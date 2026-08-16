import { notFound } from "next/navigation";
import { Mail, Phone, Globe, Building2, MapPin, FileText } from "lucide-react";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge, statusTone, priorityTone } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const client = await db.client.findFirst({
    where: { id, workspaceId: session.workspace.id },
    include: {
      projects: {
        include: { owner: true, tasks: true },
        orderBy: { updatedAt: "desc" },
      },
    },
  });
  if (!client) notFound();

  const active = client.projects.filter((p) => p.status !== "ARCHIVED" && p.status !== "COMPLETED");
  const completed = client.projects.filter((p) => p.status === "COMPLETED");

  return (
    <>
      <PageHeader
        title={client.name}
        description={`${client.industry} · ${client.companySize}`}
        actions={
          <>
            <Button variant="outline" size="sm">Edit</Button>
            <Button size="sm">New project</Button>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Active engagements" description={`${active.length} of ${client.projects.length} projects in progress`} />
            <CardBody className="p-0">
              <ul className="divide-y divide-slate-100">
                {active.map((p) => (
                  <li key={p.id} className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-slate-900">{p.name}</p>
                          <Badge tone={statusTone(p.status)}>{p.status.replace("_", " ").toLowerCase()}</Badge>
                          <Badge tone={priorityTone(p.priority)}>{p.priority.toLowerCase()}</Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Owner: {p.owner.name} · Due {formatDate(p.dueDate)} · {p.tasks.length} tasks
                        </p>
                      </div>
                      <div className="hidden w-44 sm:block">
                        <div className="flex items-center gap-2">
                          <Progress value={p.progress} />
                          <span className="text-xs tabular-nums text-slate-600">{p.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
                {active.length === 0 && (
                  <li className="px-5 py-10 text-center text-sm text-slate-500">No active engagements.</li>
                )}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Notes" />
            <CardBody>
              <p className="text-sm leading-relaxed text-slate-700">{client.notes}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Activity" description="Last 30 days" />
            <CardBody className="p-0">
              <ul className="divide-y divide-slate-100">
                {[
                  { who: "Marcus Chen", what: "marked the 'Frontend audit' milestone as Done", when: "2h ago" },
                  { who: "Naomi Ortega", what: "logged a discovery call with the client", when: "Yesterday" },
                  { who: "Priya Raman", what: "uploaded revised wireframes to the project", when: "2 days ago" },
                  { who: "Marcus Chen", what: "moved 'API integration' from Backlog to To Do", when: "3 days ago" },
                  { who: "Naomi Ortega", what: "approved the v1 statement of work", when: "1 week ago" },
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

        <div className="space-y-6">
          <Card>
            <CardHeader title="Overview" />
            <CardBody>
              <dl className="space-y-3 text-sm">
                <Row icon={<Building2 className="h-4 w-4" />} label="Industry" value={client.industry} />
                <Row icon={<MapPin className="h-4 w-4" />} label="Company size" value={client.companySize} />
                <Row icon={<Mail className="h-4 w-4" />} label="Email" value={client.email} />
                <Row icon={<Phone className="h-4 w-4" />} label="Phone" value={client.phone ?? "—"} />
                <Row icon={<Globe className="h-4 w-4" />} label="Website" value={client.website ?? "—"} />
                <Row icon={<FileText className="h-4 w-4" />} label="Status" value={<Badge tone={statusTone(client.status)}>{client.status.toLowerCase()}</Badge>} />
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="At a glance" />
            <CardBody>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <Stat label="Active projects" value={String(active.length)} />
                <Stat label="Completed" value={String(completed.length)} />
                <Stat label="Total tasks" value={String(client.projects.reduce((s, p) => s + p.tasks.length, 0))} />
                <Stat
                  label="Pipeline"
                  value={formatCurrency(active.reduce((s, p) => s + (p.budget ?? 0), 0))}
                />
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Primary contact" />
            <CardBody>
              <div className="flex items-center gap-3">
                <Avatar name={client.contactName} size="lg" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{client.contactName}</p>
                  <p className="text-xs text-slate-500">{client.email}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <Mail className="h-3.5 w-3.5" /> Email
                </Button>
                <Button variant="outline" size="sm">
                  <Phone className="h-3.5 w-3.5" /> Call
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-right text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-900 tabular-nums">{value}</p>
    </div>
  );
}
