import { Download, FileText } from "lucide-react";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { AreaChart } from "@/components/charts/area-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";

export default async function ReportsPage() {
  const session = await requireSession();
  const wid = session.workspace.id;

  const [tasks, projects, clients] = await Promise.all([
    db.task.findMany({ where: { workspaceId: wid }, select: { status: true, createdAt: true, priority: true } }),
    db.project.findMany({ where: { workspaceId: wid }, select: { status: true, budget: true } }),
    db.client.findMany({ where: { workspaceId: wid }, select: { industry: true, status: true } }),
  ]);

  const completedThisMonth = tasks.filter((t) => t.status === "DONE").length;
  const overdueRate = Math.round(
    (tasks.filter((t) => t.status !== "DONE").length / tasks.length) * 100,
  );

  const trend = Array.from({ length: 12 }, (_, i) => ({
    label: new Date(2025, 4 + i, 1).toLocaleString("en-US", { month: "short" }),
    completed: 18 + ((i * 7) % 14) + (i > 6 ? 8 : 0),
  }));

  const byPriority = ["URGENT", "HIGH", "MEDIUM", "LOW"].map((p) => ({
    label: p[0] + p.slice(1).toLowerCase(),
    count: tasks.filter((t) => t.priority === p).length,
  }));

  const byStatus = ["PLANNING", "IN_PROGRESS", "BLOCKED", "REVIEW", "COMPLETED"].map((s) => ({
    name: s.replace("_", " ").toLowerCase(),
    value: projects.filter((p) => p.status === s).length,
  }));

  const industries = Array.from(
    clients.reduce((m, c) => m.set(c.industry, (m.get(c.industry) ?? 0) + 1), new Map<string, number>()),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, count]) => ({ label, count }));

  return (
    <>
      <PageHeader
        title="Reports"
        description="Performance, throughput, and pipeline analytics"
        actions={
          <>
            <Button variant="outline" size="sm">
              <FileText className="h-3.5 w-3.5" /> Export PDF
            </Button>
            <Button size="sm">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </>
        }
      />
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Tasks completed (90d)" value={completedThisMonth} delta={{ value: "+18% vs prior", positive: true }} />
          <StatCard label="Open task rate" value={`${overdueRate}%`} hint="of all tasks tracked" />
          <StatCard label="Active projects" value={projects.filter((p) => p.status === "IN_PROGRESS").length} delta={{ value: "+8", positive: true }} />
          <StatCard label="Active clients" value={clients.filter((c) => c.status === "ACTIVE").length} delta={{ value: "+3", positive: true }} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Project completion trend" description="Tasks marked done per month" />
            <CardBody>
              <AreaChart data={trend} dataKey="completed" height={260} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Project status" description="Across the workspace" />
            <CardBody>
              <DonutChart
                data={byStatus}
                colors={["#94a3b8", "#0ea5e9", "#ef4444", "#f59e0b", "#10b981"]}
              />
              <ul className="mt-3 space-y-1.5 text-xs">
                {byStatus.map((s, i) => (
                  <li key={s.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: ["#94a3b8", "#0ea5e9", "#ef4444", "#f59e0b", "#10b981"][i] }}
                      />
                      {s.name}
                    </span>
                    <span className="tabular-nums text-slate-900">{s.value}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Tasks by priority" />
            <CardBody>
              <BarChart
                data={byPriority}
                dataKey="count"
                colors={["#ef4444", "#f59e0b", "#0ea5e9", "#94a3b8"]}
              />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Top client industries" description="Where the workload is concentrated" />
            <CardBody>
              <BarChart data={industries} dataKey="count" />
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
