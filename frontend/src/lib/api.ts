const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "taskflow-token";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: { field: string; message: string }[]
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error ?? "Request failed", response.status, data.details);
  }

  return data as T;
}

export const api = {
  register: (body: { email: string; password: string; name?: string }) =>
    request<{ token: string; user: import("@/types/task").User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: import("@/types/task").User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  me: () => request<{ user: import("@/types/task").User }>("/api/auth/me"),

  getTasks: () => request<{ tasks: import("@/types/task").Task[] }>("/api/tasks"),

  createTask: (body: { title: string; color: string; dueDate?: string | null }) =>
    request<{ task: import("@/types/task").Task }>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateTask: (
    id: string,
    body: Partial<{
      title: string;
      completed: boolean;
      color: string;
      dueDate: string | null;
      sortOrder: number;
    }>
  ) =>
    request<{ task: import("@/types/task").Task }>(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteTask: (id: string) =>
    request<void>(`/api/tasks/${id}`, { method: "DELETE" }),

  reorderTasks: (orderedIds: string[]) =>
    request<{ tasks: import("@/types/task").Task[] }>("/api/tasks/reorder", {
      method: "PUT",
      body: JSON.stringify({ orderedIds }),
    }),
};
