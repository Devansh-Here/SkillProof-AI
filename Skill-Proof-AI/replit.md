# SkillProof.ai

## Overview

SkillProof.ai is a coding skills assessment platform where users solve Python programming challenges, receive AI-powered feedback on code quality, and track their learning gaps. The app features user authentication, a code editor for solving challenges, a dashboard with gap analysis visualizations, and a leaderboard ranking system. Users earn credits/points by passing tests, and the system detects learning gaps based on submission history.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure

The project uses a three-folder monorepo pattern:
- **`client/`** — React frontend (SPA)
- **`server/`** — Express backend (API server)
- **`shared/`** — Shared types, schemas, and API route definitions used by both client and server

### Frontend (client/)

- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State/Data Fetching**: TanStack React Query for server state management
- **Styling**: Tailwind CSS with CSS variables for theming, plus shadcn/ui component library (New York style)
- **UI Components**: Full shadcn/ui component set in `client/src/components/ui/`
- **Animations**: Framer Motion for page transitions
- **Code Editor**: `react-simple-code-editor` with PrismJS for Python syntax highlighting
- **Charts**: Recharts for dashboard data visualization (learning gap analysis)
- **Fonts**: Inter (body), Outfit (headings), JetBrains Mono (code)
- **Build Tool**: Vite with React plugin

Pages: Landing, Login, Register, Dashboard (protected), Test List (protected), Test Detail with code editor (protected), Leaderboard (protected), 404.

Authentication is handled via session cookies. Protected routes render the Login page if the user is not authenticated.

### Backend (server/)

- **Framework**: Express 5 on Node.js
- **Language**: TypeScript, run with `tsx` in development
- **Authentication**: Passport.js with `passport-local` strategy, express-session with PostgreSQL session store (`connect-pg-simple`)
- **Code Execution**: Server-side Python code execution using Node's `child_process.exec` (submissions are written to temp files and executed)
- **API Pattern**: RESTful JSON API under `/api/*` prefix
- **Build**: esbuild bundles the server for production into `dist/index.cjs`

### Shared Layer (shared/)

- **`schema.ts`** — Drizzle ORM table definitions (users, tests, submissions) and Zod validation schemas via `drizzle-zod`
- **`routes.ts`** — Typed API contract definitions with method, path, input schemas, and response schemas. Used by both frontend hooks and backend route handlers for type safety.

### Database

- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (required via `DATABASE_URL` environment variable)
- **Session Store**: PostgreSQL via `connect-pg-simple` (auto-creates session table)
- **Schema Management**: `drizzle-kit push` for schema migrations (no migration files needed for dev)
- **Tables**:
  - `users` — id, username (unique), password, score
  - `tests` — id, title, description, starterCode, expectedOutput, topic, credits
  - `submissions` — id, userId, testId, code, isPassed, output, createdAt

### API Routes

- `POST /api/register` — Create new user
- `POST /api/login` — Authenticate user (session cookie)
- `POST /api/logout` — End session
- `GET /api/user` — Get current authenticated user
- `GET /api/tests` — List all coding challenges
- `GET /api/tests/:id` — Get specific test details
- `POST /api/tests/:id/submit` — Submit code for evaluation
- `GET /api/dashboard` — Get user's dashboard stats and gap analysis
- `GET /api/leaderboard` — Get ranked user list

### Dev/Production Workflow

- **Development**: `npm run dev` — tsx runs the server, Vite provides HMR for the frontend via middleware
- **Production Build**: `npm run build` — Vite builds the client to `dist/public`, esbuild bundles the server to `dist/index.cjs`
- **Production Start**: `npm start` — Runs the bundled server which serves static files from `dist/public`
- **Database Push**: `npm run db:push` — Pushes Drizzle schema to PostgreSQL

### Key Design Decisions

1. **Shared API contracts** — The `shared/routes.ts` file defines typed API routes used by both client and server, ensuring type safety across the stack without code generation.
2. **Session-based auth over JWT** — Simpler for a server-rendered/SPA hybrid; session data stored in PostgreSQL for persistence across restarts.
3. **Wouter over React Router** — Minimal bundle size; sufficient for this app's routing needs.
4. **Plain password storage** — Current implementation stores passwords in plaintext (needs hashing for production).
5. **Server-side code execution** — Python code is executed directly on the server via child_process, which is a security concern for production but works for hackathon/demo purposes.

## External Dependencies

- **PostgreSQL** — Primary database (required, configured via `DATABASE_URL` environment variable)
- **Google Fonts** — Inter, Outfit, JetBrains Mono loaded via CDN
- **Python Runtime** — Required on the server for executing user-submitted code
- **Replit Plugins** — `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner` (dev-only, Replit environment detection)