import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  serial,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    text: varchar("text", { length: 100 }).default("null"),
  },
  (table) => [
    uniqueIndex("uq_category_name").on(table.name),
  ]
);

export const topics = pgTable(
  "topics",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    categoryName: varchar("category_name", { length: 255 })
      .notNull()
      .references(() => categories.text, { onDelete: "cascade" }), // new

    // ✅ fixed: wrap in arrow fn so TS resolves later
    parentId: integer("parent_id").references((): any => topics.id, { onDelete: "cascade" }),
    parentName: varchar("parent_name").references((): any => topics.slug, { onDelete: "cascade" }), //new 

    slug: varchar("slug", { length: 255 }).notNull(),
    text: varchar("text", { length: 255 }).notNull(),

    quizId: integer("quiz_id").notNull(), // NULL = sub-topic, NOT NULL = quiz
  },
  (table) => [
    uniqueIndex("uq_topic").on(table.categoryId, table.parentId, table.slug),
  ]
);

export const quizzes = pgTable(
  "quizzes",
  {
    id: serial("id").primaryKey(), // SERIAL PRIMARY KEY
    quizId: integer("quiz_id").notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: false })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex("uq_quizzes_slug").on(table.slug), // UNIQUE constraint on slug
  })
);

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(), // SERIAL PRIMARY KEY
  questionId: integer("question_id").notNull(),
  text: text("text").notNull(),
  explanation: text("explanation"),
  explanationImage: varchar("explanation_image", { length: 500 }),
  tooltip: text("tooltip"),
  featuredImage: varchar("featured_image", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export const questionOptions = pgTable("question_options", {
  id: serial("id").primaryKey(), // SERIAL PRIMARY KEY
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  optionText: varchar("option_text", { length: 1000 }).notNull(),
  isCorrect: boolean("is_correct").default(false).notNull(),
  optionOrder: integer("option_order").default(0).notNull(),
});

export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(), // SERIAL PRIMARY KEY
  quizId: integer("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  position: integer("position"), // Optional ordering inside quiz
});

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  themePreference: varchar("theme_preference", { length: 10 }).default('light'),
  passwordHash: varchar("password_hash"),
  username: varchar("username").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subjects (renamed from atplSubjects for consistency)
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  sequence: integer("sequence").default(0),
});

// Chapters
// export const chapters = pgTable("chapters", {
//   id: serial("id").primaryKey(),
//   subjectId: integer("subject_id").references(() => subjects.id, { onDelete: 'cascade' }).notNull(),
//   name: varchar("name", { length: 255 }).notNull(),
//   description: text("description"),
//   sequence: integer("sequence").default(0),
// });

// // Sections
// export const sections = pgTable("sections", {
//   id: serial("id").primaryKey(),
//   chapterId: integer("chapter_id").references(() => chapters.id, { onDelete: 'cascade' }).notNull(),
//   name: varchar("name", { length: 255 }).notNull(),
//   description: text("description"),
//   sequence: integer("sequence").default(0),
// });

// Questions (updated structure to match actual database)
// export const questions = pgTable("questions", {
//   id: serial("id").primaryKey(),
//   subject_id: integer("subject_id"),
//   question_text: text("question_text").notNull(),
//   option_a: text("option_a"),
//   option_b: text("option_b"),
//   option_c: text("option_c"),
//   option_d: text("option_d"),
//   correct_answer: varchar("correct_answer", { length: 1 }),
//   explanation: text("explanation"),
//   difficulty: varchar("difficulty", { length: 20 }),
//   sequence: integer("sequence").default(0),
//   explanation_text: text("explanation_text"),
//   explanation_image: varchar("explanation_image"),
// });

// Answers (new table for flexible answer options)
// export const answers = pgTable("answers", {
//   id: serial("id").primaryKey(),
//   questionId: integer("question_id").references(() => questions.id, { onDelete: 'cascade' }).notNull(),
//   answerText: text("answer_text"),
//   answerImage: text("answer_image"),
//   isCorrect: boolean("is_correct").default(false),
// });

// // Test Sessions
// export const testSessions = pgTable("test_sessions", {
//   id: serial("id").primaryKey(),
//   userId: varchar("user_id").references(() => users.id),
//   subjectId: integer("subject_id").references(() => subjects.id).notNull(),
//   startTime: timestamp("start_time").defaultNow(),
//   endTime: timestamp("end_time"),
//   isCompleted: boolean("is_completed").default(false),
//   score: integer("score"),
//   totalQuestions: integer("total_questions").notNull(),
//   correctAnswers: integer("correct_answers").default(0),
// });

// // Question Comments
// export const questionComments = pgTable("question_comments", {
//   id: serial("id").primaryKey(),
//   questionId: integer("question_id").references(() => questions.id).notNull(),
//   userId: varchar("user_id").references(() => users.id),
//   username: varchar("username", { length: 100 }).notNull(),
//   comment: text("comment").notNull(),
//   likes: integer("likes").default(0),
//   dislikes: integer("dislikes").default(0),
//   createdAt: timestamp("created_at").defaultNow(),
// });

// // Comment Votes
// export const commentVotes = pgTable("comment_votes", {
//   id: serial("id").primaryKey(),
//   commentId: integer("comment_id").references(() => questionComments.id).notNull(),
//   userId: varchar("user_id").references(() => users.id),
//   voteType: varchar("vote_type", { length: 10 }).notNull(), // 'like' or 'dislike'
//   createdAt: timestamp("created_at").defaultNow(),
// });

// // User Answers
// export const userAnswers = pgTable("user_answers", {
//   id: serial("id").primaryKey(),
//   sessionId: integer("session_id").references(() => testSessions.id).notNull(),
//   questionId: integer("question_id").references(() => questions.id).notNull(),
//   selectedAnswer: varchar("selected_answer", { length: 1 }),
//   isCorrect: boolean("is_correct"),
//   timeSpent: integer("time_spent"), // in seconds
// });

// // User Progress
// export const userProgress = pgTable("user_progress", {
//   id: serial("id").primaryKey(),
//   userId: varchar("user_id").references(() => users.id).notNull(),
//   subjectId: integer("subject_id").references(() => subjects.id).notNull(),
//   totalTests: integer("total_tests").default(0),
//   averageScore: integer("average_score").default(0),
//   bestScore: integer("best_score").default(0),
//   lastTestDate: timestamp("last_test_date"),
// });

// // Question-Section Mapping Table (matches actual database)
// export const questionSections = pgTable("question_sections", {
//   id: serial("id").primaryKey(),
//   question_id: integer("question_id").references(() => questions.id, { onDelete: 'cascade' }).notNull(),
//   section_id: integer("section_id").references(() => sections.id, { onDelete: 'cascade' }).notNull(),
//   sequence: integer("sequence").default(0),
// });

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  themePreference: true,
});

export const signUpSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  username: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const insertSubjectSchema = createInsertSchema(subjects);
// export const insertChapterSchema = createInsertSchema(chapters).omit({ id: true });
// export const insertSectionSchema = createInsertSchema(sections).omit({ id: true });
export const insertQuestionSchema = createInsertSchema(questions)
// export const insertAnswerSchema = createInsertSchema(answers).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories);
export const insertTopicSchema = createInsertSchema(topics);
export const insertQuizzesSchema = createInsertSchema(quizzes);
export const insertQuestionsSchema = createInsertSchema(questions);
export const insertQuestionOptionsSchema = createInsertSchema(questionOptions);
export const insertQuizQuestionsSchema = createInsertSchema(quizQuestions);



// export const insertTestSessionSchema = createInsertSchema(testSessions).omit({
//   id: true,
//   startTime: true,
//   endTime: true,
// });

// export const insertUserAnswerSchema = createInsertSchema(userAnswers).omit({
//   id: true,
// });

// export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
//   id: true,
// });

// export const insertQuestionCommentSchema = createInsertSchema(questionComments).omit({
//   id: true,
//   likes: true,
//   dislikes: true,
//   createdAt: true,
// });

// export const insertCommentVoteSchema = createInsertSchema(commentVotes).omit({
//   id: true,
//   createdAt: true,
// });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
// export type Chapter = typeof chapters.$inferSelect;
// export type InsertChapter = z.infer<typeof insertChapterSchema>;
// export type Section = typeof sections.$inferSelect;
// export type InsertSection = z.infer<typeof insertSectionSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
// export type Answer = typeof answers.$inferSelect;
// export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
// export type TestSession = typeof testSessions.$inferSelect;
// export type InsertTestSession = z.infer<typeof insertTestSessionSchema>;
// export type UserAnswer = typeof userAnswers.$inferSelect;
// export type InsertUserAnswer = z.infer<typeof insertUserAnswerSchema>;
// export type UserProgress = typeof userProgress.$inferSelect;
// export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
// export type QuestionComment = typeof questionComments.$inferSelect;
// export type InsertQuestionComment = z.infer<typeof insertQuestionCommentSchema>;
// export type CommentVote = typeof commentVotes.$inferSelect;
// export type InsertCommentVote = z.infer<typeof insertCommentVoteSchema>;

export type Categories = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Topics = typeof topics.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type Quizzes = z.infer<typeof insertQuizzesSchema>;
export type Questions = z.infer<typeof insertQuestionsSchema>;
export type QuestionOptions = z.infer<typeof insertQuestionOptionsSchema>;
export type QuizQuestions = z.infer<typeof insertQuizQuestionsSchema>;
