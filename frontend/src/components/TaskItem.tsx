"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDueDate, getColorClasses, isOverdue, type Task, type TaskColor } from "@/types/task";
import { TASK_COLORS } from "@/types/task";

interface TaskItemProps {
  task: Task;
  sortMode: "manual" | "dueDate";
  disabled?: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<Task, "title" | "color" | "dueDate">>) => void;
  onTitleBlur: (id: string, title: string) => void;
}

export function TaskItem({
  task,
  sortMode,
  disabled,
  onToggle,
  onDelete,
  onUpdate,
  onTitleBlur,
}: TaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: sortMode === "dueDate" || disabled,
  });

  const colorClasses = getColorClasses(task.color);
  const overdue = isOverdue(task.dueDate, task.completed);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`group animate-fade-in flex items-start gap-3 rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md ${colorClasses.bg} ${colorClasses.border} ${task.completed ? "opacity-60" : ""}`}
    >
      {sortMode === "manual" && (
        <button
          type="button"
          className="mt-0.5 cursor-grab touch-none text-slate-400 hover:text-slate-600 active:cursor-grabbing disabled:cursor-not-allowed"
          aria-label="Drag to reorder"
          disabled={disabled}
          {...attributes}
          {...listeners}
        >
          <GripIcon />
        </button>
      )}

      <button
        type="button"
        onClick={() => onToggle(task.id)}
        disabled={disabled}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors disabled:opacity-50 ${
          task.completed
            ? "border-green-500 bg-green-500 text-white"
            : "border-slate-300 hover:border-green-400"
        }`}
        aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
      >
        {task.completed && (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1 space-y-2">
        <input
          type="text"
          value={task.title}
          onChange={(e) => onUpdate(task.id, { title: e.target.value })}
          onBlur={(e) => onTitleBlur(task.id, e.target.value)}
          disabled={disabled}
          className={`w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400 disabled:opacity-50 ${
            task.completed ? "line-through text-slate-500" : "text-slate-800"
          }`}
          maxLength={200}
        />

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={task.dueDate ?? ""}
            onChange={(e) => onUpdate(task.id, { dueDate: e.target.value || null })}
            disabled={disabled}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 outline-none focus:border-blue-400 disabled:opacity-50"
          />
          {task.dueDate && (
            <span className={`text-xs font-medium ${overdue ? "text-red-600" : "text-slate-500"}`}>
              {overdue ? "Overdue · " : ""}
              {formatDueDate(task.dueDate)}
            </span>
          )}

          <div className="flex items-center gap-1">
            {TASK_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => onUpdate(task.id, { color: c.value as TaskColor })}
                disabled={disabled}
                className={`h-4 w-4 rounded-full ${c.dot} transition-transform disabled:opacity-50 ${
                  task.color === c.value ? "ring-2 ring-offset-1 ring-slate-400 scale-110" : "opacity-60 hover:opacity-100"
                }`}
                aria-label={`Color ${c.label}`}
              />
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDelete(task.id)}
        disabled={disabled}
        className="shrink-0 rounded-lg p-1.5 text-slate-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 disabled:opacity-50"
        aria-label="Delete task"
      >
        <TrashIcon />
      </button>
    </li>
  );
}

function GripIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
