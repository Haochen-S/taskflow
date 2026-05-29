# TaskFlow

A full-stack task management platform built with Next.js, Express, TypeScript, PostgreSQL, and Prisma.

The project demonstrates modern software engineering practices including authentication, database design, API development, Dockerized local environments, and scalable monorepo architecture.

This project was developed using an AI-assisted workflow with Cursor, while all architecture decisions, database schema design, API specifications, security implementation, and project structure were independently designed and validated.

## Engineering Highlights

- Designed JWT-based authentication and authorization flow
- Implemented secure password hashing with bcrypt
- Built type-safe backend APIs using TypeScript and Zod
- Structured the project as a monorepo for scalability
- Containerized local development with Docker
- Applied security best practices using Helmet and CORS

## Project Structure

```
taskflow/
├── frontend/     # Next.js 15 — React UI
├── backend/      # Express API — auth & tasks
├── database/     # Prisma schema — PostgreSQL models
└── docker-compose.yml
```

## Tech Stack

| Layer    | Technology                           |
| -------- | ------------------------------------ |
| Frontend | Next.js 15, React 19, Tailwind CSS   |
| Backend  | Express, TypeScript, JWT, bcrypt     |
| Database | PostgreSQL, Prisma ORM               |
| Auth     | Email/password with JWT bearer token |

## Features

- User registration and login
- JWT-protected API routes
- Per-user task storage in PostgreSQL
- Task CRUD with color, due date, and completion status
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

| Method | Path               | Auth | Description         |
| ------ | ------------------ | ---- | ------------------- |
| POST   | /api/auth/register | No   | Create account      |
| POST   | /api/auth/login    | No   | Sign in             |
| GET    | /api/auth/me       | Yes  | Current user        |
| GET    | /api/tasks         | Yes  | List user tasks     |
| POST   | /api/tasks         | Yes  | Create task         |
| PATCH  | /api/tasks/:id     | Yes  | Update task         |
| DELETE | /api/tasks/:id     | Yes  | Delete task         |
| PUT    | /api/tasks/reorder | Yes  | Reorder by priority |

## Roadmap

| Phase | Scope                                                        | Status    |
| ----- | ------------------------------------------------------------ | --------- |
| 1     | Task management UI (CRUD, colors, due dates, drag reorder)   | Completed |
| 2     | User authentication and PostgreSQL persistence               | Completed |
| 3     | Products, orders, and admin panel                            | Planned   |
| 4     | Vercel deployment and custom domain                          | Planned   |
| 5     | Security hardening (input validation, XSS, SQL injection)    | Planned   |
