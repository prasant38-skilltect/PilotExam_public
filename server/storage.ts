import {
  users,
  subjects,
  subscriptions,
  // chapters,
  // sections,
  questions,
  // questionSections,
  // answers,
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
} from "../shared/schema";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { eq, and, desc, avg, max, count, ne, asc, sql, or, like, isNull } from "drizzle-orm";
import { text } from "stream/consumers";

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

  // Issue Report operations
  createIssueReport(report: InsertIssueReport): Promise<IssueReport>;
  getIssueReportsByUser(userId: string): Promise<IssueReport[]>;
  // getAllIssueReports(): Promise<IssueReport[]>;

  // Comment operations
  createComment(comment: InsertQuestionComment): Promise<QuestionComment>;
  getCommentsByQuestion(questionId: number): Promise<QuestionComment[]>;
  
  // Admin operations
  getAllIssueReports(page?: number, limit?: number): Promise<{ reports: IssueReport[], total: number }>;
  getAllQuestionsForAdmin(page?: number, limit?: number, searchText?: string, hasEmptyExplanation?: boolean): Promise<{ questions: any[], total: number }>;
  updateQuestion(questionId: number, questionData: any): Promise<any>;

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
      .where(and(eq(topics.parentName, name)));
    console.log("subTopics...", subTopics);
    if (subTopics.length > 0) {
      return {
        type: "topic",
        data: subTopics,
      };
    }

    const topicQuizId = await db
      .select({ id: topics.quizId, text: topics.text })
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
        topicName: topicQuizId[0].text,
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

  async getQuestionOptions(questionId: number): Promise<any[]> {
    return await db
      .select()
      .from(questionOptions)
      .where(eq(questionOptions.questionId, questionId))
      .orderBy(asc(questionOptions.optionOrder));
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
    return await db
      .select()
      .from(questionComments)
      .where(eq(questionComments.questionId, questionId))
      .orderBy(desc(questionComments.createdAt));
  }

  // Admin operations implementation
  async getAllIssueReports(page: number = 1, limit: number = 50): Promise<{ reports: IssueReport[], total: number }> {
    const offset = (page - 1) * limit;
    
    const reports = await db
      .select()
      .from(issueReports)
      .orderBy(desc(issueReports.createdAt))
      .limit(limit)
      .offset(offset);
      
    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(issueReports);
      
    return { reports, total: Number(totalCount) };
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
      query = searchText ? query.and(emptyExplanationCondition) : query.where(emptyExplanationCondition);
      countQuery = searchText ? countQuery.and(emptyExplanationCondition) : countQuery.where(emptyExplanationCondition);
    }
    
    const questionsData = await query
      .orderBy(asc(questions.id))
      .limit(limit)
      .offset(offset);
      
    const [{ count: totalCount }] = await countQuery;
    
    return { questions: questionsData, total: Number(totalCount) };
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
      if (currentQuestion.explanation !== questionData.explanation_text) {
        questionUpdates.explanation = questionData.explanation_text;
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
      const newOptionsData = [
        { text: questionData.option_a, order: 0 },
        { text: questionData.option_b, order: 1 },
        { text: questionData.option_c, order: 2 },
        { text: questionData.option_d, order: 3 },
      ].filter(option => option.text && option.text.trim() !== '');
      // Update, insert, or delete options as needed
      for (let i = 0; i < Math.max(currentOptions.length, newOptionsData.length); i++) {
        const currentOption = currentOptions[i];
        const newOption = newOptionsData[i];
        if (currentOption && newOption) {
          // Update existing option if changed
          const isCorrect = questionData.correct_answer?.toUpperCase() === String.fromCharCode(65 + newOption.order);

          if (currentOption.optionText !== newOption.text || 
              currentOption.isCorrect !== isCorrect || 
              currentOption.optionOrder !== newOption.order) {
            await tx
              .update(questionOptions)
              .set({
                optionText: newOption.text,
                isCorrect: isCorrect,
                optionOrder: newOption.order,
              })
              .where(eq(questionOptions.id, currentOption.id));
          }
        } else if (newOption) {
          // Insert new option
          const isCorrect = questionData.correct_answer?.toUpperCase() === String.fromCharCode(65 + newOption.order);
          await tx
            .insert(questionOptions)
            .values({
              questionId: questionId,
              optionText: newOption.text,
              isCorrect: isCorrect,
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
      console.log("categoriesData...", categoriesData);

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
      console.log("topicsData...", topicsData);

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
}

export const storage = new DatabaseStorage();
