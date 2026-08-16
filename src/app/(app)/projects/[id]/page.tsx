import { notFound } from "next/navigation";
import { Calendar, DollarSign, Target, MessageSquare } from "lucide-react";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge, statusTone, priorityTone } from "@/components/ui/badge";
import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const project = await db.project.findFirst({
    where: { id, workspaceId: session.workspace.id },
    include: {
      client: true,
      owner: true,
      milestones: { orderBy: { order: "asc" } },
      tasks: {
        include: { assignee: true },
        orderBy: { dueDate: "asc" },
      },
    },
  });
  if (!project) notFound();

  const team = Array.from(
    new Set(project.tasks.map((t) => t.assignee?.name).filter(Boolean) as string[]),
  );

  const tasksByStatus = ["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"].map((s) => ({
    status: s,
    count: project.tasks.filter((t) => t.status === s).length,
  }));

  return (
    <>
      <PageHeader
        title={project.name}
        description={`${project.client.name} · Owner: ${project.owner.name}`}
        actions={
          <>
            <Button variant="outline" size="sm">Edit</Button>
            <Button size="sm">Add task</Button>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardBody>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                <KV
                  icon={<Calendar className="h-3.5 w-3.5" />}
                  label="Start"
                  value={formatDate(project.startDate)}
                />
                <KV
                  icon={<Target className="h-3.5 w-3.5" />}
                  label="Due"
                  value={formatDate(project.dueDate)}
                />
                <KV
                  icon={<DollarSign className="h-3.5 w-3.5" />}
                  label="Budget"
                  value={project.budget ? formatCurrency(project.budget) : "—"}
                />
                <KV
                  icon={<MessageSquare className="h-3.5 w-3.5" />}
                  label="Tasks"
                  value={String(project.tasks.length)}
                />
              </div>
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">Project progress</span>
                  <span className="tabular-nums text-slate-600">{project.progress}%</span>
                </div>
                <Progress value={project.progress} tone={project.progress >= 80 ? "success" : "default"} />
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Badge tone={statusTone(project.status)}>{project.status.replace("_", " ").toLowerCase()}</Badge>
                <Badge tone={priorityTone(project.priority)}>{project.priority.toLowerCase()}</Badge>
                <span className="text-xs text-slate-500">Last updated {formatDate(project.updatedAt)}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">{project.description}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Milestones" description="Phases and delivery checkpoints" />
            <CardBody className="p-0">
              <ol className="divide-y divide-slate-100">
                {project.milestones.map((m, i) => (
                  <li key={m.id} className="flex items-start gap-4 px-5 py-4">
                    <div
                      className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        m.status === "DONE"
                          ? "bg-emerald-100 text-emerald-700"
                          : m.status === "IN_PROGRESS"
                            ? "bg-sky-100 text-sky-700"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900">{m.title}</p>
                        <Badge tone={statusTone(m.status)}>{m.status.replace("_", " ").toLowerCase()}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">{m.description}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <Progress value={m.progress} className="max-w-xs" />
                        <span className="text-xs tabular-nums text-slate-500">{m.progress}%</span>
                        <span className="text-xs text-slate-500">due {formatDate(m.dueDate)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Tasks" description={`${project.tasks.length} tasks across this project`} />
            <CardBody className="p-0">
              <ul className="divide-y divide-slate-100">
                {project.tasks.slice(0, 12).map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                    <div
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        t.status === "DONE"
                          ? "bg-emerald-500"
                          : t.status === "IN_PROGRESS"
                            ? "bg-sky-500"
                            : t.status === "REVIEW"
                              ? "bg-amber-500"
                              : "bg-slate-300"
                      }`}
                    />
                    <p className="min-w-0 flex-1 truncate text-sm text-slate-800">{t.title}</p>
                    <Badge tone={priorityTone(t.priority)}>{t.priority.toLowerCase()}</Badge>
                    {t.assignee && <Avatar name={t.assignee.name} size="xs" />}
                    <span className="w-20 text-right text-xs text-slate-500">{formatDate(t.dueDate)}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Team" description={`${team.length} contributors`} />
            <CardBody>
              <AvatarStack names={team} max={5} size="md" />
              <ul className="mt-4 space-y-2 text-sm">
                {team.slice(0, 6).map((n) => (
                  <li key={n} className="flex items-center gap-2 text-slate-700">
                    <Avatar name={n} size="xs" /> {n}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Task breakdown" />
            <CardBody>
              <ul className="space-y-2 text-sm">
                {tasksByStatus.map((t) => (
                  <li key={t.status} className="flex items-center justify-between">
                    <Badge tone={statusTone(t.status)}>{t.status.replace("_", " ").toLowerCase()}</Badge>
                    <span className="tabular-nums text-slate-700">{t.count}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Activity" />
            <CardBody className="p-0">
              <ul className="divide-y divide-slate-100">
                {[
                  { who: "Marcus Chen", what: "moved 'API integration' to In Progress", when: "1h ago" },
                  { who: "Priya Raman", what: "left a comment on 'Wireframes v2'", when: "3h ago" },
                  { who: "Naomi Ortega", what: "approved milestone 'Discovery'", when: "Yesterday" },
                  { who: "Devon Hayes", what: "raised the priority of 'Auth refresh'", when: "2 days ago" },
                ].map((a, i) => (
                  <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                    <Avatar name={a.who} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-700">
                        <span className="font-medium text-slate-900">{a.who}</span> {a.what}
                      </p>
                      <p className="text-xs text-slate-500">{a.when}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}

function KV({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-base font-semibold text-slate-900 tabular-nums">{value}</p>
    </div>
  );
}
