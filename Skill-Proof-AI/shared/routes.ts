import { z } from 'zod';
import { insertUserSchema, users, tests, submissions } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: insertUserSchema,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: { 200: z.object({ message: z.string() }) },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    }
  },
  tests: {
    list: {
      method: 'GET' as const,
      path: '/api/tests' as const,
      responses: { 200: z.array(z.custom<typeof tests.$inferSelect>()) },
    },
    get: {
      method: 'GET' as const,
      path: '/api/tests/:id' as const,
      responses: { 200: z.custom<typeof tests.$inferSelect>(), 404: errorSchemas.notFound },
    },
    submit: {
      method: 'POST' as const,
      path: '/api/tests/:id/submit' as const,
      input: z.object({ code: z.string() }),
      responses: {
        200: z.object({
          isPassed: z.boolean(),
          output: z.string(),
          expectedOutput: z.string(),
          authenticityScore: z.number(),
          message: z.string()
        }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    }
  },
  stats: {
    leaderboard: {
      method: 'GET' as const,
      path: '/api/leaderboard' as const,
      responses: {
        200: z.array(z.object({ username: z.string(), score: z.number() }))
      }
    },
    dashboard: {
      method: 'GET' as const,
      path: '/api/dashboard' as const,
      responses: {
        200: z.object({
          score: z.number(),
          recentSubmissions: z.array(z.custom<typeof submissions.$inferSelect>()),
          gaps: z.array(z.object({
            topic: z.string(),
            totalAttempted: z.number(),
            failed: z.number(),
            weaknessPercentage: z.number()
          }))
        }),
        401: errorSchemas.unauthorized,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
