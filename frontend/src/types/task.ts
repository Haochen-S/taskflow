export type TaskColor =
  | "slate"
  | "red"
  | "orange"
  | "amber"
  | "green"
  | "teal"
  | "blue"
  | "purple"
  | "pink";

export type SortMode = "manual" | "dueDate";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  color: TaskColor;
  dueDate: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export const TASK_COLORS: {
  value: TaskColor;
  label: string;
  bg: string;
  border: string;
  dot: string;
}[] = [
  { value: "slate", label: "Slate", bg: "bg-slate-50", border: "border-slate-200", dot: "bg-slate-400" },
  { value: "red", label: "Red", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-400" },
  { value: "orange", label: "Orange", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-400" },
  { value: "amber", label: "Amber", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-400" },
  { value: "green", label: "Green", bg: "bg-green-50", border: "border-green-200", dot: "bg-green-400" },
  { value: "teal", label: "Teal", bg: "bg-teal-50", border: "border-teal-200", dot: "bg-teal-400" },
  { value: "blue", label: "Blue", bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-400" },
  { value: "purple", label: "Purple", bg: "bg-purple-50", border: "border-purple-200", dot: "bg-purple-400" },
  { value: "pink", label: "Pink", bg: "bg-pink-50", border: "border-pink-200", dot: "bg-pink-400" },
];

export function getColorClasses(color: TaskColor) {
  return TASK_COLORS.find((c) => c.value === color) ?? TASK_COLORS[0];
}

export function sortTasks(tasks: Task[], mode: SortMode): Task[] {
  const copy = [...tasks];
  if (mode === "manual") {
    return copy.sort((a, b) => a.sortOrder - b.sortOrder);
  }
  return copy.sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return a.sortOrder - b.sortOrder;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    const diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    return diff !== 0 ? diff : a.sortOrder - b.sortOrder;
  });
}

export function isOverdue(dueDate: string | null, completed: boolean): boolean {
  if (!dueDate || completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
}

export function formatDueDate(dueDate: string): string {
  const date = new Date(dueDate);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
}

export function sanitizeTitle(title: string): string {
  return title.trim().slice(0, 200);
}
