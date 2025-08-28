import {
  users,
  subjects,
  chapters,
  sections,
  questions,
  questionSections,
  answers,
  testSessions,
  userAnswers,
  userProgress,
  categories,
  topics,
  type User,
  type UpsertUser,
  type Subject,
  type InsertSubject,
  type Chapter,
  type InsertChapter,
  type Section,
  type InsertSection,
  type Question,
  type InsertQuestion,
  type Answer,
  type InsertAnswer,
  type TestSession,
  type InsertTestSession,
  type UserAnswer,
  type InsertUserAnswer,
  type UserProgress,
  type InsertUserProgress,
  type Categories,
  type Topics,
} from "../shared/schema";
import { db, pool } from "./db";
import { eq, and, desc, avg, max, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Subject operations
  getAllSubjects(): Promise<Categories[]>;
  getSubject(id: number): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  
  // Chapter operations
  getChaptersBySubject(subjectId: number): Promise<Chapter[]>;
  getChapter(id: number): Promise<Chapter | undefined>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  
  // Section operations
  getSectionsByChapter(chapterId: number): Promise<Section[]>;
  getSection(id: number): Promise<Section | undefined>;
  createSection(section: InsertSection): Promise<Section>;
  
  // Answer operations
  getAnswersByQuestion(questionId: number): Promise<Answer[]>;
  createAnswer(answer: InsertAnswer): Promise<Answer>;
  
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

  // Topics (raw SQL)
  getRootTopicsRaw(): Promise<any[]>;
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
  async getAllSubjects(): Promise<Categories[]> {
    return await db.select().from(categories).orderBy(categories.id);
  }

  async getTopicByName(name: string): Promise<any | []> {
    const parentTopics = await db.select().from(topics).where(and(eq(topics.parentName, name), eq(topics.quizId, -1)));
    if (parentTopics.length > 0) {
      return parentTopics;
    }
    console.log("parentTopics...",parentTopics);

    const categoryTopics = await db.select().from(topics).where(and(eq(topics.categoryName, name), eq(topics.quizId, -1)));
    console.log("categoryTopics...",categoryTopics)

    if (categoryTopics.length > 0) {
      return categoryTopics;
    }
    return [];
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
    return subject;
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const [created] = await db.insert(subjects).values(subject).returning();
    return created;
  }

  // Chapter operations
  async getChaptersBySubject(subjectId: number): Promise<Chapter[]> {
    return await db.select().from(chapters).where(eq(chapters.subjectId, subjectId)).orderBy(chapters.sequence, chapters.name);
  }

  async getChapter(id: number): Promise<Chapter | undefined> {
    const [chapter] = await db.select().from(chapters).where(eq(chapters.id, id));
    return chapter;
  }

  async createChapter(chapter: InsertChapter): Promise<Chapter> {
    const [created] = await db.insert(chapters).values(chapter).returning();
    return created;
  }

  // Section operations
  async getSectionsByChapter(chapterId: number): Promise<Section[]> {
    return await db.select().from(sections).where(eq(sections.chapterId, chapterId)).orderBy(sections.sequence, sections.name);
  }

  async getSection(id: number): Promise<Section | undefined> {
    const [section] = await db.select().from(sections).where(eq(sections.id, id));
    return section;
  }

  async createSection(section: InsertSection): Promise<Section> {
    const [created] = await db.insert(sections).values(section).returning();
    return created;
  }

  // Question operations
  async getQuestionsBySubject(subjectId: number): Promise<Question[]> {
    // Get questions by joining through sections and chapters via questionSections mapping
    return await db
      .select()
      .from(questions)
      .innerJoin(questionSections, eq(questions.id, questionSections.question_id))
      .innerJoin(sections, eq(questionSections.section_id, sections.id))
      .innerJoin(chapters, eq(sections.chapterId, chapters.id))
      .where(eq(chapters.subjectId, subjectId))
      .then(rows => rows.map(row => row.questions));
  }

  async getRandomQuestions(subjectId: number, count: number): Promise<Question[]> {
    const allQuestions = await this.getQuestionsBySubject(subjectId);
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  async getQuestionsBySection(sectionId: number): Promise<Question[]> {
    // Get questions mapped to this section through question_sections table
    return await db
      .select()
      .from(questions)
      .innerJoin(questionSections, eq(questions.id, questionSections.question_id))
      .where(eq(questionSections.section_id, sectionId))
      .orderBy(questionSections.sequence)
      .then(rows => rows.map(row => row.questions));
  }

  // Answer operations
  async getAnswersByQuestion(questionId: number): Promise<Answer[]> {
    return await db.select().from(answers).where(eq(answers.questionId, questionId));
  }

  async createAnswer(answer: InsertAnswer): Promise<Answer> {
    const [created] = await db.insert(answers).values(answer).returning();
    return created;
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

  // Topics via plain SQL (no ORM)
  async getRootTopicsRaw(): Promise<any[]> {
    const sql = `
      SELECT id, category_id, parent_id, slug, text, quiz_id
      FROM topics
      WHERE parent_id IS NULL
      ORDER BY id ASC
    `;
    const result = await pool.query(sql);
    return result.rows as any[];
  }
}

export const storage = new DatabaseStorage();
