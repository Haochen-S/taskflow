# Database

PostgreSQL schema managed with Prisma.

## Models

- **User** — email, password (bcrypt hash), optional name
- **Task** — title, color, due date, sort order, linked to user (cascade delete)

## Commands

Run from project root:

```bash
npm run db:push      # Sync schema to database (dev)
npm run db:migrate   # Create migration (production)
npm run db:generate  # Regenerate Prisma client
npm run db:studio    # Open Prisma Studio GUI
```

## Connection

Set `DATABASE_URL` in `database/.env`:

```
postgresql://taskflow:taskflow@localhost:5432/taskflow?schema=public
```
