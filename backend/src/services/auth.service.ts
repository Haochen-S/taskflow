import { prisma } from "../lib/prisma";
import { comparePassword, hashPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import type { LoginInput, RegisterInput } from "../validators/schemas";

function sanitizeUser(user: { id: string; email: string; name: string | null; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) {
    const error = new Error("Email already registered") as Error & { status?: number };
    error.status = 409;
    throw error;
  }

  const hashed = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      password: hashed,
      name: input.name ?? null,
    },
  });

  const token = signToken({ userId: user.id, email: user.email });
  return { token, user: sanitizeUser(user) };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user) {
    const error = new Error("Invalid email or password") as Error & { status?: number };
    error.status = 401;
    throw error;
  }

  const valid = await comparePassword(input.password, user.password);
  if (!valid) {
    const error = new Error("Invalid email or password") as Error & { status?: number };
    error.status = 401;
    throw error;
  }

  const token = signToken({ userId: user.id, email: user.email });
  return { token, user: sanitizeUser(user) };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error("User not found") as Error & { status?: number };
    error.status = 404;
    throw error;
  }
  return sanitizeUser(user);
}
