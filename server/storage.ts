import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {
  users,
  subjects,
  subscriptions,
  subscriptionPlan,
  questions,
  testSessions,
  userAnswers,
  userProgress,
  categories,
  topics,
  quizzes,
  questionOptions,
  quizQuestions,
  issueReports,
  questionComments,
  packages,
  type User,
  type UpsertUser,
  type Subject,
  type InsertSubject,
  type SignUpData,
  type SignInData,
  type InsertQuestion,
  type TestSession,
  type InsertTestSession,
  type UserAnswer,
  type InsertUserAnswer,
  type UserProgress,
  type InsertUserProgress,
  type Categories,
  type Topics,
  type Quizzes,
  type Questions,
  type QuestionOptions,
  type QuizQuestions,
  type IssueReport,
  type InsertIssueReport,
  type QuestionComment,
  type InsertQuestionComment,
  type InsertCategory,
  type Package,
  type InsertPackage,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  insertSubscriptionPlan,
} from "../shared/schema";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { eq, and, desc, avg, max, count, ne, asc, sql, or, like, isNull, inArray } from "drizzle-orm";
import { text } from "stream/consumers";
import { Subscription } from "react-hook-form/dist/utils/createSubject";

// Get __filename and __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  updateUserActiveStatus(userId: string, isActive: boolean): Promise<User>;
  // Subject/Category operations
  getAllSubjects(): Promise<Categories[]>;
  getSubscriptionsByUserId(userId: string): Promise<any[]>;
  getSubcriptionPlanDetails(): Promise<any[]>;
  getSubject(id: number): Promise<Subject | undefined>;
  getCategory(id: number): Promise<Categories | undefined>;
  getCategoryByName(name: string): Promise<Categories | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateCategory(id: number, data: Partial<Categories>): Promise<Categories>;
  deleteCategory(id: number): Promise<void>;

  // Topic operations
  getAllTopics(): Promise<Topics[]>;
  getTopicById(topicId: number): Promise<Topics | null>;
  createTopic(data: Partial<Topics>): Promise<Topics>;
  updateTopic(id: number, data: Partial<Topics>): Promise<Topics>;
  deleteTopic(id: number): Promise<void>;

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
  createQuestion(questionData: any): Promise<any>;

  // Issue Report operations
  createIssueReport(report: InsertIssueReport): Promise<IssueReport>;
  getIssueReportsByUser(userId: string): Promise<IssueReport[]>;
  acknowledgeIssueReport(reportId: number, adminId: string): Promise<IssueReport>;
  // getAllIssueReports(): Promise<IssueReport[]>;

  // Package operations
  getAllPackages(): Promise<Package[]>;
  getActivePackages(): Promise<Package[]>;
  getPackageById(id: number): Promise<Package | undefined>;
  createPackage(packageData: InsertPackage): Promise<Package>;
  createSubscriptionPlan(subscriptionPlanData: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updatePackage(id: number, packageData: Partial<InsertPackage>): Promise<Package>;
  deletePackage(id: number): Promise<void>;

  // Comment operations
  createComment(comment: InsertQuestionComment): Promise<QuestionComment>;
  getCommentsByQuestion(questionId: number): Promise<QuestionComment[]>;
  
  // Admin comment moderation
  getAllPendingComments(): Promise<QuestionComment[]>;
  approveComment(commentId: number, adminId: string, adminResponse?: string): Promise<QuestionComment>;
  rejectComment(commentId: number, adminId: string, adminResponse?: string): Promise<QuestionComment>;
  
  // Topic and quiz management
  getAllTopics(): Promise<Topics[]>;
  getTopicById(topicId: number): Promise<Topics | null>;
  createQuiz(title: string, slug: string): Promise<Quizzes>;
  getQuizByQuizId(externalQuizId: number): Promise<any>;
  linkQuestionToQuiz(questionId: number, quizPrimaryKey: number): Promise<void>;
  linkQuestionsToTopic(questionIds: number[], topicId: number): Promise<void>;
  
  // Admin operations
  getAllIssueReports(page?: number, limit?: number): Promise<{ reports: IssueReport[], total: number }>;
  getAllQuestionsForAdmin(page?: number, limit?: number, searchText?: string, hasEmptyExplanation?: boolean): Promise<{ questions: any[], total: number }>;
  updateQuestion(questionId: number, questionData: any): Promise<any>;
  getAllUsers(page?: number, limit?: number): Promise<{ users: User[], total: number }>;

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
  getSectionProgress(userId: string, sectionName: string): Promise<UserProgress | undefined>;

  // Question search
  searchQuestions(searchText: string): Promise<any[]>;
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

    

    // Insert subscription if planDuration provided
    if (userData.planDuration) {
      await db.insert(subscriptions).values({
        user_id: user.id,
        plan_duration: userData.planDuration,
        subscribed_at: new Date(),
      });
    }

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

  async updateUserActiveStatus(userId: string, isActive: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

   async upsertGoogleUser(userData: {
  email: string;
  firstName: string;
  lastName: string;
  googleId: string;
  profileImageUrl?: string;
}): Promise<User> {
  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.googleId, userData.googleId));

  if (!user) {
    const [newUser] = await db
      .insert(users)
      .values({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.email.split("@")[0],
        googleId: userData.googleId,
        profileImageUrl: userData.profileImageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    user = newUser;
  }

  return user;
}

  // Subject operations
  async getAllSubjects(): Promise<Categories[]> {
    return await db.select().from(categories).orderBy(categories.id);
  }

  async getSubscriptionsByUserId(userId: string): Promise<any[]> {
    return await db.select().from(subscriptions).where(eq(subscriptions.user_id, userId));
  }

  async getSubcriptionPlanDetails(): Promise<any[]> {
    return await db.select().from(subscriptionPlan).orderBy(subscriptionPlan.id);
  }

  async getCategoryByName(name: string): Promise<Categories | undefined> {
    const [cateogry] = await db
      .select()
      .from(categories)
      .where(eq(categories.text, name));

    return cateogry;
  }

  async getTopicByCategoryName(name: string): Promise<any | []> {
    const parentTopics = await db
      .select()
      .from(topics)
      .where(and(eq(topics.categoryName, name), eq(topics.parentId, -1)));

    if (parentTopics.length > 0) {
      return {
        type: "topic",
        data: parentTopics,
      };
    }

    const subTopics = await db
      .select()
      .from(topics)
      .where(and(eq(topics.parentName, name)));

    if (subTopics.length > 0) {
      return {
        type: "topic",
        data: subTopics,
      };
    }

    const topicBySlug = await db
      .select({ quizId: topics.quizId, text: topics.text })
      .from(topics)
      .where(eq(topics.slug, name))
      .limit(1);

    console.log("topicBySlug", topicBySlug);
    let quiz: any[] = [];

    if(topicBySlug.length > 0) {
      console.log("topicBySlug[0].quizId", topicBySlug[0]);
      const quizId = topicBySlug[0].quizId;

       if(quizId === -1) {
        const topic: any = await db
          .select()
          .from(topics)
          .where(and(eq(topics.slug, name)));

        const newTopic = {
            ...topic[0],
            text: "ignore",
            parentId: topic[0].id,
            parentName: topic[0].slug
          }
        return {
          type: "topic",
          data: [newTopic],
        };
      } else if(quizId === 1) {
        return {
          type: "quiz",
          data: [],
          topicName: topicBySlug[0].text,
        };
      }

      quiz = await db
      .select({ id: quizzes.id })
      .from(quizzes)
      .where(eq(quizzes.quizId, quizId))
      .limit(1);
    } else {
      console.log("No topic found with slug:", name);
      this.getDefaultReturnValue(name);
    }

    if (quiz.length === 0) {
      return this.getDefaultReturnValue(name);
    }

    console.log("quiz", quiz);
    const quizPrimaryKey = quiz[0].id;

    const result2 = await db.execute(sql`
      SELECT 
        qq.id,
        qq.quiz_id,
        qq.position,
        q.id AS question_pk,
        q.question_id,
        q.text AS question_text,
        q.explanation,
        q.explanation_image,
        q.tooltip,
        q.featured_image,
        q.created_at,
        json_agg(json_build_object(
          'key', qo.id,
          'optionText', qo.option_text,
          'isCorrect', qo.is_correct,
          'optionOrder', qo.option_order
        ) ORDER BY qo.option_order) AS options
      FROM quiz_questions qq
      JOIN questions q 
        ON qq.question_id = q.id
      LEFT JOIN question_options qo 
        ON q.id = qo.question_id
      WHERE qq.quiz_id = ${quizPrimaryKey}
        AND q.is_active = true
      GROUP BY qq.id, q.id
      ORDER BY qq.id;
    `);

    const quizRows = Array.isArray(result2) ? result2 : (result2.rows ?? []);
    if (quizRows.length > 0) {
      return {
        type: "quiz",
        data: quizRows,
        topicName: topicBySlug[0].text,
      };
    }

    const topic = await this.getTopicByName(name);

    if(!topic) return [];

    const newTopic = {
        id: topic.id,
        slug: name,
        text: "ignore",
        categoryId: topic.categoryId,
        categoryName: topic.categoryName,
        parentId: -1,
        parentName: null,
        quiz_id: quizPrimaryKey
      }
    return {
      type: "topic",
      data: [newTopic],
    };
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    const [subject] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, id));
    return subject;
  }

  async getDefaultReturnValue(name: string) {
    const category = await this.getCategoryByName(name);

    if(!category) return [];

    const newTopic = {
        id: category.id,
        slug: name,
        text: "ignore",
        categoryId: category.id,
        categoryName: category.text,
        parentId: -1,
        parentName: null,
        quiz_id: -1
      }
    return {
      type: "topic",
      data: [newTopic],
    };
  }

  async getCategory(id: number): Promise<Categories | undefined> {
    const [cateogry] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    return cateogry;
  }

  async getTopicByName(name: string): Promise<Topics | undefined> {
    const [topic] = await db
      .select()
      .from(topics)
      .where(eq(topics.slug, name));

    return topic;
  }
  
  async createCategories(category: InsertCategory): Promise<Categories> {
    const [created] = await db.insert(categories).values(category).returning();
    return created;
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

  async getQuestionOptions(questionId: number): Promise<any[]> {
    return await db
      .select()
      .from(questionOptions)
      .where(eq(questionOptions.questionId, questionId))
      .orderBy(asc(questionOptions.optionOrder));
  }

  async searchQuestions(searchText: string): Promise<any[]> {
    try {
      const rows = await db
        .select({
          questionId: questions.id,
          questionText: questions.text,
          explanation: questions.explanation,
          quizId: quizzes.id,
          quizTitle: topics.text,
          quizSlug: topics.slug,
        })
        .from(questions)
        .leftJoin(quizQuestions, eq(questions.id, quizQuestions.questionId))
        .leftJoin(quizzes, eq(quizQuestions.quizId, quizzes.id))
        .leftJoin(topics, eq(quizzes.quizId, topics.quizId))
        .where(
          and(
            eq(questions.isActive, true),
            like(questions.text, `%${searchText}%`)
          )
        )
        .limit(50); // fetch extra since grouping may shrink results

      // Group quizzes under each question
      const questionMap: Record<string, any> = {};

      for (const row of rows) {
        if (!questionMap[row.questionId]) {
          questionMap[row.questionId] = {
            questionId: row.questionId,
            questionText: row.questionText,
            explanation: row.explanation,
            quizzes: [],
          };
        }
        if (row.quizId) {
          questionMap[row.questionId].quizzes.push({
            quizId: row.quizId,
            quizTitle: row.quizTitle,
            quizSlug: row.quizSlug,
          });
        }
      }

      return Object.values(questionMap).slice(0, 10);
    } catch (error) {
      console.error("Error searching questions:", error);
      throw error;
    }
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
          eq(userProgress.sectionName, progress.sectionName)
        )
      );

    if (existing.length > 0) {
      const [updated] = await db
        .update(userProgress)
        .set(progress)
        .where(
          and(
            eq(userProgress.userId, progress.userId),
            eq(userProgress.sectionName, progress.sectionName)
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

  async getSectionProgress(userId: string, sectionName: string): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.sectionName, sectionName)
        )
      );
    return progress;
  }

  // Issue Report operations
  async createIssueReport(report: InsertIssueReport): Promise<IssueReport> {
    const [issueReport] = await db
      .insert(issueReports)
      .values(report)
      .returning();
    return issueReport;
  }

  async getIssueReportsByUser(userId: string): Promise<IssueReport[]> {
    return await db
      .select()
      .from(issueReports)
      .where(eq(issueReports.userId, userId))
      .orderBy(desc(issueReports.createdAt));
  }

  // Comment operations
  async createComment(comment: InsertQuestionComment): Promise<QuestionComment> {
    const [questionComment] = await db
      .insert(questionComments)
      .values(comment)
      .returning();
    return questionComment;
  }

  async getCommentsByQuestion(questionId: number): Promise<QuestionComment[]> {
    // Only return approved comments to regular users
    return await db
      .select()
      .from(questionComments)
      .where(
        and(
          eq(questionComments.questionId, questionId),
          eq(questionComments.status, 'approved')
        )
      )
      .orderBy(desc(questionComments.createdAt));
  }

  // Admin comment moderation methods
  async getAllPendingComments(): Promise<QuestionComment[]> {
    return await db
      .select()
      .from(questionComments)
      .where(eq(questionComments.status, 'pending'))
      .orderBy(desc(questionComments.createdAt));
  }

  async approveComment(commentId: number, adminId: string, adminResponse?: string): Promise<QuestionComment> {
    const [updatedComment] = await db
      .update(questionComments)
      .set({
        status: 'approved',
        approvedBy: adminId,
        approvedAt: new Date(),
        adminResponse: adminResponse || null
      })
      .where(eq(questionComments.id, commentId))
      .returning();
    return updatedComment;
  }

  async rejectComment(commentId: number, adminId: string, adminResponse?: string): Promise<QuestionComment> {
    const [updatedComment] = await db
      .update(questionComments)
      .set({
        status: 'rejected',
        approvedBy: adminId,
        approvedAt: new Date(),
        adminResponse: adminResponse || null
      })
      .where(eq(questionComments.id, commentId))
      .returning();
    return updatedComment;
  }

  // Topic and quiz management methods
  async getAllTopics(): Promise<Topics[]> {
    return await db
      .select()
      .from(topics)
      .orderBy(topics.categoryName, topics.text);
  }

  async getTopicById(topicId: number): Promise<Topics | null> {
    const [topic] = await db
      .select()
      .from(topics)
      .where(eq(topics.id, topicId));
    return topic || null;
  }

  async createTopic(data: Partial<Topics>): Promise<Topics> {
    const [newTopic] = await db
      .insert(topics)
      .values({
        categoryId: data.categoryId!,
        categoryName: data.categoryName!,
        parentId: data.parentId || -1,
        parentName: data.parentName || null,
        slug: data.slug!,
        text: data.text!,
        quizId: data.quizId || null,
      })
      .returning();
    return newTopic;
  }

  async updateTopic(id: number, data: Partial<Topics>): Promise<Topics> {
    const [updatedTopic] = await db
      .update(topics)
      .set(data)
      .where(eq(topics.id, id))
      .returning();
    return updatedTopic;
  }

  async deleteTopic(id: number): Promise<void> {
    await db.delete(topics).where(eq(topics.id, id));
  }

  async updateCategory(id: number, data: Partial<Categories>): Promise<Categories> {
    const [updatedCategory] = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async createQuiz(title: string, slug: string): Promise<Quizzes> {
    // Get the next quizId
    const [maxQuizResult] = await db
      .select({ maxQuizId: sql`COALESCE(MAX(quiz_id), 0)` })
      .from(quizzes);
    const nextQuizId = (maxQuizResult?.maxQuizId as number || 0) + 1;

    const [newQuiz] = await db
      .insert(quizzes)
      .values({
        quizId: nextQuizId,
        slug,
        title,
      })
      .returning();
    return newQuiz;
  }

  async linkQuestionsToTopic(questionIds: number[], topicId: number): Promise<void> {
    await db.transaction(async (tx) => {
      // Get the topic
      const [topic] = await tx
        .select()
        .from(topics)
        .where(eq(topics.id, topicId));

      if (!topic) {
        throw new Error('Topic not found');
      }

      let quizPrimaryKey: number;

      // If topic doesn't have a quiz, create one within the transaction
      if (!topic.quizId) {
        const quizTitle = `${topic.categoryName} - ${topic.text}`;
        const quizSlug = `${topic.slug}-quiz`;
        
        // Get the next external quizId within the transaction
        const [maxQuizResult] = await tx
          .select({ maxQuizId: sql`COALESCE(MAX(quiz_id), 0)` })
          .from(quizzes);
        const nextExternalQuizId = (maxQuizResult?.maxQuizId as number || 0) + 1;

        // Create quiz within the transaction
        const [newQuiz] = await tx
          .insert(quizzes)
          .values({
            quizId: nextExternalQuizId,
            slug: quizSlug,
            title: quizTitle,
          })
          .returning();

        // Use the internal primary key for quiz_questions foreign key
        quizPrimaryKey = newQuiz.id;

        // Update topic with the external quizId
        await tx
          .update(topics)
          .set({ quizId: nextExternalQuizId })
          .where(eq(topics.id, topicId));
      } else {
        // Topic has existing quiz, lookup the internal primary key
        const [existingQuiz] = await tx
          .select()
          .from(quizzes)
          .where(eq(quizzes.quizId, topic.quizId));

        if (!existingQuiz) {
          throw new Error(`Quiz with ID ${topic.quizId} not found`);
        }

        quizPrimaryKey = existingQuiz.id;
      }

      // Link questions to the quiz using the internal primary key
      const quizQuestionData = questionIds.map(questionId => ({
        quizId: quizPrimaryKey, // Use internal PK, not external ID
        questionId,
      }));

      if (quizQuestionData.length > 0) {
        // Use onConflictDoNothing with target to prevent duplicate links
        await tx
          .insert(quizQuestions)
          .values(quizQuestionData)
      }
    });
  }

  // Link a single question to a quiz by quiz's internal primary key
  async updateQuizIdToTopic(topicId: number, quizId: number): Promise<void> {
    // Update topic with the external quizId
    await db
      .update(topics)
      .set({ quizId: quizId })
      .where(eq(topics.id, topicId));
  }

  // Admin operations implementation
  async getAllIssueReports(page: number = 1, limit: number = 50): Promise<{ reports: IssueReport[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Only show unacknowledged issues
    const reports = await db
      .select()
      .from(issueReports)
      .where(eq(issueReports.isAcknowledged, false))
      .orderBy(desc(issueReports.createdAt))
      .limit(limit)
      .offset(offset);
      
    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(issueReports)
      .where(eq(issueReports.isAcknowledged, false));
      
    return { reports, total: Number(totalCount) };
  }

  async acknowledgeIssueReport(reportId: number, adminId: string): Promise<IssueReport> {
    const [updatedReport] = await db
      .update(issueReports)
      .set({
        isAcknowledged: true,
        acknowledgedAt: new Date(),
        acknowledgedBy: adminId
      })
      .where(eq(issueReports.id, reportId))
      .returning();
    
    return updatedReport;
  }

  async getAllQuestionsForAdmin(
    page: number = 1, 
    limit: number = 50, 
    searchText?: string, 
    hasEmptyExplanation?: boolean
  ): Promise<{ questions: any[], total: number }> {
    const offset = (page - 1) * limit;
    
    let query = db.select().from(questions);
    let countQuery = db.select({ count: count() }).from(questions);
    
    // Add search filter if provided
    if (searchText) {
      const searchCondition = sql`${questions.text} ILIKE ${'%' + searchText + '%'}`;
      query = query.where(searchCondition);
      countQuery = countQuery.where(searchCondition);
    }
    
    // Add empty explanation filter if requested
    if (hasEmptyExplanation) {
      const emptyExplanationCondition = sql`${questions.explanation} IS NULL OR ${questions.explanation} = ''`;
      if (searchText) {
        query = query.where(and(
          sql`${questions.text} ILIKE ${'%' + searchText + '%'}`,
          emptyExplanationCondition
        ));
        countQuery = countQuery.where(and(
          sql`${questions.text} ILIKE ${'%' + searchText + '%'}`,
          emptyExplanationCondition
        ));
      } else {
        query = query.where(emptyExplanationCondition);
        countQuery = countQuery.where(emptyExplanationCondition);
      }
    }
    
    const questionsData = await query
      .orderBy(desc(questions.id))
      .limit(limit)
      .offset(offset);

    // Extract IDs from the fetched questions
    const questionIds = questionsData.map(q => q.id);

    let optionsByQuestion: Record<number, any[]> = {};
    if (questionIds.length > 0) {
      const options = await db
        .select()
        .from(questionOptions)
        .where(inArray(questionOptions.questionId, questionIds));

      // Group options by questionId
      optionsByQuestion = options.reduce((acc, opt) => {
        if (!acc[opt.questionId]) acc[opt.questionId] = [];
        acc[opt.questionId].push(opt);
        return acc;
      }, {} as Record<number, any[]>);
    }

    // Attach options to each question
    const questionsWithOptions = questionsData.map(q => ({
      ...q,
      options: optionsByQuestion[q.id] || []
    }));

    const [{ count: totalCount }] = await countQuery;
    
    return { questions: questionsWithOptions, total: Number(totalCount) };
  }

  /**
   * Process text content and replace base64 images with uploaded file URLs.
   * @param content The text content that may contain base64 images
   * @param folder The subfolder under /public/uploads where images should be saved
   * @returns Updated content with base64 replaced by URL paths
   */
  async processTextWithImages(content: string, folder: string): Promise<string> {
    if (!content) return content;

    const base64Regex = /data:image\/\w+;base64,[A-Za-z0-9+/=]+/g;
    const matches = content.match(base64Regex);

    if (matches) {
      for (const base64Image of matches) {
        // Convert base64 to Buffer
        const buffer = Buffer.from(base64Image.split(",")[1], "base64");

        // Extract extension (e.g., "png", "jpeg")
        const ext = base64Image.substring(11, base64Image.indexOf(";"));
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${ext}`;

        // Build paths
        const folderPath = path.join(__dirname, `../public/uploads/${folder}`);
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }
        const filePath = path.join(folderPath, fileName);

        // Save file
        await fs.promises.writeFile(filePath, buffer);

        // Replace base64 with public URL
        content = content.replace(base64Image, `/uploads/${folder}/${fileName}`);
      }
    }

    return content;
  }

  async getAllUsers(page: number = 1, limit: number = 50): Promise<{ users: User[], total: number }> {
    const offset = (page - 1) * limit;
    
    const usersData = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);
      
    const countResult = await db
      .select({ total: count() })
      .from(users);
      
    return { users: usersData, total: Number(countResult[0]?.total || 0) };
  }

  async updateQuestion(questionId: number, questionData: any): Promise<any> {
    return await db.transaction(async (tx) => {
      // Get current question data
      const [currentQuestion] = await tx
        .select()
        .from(questions)
        .where(eq(questions.id, questionId));
      // Update question only if fields have changed
      const questionUpdates: any = {};
      if (currentQuestion.text !== questionData.question_text) {
        questionUpdates.text = questionData.question_text;
      }
      if (currentQuestion.explanation !== questionData.explanation) {
        questionUpdates.explanation = await this.processTextWithImages(
          questionData.explanation,
          "explanations"
        );
      }

      if (currentQuestion.text !== questionData.question_text) {
        questionUpdates.text = await this.processTextWithImages(
          questionData.question_text,
          "questions"
        );
      }

      let updatedQuestion = currentQuestion;
      if (Object.keys(questionUpdates).length > 0) {
        [updatedQuestion] = await tx
          .update(questions)
          .set(questionUpdates)
          .where(eq(questions.id, questionId))
          .returning();
      }
      // Get current options
      const currentOptions = await tx
        .select()
        .from(questionOptions)
        .where(eq(questionOptions.questionId, questionId))
        .orderBy(asc(questionOptions.optionOrder));
      // Prepare new options data
      let newOptionsData;
      
      if(questionData.options && Array.isArray(questionData.options) && questionData.options.length > 0) {
        newOptionsData = (
          await Promise.all(
            questionData.options.map(async (opt: any, index: number) => ({
              optionText: opt.optionText ? await this.processTextWithImages(opt.optionText, "options") : "",
              isCorrect: opt.isCorrect || false,
              order: index,
              key: opt.key || null
            }))
          )
        ).filter((option: any) => option.optionText && option.optionText.trim() !== "");
      } else {
        newOptionsData = [
          { optionText: await this.processTextWithImages(questionData.option_a, "options"), order: 0 },
          { optionText: await this.processTextWithImages(questionData.option_b, "options"), order: 1 },
          { optionText: await this.processTextWithImages(questionData.option_c, "options"), order: 2 },
          { optionText: await this.processTextWithImages(questionData.option_d, "options"), order: 3 },
        ].filter(option => option.optionText && option.optionText.trim() !== "");
      }
      console.log('New options data:', newOptionsData);

      // Update, insert, or delete options as needed
      for (let i = 0; i < newOptionsData.length; i++) {
        const newOption = newOptionsData[i];
        const currentOption = currentOptions.find(opt => opt.id === newOption.key);
        console.log('Comparing current option:', currentOption, 'with new option:', newOption);

        if (currentOption && newOption) {
          if (currentOption.optionText !== newOption.optionText || 
              currentOption.isCorrect !== newOption.isCorrect || 
              currentOption.optionOrder !== newOption.order) {
              console.log('Updating option:', currentOption.id, newOption);

            await tx
              .update(questionOptions)
              .set({
                optionText: newOption.optionText,
                isCorrect: newOption.isCorrect,
              })
              .where(eq(questionOptions.id, currentOption.id));
          }
        } else if (newOption) {
          console.log('Inserting new option:', newOption);
          // Insert new option
          await tx
            .insert(questionOptions)
            .values({
              questionId: questionId,
              optionText: newOption.optionText,
              isCorrect: newOption.isCorrect,
              optionOrder: newOption.order,
            });
        } else if (currentOption) {
          // Delete removed option
          await tx
            .delete(questionOptions)
            .where(eq(questionOptions.id, currentOption.id));
        }
      }
      return updatedQuestion;
    });
  }

  async getCategoryHierarchy() {
    // Get all categories
    const categoriesData = await db
      .select({
        id: categories.id,
        name: categories.name,
        text: categories.text
      })
      .from(categories)
      .orderBy(asc(categories.name));

    // Get all topics with their quiz information
    const topicsData = await db
      .select({
        id: topics.id,
        categoryId: topics.categoryId,
        categoryName: topics.categoryName,
        parentId: topics.parentId,
        parentName: topics.parentName,
        slug: topics.slug,
        text: topics.text,
        quizId: topics.quizId,
        quizSlug: quizzes.slug,
        quizTitle: quizzes.title
      })
      .from(topics)
      .leftJoin(quizzes, eq(topics.quizId, quizzes.quizId))
      .orderBy(asc(topics.categoryName), asc(topics.text));

    // Build hierarchy structure
    const hierarchy = categoriesData.map(category => {
      // Get top-level topics for this category (no parent)
      const categoryTopics = topicsData.filter(
        topic => topic.categoryId === category.id && topic.parentId === -1
      );

      const buildSubtopics = (parentId: number): any[] => {
        return topicsData
          .filter(topic => topic.parentId === parentId)
          .map(subtopic => ({
            id: subtopic.id,
            text: subtopic.text,
            slug: subtopic.slug,
            quizId: subtopic.quizId,
            quizSlug: subtopic.quizSlug,
            quizTitle: subtopic.quizTitle,
            subtopics: buildSubtopics(subtopic.id)
          }));
      };

      return {
        id: category.id,
        name: category.name,
        text: category.text,
        topics: categoryTopics.map(topic => ({
          id: topic.id,
          text: topic.text,
          slug: topic.slug,
          quizId: topic.quizId,
          quizSlug: topic.quizSlug,
          quizTitle: topic.quizTitle,
          subtopics: buildSubtopics(topic.id)
        }))
      };
    });

    return hierarchy;
  }

  async createQuestion(questionData: any): Promise<any> {
    questionData.explanation = await this.processTextWithImages(
      questionData.explanation,
      "explanations"
    );

    questionData.text = await this.processTextWithImages(
      questionData.question_text,
      "questions"
    );

    return await db.transaction(async (tx) => {
      // Generate a unique questionId for new questions (timestamp in seconds + random number)
      const generatedQuestionId = questionData.questionId || Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
      
      // Get the next available ID to avoid sequence conflicts
      const [maxResult] = await tx.select({ maxId: sql`COALESCE(MAX(id), 0)` }).from(questions);
      const nextId = (maxResult?.maxId as number || 0) + 1;

      // Create question with explicit ID
      const [newQuestion] = await tx
        .insert(questions)
        .values({
          id: nextId,
          questionId: nextId,
          text: questionData.question_text,
          explanation: questionData.explanation || null,
          isActive: true
        })
        .returning();

      // Prepare new options data
      let newOptionsData;
      
      if(questionData.options && Array.isArray(questionData.options) && questionData.options.length > 0) {
        newOptionsData = (
          await Promise.all(
            questionData.options.map(async (opt: any, index: number) => ({
              optionText: opt.optionText ? await this.processTextWithImages(opt.optionText, "options") : "",
              isCorrect: opt.isCorrect || false,
              order: index,
            }))
          )
        ).filter((option: any) => option.optionText && option.optionText.trim() !== "");
      } else {
        newOptionsData = [
          { optionText: await this.processTextWithImages(questionData.option_a, "options"), order: 0 },
          { optionText: await this.processTextWithImages(questionData.option_b, "options"), order: 1 },
          { optionText: await this.processTextWithImages(questionData.option_c, "options"), order: 2 },
          { optionText: await this.processTextWithImages(questionData.option_d, "options"), order: 3 },
        ].filter(option => option.optionText && option.optionText.trim() !== "");
      }

      // Add options if provided
      if (newOptionsData && newOptionsData.length > 0) {
        // fetch max id from question_options
        const [maxResult] = await tx
          .select({ maxId: sql`COALESCE(MAX(id), 0)` })
          .from(questionOptions);

        let nextId = (maxResult?.maxId as number || 0) + 1;

        const optionsToInsert = newOptionsData.map((option: any, index: number) => {
          const optionRecord = {
            id: nextId, // manually assign new id
            questionId: newQuestion.id,
            optionText: option.optionText,
            isCorrect: option.isCorrect || false,
            optionOrder: index,
          };

          nextId += 1; // increment for next option
          return optionRecord;
        });

        await tx.insert(questionOptions).values(optionsToInsert);
      }


      // Link question to quiz if quizId provided
      if (questionData.quizId) {
        await tx
          .insert(quizQuestions)
          .values({
            quizId: questionData.quizId,
            questionId: newQuestion.id,
            position: questionData.position || 999
          });
      }

      return newQuestion;
    });
  }

  async softDeleteQuestion(questionId: number): Promise<any> {
    const [updatedQuestion] = await db
      .update(questions)
      .set({ isActive: false })
      .where(eq(questions.id, questionId))
      .returning();
    
    return updatedQuestion;
  }

  async getQuizByQuizId(externalQuizId: number): Promise<any> {
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, externalQuizId));
    return quiz || null;
  }

  async linkQuestionToQuiz(questionId: number, quizPrimaryKey: number): Promise<void> {
    // Insert into quiz_questions table to link question to quiz
    // Use onConflictDoNothing to prevent duplicate entries
    await db
      .insert(quizQuestions)
      .values({
        id: questionId,
        quizId: quizPrimaryKey,
        questionId: questionId,
        position: 999 // Default position
      })
  }

  async getActiveQuestions(quizId?: number): Promise<any[]> {
    let query = db
      .select({
        id: questions.id,
        questionId: questions.questionId,
        text: questions.text,
        explanation: questions.explanation,
        isActive: questions.isActive,
        options: sql`
          COALESCE(
            json_agg(
              json_build_object(
                'id', ${questionOptions.id},
                'text', ${questionOptions.optionText},
                'isCorrect', ${questionOptions.isCorrect},
                'order', ${questionOptions.optionOrder}
              ) ORDER BY ${questionOptions.optionOrder}
            ) FILTER (WHERE ${questionOptions.id} IS NOT NULL),
            '[]'::json
          )
        `.as('options')
      })
      .from(questions)
      .leftJoin(questionOptions, eq(questions.id, questionOptions.questionId))
      .where(eq(questions.isActive, true))
      .groupBy(questions.id);

    if (quizId) {
      query = db
        .select({
          id: questions.id,
          questionId: questions.questionId,
          text: questions.text,
          explanation: questions.explanation,
          isActive: questions.isActive,
          options: sql`
            COALESCE(
              json_agg(
                json_build_object(
                  'id', ${questionOptions.id},
                  'text', ${questionOptions.optionText},
                  'isCorrect', ${questionOptions.isCorrect},
                  'order', ${questionOptions.optionOrder}
                ) ORDER BY ${questionOptions.optionOrder}
              ) FILTER (WHERE ${questionOptions.id} IS NOT NULL),
              '[]'::json
            )
          `.as('options')
        })
        .from(questions)
        .leftJoin(questionOptions, eq(questions.id, questionOptions.questionId))
        .innerJoin(quizQuestions, eq(questions.id, quizQuestions.questionId))
        .where(and(eq(questions.isActive, true), eq(quizQuestions.quizId, quizId)))
        .groupBy(questions.id);
    }

    return await query;
  }

  // Package operations
  async getAllPackages(): Promise<Package[]> {
    return await db
      .select()
      .from(packages)
      .orderBy(asc(packages.months));
  }

  async getActivePackages(): Promise<Package[]> {
    return await db
      .select()
      .from(packages)
      .where(eq(packages.isActive, true))
      .orderBy(asc(packages.months));
  }

  async getPackageById(id: number): Promise<Package | undefined> {
    const [packageData] = await db
      .select()
      .from(packages)
      .where(eq(packages.id, id));
    return packageData;
  }

  async createPackage(packageData: InsertPackage): Promise<Package> {
    const [newPackage] = await db
      .insert(packages)
      .values(packageData)
      .returning();
    return newPackage;
  }

  async updatePackage(id: number, packageData: Partial<InsertPackage>): Promise<Package> {
    const [updatedPackage] = await db
      .update(packages)
      .set({ ...packageData, updatedAt: new Date() })
      .where(eq(packages.id, id))
      .returning();
    return updatedPackage;
  }

  async deletePackage(id: number): Promise<void> {
    await db
      .update(packages)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(packages.id, id));
  }
  
  async createSubscriptionPlan(packageData: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [newPackage] = await db
      .insert(subscriptionPlan)
      .values(packageData)
      .returning();
    return newPackage;
  }
}

export const storage = new DatabaseStorage();
