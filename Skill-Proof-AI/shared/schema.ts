import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  score: integer("score").default(0).notNull(),
});

export const tests = pgTable("tests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  starterCode: text("starter_code").notNull(),
  expectedOutput: text("expected_output").notNull(),
  topic: text("topic").notNull(),
  credits: integer("credits").notNull(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  testId: integer("test_id").notNull(),
  code: text("code").notNull(),
  isPassed: boolean("is_passed").notNull(),
  output: text("output"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, score: true });
export const insertTestSchema = createInsertSchema(tests).omit({ id: true });
export const insertSubmissionSchema = createInsertSchema(submissions).omit({ id: true, createdAt: true });

// Explicit API Contract Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Test = typeof tests.$inferSelect;
export type InsertTest = z.infer<typeof insertTestSchema>;

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

export type LoginRequest = InsertUser;
export type RegisterRequest = InsertUser;

export type SubmitCodeRequest = { code: string };
export type SubmitCodeResponse = { isPassed: boolean, output: string, expectedOutput: string, authenticityScore: number, message: string };

export type LeaderboardEntry = { username: string, score: number };
export type GapAnalysis = { topic: string, totalAttempted: number, failed: number, weaknessPercentage: number };
export type DashboardResponse = { score: number, recentSubmissions: Submission[], gaps: GapAnalysis[] };
