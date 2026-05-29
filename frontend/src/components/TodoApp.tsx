"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TaskForm } from "@/components/TaskForm";
import { TaskItem } from "@/components/TaskItem";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { sanitizeTitle, sortTasks, type SortMode, type Task, type TaskColor } from "@/types/task";

const SORT_MODE_KEY = "taskflow-sort-mode";

export function TodoApp() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("manual");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const pendingUpdates = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const saved = localStorage.getItem(SORT_MODE_KEY);
    if (saved === "dueDate") setSortMode("dueDate");
  }, []);

  useEffect(() => {
    localStorage.setItem(SORT_MODE_KEY, sortMode);
  }, [sortMode]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { tasks } = await api.getTasks();
      setTasks(tasks);
    } catch {
      setError("Failed to load tasks. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const displayedTasks = useMemo(() => sortTasks(tasks, sortMode), [tasks, sortMode]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const persistUpdate = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      const { task } = await api.updateTask(id, updates);
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    } catch {
      setError("Failed to save changes.");
      fetchTasks();
    }
  }, [fetchTasks]);

  const addTask = useCallback(async (title: string, color: TaskColor, dueDate: string | null) => {
    const safeTitle = sanitizeTitle(title);
    if (!safeTitle) return;

    setSyncing(true);
    setError("");
    try {
      const { task } = await api.createTask({ title: safeTitle, color, dueDate });
      setTasks((prev) => [...prev, task]);
    } catch {
      setError("Failed to create task.");
    } finally {
      setSyncing(false);
    }
  }, []);

  const toggleTask = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
      await persistUpdate(id, { completed: !task.completed });
    },
    [tasks, persistUpdate]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      try {
        await api.deleteTask(id);
      } catch {
        setError("Failed to delete task.");
        fetchTasks();
      }
    },
    [fetchTasks]
  );

  const updateTaskLocal = useCallback(
    (id: string, updates: Partial<Pick<Task, "title" | "color" | "dueDate">>) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          return { ...t, ...updates };
        })
      );

      if (updates.color !== undefined || updates.dueDate !== undefined) {
        persistUpdate(id, updates);
      }
    },
    [persistUpdate]
  );

  const handleTitleBlur = useCallback(
    (id: string, title: string) => {
      const safeTitle = sanitizeTitle(title);
      if (!safeTitle) {
        fetchTasks();
        return;
      }

      const existing = pendingUpdates.current.get(id);
      if (existing) clearTimeout(existing);

      pendingUpdates.current.set(
        id,
        setTimeout(() => {
          persistUpdate(id, { title: safeTitle });
          pendingUpdates.current.delete(id);
        }, 300)
      );
    },
    [persistUpdate, fetchTasks]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      if (sortMode !== "manual") return;
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const sorted = sortTasks(tasks, "manual");
      const oldIndex = sorted.findIndex((t) => t.id === active.id);
      const newIndex = sorted.findIndex((t) => t.id === over.id);
      const reordered = arrayMove(sorted, oldIndex, newIndex);
      const withOrder = reordered.map((t, i) => ({ ...t, sortOrder: i }));

      setTasks(withOrder);

      try {
        const { tasks: updated } = await api.reorderTasks(withOrder.map((t) => t.id));
        setTasks(updated);
      } catch {
        setError("Failed to reorder tasks.");
        fetchTasks();
      }
    },
    [sortMode, tasks, fetchTasks]
  );

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completed).length;
    const overdue = tasks.filter(
      (t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
    ).length;
    return { total, done, pending: total - done, overdue };
  }, [tasks]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                Step 2 · Auth & Database
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">TaskFlow</h1>
              <p className="mt-1 text-sm text-slate-500">
                Signed in as {user?.name ?? user?.email}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <div className="mb-6 grid grid-cols-3 gap-3">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Pending" value={stats.pending} accent="text-amber-600" />
          <StatCard label="Overdue" value={stats.overdue} accent="text-red-600" />
        </div>

        <TaskForm onAdd={addTask} disabled={syncing} />

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">
            Tasks
            <span className="ml-2 font-normal text-slate-400">
              ({stats.done}/{stats.total} done)
            </span>
          </h2>
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
            <SortButton active={sortMode === "manual"} onClick={() => setSortMode("manual")}>
              Priority
            </SortButton>
            <SortButton active={sortMode === "dueDate"} onClick={() => setSortMode("dueDate")}>
              Due date
            </SortButton>
          </div>
        </div>

        {sortMode === "dueDate" && (
          <p className="mt-2 text-xs text-slate-400">
            Drag is disabled in due date sort mode. Switch to Priority to reorder manually.
          </p>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={displayedTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <ul className="mt-4 space-y-3">
              {displayedTasks.length === 0 ? (
                <li className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-sm text-slate-400">
                  No tasks yet. Add your first one above.
                </li>
              ) : (
                displayedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    sortMode={sortMode}
                    disabled={syncing}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onUpdate={updateTaskLocal}
                    onTitleBlur={handleTitleBlur}
                  />
                ))
              )}
            </ul>
          </SortableContext>
        </DndContext>

        <footer className="mt-10 text-center text-xs text-slate-400">
          Tasks are stored in PostgreSQL and linked to your account
        </footer>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
      <div className={`text-2xl font-bold ${accent ?? "text-slate-800"}`}>{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
        active ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}
