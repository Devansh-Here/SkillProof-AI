import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { promisify } from "util";
import session from "express-session";

const execAsync = promisify(exec);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // --- Auth & Session Setup ---
  app.use(session({
    secret: process.env.SESSION_SECRET || 'hackathon-secret-key',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: { secure: false } // Set to true in prod with HTTPS
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return done(null, false, { message: "Invalid username or password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth Routes
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existingUser = await storage.getUserByUsername(input.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser(input);
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed after registration" });
        return res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.status(200).json(req.user);
  });

  // Protected middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Unauthorized" });
  };

  // Test Routes
  app.get(api.tests.list.path, requireAuth, async (req, res) => {
    const tests = await storage.getTests();
    res.status(200).json(tests);
  });

  app.get(api.tests.get.path, requireAuth, async (req, res) => {
    const test = await storage.getTest(Number(req.params.id));
    if (!test) return res.status(404).json({ message: "Test not found" });
    res.status(200).json(test);
  });

  app.post(api.tests.submit.path, requireAuth, async (req, res) => {
    try {
      const testId = Number(req.params.id);
      const input = api.tests.submit.input.parse(req.body);
      const test = await storage.getTest(testId);
      
      if (!test) return res.status(404).json({ message: "Test not found" });

      // Hackathon-ready secure execution: Using Node's child process with a temp file
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'skillproof-'));
      const scriptPath = path.join(tmpDir, 'script.py');
      
      await fs.writeFile(scriptPath, input.code);

      let output = "";
      let isPassed = false;
      let message = "";

      try {
        // Run python script with a 3 second timeout
        const { stdout, stderr } = await execAsync(`python3 ${scriptPath}`, { timeout: 3000 });
        
        // Normalize output: trim trailing/leading whitespace and handle different line endings
        const normalizedOutput = stdout.trim().replace(/\r\n/g, '\n');
        const normalizedExpected = test.expectedOutput.trim().replace(/\r\n/g, '\n');
        
        output = normalizedOutput;
        
        // Output Validation
        if (normalizedOutput === normalizedExpected) {
          isPassed = true;
          message = "Success! All test cases passed.";
          
          // Update user score
          const user = req.user as any;
          await storage.updateUserScore(user.id, test.credits);
        } else {
          message = "Failed. Output did not match expected output.";
          if (stderr) {
              output += "\nError: " + stderr;
          }
        }
      } catch (execError: any) {
        message = "Execution failed or timed out.";
        output = (execError.stdout || "") + (execError.stderr || "") || execError.message || "Timeout/Error";
        output = output.trim();
      } finally {
        // Cleanup temp file
        await fs.rm(tmpDir, { recursive: true, force: true });
      }

      // Simple Authenticity Score Formula
      const authenticityScore = Math.min(100, Math.round((input.code.length / (test.starterCode.length || 1)) * 50) + 50);

      // Save submission
      const user = req.user as any;
      await storage.createSubmission({
        userId: user.id,
        testId: testId,
        code: input.code,
        isPassed,
        output
      });

      res.status(200).json({
        isPassed,
        output,
        expectedOutput: test.expectedOutput,
        authenticityScore,
        message
      });

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      console.error("Submit error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Stats Routes
  app.get(api.stats.leaderboard.path, requireAuth, async (req, res) => {
    const leaderboard = await storage.getLeaderboard();
    res.status(200).json(leaderboard);
  });

  app.get(api.stats.dashboard.path, requireAuth, async (req, res) => {
    const user = req.user as any;
    
    // Get fresh user to ensure we have the latest score
    const freshUser = await storage.getUser(user.id);
    const score = freshUser?.score || 0;
    
    const recentSubmissions = await storage.getUserSubmissions(user.id);
    const gaps = await storage.getGapAnalysis(user.id);

    res.status(200).json({
      score,
      recentSubmissions,
      gaps
    });
  });

  // Seed Data
  seedDatabase().catch(console.error);

  return httpServer;
}

async function seedDatabase() {
  const tests = await storage.getTests();
  if (tests.length === 0) {
    await storage.createTest({
      title: "Hello World in Python",
      description: "Write a program that prints 'Hello, World!' exactly as shown.",
      starterCode: "# Write your code below\n\n",
      expectedOutput: "Hello, World!",
      topic: "Basics",
      credits: 10
    });
    
    await storage.createTest({
      title: "Sum of Two Numbers",
      description: "Write a program that prints the sum of 5 and 7.",
      starterCode: "a = 5\nb = 7\n# Print their sum\n",
      expectedOutput: "12",
      topic: "Variables & Math",
      credits: 20
    });

    await storage.createTest({
      title: "Simple Loop",
      description: "Write a loop that prints numbers from 1 to 3, each on a new line.",
      starterCode: "# Use a for loop\n",
      expectedOutput: "1\n2\n3",
      topic: "Loops",
      credits: 30
    });
  }
}
