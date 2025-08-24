import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// import { setupAuth, isAuthenticated } from "./replitAuth"; // Disabled Replit auth
import { insertTestSessionSchema, insertUserAnswerSchema } from "@shared/schema";

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