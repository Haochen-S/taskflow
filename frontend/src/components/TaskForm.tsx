"use client";

import { useState } from "react";
import { TASK_COLORS, type TaskColor } from "@/types/task";

interface TaskFormProps {
  onAdd: (title: string, color: TaskColor, dueDate: string | null) => void;
  disabled?: boolean;
}

export function TaskForm({ onAdd, disabled }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState<TaskColor>("blue");
  const [dueDate, setDueDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || disabled) return;
    onAdd(trimmed, color, dueDate || null);
    setTitle("");
    setDueDate("");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task..."
          disabled={disabled}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
          maxLength={200}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={disabled}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-400 disabled:opacity-50"
          aria-label="Due date"
        />
        <button
          type="submit"
          disabled={!title.trim() || disabled}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-slate-500">Color:</span>
        {TASK_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setColor(c.value)}
            disabled={disabled}
            className={`h-5 w-5 rounded-full ${c.dot} transition-transform disabled:opacity-50 ${
              color === c.value ? "ring-2 ring-offset-1 ring-slate-400 scale-110" : "opacity-60 hover:opacity-100"
            }`}
            aria-label={`Select ${c.label}`}
          />
        ))}
      </div>
    </form>
  );
}
