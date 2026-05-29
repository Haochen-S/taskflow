import { prisma } from "../lib/prisma";
import type { CreateTaskInput, UpdateTaskInput } from "../validators/schemas";

const VALID_COLORS = new Set([
  "slate", "red", "orange", "amber", "green", "teal", "blue", "purple", "pink",
]);

function formatTask(task: {
  id: string;
  title: string;
  completed: boolean;
  color: string;
  dueDate: Date | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: task.id,
    title: task.title,
    completed: task.completed,
    color: task.color,
    dueDate: task.dueDate ? task.dueDate.toISOString().slice(0, 10) : null,
    sortOrder: task.sortOrder,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

function parseDueDate(dueDate: string | null | undefined): Date | null {
  if (!dueDate) return null;
  return new Date(`${dueDate}T00:00:00.000Z`);
}

export async function listTasks(userId: string) {
  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { sortOrder: "asc" },
  });
  return tasks.map(formatTask);
}

export async function createTask(userId: string, input: CreateTaskInput) {
  const maxOrder = await prisma.task.aggregate({
    where: { userId },
    _max: { sortOrder: true },
  });

  const task = await prisma.task.create({
    data: {
      userId,
      title: input.title,
      color: VALID_COLORS.has(input.color) ? input.color : "blue",
      dueDate: parseDueDate(input.dueDate),
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  return formatTask(task);
}

export async function updateTask(userId: string, taskId: string, input: UpdateTaskInput) {
  const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!existing) {
    const error = new Error("Task not found") as Error & { status?: number };
    error.status = 404;
    throw error;
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.completed !== undefined && { completed: input.completed }),
      ...(input.color !== undefined && { color: input.color }),
      ...(input.dueDate !== undefined && { dueDate: parseDueDate(input.dueDate) }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
    },
  });

  return formatTask(task);
}

export async function deleteTask(userId: string, taskId: string) {
  const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!existing) {
    const error = new Error("Task not found") as Error & { status?: number };
    error.status = 404;
    throw error;
  }

  await prisma.task.delete({ where: { id: taskId } });
}

export async function reorderTasks(userId: string, orderedIds: string[]) {
  const tasks = await prisma.task.findMany({ where: { userId } });
  const taskIds = new Set(tasks.map((t) => t.id));

  for (const id of orderedIds) {
    if (!taskIds.has(id)) {
      const error = new Error("Invalid task in reorder list") as Error & { status?: number };
      error.status = 400;
      throw error;
    }
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.task.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  return listTasks(userId);
}
