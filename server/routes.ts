import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// import { setupAuth, isAuthenticated } from "./replitAuth"; // Disabled Replit auth
import { insertTestSessionSchema, insertUserAnswerSchema } from "../shared/schema";
import { db } from "./db";
import { topics } from "../shared/schema";
import { and, eq, isNull } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  // await setupAuth(app); // Disabled Replit auth

  // Auth routes (temporarily disabled)
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user theme preference
  app.patch('/api/auth/user/theme', async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { theme } = req.body;

      if (!theme || !['light', 'dark'].includes(theme)) {
        return res.status(400).json({ message: "Invalid theme preference" });
      }

      const user = await storage.upsertUser({
        id: userId,
        themePreference: theme,
      });

      res.json(user);
    } catch (error) {
      console.error("Error updating theme:", error);
      res.status(500).json({ message: "Failed to update theme preference" });
    }
  });

  // Subject routes (public) - now using topics instead of categories
  app.get('/api/subjects', async (req, res) => {
    try {
      const parentTopics = await storage.getParentTopics();
      
      // Transform the topics data to match the expected format
      const formattedTopics = await Promise.all(
        parentTopics.map(async (topic) => {
          const questionCount = await storage.getQuestionCountByTopic(topic.id);
          
          return {
            id: topic.id,
            title: topic.text,
            description: topic.text, // Using text as description for now
            code: topic.slug.toUpperCase().slice(0, 3), // Generate code from slug
            slug: topic.slug,
            questionCount,
            duration: 120, // Default duration in minutes
          };
        })
      );
      
      res.json(formattedTopics);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  // Specific route for question-bank page
  app.get('/api/question-bank', async (req, res) => {
    try {
      const parentTopics = await storage.getParentTopics();
      
      // Transform the topics data to match the expected format
      const formattedTopics = await Promise.all(
        parentTopics.map(async (topic) => {
          const questionCount = await storage.getQuestionCountByTopic(topic.id);
          
          return {
            id: topic.id,
            title: topic.text,
            description: topic.text, // Using text as description for now
            code: topic.slug.toUpperCase().slice(0, 3), // Generate code from slug
            slug: topic.slug,
            questionCount,
            duration: 120, // Default duration in minutes
          };
        })
      );
      
      res.json(formattedTopics);
    } catch (error) {
      console.error("Error fetching question bank topics:", error);
      res.status(500).json({ message: "Failed to fetch question bank topics" });
    }
  });

  // Debug endpoint to investigate the O#F#RD issue
  app.get('/api/debug/oxford', async (req, res) => {
    try {
      const name = "O#F#RD";
      
      // Check for parent topics with exact text match
      const exactTextMatches = await db
        .select()
        .from(topics)
        .where(
          and(
            eq(topics.text, name),
            isNull(topics.parentId)
          )
        );
      
      // Check for parent topics with exact slug match  
      const exactSlugMatches = await db
        .select() 
        .from(topics)
        .where(
          and(
            eq(topics.slug, "oxford-instruments-questions"),
            isNull(topics.parentId)
          )
        );
      
      // Find all parents that have children with ID >= 190
      const allParents = await db
        .select()
        .from(topics)
        .where(isNull(topics.parentId));
      
      let parentsWithHighIds = [];
      for (const parent of allParents) {
        const children = await db
          .select()
          .from(topics)
          .where(eq(topics.parentId, parent.id));
        
        const hasHighIds = children.some(child => child.id >= 190);
        if (hasHighIds) {
          parentsWithHighIds.push({
            parent: parent,
            childCount: children.length,
            childIdRange: children.length > 0 ? `${Math.min(...children.map(c => c.id))}-${Math.max(...children.map(c => c.id))}` : 'none'
          });
        }
      }
      
      res.json({
        searchTerm: name,
        exactTextMatches,
        exactSlugMatches,
        parentsWithHighIds,
        explanation: "Debug info for O#F#RD topic matching"
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/:topic', async (req, res) => {
    try {
      const topicName = req.params.topic;
      console.log(`[ROUTE DEBUG] Received request for topic: "${topicName}"`);
      const subjects = await storage.getTopicByName(topicName);
      console.log(`[ROUTE DEBUG] Returning ${Array.isArray(subjects) ? subjects.length : 'non-array'} items for topic: "${topicName}"`);
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
  app.get('/api/subjects/:subjectId/chapters', async (req, res) => {
    try {
      const subjectId = parseInt(req.params.subjectId);
      const chapters = await storage.getChaptersBySubject(subjectId);
      res.json(chapters);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      res.status(500).json({ message: "Failed to fetch chapters" });
    }
  });

  app.get('/api/chapters/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const chapter = await storage.getChapter(id);

      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }

      res.json(chapter);
    } catch (error) {
      console.error("Error fetching chapter:", error);
      res.status(500).json({ message: "Failed to fetch chapter" });
    }
  });

  // Section routes (public)
  app.get('/api/chapters/:chapterId/sections', async (req, res) => {
    try {
      const chapterId = parseInt(req.params.chapterId);
      const sections = await storage.getSectionsByChapter(chapterId);
      res.json(sections);
    } catch (error) {
      console.error("Error fetching sections:", error);
      res.status(500).json({ message: "Failed to fetch sections" });
    }
  });

  app.get('/api/sections/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const section = await storage.getSection(id);

      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }

      res.json(section);
    } catch (error) {
      console.error("Error fetching section:", error);
      res.status(500).json({ message: "Failed to fetch section" });
    }
  });

  // Section questions routes (public)
  app.get('/api/sections/:sectionId/questions', async (req, res) => {
    try {
      const sectionId = parseInt(req.params.sectionId);
      const questions = await storage.getQuestionsBySection(sectionId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching section questions:", error);
      res.status(500).json({ message: "Failed to fetch section questions" });
    }
  });

  // Question routes (public)
  app.get('/api/subjects/:subjectId/questions', async (req, res) => {
    try {
      const subjectId = parseInt(req.params.subjectId);
      const { count } = req.query;

      let questions;
      if (count) {
        const questionCount = parseInt(count as string);
        questions = await storage.getRandomQuestions(subjectId, questionCount);
      } else {
        questions = await storage.getQuestionsBySubject(subjectId);
      }

      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Test session routes
  app.post('/api/test-sessions', async (req: any, res) => {
    try {
      const sessionData = insertTestSessionSchema.parse(req.body);

      // If user is authenticated, add their ID
      if (req.isAuthenticated && req.user?.claims?.sub) {
        sessionData.userId = req.user.claims.sub;
      }

      const session = await storage.createTestSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating test session:", error);
      res.status(500).json({ message: "Failed to create test session" });
    }
  });

  app.get('/api/test-sessions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getTestSession(id);

      if (!session) {
        return res.status(404).json({ message: "Test session not found" });
      }

      res.json(session);
    } catch (error) {
      console.error("Error fetching test session:", error);
      res.status(500).json({ message: "Failed to fetch test session" });
    }
  });

  app.patch('/api/test-sessions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;

      const session = await storage.updateTestSession(id, updates);
      res.json(session);
    } catch (error) {
      console.error("Error updating test session:", error);
      res.status(500).json({ message: "Failed to update test session" });
    }
  });

  // User answer routes
  app.post('/api/user-answers', async (req, res) => {
    try {
      const answerData = insertUserAnswerSchema.parse(req.body);
      const answer = await storage.saveUserAnswer(answerData);
      res.json(answer);
    } catch (error) {
      console.error("Error saving user answer:", error);
      res.status(500).json({ message: "Failed to save answer" });
    }
  });

  app.get('/api/test-sessions/:sessionId/answers', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const answers = await storage.getSessionAnswers(sessionId);
      res.json(answers);
    } catch (error) {
      console.error("Error fetching session answers:", error);
      res.status(500).json({ message: "Failed to fetch answers" });
    }
  });

  // Progress tracking routes (temporarily disabled authentication)
  app.get('/api/progress', async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.get('/api/test-sessions/user/history', async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getUserTestSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching test history:", error);
      res.status(500).json({ message: "Failed to fetch test history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}