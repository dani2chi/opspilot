import { Check, X } from "lucide-react";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PERMISSIONS: Array<{ feature: string; owner: boolean | "limited"; admin: boolean | "limited"; member: boolean | "limited" }> = [
  { feature: "View dashboard", owner: true, admin: true, member: "limited" },
  { feature: "Create / edit clients", owner: true, admin: true, member: false },
  { feature: "Archive client records", owner: true, admin: false, member: false },
  { feature: "Create / edit projects", owner: true, admin: true, member: false },
  { feature: "Manage milestones", owner: true, admin: true, member: false },
  { feature: "Update task status", owner: true, admin: true, member: "limited" },
  { feature: "Manage team & invites", owner: true, admin: true, member: false },
  { feature: "Change member roles", owner: true, admin: false, member: false },
  { feature: "Generate reports", owner: true, admin: true, member: false },
  { feature: "Export workspace data", owner: true, admin: true, member: false },
  { feature: "Manage workspace settings", owner: true, admin: false, member: false },
  { feature: "Billing & subscription", owner: true, admin: false, member: false },
];

function PCell({ value }: { value: boolean | "limited" }) {
  if (value === true) return <Check className="mx-auto h-4 w-4 text-emerald-600" />;
  if (value === "limited") return <Badge tone="warning">limited</Badge>;
  return <X className="mx-auto h-4 w-4 text-slate-300" />;
}

export default async function SettingsPage() {
  const session = await requireSession();
  const members = await db.workspaceMember.findMany({
    where: { workspaceId: session.workspace.id },
    include: { user: true },
  });

  return (
    <>
      <PageHeader
        title="Settings"
        description="Workspace, profile, and role-based permissions"
      />
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Workspace" description="Settings shared by everyone in BrightPath Consulting" />
            <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Workspace name" value={session.workspace.name} />
              <Field label="URL slug" value={`opspilot.app/${session.workspace.slug}`} />
              <Field label="Industry" value={session.workspace.industry} />
              <Field label="Company size" value={session.workspace.companySize} />
              <Field label="Time zone" value={session.workspace.timezone} />
              <Field label="Default currency" value="USD" />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Roles & permissions"
              description="Three-tier role model: Owner, Admin, and Team Member"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3">Feature</th>
                    <th className="px-5 py-3 text-center">
                      <Badge tone="purple">OWNER</Badge>
                    </th>
                    <th className="px-5 py-3 text-center">
                      <Badge tone="info">ADMIN</Badge>
                    </th>
                    <th className="px-5 py-3 text-center">
                      <Badge tone="neutral">MEMBER</Badge>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PERMISSIONS.map((p) => (
                    <tr key={p.feature}>
                      <td className="px-5 py-3 text-slate-700">{p.feature}</td>
                      <td className="px-5 py-3 text-center"><PCell value={p.owner} /></td>
                      <td className="px-5 py-3 text-center"><PCell value={p.admin} /></td>
                      <td className="px-5 py-3 text-center"><PCell value={p.member} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Notifications"
              description="Per-event delivery preferences for this workspace"
            />
            <CardBody className="space-y-3">
              {[
                { name: "Task assigned to me", email: true, inApp: true, slack: false },
                { name: "Mentioned in a comment", email: true, inApp: true, slack: true },
                { name: "Project status changed", email: false, inApp: true, slack: false },
                { name: "Weekly digest", email: true, inApp: false, slack: false },
                { name: "Overdue task reminder", email: true, inApp: true, slack: false },
              ].map((n) => (
                <div key={n.name} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                  <p className="text-sm font-medium text-slate-800">{n.name}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <Toggle on={n.email} label="Email" />
                    <Toggle on={n.inApp} label="In-app" />
                    <Toggle on={n.slack} label="Slack" />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Your profile" />
            <CardBody>
              <div className="flex items-center gap-4">
                <Avatar name={session.user.name} size="lg" />
                <div>
                  <p className="text-base font-semibold text-slate-900">{session.user.name}</p>
                  <p className="text-xs text-slate-500">{session.user.email}</p>
                  <Badge
                    tone={session.role === "OWNER" ? "purple" : session.role === "ADMIN" ? "info" : "neutral"}
                    className="mt-2"
                  >
                    {session.role}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">Edit profile</Button>
                <Button variant="outline" size="sm">Change password</Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Members" description={`${members.length} active`} />
            <CardBody className="p-0">
              <ul className="divide-y divide-slate-100">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar name={m.user.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{m.user.name}</p>
                      <p className="truncate text-xs text-slate-500">{m.user.email}</p>
                    </div>
                    <Badge tone={m.role === "OWNER" ? "purple" : m.role === "ADMIN" ? "info" : "neutral"}>
                      {m.role}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card className="border-rose-100">
            <CardHeader title="Danger zone" description="Irreversible workspace actions" />
            <CardBody className="space-y-3">
              <Button variant="outline" size="sm" className="w-full">Transfer ownership</Button>
              <Button variant="danger" size="sm" className="w-full">Delete workspace</Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</label>
      <div className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">{value}</div>
    </div>
  );
}

function Toggle({ on, label }: { on: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${on ? "text-slate-900" : "text-slate-400"}`}>
      <span
        className={`inline-block h-3.5 w-6 rounded-full border ${on ? "border-emerald-300 bg-emerald-100" : "border-slate-200 bg-slate-100"} relative`}
      >
        <span
          className={`absolute top-[1px] h-2.5 w-2.5 rounded-full transition-all ${on ? "left-[12px] bg-emerald-500" : "left-[1px] bg-slate-400"}`}
        />
      </span>
      {label}
    </span>
  );
}
