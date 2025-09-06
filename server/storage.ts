import {
  users,
  subjects,
  // chapters,
  // sections,
  questions,
  // questionSections,
  // answers,
  // testSessions,
  // userAnswers,
  // userProgress,
  categories,
  topics,
  quizzes,
  questionOptions,
  quizQuestions,
  type User,
  type UpsertUser,
  type Subject,
  type InsertSubject,
  type SignUpData,
  type SignInData,
  // type Chapter,
  // type InsertChapter,
  // type Section,
  // type InsertSection,
  // type Question,
  type InsertQuestion,
  // type Answer,
  // type InsertAnswer,
  // type TestSession,
  // type InsertTestSession,
  // type UserAnswer,
  // type InsertUserAnswer,
  // type UserProgress,
  // type InsertUserProgress,
  type Categories,
  type Topics,
  type Quizzes,
  type Questions,
  type QuestionOptions,
  type QuizQuestions,
} from "../shared/schema";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { eq, and, desc, avg, max, count, ne, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(userData: SignUpData): Promise<User>;
  authenticateUser(credentials: SignInData): Promise<User | null>;
  updateUserProfile(
    userId: string,
    profileData: { firstName?: string; lastName?: string; username?: string },
  ): Promise<User>;
  updateUserPassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void>;
  // Subject operations
  getAllSubjects(): Promise<Categories[]>;
  getSubject(id: number): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;

  // Chapter operations
  // getChaptersBySubject(subjectId: number): Promise<Chapter[]>;
  // getChapter(id: number): Promise<Chapter | undefined>;
  // createChapter(chapter: InsertChapter): Promise<Chapter>;

  // Section operations
  // getSectionsByChapter(chapterId: number): Promise<Section[]>;
  // getSection(id: number): Promise<Section | undefined>;
  // createSection(section: InsertSection): Promise<Section>;

  // Answer operations
  // getAnswersByQuestion(questionId: number): Promise<Answer[]>;
  // createAnswer(answer: InsertAnswer): Promise<Answer>;

  // Question operations
  // getQuestionsBySubject(subjectId: number): Promise<Question[]>;
  // getRandomQuestions(subjectId: number, count: number): Promise<Question[]>;
  getQuestion(id: number): Promise<Questions | undefined>;

  // Test session operations
  // createTestSession(session: InsertTestSession): Promise<TestSession>;
  // getTestSession(id: number): Promise<TestSession | undefined>;
  // updateTestSession(id: number, updates: Partial<TestSession>): Promise<TestSession>;
  // getUserTestSessions(userId: string): Promise<TestSession[]>;

  // User answer operations
  // saveUserAnswer(answer: InsertUserAnswer): Promise<UserAnswer>;
  // getSessionAnswers(sessionId: number): Promise<UserAnswer[]>;

  // Progress tracking
  // getUserProgress(userId: string): Promise<UserProgress[]>;
  // updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  // getSubjectProgress(userId: string, subjectId: number): Promise<UserProgress | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
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

  async createUser(userData: SignUpData): Promise<User> {
    // Check if user already exists
    const existingUserByEmail = await this.getUserByEmail(userData.email);
    if (existingUserByEmail) {
      throw new Error("User with this email already exists");
    }

    if (userData.username) {
      const existingUserByUsername = await this.getUserByUsername(
        userData.username,
      );
      if (existingUserByUsername) {
        throw new Error("User with this username already exists");
      }
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    // Create user
    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        passwordHash,
      })
      .returning();

    return user;
  }

  async authenticateUser(credentials: SignInData): Promise<User | null> {
    const user = await this.getUserByEmail(credentials.email);
    if (!user || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async updateUserProfile(
    userId: string,
    profileData: { firstName?: string; lastName?: string; username?: string },
  ): Promise<User> {
    // Check if username already exists (if username is being updated)
    if (profileData.username) {
      const existingUser = await this.getUserByUsername(profileData.username);
      if (existingUser && existingUser.id !== userId) {
        throw new Error("A user with this username already exists");
      }
    }

    const [user] = await db
      .update(users)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async updateUserPassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    // Get the user first to verify current password
    const user: any = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    // Hash the new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update the password
    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Subject operations
  async getAllSubjects(): Promise<Categories[]> {
    return await db.select().from(categories).orderBy(categories.id);
  }

  async getTopicByName(name: string): Promise<any | []> {
    const parentTopics = await db
      .select()
      .from(topics)
      .where(and(eq(topics.categoryName, name), eq(topics.parentId, -1)));
    console.log("parentTopics...", parentTopics);
    if (parentTopics.length > 0) {
      return {
        type: "topic",
        data: parentTopics,
      };
    }

    const subTopics = await db
      .select()
      .from(topics)
      .where(and(eq(topics.parentName, name), ne(topics.quizId, -1)));
    console.log("subTopics...", subTopics);
    if (subTopics.length > 0) {
      return {
        type: "topic",
        data: subTopics,
      };
    }

    const topicQuizId = await db
      .select({ id: topics.quizId })
      .from(topics)
      .where(eq(topics.slug, name))
      .limit(1);
    console.log("TopicQuizId...", topicQuizId);

    const quiz = await db
      .select({ id: quizzes.id })
      .from(quizzes)
      .where(eq(quizzes.quizId, topicQuizId[0].id))
      .limit(1);

    if (quiz.length === 0) {
      throw new Error(`Quiz with quiz_id=${topicQuizId} not found`);
    }

    const quizId = quiz[0].id;
    console.log("quizId....", quizId);

    const result2 = await db
      .select({
        id: quizQuestions.id,
        quiz_id: quizQuestions.quizId,
        position: quizQuestions.position,
        questionPk: questions.id,
        question_id: questions.questionId,
        question_text: questions.text,
        explaination: questions.explanation,
        explaination_img: questions.explanationImage,
        tooltio: questions.tooltip,
        featured_img: questions.featuredImage,
        created_at: questions.createdAt,
        option_text: questionOptions.optionText,
        isCorrect: questionOptions.isCorrect,
        optionOrder: questionOptions.optionOrder,
      })
      .from(quizQuestions)
      .innerJoin(questions, eq(quizQuestions.questionId, questions.id))
      .leftJoin(questionOptions, eq(questions.id, questionOptions.questionId))
      .where(eq(quizQuestions.quizId, quizId))
      .orderBy(asc(quizQuestions.id), asc(questionOptions.optionOrder));

    // console.log("results quiz......", result2);
    if (result2.length > 0) {
      return {
        type: "quiz",
        data: result2,
      };
    }

    return [];
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    const [subject] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, id));
    return subject;
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const [created] = await db.insert(subjects).values(subject).returning();
    return created;
  }

  // Chapter operations
  // async getChaptersBySubject(subjectId: number): Promise<Chapter[]> {
  //   return await db.select().from(chapters).where(eq(chapters.subjectId, subjectId)).orderBy(chapters.sequence, chapters.name);
  // }

  // async getChapter(id: number): Promise<Chapter | undefined> {
  //   const [chapter] = await db.select().from(chapters).where(eq(chapters.id, id));
  //   return chapter;
  // }

  // async createChapter(chapter: InsertChapter): Promise<Chapter> {
  //   const [created] = await db.insert(chapters).values(chapter).returning();
  //   return created;
  // }

  // Section operations
  // async getSectionsByChapter(chapterId: number): Promise<Section[]> {
  //   return await db.select().from(sections).where(eq(sections.chapterId, chapterId)).orderBy(sections.sequence, sections.name);
  // }

  // async getSection(id: number): Promise<Section | undefined> {
  //   const [section] = await db.select().from(sections).where(eq(sections.id, id));
  //   return section;
  // }

  // async createSection(section: InsertSection): Promise<Section> {
  //   const [created] = await db.insert(sections).values(section).returning();
  //   return created;
  // }

  // Question operations ??
  // async getQuestionsBySubject(subjectId: number): Promise<Question[]> {
  //   // Get questions by joining through sections and chapters via questionSections mapping
  //   return await db
  //     .select()
  //     .from(questions)
  //     .innerJoin(questionSections, eq(questions.id, questionSections.question_id))
  //     .innerJoin(sections, eq(questionSections.section_id, sections.id))
  //     .innerJoin(chapters, eq(sections.chapterId, chapters.id))
  //     .where(eq(chapters.subjectId, subjectId))
  //     .then(rows => rows.map(row => row.questions));
  // }

  // async getRandomQuestions(subjectId: number, count: number): Promise<Question[]> {
  //   const allQuestions = await this.getQuestionsBySubject(subjectId);
  //   const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  //   return shuffled.slice(0, count);
  // }

  // async getQuestionsBySection(sectionId: number): Promise<Question[]> {
  //   // Get questions mapped to this section through question_sections table
  //   return await db
  //     .select()
  //     .from(questions)
  //     .innerJoin(questionSections, eq(questions.id, questionSections.question_id))
  //     .where(eq(questionSections.section_id, sectionId))
  //     .orderBy(questionSections.sequence)
  //     .then(rows => rows.map(row => row.questions));
  // }

  // Answer operations
  // async getAnswersByQuestion(questionId: number): Promise<Answer[]> {
  //   return await db.select().from(answers).where(eq(answers.questionId, questionId));
  // }

  // async createAnswer(answer: InsertAnswer): Promise<Answer> {
  //   const [created] = await db.insert(answers).values(answer).returning();
  //   return created;
  // }

  async getQuestion(id: number): Promise<Questions | undefined> {
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, id));
    return question;
  }

  // Test session operations
  // async createTestSession(session: InsertTestSession): Promise<TestSession> {
  //   const [newSession] = await db
  //     .insert(testSessions)
  //     .values(session)
  //     .returning();
  //   return newSession;
  // }

  // async getTestSession(id: number): Promise<TestSession | undefined> {
  //   const [session] = await db.select().from(testSessions).where(eq(testSessions.id, id));
  //   return session;
  // }

  // async updateTestSession(id: number, updates: Partial<TestSession>): Promise<TestSession> {
  //   const [updated] = await db
  //     .update(testSessions)
  //     .set(updates)
  //     .where(eq(testSessions.id, id))
  //     .returning();
  //   return updated;
  // }

  // async getUserTestSessions(userId: string): Promise<TestSession[]> {
  //   return await db
  //     .select()
  //     .from(testSessions)
  //     .where(eq(testSessions.userId, userId))
  //     .orderBy(desc(testSessions.startTime));
  // }

  // User answer operations
  // async saveUserAnswer(answer: InsertUserAnswer): Promise<UserAnswer> {
  //   const [saved] = await db
  //     .insert(userAnswers)
  //     .values(answer)
  //     .returning();
  //   return saved;
  // }

  // async getSessionAnswers(sessionId: number): Promise<UserAnswer[]> {
  //   return await db
  //     .select()
  //     .from(userAnswers)
  //     .where(eq(userAnswers.sessionId, sessionId));
  // }

  // Progress tracking
  // async getUserProgress(userId: string): Promise<UserProgress[]> {
  //   return await db
  //     .select()
  //     .from(userProgress)
  //     .where(eq(userProgress.userId, userId));
  // }

  // async updateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
  //   const existing = await db
  //     .select()
  //     .from(userProgress)
  //     .where(
  //       and(
  //         eq(userProgress.userId, progress.userId),
  //         eq(userProgress.subjectId, progress.subjectId)
  //       )
  //     );

  //   if (existing.length > 0) {
  //     const [updated] = await db
  //       .update(userProgress)
  //       .set(progress)
  //       .where(
  //         and(
  //           eq(userProgress.userId, progress.userId),
  //           eq(userProgress.subjectId, progress.subjectId)
  //         )
  //       )
  //       .returning();
  //     return updated;
  //   } else {
  //     const [created] = await db
  //       .insert(userProgress)
  //       .values(progress)
  //       .returning();
  //     return created;
  //   }
  // }

  // async getSubjectProgress(userId: string, subjectId: number): Promise<UserProgress | undefined> {
  //   const [progress] = await db
  //     .select()
  //     .from(userProgress)
  //     .where(
  //       and(
  //         eq(userProgress.userId, userId),
  //         eq(userProgress.subjectId, subjectId)
  //       )
  //     );
  //   return progress;
  // }
}

export const storage = new DatabaseStorage();
