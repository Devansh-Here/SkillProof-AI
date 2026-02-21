import { db } from "./db";
import { users, tests, submissions, type User, type InsertUser, type Test, type InsertTest, type Submission, type InsertSubmission, type GapAnalysis, type LeaderboardEntry } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserScore(userId: number, credits: number): Promise<void>;
  
  getTests(): Promise<Test[]>;
  getTest(id: number): Promise<Test | undefined>;
  createTest(test: InsertTest): Promise<Test>;
  
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getUserSubmissions(userId: number): Promise<Submission[]>;
  getGapAnalysis(userId: number): Promise<GapAnalysis[]>;
  getLeaderboard(): Promise<LeaderboardEntry[]>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserScore(userId: number, credits: number): Promise<void> {
    await db.update(users)
      .set({ score: sql`${users.score} + ${credits}` })
      .where(eq(users.id, userId));
  }

  async getTests(): Promise<Test[]> {
    return await db.select().from(tests);
  }

  async getTest(id: number): Promise<Test | undefined> {
    const [test] = await db.select().from(tests).where(eq(tests.id, id));
    return test;
  }

  async createTest(test: InsertTest): Promise<Test> {
    const [newTest] = await db.insert(tests).values(test).returning();
    return newTest;
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const [newSubmission] = await db.insert(submissions).values(submission).returning();
    return newSubmission;
  }

  async getUserSubmissions(userId: number): Promise<Submission[]> {
    return await db.select().from(submissions).where(eq(submissions.userId, userId)).orderBy(desc(submissions.createdAt)).limit(10);
  }

  async getGapAnalysis(userId: number): Promise<GapAnalysis[]> {
    const result = await db.execute(sql`
      SELECT 
        t.topic,
        COUNT(s.id)::int as "totalAttempted",
        SUM(CASE WHEN s.is_passed = false THEN 1 ELSE 0 END)::int as "failed"
      FROM submissions s
      JOIN tests t ON s.test_id = t.id
      WHERE s.user_id = ${userId}
      GROUP BY t.topic
    `);

    return result.rows.map((row: any) => ({
      topic: row.topic,
      totalAttempted: row.totalAttempted || 0,
      failed: row.failed || 0,
      weaknessPercentage: row.totalAttempted > 0 ? Math.round((row.failed / row.totalAttempted) * 100) : 0
    }));
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const result = await db.select({
      username: users.username,
      score: users.score
    })
    .from(users)
    .orderBy(desc(users.score))
    .limit(10);
    return result;
  }
}

export const storage = new DatabaseStorage();
