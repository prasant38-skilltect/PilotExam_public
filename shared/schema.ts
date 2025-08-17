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
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ATPL Subjects
export const atplSubjects = pgTable("atpl_subjects", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  questionCount: integer("question_count").notNull(),
});

// Questions
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").references(() => atplSubjects.id).notNull(),
  questionText: text("question_text").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  correctAnswer: varchar("correct_answer", { length: 1 }).notNull(),
  explanation: text("explanation"),
  difficulty: varchar("difficulty", { length: 20 }).default('medium'),
});

// Test Sessions
export const testSessions = pgTable("test_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  subjectId: integer("subject_id").references(() => atplSubjects.id).notNull(),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  isCompleted: boolean("is_completed").default(false),
  score: integer("score"),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").default(0),
});

// User Answers
export const userAnswers = pgTable("user_answers", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => testSessions.id).notNull(),
  questionId: integer("question_id").references(() => questions.id).notNull(),
  selectedAnswer: varchar("selected_answer", { length: 1 }),
  isCorrect: boolean("is_correct"),
  timeSpent: integer("time_spent"), // in seconds
});

// User Progress
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  subjectId: integer("subject_id").references(() => atplSubjects.id).notNull(),
  totalTests: integer("total_tests").default(0),
  averageScore: integer("average_score").default(0),
  bestScore: integer("best_score").default(0),
  lastTestDate: timestamp("last_test_date"),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  themePreference: true,
});

export const insertAtplSubjectSchema = createInsertSchema(atplSubjects);

export const insertQuestionSchema = createInsertSchema(questions);

export const insertTestSessionSchema = createInsertSchema(testSessions).omit({
  id: true,
  startTime: true,
  endTime: true,
});

export const insertUserAnswerSchema = createInsertSchema(userAnswers).omit({
  id: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type AtplSubject = typeof atplSubjects.$inferSelect;
export type InsertAtplSubject = z.infer<typeof insertAtplSubjectSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type TestSession = typeof testSessions.$inferSelect;
export type InsertTestSession = z.infer<typeof insertTestSessionSchema>;
export type UserAnswer = typeof userAnswers.$inferSelect;
export type InsertUserAnswer = z.infer<typeof insertUserAnswerSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
