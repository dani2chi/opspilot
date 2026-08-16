import Link from "next/link";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Table, THead, TR, TH, TBody, TD } from "@/components/ui/table";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

export default async function ClientsPage() {
  const session = await requireSession();
  const clients = await db.client.findMany({
    where: { workspaceId: session.workspace.id },
    orderBy: { updatedAt: "desc" },
    include: {
      projects: { where: { status: { not: "ARCHIVED" } }, select: { id: true } },
    },
  });

  const stats = {
    total: clients.length,
    active: clients.filter((c) => c.status === "ACTIVE").length,
    paused: clients.filter((c) => c.status === "PAUSED").length,
    archived: clients.filter((c) => c.status === "ARCHIVED").length,
  };

  return (
    <>
      <PageHeader
        title="Clients"
        description="All companies you work with, their contacts, and active engagements"
        actions={
          <>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Export
            </Button>
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" /> New client
            </Button>
          </>
        }
      />
      <div className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryPill label="All clients" value={stats.total} />
          <SummaryPill label="Active" value={stats.active} tone="emerald" />
          <SummaryPill label="Paused" value={stats.paused} tone="amber" />
          <SummaryPill label="Archived" value={stats.archived} tone="slate" />
        </div>

        <Card>
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search by name or contact…"
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
              />
            </div>
            <FilterChip label="Status: All" />
            <FilterChip label="Industry: All" />
            <FilterChip label="Size: Any" />
            <FilterChip label="Sort: Recent" />
          </div>
          <Table>
            <THead>
              <TR>
                <TH>Client</TH>
                <TH>Industry</TH>
                <TH>Contact</TH>
                <TH>Status</TH>
                <TH className="text-right">Active projects</TH>
                <TH>Added</TH>
              </TR>
            </THead>
            <TBody>
              {clients.map((c) => (
                <TR key={c.id}>
                  <TD>
                    <Link href={`/clients/${c.id}`} className="flex items-center gap-3 hover:text-slate-900">
                      <Avatar name={c.name} size="md" />
                      <div>
                        <p className="font-medium text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.website}</p>
                      </div>
                    </Link>
                  </TD>
                  <TD>
                    <span className="text-sm text-slate-700">{c.industry}</span>
                    <p className="text-xs text-slate-500">{c.companySize}</p>
                  </TD>
                  <TD>
                    <p className="text-sm text-slate-700">{c.contactName}</p>
                    <p className="text-xs text-slate-500">{c.email}</p>
                  </TD>
                  <TD>
                    <Badge tone={statusTone(c.status)}>{c.status.toLowerCase()}</Badge>
                  </TD>
                  <TD className="text-right tabular-nums">{c.projects.length}</TD>
                  <TD className="text-xs text-slate-500">{formatDate(c.createdAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
      </div>
    </>
  );
}

function SummaryPill({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: number;
  tone?: "slate" | "emerald" | "amber";
}) {
  const t: Record<string, string> = {
    slate: "border-slate-200",
    emerald: "border-emerald-200 bg-emerald-50/40",
    amber: "border-amber-200 bg-amber-50/40",
  };
  return (
    <div className={`rounded-lg border bg-white px-4 py-3 ${t[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-slate-300">
      {label}
    </button>
  );
}
