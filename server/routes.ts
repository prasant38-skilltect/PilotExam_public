import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { signUpSchema, signInSchema, insertIssueReportSchema, insertQuestionCommentSchema } from "../shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import multer from "multer";
import * as XLSX from "xlsx";
import path from "path";
import { OAuth2Client } from "google-auth-library";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, "postmessage");
// import { setupAuth, isAuthenticated } from "./replitAuth"; // Disabled Replit auth
// import { insertTestSessionSchema, insertUserAnswerSchema } from "../shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.set("trust proxy", 1);
  app.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-this",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  }));

  // Auth middleware for protected routes
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.session && req.session.userId) {
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  };

  // Admin middleware for admin-only routes
  const isAdmin = (req: any, res: any, next: any) => {
    if (req.session && req.session.userId && req.session.isAdmin) {
      return next();
    }
    return res.status(403).json({ message: "Admin access required" });
  };

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedMimes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only Excel files are allowed'));
      }
    }
  });

  // Authentication routes
  app.post('/api/auth/signup', async (req: any, res) => {
    try {
      const validatedData = signUpSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      
      // Set up session
      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin;
      
      // Don't return password hash
      const { passwordHash, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Error during signup:", error);
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          return res.status(400).json({ message: error.message });
        }
      }
      res.status(500).json({ message: "Failed to create account" });
    }
  });


  app.post("/api/auth/google", async (req: any, res) => {
  try {
    const { email, firstName, lastName, googleId, profileImageUrl } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ message: "Missing Google user data" });
    }

    // Create or update user
    const user = await storage.upsertGoogleUser({
      email,
      firstName,
      lastName,
      googleId,
      profileImageUrl,
    });

    // Set session
    req.session.userId = user.id;
    req.session.isAdmin = user.isAdmin;

    const { passwordHash, ...userResponse } = user;
    res.json(userResponse);
  } catch (error: any) {
    console.error("Google login error:", error);
    res.status(500).json({ message: error.message });
  }
});

  app.post('/api/auth/signin', async (req: any, res) => {
    try {
      const validatedData = signInSchema.parse(req.body);
      const user = await storage.authenticateUser(validatedData);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Set up session
      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin;
      
      // Don't return password hash
      const { passwordHash, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Error during signin:", error);
      res.status(500).json({ message: "Failed to sign in" });
    }
  });

  app.post('/api/auth/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password hash
      const { passwordHash, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/subscriptions', async (req: any, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      } else {
        const subscriptions = await storage.getSubscriptionsByUserId(user.id);
        return res.json(subscriptions);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/admin/subscriptionsPlan', async (req: any, res) => {
    try {
        const plans = await storage.getSubcriptionPlanDetails();
        return res.json(plans);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  
  app.post('/api/admin/subscriptionsPlan', isAdmin, async (req: any, res) => {
    try {
      const { name, months, price, isActive } = req.body;
      
      if (!name || !months || !price) {
        return res.status(400).json({ message: "Name, months, and price are required" });
      }

      const subscriptionsPlan = {
        name: name.trim(),
        price: parseInt(price),
        duration: `${parseInt(months)} months`,
        features: req.body.features || "",
        isActive: isActive !== undefined ? isActive : true
      };

      const newPackage = await storage.createSubscriptionPlan(subscriptionsPlan);
      res.json(newPackage);
    } catch (error) {
      console.error("Error creating package:", error);
      res.status(500).json({ message: "Failed to create package" });
    }
  });

  app.put('/api/admin/packages/:id', isAdmin, async (req: any, res) => {
    try {
      const packageId = parseInt(req.params.id);
      const { name, months, price, isActive } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (months !== undefined) updateData.months = parseInt(months);
      if (price !== undefined) updateData.price = parseInt(price);
      if (isActive !== undefined) updateData.isActive = isActive;

      const updatedPackage = await storage.updatePackage(packageId, updateData);
      res.json(updatedPackage);
    } catch (error) {
      console.error("Error updating package:", error);
      res.status(500).json({ message: "Failed to update package" });
    }
  });

  app.delete('/api/admin/packages/:id', isAdmin, async (req: any, res) => {
    try {
      const packageId = parseInt(req.params.id);
      await storage.deletePackage(packageId);
      res.json({ message: "Package deleted successfully" });
    } catch (error) {
      console.error("Error deleting package:", error);
      res.status(500).json({ message: "Failed to delete package" });
    }
  });

  // Update user profile
  app.patch('/api/auth/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { firstName, lastName, username } = req.body;

      const user = await storage.updateUserProfile(userId, {
        firstName,
        lastName,
        username,
      });

      const { passwordHash, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error instanceof Error && error.message.includes('username already exists')) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Update user password
  app.patch('/api/auth/user/password', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }

      await storage.updateUserPassword(userId, currentPassword, newPassword);
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      if (error instanceof Error && error.message.includes('Current password is incorrect')) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  // Update user theme preference
  app.patch('/api/auth/user/theme', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { theme } = req.body;

      if (!theme || !['light', 'dark'].includes(theme)) {
        return res.status(400).json({ message: "Invalid theme preference" });
      }

      const user = await storage.upsertUser({
        id: userId,
        themePreference: theme,
      });

      const { passwordHash, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Error updating theme:", error);
      res.status(500).json({ message: "Failed to update theme preference" });
    }
  });

  // Get category hierarchy for admin
  app.get('/api/admin/category-hierarchy', isAdmin, async (req: any, res) => {
    try {
      const hierarchy = await storage.getCategoryHierarchy();
      res.json(hierarchy);
    } catch (error) {
      console.error("Error fetching category hierarchy:", error);
      res.status(500).json({ message: "Failed to fetch category hierarchy" });
    }
  });

  // Issue Report routes
  app.post('/api/issue-reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { questionId, description } = req.body;

      if (!questionId || !description?.trim()) {
        return res.status(400).json({ message: "Question ID and description are required" });
      }

      const validatedData = insertIssueReportSchema.parse({
        userId,
        questionId: parseInt(questionId),
        description: description.trim(),
      });

      const issueReport = await storage.createIssueReport(validatedData);
      res.json(issueReport);
    } catch (error) {
      console.error("Error creating issue report:", error);
      res.status(500).json({ message: "Failed to create issue report" });
    }
  });

  app.get('/api/issue-reports/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const reports = await storage.getIssueReportsByUser(userId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching user issue reports:", error);
      res.status(500).json({ message: "Failed to fetch issue reports" });
    }
  });

  // Comment routes
  app.post('/api/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { questionId, comment } = req.body;

      if (!questionId || !comment?.trim()) {
        return res.status(400).json({ message: "Question ID and comment are required" });
      }

      // Get user details for username
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const username = user.username || user.firstName || user.email?.split('@')[0] || 'Anonymous';

      const validatedData = insertQuestionCommentSchema.parse({
        questionId: parseInt(questionId),
        userId,
        username,
        comment: comment.trim(),
      });

      const questionComment = await storage.createComment(validatedData);
      res.json(questionComment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.get('/api/comments/:questionId', async (req: any, res) => {
    try {
      const questionId = parseInt(req.params.questionId);
      if (!questionId) {
        return res.status(400).json({ message: "Invalid question ID" });
      }

      const comments = await storage.getCommentsByQuestion(questionId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Admin comment moderation routes
  app.get('/api/admin/comments/pending', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const pendingComments = await storage.getAllPendingComments();
      res.json(pendingComments);
    } catch (error) {
      console.error("Error fetching pending comments:", error);
      res.status(500).json({ message: "Failed to fetch pending comments" });
    }
  });

  app.post('/api/admin/comments/:commentId/approve', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const commentId = parseInt(req.params.commentId);
      const { adminResponse } = req.body;

      if (!commentId) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }

      const approvedComment = await storage.approveComment(commentId, userId, adminResponse);
      res.json(approvedComment);
    } catch (error) {
      console.error("Error approving comment:", error);
      res.status(500).json({ message: "Failed to approve comment" });
    }
  });

  app.post('/api/admin/comments/:commentId/reject', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const commentId = parseInt(req.params.commentId);
      const { adminResponse } = req.body;

      if (!commentId) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }

      const rejectedComment = await storage.rejectComment(commentId, userId, adminResponse);
      res.json(rejectedComment);
    } catch (error) {
      console.error("Error rejecting comment:", error);
      res.status(500).json({ message: "Failed to reject comment" });
    }
  });

  // Topic management routes
  app.get('/api/admin/topics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const topics = await storage.getAllTopics();
      res.json(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  // Create Topic
  app.post('/api/admin/topics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { text, slug, categoryId, categoryName, parentId, parentName } = req.body;

      if (!text?.trim()) {
        return res.status(400).json({ message: "Topic name is required" });
      }

      if (!categoryId) {
        return res.status(400).json({ message: "Category ID is required" });
      }

      // Get category to populate categoryName
      // const category = await storage.getCategory(categoryId);
      // if (!category) {
      //   return res.status(400).json({ message: "Category not found" });
      // }

      // Generate slug from text
      // const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      const newTopic = await storage.createTopic({
        text: text.trim(),
        categoryId: parseInt(categoryId),
        categoryName: categoryName,
        slug,
        parentId: parentId,
        parentName: parentName,
        quizId: -1
      });

      res.json(newTopic);
    } catch (error) {
      console.error("Error creating topic:", error);
      res.status(500).json({ message: "Failed to create topic" });
    }
  });

  // Update Topic
  app.put('/api/admin/topics/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const topicId = parseInt(req.params.id);
      const { text, slug, categoryId } = req.body;

      if (!topicId) {
        return res.status(400).json({ message: "Invalid topic ID" });
      }

      const updateData: any = {};
      if (text?.trim()) {
        updateData.text = text.trim();
        updateData.slug = slug;
      }
      if (categoryId) {
        const category = await storage.getCategory(categoryId);
        if (!category) {
          return res.status(400).json({ message: "Category not found" });
        }
        updateData.categoryId = parseInt(categoryId);
        updateData.categoryName = category.text;
      }

      const updatedTopic = await storage.updateTopic(topicId, updateData);
      res.json(updatedTopic);
    } catch (error) {
      console.error("Error updating topic:", error);
      res.status(500).json({ message: "Failed to update topic" });
    }
  });

  // Delete Topic
  app.delete('/api/admin/topics/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const topicId = parseInt(req.params.id);

      if (!topicId) {
        return res.status(400).json({ message: "Invalid topic ID" });
      }

      await storage.deleteTopic(topicId);
      res.json({ message: "Topic deleted successfully" });
    } catch (error) {
      console.error("Error deleting topic:", error);
      res.status(500).json({ message: "Failed to delete topic" });
    }
  });

  // Category management routes
  app.get('/api/admin/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const categories = await storage.getAllSubjects();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Create Category
  app.post('/api/admin/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { name, slug } = req.body;

      if (!name?.trim()) {
        return res.status(400).json({ message: "Category name is required" });
      }

      const newCategory = await storage.createCategories({
        name: name.trim(),
        text: slug
      });

      res.json(newCategory);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Update Category
  app.put('/api/admin/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const categoryId = parseInt(req.params.id);
      const { name, description } = req.body;

      if (!categoryId) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const updateData: any = {};
      if (name?.trim()) {
        updateData.name = name.trim();
      }
      if (description !== undefined) {
        updateData.text = description?.trim() || updateData.name || '';
      }

      const updatedCategory = await storage.updateCategory(categoryId, updateData);
      res.json(updatedCategory);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  // Delete Category
  app.delete('/api/admin/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const categoryId = parseInt(req.params.id);

      if (!categoryId) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      await storage.deleteCategory(categoryId);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  app.post('/api/admin/questions/link-to-topic', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { questionIds, topicId } = req.body;

      if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
        return res.status(400).json({ message: "Question IDs are required" });
      }

      if (!topicId) {
        return res.status(400).json({ message: "Topic ID is required" });
      }

      await storage.linkQuestionsToTopic(questionIds, topicId);
      res.json({ message: "Questions successfully linked to topic" });
    } catch (error) {
      console.error("Error linking questions to topic:", error);
      res.status(500).json({ message: "Failed to link questions to topic" });
    }
  });

  // Subject routes (public)
  app.get('/api/subjects', async (req, res) => {
    try {
      const subjects = await storage.getAllSubjects();
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.get('/api/:topic', async (req, res) => {
    try {
      const subjects = await storage.getTopicByCategoryName(req.params.topic);
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.get('/api/subjects/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subject = await storage.getSubject(id);

      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }

      res.json(subject);
    } catch (error) {
      console.error("Error fetching subject:", error);
      res.status(500).json({ message: "Failed to fetch subject" });
    }
  });

  // Chapter routes (public)
  // app.get('/api/subjects/:subjectId/chapters', async (req, res) => {
  //   try {
  //     const subjectId = parseInt(req.params.subjectId);
  //     const chapters = await storage.getChaptersBySubject(subjectId);
  //     res.json(chapters);
  //   } catch (error) {
  //     console.error("Error fetching chapters:", error);
  //     res.status(500).json({ message: "Failed to fetch chapters" });
  //   }
  // });

  // app.get('/api/chapters/:id', async (req, res) => {
  //   try {
  //     const id = parseInt(req.params.id);
  //     const chapter = await storage.getChapter(id);

  //     if (!chapter) {
  //       return res.status(404).json({ message: "Chapter not found" });
  //     }

  //     res.json(chapter);
  //   } catch (error) {
  //     console.error("Error fetching chapter:", error);
  //     res.status(500).json({ message: "Failed to fetch chapter" });
  //   }
  // });

  // Section routes (public)
  // app.get('/api/chapters/:chapterId/sections', async (req, res) => {
  //   try {
  //     const chapterId = parseInt(req.params.chapterId);
  //     const sections = await storage.getSectionsByChapter(chapterId);
  //     res.json(sections);
  //   } catch (error) {
  //     console.error("Error fetching sections:", error);
  //     res.status(500).json({ message: "Failed to fetch sections" });
  //   }
  // });

  // app.get('/api/sections/:id', async (req, res) => {
  //   try {
  //     const id = parseInt(req.params.id);
  //     const section = await storage.getSection(id);

  //     if (!section) {
  //       return res.status(404).json({ message: "Section not found" });
  //     }

  //     res.json(section);
  //   } catch (error) {
  //     console.error("Error fetching section:", error);
  //     res.status(500).json({ message: "Failed to fetch section" });
  //   }
  // });

  // Section questions routes (public)
  // app.get('/api/sections/:sectionId/questions', async (req, res) => {
  //   try {
  //     const sectionId = parseInt(req.params.sectionId);
  //     const questions = await storage.getQuestionsBySection(sectionId);
  //     res.json(questions);
  //   } catch (error) {
  //     console.error("Error fetching section questions:", error);
  //     res.status(500).json({ message: "Failed to fetch section questions" });
  //   }
  // });

  // Search questions by text (public)
  app.get('/api/questions/search', async (req, res) => {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string' || query.length < 3) {
        return res.status(400).json({ message: "Query must be at least 3 characters long" });
      }

      const searchResults = await storage.searchQuestions(query);
      res.json(searchResults);
    } catch (error) {
      console.error("Error searching questions:", error);
      res.status(500).json({ message: "Failed to search questions" });
    }
  });

  // // Question routes (public)
  // app.get('/api/subjects/:subjectId/questions', async (req, res) => {
  //   try {
  //     const subjectId = parseInt(req.params.subjectId);
  //     const { count } = req.query;

  //     let questions;
  //     if (count) {
  //       const questionCount = parseInt(count as string);
  //       questions = await storage.getRandomQuestions(subjectId, questionCount);
  //     } else {
  //       questions = await storage.getQuestionsBySubject(subjectId);
  //     }

  //     res.json(questions);
  //   } catch (error) {
  //     console.error("Error fetching questions:", error);
  //     res.status(500).json({ message: "Failed to fetch questions" });
  //   }
  // });

  // // Test session routes
  // app.post('/api/test-sessions', async (req: any, res) => {
  //   try {
  //     const sessionData = insertTestSessionSchema.parse(req.body);

  //     // If user is authenticated, add their ID
  //     if (req.isAuthenticated && req.user?.claims?.sub) {
  //       sessionData.userId = req.user.claims.sub;
  //     }

  //     const session = await storage.createTestSession(sessionData);
  //     res.json(session);
  //   } catch (error) {
  //     console.error("Error creating test session:", error);
  //     res.status(500).json({ message: "Failed to create test session" });
  //   }
  // });

  // app.get('/api/test-sessions/:id', async (req, res) => {
  //   try {
  //     const id = parseInt(req.params.id);
  //     const session = await storage.getTestSession(id);

  //     if (!session) {
  //       return res.status(404).json({ message: "Test session not found" });
  //     }

  //     res.json(session);
  //   } catch (error) {
  //     console.error("Error fetching test session:", error);
  //     res.status(500).json({ message: "Failed to fetch test session" });
  //   }
  // });

  // app.patch('/api/test-sessions/:id', async (req, res) => {
  //   try {
  //     const id = parseInt(req.params.id);
  //     const updates = req.body;

  //     const session = await storage.updateTestSession(id, updates);
  //     res.json(session);
  //   } catch (error) {
  //     console.error("Error updating test session:", error);
  //     res.status(500).json({ message: "Failed to update test session" });
  //   }
  // });

  // // User answer routes
  // app.post('/api/user-answers', async (req, res) => {
  //   try {
  //     const answerData = insertUserAnswerSchema.parse(req.body);
  //     const answer = await storage.saveUserAnswer(answerData);
  //     res.json(answer);
  //   } catch (error) {
  //     console.error("Error saving user answer:", error);
  //     res.status(500).json({ message: "Failed to save answer" });
  //   }
  // });

  // app.get('/api/test-sessions/:sessionId/answers', async (req, res) => {
  //   try {
  //     const sessionId = parseInt(req.params.sessionId);
  //     const answers = await storage.getSessionAnswers(sessionId);
  //     res.json(answers);
  //   } catch (error) {
  //     console.error("Error fetching session answers:", error);
  //     res.status(500).json({ message: "Failed to fetch answers" });
  //   }
  // });

  // // Progress tracking routes (temporarily disabled authentication)
  // app.get('/api/progress', async (req: any, res) => {
  //   try {
  //     const userId = req.user.claims.sub;
  //     const progress = await storage.getUserProgress(userId);
  //     res.json(progress);
  //   } catch (error) {
  //     console.error("Error fetching user progress:", error);
  //     res.status(500).json({ message: "Failed to fetch progress" });
  //   }
  // });

  // app.get('/api/test-sessions/user/history', async (req: any, res) => {
  //   try {
  //     const userId = req.user.claims.sub;
  //     const sessions = await storage.getUserTestSessions(userId);
  //     res.json(sessions);
  //   } catch (error) {
  //     console.error("Error fetching test history:", error);
  //     res.status(500).json({ message: "Failed to fetch test history" });
  //   }
  // });

  // Admin routes
  app.get('/api/admin/issue-reports', isAdmin, async (req: any, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const result = await storage.getAllIssueReports(page, limit);
      res.json(result);
    } catch (error) {
      console.error("Error fetching issue reports:", error);
      res.status(500).json({ message: "Failed to fetch issue reports" });
    }
  });

  // Acknowledge an issue report (admin only)
  app.post('/api/admin/issue-reports/:id/acknowledge', isAdmin, async (req: any, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const adminId = req.session.userId;
      
      if (!adminId) {
        return res.status(401).json({ message: "Admin user not found" });
      }

      const acknowledgedReport = await storage.acknowledgeIssueReport(reportId, adminId);
      res.json(acknowledgedReport);
    } catch (error) {
      console.error("Error acknowledging issue report:", error);
      res.status(500).json({ message: "Failed to acknowledge issue report" });
    }
  });

  app.get('/api/admin/questions', isAdmin, async (req: any, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const searchText = req.query.search as string;
      const hasEmptyExplanation = req.query.hasEmptyExplanation === 'true';
      
      const result = await storage.getAllQuestionsForAdmin(page, limit, searchText, hasEmptyExplanation);
      res.json(result);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.get('/api/admin/users', isAdmin, async (req: any, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const result = await storage.getAllUsers(page, limit);
      res.json(result);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get user subscriptions by user ID
  app.get('/api/admin/users/:userId/subscriptions', isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const subscriptions = await storage.getSubscriptionsByUserId(userId);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching user subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch user subscriptions" });
    }
  });

  // Toggle user active status
  app.put('/api/admin/users/:userId/active-status', isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;
      
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: "isActive must be a boolean" });
      }

      const updatedUser = await storage.updateUserActiveStatus(userId, isActive);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user active status:", error);
      res.status(500).json({ message: "Failed to update user active status" });
    }
  });

  // Package management routes
  app.get('/api/packages', async (req, res) => {
    try {
      const packages = await storage.getActivePackages();
      res.json(packages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  app.get('/api/admin/packages', isAdmin, async (req: any, res) => {
    try {
      const packages = await storage.getAllPackages();
      res.json(packages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  app.post('/api/admin/packages', isAdmin, async (req: any, res) => {
    try {
      const { name, months, price, isActive } = req.body;
      
      if (!name || !months || !price) {
        return res.status(400).json({ message: "Name, months, and price are required" });
      }

      const packageData = {
        name: name.trim(),
        months: parseInt(months),
        price: parseInt(price),
        isActive: isActive !== undefined ? isActive : true
      };

      const newPackage = await storage.createPackage(packageData);
      res.json(newPackage);
    } catch (error) {
      console.error("Error creating package:", error);
      res.status(500).json({ message: "Failed to create package" });
    }
  });

  app.put('/api/admin/packages/:id', isAdmin, async (req: any, res) => {
    try {
      const packageId = parseInt(req.params.id);
      const { name, months, price, isActive } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (months !== undefined) updateData.months = parseInt(months);
      if (price !== undefined) updateData.price = parseInt(price);
      if (isActive !== undefined) updateData.isActive = isActive;

      const updatedPackage = await storage.updatePackage(packageId, updateData);
      res.json(updatedPackage);
    } catch (error) {
      console.error("Error updating package:", error);
      res.status(500).json({ message: "Failed to update package" });
    }
  });

  app.delete('/api/admin/packages/:id', isAdmin, async (req: any, res) => {
    try {
      const packageId = parseInt(req.params.id);
      await storage.deletePackage(packageId);
      res.json({ message: "Package deleted successfully" });
    } catch (error) {
      console.error("Error deleting package:", error);
      res.status(500).json({ message: "Failed to delete package" });
    }
  });

  app.put('/api/admin/questions/:id', isAdmin, async (req: any, res) => {
    try {
      const questionId = parseInt(req.params.id);
      const questionData = req.body;
      
      const updatedQuestion = await storage.updateQuestion(questionId, questionData);
      res.json(updatedQuestion);
    } catch (error) {
      console.error("Error updating question:", error);
      res.status(500).json({ message: "Failed to update question" });
    }
  });

  // Create new question
  // app.post('/api/admin/questions', isAdmin, async (req: any, res) => {
  //   try {
  //     const questionData = req.body;
  //     const newQuestion = await storage.createQuestion(questionData);
  //     res.json(newQuestion);
  //   } catch (error) {
  //     console.error("Error creating question:", error);
  //     res.status(500).json({ message: "Failed to create question" });
  //   }
  // });

  // Soft delete question
  app.delete('/api/admin/questions/:id', isAdmin, async (req: any, res) => {
    try {
      const questionId = parseInt(req.params.id);
      const deletedQuestion = await storage.softDeleteQuestion(questionId);

      res.json({ message: "Question deleted successfully", question: deletedQuestion });
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ message: "Failed to delete question" });
    }
  });

  // Test session routes
  app.post('/api/test-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const sessionData = {
        userId: req.session.userId,
        sectionName: req.body.sectionName,
        totalQuestions: req.body.totalQuestions,
      };
      
      const testSession = await storage.createTestSession(sessionData);
      res.json(testSession);
    } catch (error) {
      console.error("Error creating test session:", error);
      res.status(500).json({ message: "Failed to create test session" });
    }
  });

  app.put('/api/test-sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      
      const sessionId = parseInt(req.params.id);
      const { updates } = req.body;
      // ✅ Ensure endTime is a Date before calling Drizzle
      const dataToUpdate = {
        ...updates,
        endTime: updates.endTime ? new Date(updates.endTime) : null,
      };
      
      const updatedSession = await storage.updateTestSession(sessionId, dataToUpdate);
      res.json(updatedSession);
    } catch (error) {
      console.error("Error updating test session:", error);
      res.status(500).json({ message: "Failed to update test session" });
    }
  });

  app.get('/api/user/test-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const sessions = await storage.getUserTestSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching user test sessions:", error);
      res.status(500).json({ message: "Failed to fetch test sessions" });
    }
  });

  app.get('/api/test-sessions/:id/details', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const userId = req.session.userId;
      
      // Get the test session
      const session = await storage.getTestSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ message: "Test session not found" });
      }
      
      // Get all user answers for this session
      const answers = await storage.getSessionAnswers(sessionId);
      
      // Get questions with options for this session
      const questionIds = answers.map(answer => answer.questionId);
      const questionsWithOptions = [];
      
      for (const questionId of questionIds) {
        const question = await storage.getQuestion(questionId);
        if (question) {
          // Get options for this question
          const options = await storage.getQuestionOptions(questionId);
          
          // Format options as A, B, C, D
          const formattedQuestion = {
            ...question,
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_answer: ''
          };
          
          // Map options to A, B, C, D format
          options.forEach(option => {
            const optionLetter = String.fromCharCode(65 + option.optionOrder); // 0=A, 1=B, etc.
            const optionKey = `option_${optionLetter.toLowerCase()}`;
            if (optionKey === 'option_a') formattedQuestion.option_a = option.optionText;
            else if (optionKey === 'option_b') formattedQuestion.option_b = option.optionText;
            else if (optionKey === 'option_c') formattedQuestion.option_c = option.optionText;
            else if (optionKey === 'option_d') formattedQuestion.option_d = option.optionText;
            
            if (option.isCorrect) {
              formattedQuestion.correct_answer = optionLetter;
            }
          });
          
          questionsWithOptions.push(formattedQuestion);
        }
      }
      
      // Combine session, answers, and questions
      const sessionDetails = {
        session,
        answers,
        questions: questionsWithOptions,
        questionsWithAnswers: questionsWithOptions.map(question => {
          const userAnswer = answers.find(answer => answer.questionId === question.id);
          return {
            ...question,
            userAnswer: userAnswer?.selectedAnswer,
            isCorrect: userAnswer?.isCorrect,
            timeSpent: userAnswer?.timeSpent
          };
        })
      };
      
      res.json(sessionDetails);
    } catch (error) {
      console.error("Error fetching test session details:", error);
      res.status(500).json({ message: "Failed to fetch test session details" });
    }
  });

  // User answer routes
  app.post('/api/user-answers', isAuthenticated, async (req: any, res) => {
    try {
      const answerData = req.body;
      const savedAnswer = await storage.saveUserAnswer(answerData);
      res.json(savedAnswer);
    } catch (error) {
      console.error("Error saving user answer:", error);
      res.status(500).json({ message: "Failed to save answer" });
    }
  });

  // User progress routes
  app.get('/api/user/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.get('/api/user/progress/:sectionName', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const sectionName = req.params.sectionName;
      const progress = await storage.getSectionProgress(userId, sectionName);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching section progress:", error);
      res.status(500).json({ message: "Failed to fetch section progress" });
    }
  });

  app.post('/api/user/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { sectionName, averageScore, bestScore } = req.body;
      
      // Get existing progress
      const existingProgress = await storage.getSectionProgress(userId, sectionName);
      
      let progressData;
      if (existingProgress) {
        // Update existing progress
        const currentTotalTests = existingProgress.totalTests || 0;
        const currentAverageScore = existingProgress.averageScore || 0;
        const currentBestScore = existingProgress.bestScore || 0;
        
        const newTotalTests = currentTotalTests + 1;
        const newAverageScore = Math.round(
          ((currentAverageScore * currentTotalTests) + averageScore) / newTotalTests
        );
        const newBestScore = Math.max(currentBestScore, bestScore);
        
        progressData = {
          userId,
          sectionName,
          totalTests: newTotalTests,
          averageScore: newAverageScore,
          bestScore: newBestScore,
          lastTestDate: new Date()
        };
      } else {
        // Create new progress
        progressData = {
          userId,
          sectionName,
          totalTests: 1,
          averageScore: averageScore,
          bestScore: bestScore,
          lastTestDate: new Date()
        };
      }
      
      const updatedProgress = await storage.updateUserProgress(progressData);
      res.json(updatedProgress);
    } catch (error) {
      console.error("Error updating user progress:", error);
      res.status(500).json({ message: "Failed to update user progress" });
    }
  });

  // Admin question management routes
  
  // Create single question
  app.post('/api/admin/questions', isAdmin, async (req, res) => {
    try {
      const { question_text, explanation, options } = req.body;
      const questionData = req.body;
      
      if (!question_text || !Array.isArray(options) || options.length === 0) {
        return res.status(400).json({ message: "Question text and options are required" });
      }
      
      const hasCorrectAnswer = options.some(opt => opt.isCorrect);
      if (!hasCorrectAnswer) {
        return res.status(400).json({ message: "At least one option must be marked as correct" });
      }
      
      const result = await storage.createQuestion(questionData);
      
      res.json(result);
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  // Create single question
  app.post('/api/admin/questions', isAdmin, async (req, res) => {
    try {
      const questionData = req.body;

      if (!questionData.question_text || !Array.isArray(questionData.options) || questionData.options.length === 0) {
        return res.status(400).json({ message: "Question text and options are required" });
      }
      
      const hasCorrectAnswer = questionData.options.some(opt => opt.isCorrect);
      if (!hasCorrectAnswer) {
        return res.status(400).json({ message: "At least one option must be marked as correct" });
      }
      
      const result = await storage.createQuestion(questionData);

      // await storage.linkQuestionToQuiz(result.id, quizId);
      
      res.json(result);
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to create question" });
    }
  });


  // Bulk upload questions from Excel
  app.post('/api/admin/questions/bulk-upload', isAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Parse Excel file
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Skip header row and process questions
      const questions: any[] = [];
      for (let i = 1; i < data.length; i++) {
        const row: any = data[i];
        if (!row[0]) continue; // Skip empty rows
        
        const options = [];
        // Add options A, B, C, D if they exist
        if (row[1]) options.push({ optionText: row[1], isCorrect: row[5]?.toString().toLowerCase() === 'a' });
        if (row[2]) options.push({ optionText: row[2], isCorrect: row[5]?.toString().toLowerCase() === 'b' });
        if (row[3]) options.push({ optionText: row[3], isCorrect: row[5]?.toString().toLowerCase() === 'c' });
        if (row[4]) options.push({ optionText: row[4], isCorrect: row[5]?.toString().toLowerCase() === 'd' });
        
        if (options.length === 0) continue;
        
        questions.push({
          question_text: row[0],
          explanation: row[6] || "",
          options
        });
      }

      if (questions.length === 0) {
        return res.status(400).json({ message: "No valid questions found in file" });
      }

      // Create questions in database
      let successCount = 0;
      const createdQuestions = [];
      for (const question of questions) {
        try {
          const result = await storage.createQuestion(question);
          createdQuestions.push(result);
          successCount++;
        } catch (error) {
          console.error("Error creating question:", error);
        }
      }

      res.json({ 
        message: `Successfully uploaded ${successCount} questions`,
        count: successCount,
        total: questions.length,
        questions: createdQuestions  // Include the created questions for topic linking
      });
    } catch (error) {
      console.error("Error processing bulk upload:", error);
      res.status(500).json({ message: "Failed to process file" });
    }
  });

  // Download Excel template
  app.get('/api/admin/questions/template', isAdmin, (req, res) => {
    try {
      // Create template data
      const templateData = [
        ['Question Text', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Explanation'],
        ['What is the capital of France?', 'London', 'Paris', 'Berlin', 'Madrid', 'B', 'Paris is the capital city of France.'],
        ['Which planet is closest to the Sun?', 'Venus', 'Mercury', 'Earth', 'Mars', 'B', 'Mercury is the closest planet to the Sun.']
      ];

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(templateData);
      
      // Set column widths
      worksheet['!cols'] = [
        { width: 50 }, // Question Text
        { width: 20 }, // Option A
        { width: 20 }, // Option B
        { width: 20 }, // Option C
        { width: 20 }, // Option D
        { width: 15 }, // Correct Answer
        { width: 40 }  // Explanation
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');

      // Generate buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Disposition', 'attachment; filename=questions_template.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      console.error("Error generating template:", error);
      res.status(500).json({ message: "Failed to generate template" });
    }
  });

  // Quiz-specific bulk upload questions from Excel (auto-links to quiz)
  app.post('/api/quizzes/:quizId/questions/bulk-upload', isAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const quizId = parseInt(req.params.quizId);

      let quiz;
      if (quizId === -1) {
        // Create a new quiz
        const currentDate = new Date().toISOString().split('T')[0];
        const title = `Quiz Created ${currentDate}`;
        const slug = `quiz-${Date.now()}`;
        quiz = await storage.createQuiz(title, slug);
        const topicId = req.body.topicId;     // from FormData

        // Update quizId to topic
        await storage.updateQuizIdToTopic(topicId, quiz.quizId);
      } else {
        // Verify quiz exists
        quiz = await storage.getQuizByQuizId(quizId);
        if (!quiz) {
          return res.status(404).json({ message: "Quiz not found" });
        }
      }

      // Parse Excel file
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Skip header row and process questions
      const questions: any[] = [];
      for (let i = 1; i < data.length; i++) {
        const row: any = data[i];
        if (!row[0]) continue; // Skip empty rows
        
        const options = [];
        // Add options A, B, C, D if they exist
        if (row[1]) options.push({ optionText: row[1], isCorrect: row[5]?.toString().toLowerCase() === 'a' });
        if (row[2]) options.push({ optionText: row[2], isCorrect: row[5]?.toString().toLowerCase() === 'b' });
        if (row[3]) options.push({ optionText: row[3], isCorrect: row[5]?.toString().toLowerCase() === 'c' });
        if (row[4]) options.push({ optionText: row[4], isCorrect: row[5]?.toString().toLowerCase() === 'd' });
        
        if (options.length === 0) continue;
        
        questions.push({
          question_text: row[0],
          explanation: row[6] || "",
          options
        });
      }

      if (questions.length === 0) {
        return res.status(400).json({ message: "No valid questions found in file" });
      }

      // Create questions in database and link to quiz
      let successCount = 0;
      const createdQuestions = [];
      
      for (const question of questions) {
        try {
          // Create the question
          const result = await storage.createQuestion(question);
          // Automatically link to the specific quiz
          await storage.linkQuestionToQuiz(result.id, quiz.id);
          
          createdQuestions.push(result);
          successCount++;
        } catch (error) {
          console.error("Error creating and linking question:", error);
        }
      }

      const isNewQuiz = quizId === -1;
      res.json({ 
        message: isNewQuiz 
          ? `Successfully created new quiz "${quiz.title}" and uploaded ${successCount} questions`
          : `Successfully uploaded ${successCount} questions and linked them to quiz "${quiz.title}"`,
        count: successCount,
        total: questions.length,
        questions: createdQuestions,
        quizId: quiz.quizId, // Use quiz.quizId from the database object
        quizTitle: quiz.title,
        newQuizCreated: isNewQuiz
      });
    } catch (error) {
      console.error("Error processing quiz-specific bulk upload:", error);
      res.status(500).json({ message: "Failed to process file" });
    }
  });

  // Download Excel template for quiz-specific upload
  app.get('/api/quizzes/:quizId/questions/template', isAdmin, async (req, res) => {
    try {
      const quizId = parseInt(req.params.quizId);
      
      // Get quiz info for template customization
      const quiz = await storage.getQuizByQuizId(quizId);
      const quizName = quiz ? quiz.title : 'Quiz';
      
      // Create template data
      const templateData = [
        ['Question Text', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Explanation'],
        ['What is the capital of France?', 'London', 'Paris', 'Berlin', 'Madrid', 'B', 'Paris is the capital city of France.'],
        ['Which planet is closest to the Sun?', 'Venus', 'Mercury', 'Earth', 'Mars', 'B', 'Mercury is the closest planet to the Sun.']
      ];

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(templateData);
      
      // Set column widths
      worksheet['!cols'] = [
        { width: 50 }, // Question Text
        { width: 20 }, // Option A
        { width: 20 }, // Option B
        { width: 20 }, // Option C
        { width: 20 }, // Option D
        { width: 15 }, // Correct Answer
        { width: 40 }  // Explanation
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');

      // Generate buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const filename = `${quizName.replace(/[^a-zA-Z0-9]/g, '_')}_questions_template.xlsx`;
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      console.error("Error generating quiz template:", error);
      res.status(500).json({ message: "Failed to generate template" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}