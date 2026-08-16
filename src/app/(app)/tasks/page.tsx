import { Plus, Search } from "lucide-react";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, priorityTone } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

const COLUMNS: Array<{
  status: string;
  label: string;
  accent: string;
  dot: string;
}> = [
  { status: "BACKLOG", label: "Backlog", accent: "border-slate-200", dot: "bg-slate-400" },
  { status: "TODO", label: "To Do", accent: "border-slate-200", dot: "bg-slate-500" },
  { status: "IN_PROGRESS", label: "In Progress", accent: "border-sky-200", dot: "bg-sky-500" },
  { status: "REVIEW", label: "In Review", accent: "border-amber-200", dot: "bg-amber-500" },
  { status: "DONE", label: "Done", accent: "border-emerald-200", dot: "bg-emerald-500" },
];

export default async function TasksPage() {
  const session = await requireSession();
  const tasks = await db.task.findMany({
    where: { workspaceId: session.workspace.id },
    orderBy: { updatedAt: "desc" },
    include: {
      project: { include: { client: true } },
      assignee: true,
    },
  });

  const grouped = COLUMNS.map((c) => ({
    ...c,
    tasks: tasks.filter((t) => t.status === c.status).slice(0, 6),
    total: tasks.filter((t) => t.status === c.status).length,
  }));

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Kanban view across all active projects"
        actions={
          <>
            <div className="hidden gap-1 rounded-lg border border-slate-200 bg-white p-1 sm:flex">
              <button className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white">Board</button>
              <button className="rounded-md px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">Table</button>
              <button className="rounded-md px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">Calendar</button>
            </div>
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" /> New task
            </Button>
          </>
        }
      />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search tasks…"
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
            />
          </div>
          <FilterChip label="Project: All" />
          <FilterChip label="Assignee: Anyone" />
          <FilterChip label="Priority: Any" />
          <FilterChip label="Due: Any time" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {grouped.map((col) => (
            <div
              key={col.status}
              className={`flex flex-col rounded-xl border ${col.accent} bg-slate-50/40`}
            >
              <div className="flex items-center justify-between border-b border-slate-200/60 bg-white/60 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                  <p className="text-sm font-semibold text-slate-900">{col.label}</p>
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 tabular-nums">
                    {col.total}
                  </span>
                </div>
                <button className="text-xs text-slate-400 hover:text-slate-600">+</button>
              </div>
              <div className="space-y-2.5 p-3">
                {col.tasks.map((t) => {
                  const overdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE";
                  return (
                    <div
                      key={t.id}
                      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md hover:border-slate-300"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-snug text-slate-900">{t.title}</p>
                        <Badge tone={priorityTone(t.priority)}>{t.priority.toLowerCase()}</Badge>
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {t.project.client.name}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        {t.assignee ? (
                          <Avatar name={t.assignee.name} size="xs" />
                        ) : (
                          <div className="h-6 w-6 rounded-full border border-dashed border-slate-300" />
                        )}
                        <span
                          className={`text-[11px] tabular-nums ${
                            overdue ? "font-semibold text-rose-600" : "text-slate-500"
                          }`}
                        >
                          {overdue ? "Overdue · " : ""}
                          {formatDate(t.dueDate)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {col.total > col.tasks.length && (
                  <button className="w-full rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700">
                    + {col.total - col.tasks.length} more
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-slate-300">
      {label}
    </button>
  );
}
