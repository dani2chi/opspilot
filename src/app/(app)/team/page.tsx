import { Plus, Mail } from "lucide-react";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Table, THead, TR, TH, TBody, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default async function TeamPage() {
  const session = await requireSession();
  const wid = session.workspace.id;

  const members = await db.workspaceMember.findMany({
    where: { workspaceId: wid },
    include: { user: true },
    orderBy: { joinedAt: "asc" },
  });

  const tasks = await db.task.findMany({
    where: { workspaceId: wid },
    select: { assigneeId: true, status: true, dueDate: true },
  });
  const projects = await db.project.findMany({
    where: { workspaceId: wid },
    select: { ownerId: true },
  });

  const workload = members.map((m) => {
    const userTasks = tasks.filter((t) => t.assigneeId === m.userId);
    const open = userTasks.filter((t) => t.status !== "DONE").length;
    const done = userTasks.filter((t) => t.status === "DONE").length;
    const overdue = userTasks.filter(
      (t) => t.status !== "DONE" && t.dueDate && new Date(t.dueDate) < new Date(),
    ).length;
    const ownedProjects = projects.filter((p) => p.ownerId === m.userId).length;
    const capacity = Math.min(100, Math.round((open / 18) * 100));
    return { ...m, open, done, overdue, ownedProjects, capacity };
  });

  return (
    <>
      <PageHeader
        title="Team"
        description="Members, roles, and current workload"
        actions={
          <>
            <Button variant="outline" size="sm">
              <Mail className="h-3.5 w-3.5" /> Invite link
            </Button>
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" /> Invite member
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Members" description={`${members.length} active members across roles`} />
          <Table>
            <THead>
              <TR>
                <TH>Member</TH>
                <TH>Role</TH>
                <TH>Status</TH>
                <TH className="text-right">Open</TH>
                <TH className="text-right">Done</TH>
                <TH className="text-right">Overdue</TH>
                <TH className="text-right">Projects</TH>
              </TR>
            </THead>
            <TBody>
              {workload.map((m) => (
                <TR key={m.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <Avatar name={m.user.name} size="md" />
                      <div>
                        <p className="font-medium text-slate-900">{m.user.name}</p>
                        <p className="text-xs text-slate-500">{m.user.email}</p>
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <Badge tone={m.role === "OWNER" ? "purple" : m.role === "ADMIN" ? "info" : "neutral"}>
                      {m.role}
                    </Badge>
                  </TD>
                  <TD>
                    <Badge tone="success">{m.status.toLowerCase()}</Badge>
                  </TD>
                  <TD className="text-right tabular-nums">{m.open}</TD>
                  <TD className="text-right tabular-nums">{m.done}</TD>
                  <TD className="text-right tabular-nums">
                    {m.overdue > 0 ? <span className="text-rose-600 font-medium">{m.overdue}</span> : 0}
                  </TD>
                  <TD className="text-right tabular-nums">{m.ownedProjects}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Workload" description="Open tasks vs estimated capacity" />
            <CardBody className="space-y-4">
              {workload.map((m) => (
                <div key={m.id}>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Avatar name={m.user.name} size="xs" />
                      <span className="text-slate-700">{m.user.name}</span>
                    </div>
                    <span className="text-xs tabular-nums text-slate-500">{m.open} open</span>
                  </div>
                  <div className="mt-1.5">
                    <Progress
                      value={m.capacity}
                      tone={m.capacity > 80 ? "danger" : m.capacity > 60 ? "warning" : "default"}
                    />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Pending invites" description="Last 30 days" />
            <CardBody>
              <ul className="space-y-3 text-sm">
                {[
                  { name: "Adaeze Iwu", email: "adaeze.iwu@brightpath.demo", role: "ADMIN" },
                  { name: "Lukas Vinter", email: "lukas.vinter@brightpath.demo", role: "MEMBER" },
                  { name: "Tasha Reyes", email: "tasha.reyes@brightpath.demo", role: "MEMBER" },
                ].map((i) => (
                  <li key={i.email} className="flex items-center justify-between rounded-lg border border-dashed border-slate-200 p-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={i.name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{i.name}</p>
                        <p className="text-xs text-slate-500">{i.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="neutral">{i.role}</Badge>
                      <Button size="sm" variant="ghost">Resend</Button>
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
