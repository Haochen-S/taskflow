# TaskFlow

> This is my first project built with Cursor as a coding assistant. From the Todo app to user auth, a split frontend/backend setup, and PostgreSQL, each step was done with AI pair programming. The documentation below is in English for client-facing use.

Full-stack task management system with user authentication and PostgreSQL persistence.

## Project Structure

```
taskflow/
├── frontend/     # Next.js 15 — React UI
├── backend/      # Express API — auth & tasks
├── database/     # Prisma schema — PostgreSQL models
└── docker-compose.yml
```

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | Next.js 15, React 19, Tailwind CSS  |
| Backend  | Express, TypeScript, JWT, bcrypt    |
| Database | PostgreSQL, Prisma ORM              |
| Auth     | Email/password with JWT bearer token |

## Features (Step 2)

- User registration and login
- JWT-protected API routes
- Per-user task storage in PostgreSQL
- Task CRUD with color, due date, completion
- Drag-and-drop priority reordering
- Sort by priority or due date

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Configure environment

```bash
cp database/.env.example database/.env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### 3. Install dependencies

```bash
npm install
```

### 4. Push database schema

```bash
npm run db:push
```

### 5. Run development servers

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## API Endpoints

| Method | Path                | Auth | Description        |
| ------ | ------------------- | ---- | ------------------ |
| POST   | /api/auth/register  | No   | Create account     |
| POST   | /api/auth/login     | No   | Sign in            |
| GET    | /api/auth/me        | Yes  | Current user       |
| GET    | /api/tasks          | Yes  | List user tasks    |
| POST   | /api/tasks          | Yes  | Create task        |
| PATCH  | /api/tasks/:id      | Yes  | Update task        |
| DELETE | /api/tasks/:id      | Yes  | Delete task        |
| PUT    | /api/tasks/reorder  | Yes  | Reorder by priority |

## Roadmap

1. Todo App — done
2. User login + PostgreSQL — **current**
3. Products / orders / admin panel
4. Deploy to Vercel + custom domain
5. Security hardening (validation, XSS, SQL injection)
