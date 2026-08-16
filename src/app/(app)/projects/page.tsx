import Link from "next/link";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Table, THead, TR, TH, TBody, TD } from "@/components/ui/table";
import { Badge, statusTone, priorityTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ProjectsPage() {
  const session = await requireSession();
  const projects = await db.project.findMany({
    where: { workspaceId: session.workspace.id },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    include: {
      client: true,
      owner: true,
      tasks: { select: { id: true, status: true } },
    },
  });

  const stats = {
    inProgress: projects.filter((p) => p.status === "IN_PROGRESS").length,
    blocked: projects.filter((p) => p.status === "BLOCKED").length,
    review: projects.filter((p) => p.status === "REVIEW").length,
    completed: projects.filter((p) => p.status === "COMPLETED").length,
  };

  return (
    <>
      <PageHeader
        title="Projects"
        description="Track every active engagement, milestone, and budget"
        actions={
          <>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Export
            </Button>
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" /> New project
            </Button>
          </>
        }
      />
      <div className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Pill label="In progress" value={stats.inProgress} dot="#0ea5e9" />
          <Pill label="In review" value={stats.review} dot="#f59e0b" />
          <Pill label="Blocked" value={stats.blocked} dot="#ef4444" />
          <Pill label="Completed" value={stats.completed} dot="#10b981" />
        </div>

        <Card>
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search projects…"
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
              />
            </div>
            <Chip label="Status: All" />
            <Chip label="Priority: Any" />
            <Chip label="Owner: Anyone" />
            <Chip label="Sort: Due date" />
          </div>
          <Table>
            <THead>
              <TR>
                <TH>Project</TH>
                <TH>Client</TH>
                <TH>Owner</TH>
                <TH>Status</TH>
                <TH>Priority</TH>
                <TH>Progress</TH>
                <TH>Due</TH>
                <TH className="text-right">Budget</TH>
              </TR>
            </THead>
            <TBody>
              {projects.map((p) => (
                <TR key={p.id}>
                  <TD>
                    <Link href={`/projects/${p.id}`} className="font-medium text-slate-900 hover:text-slate-700">
                      {p.name}
                    </Link>
                    <p className="text-xs text-slate-500">{p.tasks.length} tasks</p>
                  </TD>
                  <TD className="text-sm text-slate-700">{p.client.name}</TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <Avatar name={p.owner.name} size="xs" />
                      <span className="text-sm text-slate-700">{p.owner.name.split(" ")[0]}</span>
                    </div>
                  </TD>
                  <TD>
                    <Badge tone={statusTone(p.status)}>{p.status.replace("_", " ").toLowerCase()}</Badge>
                  </TD>
                  <TD>
                    <Badge tone={priorityTone(p.priority)}>{p.priority.toLowerCase()}</Badge>
                  </TD>
                  <TD className="w-[160px]">
                    <div className="flex items-center gap-2">
                      <Progress value={p.progress} tone={p.progress >= 80 ? "success" : p.progress < 30 ? "warning" : "default"} />
                      <span className="text-xs tabular-nums text-slate-600">{p.progress}%</span>
                    </div>
                  </TD>
                  <TD className="text-xs text-slate-500">{formatDate(p.dueDate)}</TD>
                  <TD className="text-right text-sm tabular-nums text-slate-700">
                    {p.budget ? formatCurrency(p.budget) : "—"}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
      </div>
    </>
  );
}

function Pill({ label, value, dot }: { label: string; value: number; dot: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
      <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-lg font-semibold tabular-nums text-slate-900">{value}</p>
      </div>
    </div>
  );
}
function Chip({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-slate-300">
      {label}
    </button>
  );
}
