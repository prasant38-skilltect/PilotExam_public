import {
  users,
  atplSubjects,
  questions,
  testSessions,
  userAnswers,
  userProgress,
  type User,
  type UpsertUser,
  type AtplSubject,
  type InsertAtplSubject,
  type Question,
  type InsertQuestion,
  type TestSession,
  type InsertTestSession,
  type UserAnswer,
  type InsertUserAnswer,
  type UserProgress,
  type InsertUserProgress,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, avg, max, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Subject operations
  getAllSubjects(): Promise<AtplSubject[]>;
  getSubject(id: number): Promise<AtplSubject | undefined>;
  
  // Question operations
  getQuestionsBySubject(subjectId: number): Promise<Question[]>;
  getRandomQuestions(subjectId: number, count: number): Promise<Question[]>;
  getQuestion(id: number): Promise<Question | undefined>;
  
  // Test session operations
  createTestSession(session: InsertTestSession): Promise<TestSession>;
  getTestSession(id: number): Promise<TestSession | undefined>;
  updateTestSession(id: number, updates: Partial<TestSession>): Promise<TestSession>;
  getUserTestSessions(userId: string): Promise<TestSession[]>;
  
  // User answer operations
  saveUserAnswer(answer: InsertUserAnswer): Promise<UserAnswer>;
  getSessionAnswers(sessionId: number): Promise<UserAnswer[]>;
  
  // Progress tracking
  getUserProgress(userId: string): Promise<UserProgress[]>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getSubjectProgress(userId: string, subjectId: number): Promise<UserProgress | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Subject operations
  async getAllSubjects(): Promise<AtplSubject[]> {
    return await db.select().from(atplSubjects).orderBy(atplSubjects.code);
  }

  async getSubject(id: number): Promise<AtplSubject | undefined> {
    const [subject] = await db.select().from(atplSubjects).where(eq(atplSubjects.id, id));
    return subject;
  }

  // Question operations
  async getQuestionsBySubject(subjectId: number): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.subjectId, subjectId));
  }

  async getRandomQuestions(subjectId: number, count: number): Promise<Question[]> {
    // In a production system, you might want to use a more sophisticated random selection
    const allQuestions = await db.select().from(questions).where(eq(questions.subjectId, subjectId));
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question;
  }

  // Test session operations
  async createTestSession(session: InsertTestSession): Promise<TestSession> {
    const [newSession] = await db
      .insert(testSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getTestSession(id: number): Promise<TestSession | undefined> {
    const [session] = await db.select().from(testSessions).where(eq(testSessions.id, id));
    return session;
  }

  async updateTestSession(id: number, updates: Partial<TestSession>): Promise<TestSession> {
    const [updated] = await db
      .update(testSessions)
      .set(updates)
      .where(eq(testSessions.id, id))
      .returning();
    return updated;
  }

  async getUserTestSessions(userId: string): Promise<TestSession[]> {
    return await db
      .select()
      .from(testSessions)
      .where(eq(testSessions.userId, userId))
      .orderBy(desc(testSessions.startTime));
  }

  // User answer operations
  async saveUserAnswer(answer: InsertUserAnswer): Promise<UserAnswer> {
    const [saved] = await db
      .insert(userAnswers)
      .values(answer)
      .returning();
    return saved;
  }

  async getSessionAnswers(sessionId: number): Promise<UserAnswer[]> {
    return await db
      .select()
      .from(userAnswers)
      .where(eq(userAnswers.sessionId, sessionId));
  }

  // Progress tracking
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
  }

  async updateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const existing = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, progress.userId),
          eq(userProgress.subjectId, progress.subjectId)
        )
      );

    if (existing.length > 0) {
      const [updated] = await db
        .update(userProgress)
        .set(progress)
        .where(
          and(
            eq(userProgress.userId, progress.userId),
            eq(userProgress.subjectId, progress.subjectId)
          )
        )
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userProgress)
        .values(progress)
        .returning();
      return created;
    }
  }

  async getSubjectProgress(userId: string, subjectId: number): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.subjectId, subjectId)
        )
      );
    return progress;
  }
}

export const storage = new DatabaseStorage();
