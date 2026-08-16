import { Compass, ShieldCheck, UserCog, Users } from "lucide-react";
import { loginAsAction } from "./actions";
import type { Role } from "@/lib/auth";

const ROLES: Array<{
  role: Role;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
}> = [
  {
    role: "OWNER",
    title: "Workspace Owner",
    subtitle: "Naomi Ortega",
    description: "Full access. Manage billing, team roles, and workspace settings.",
    icon: <ShieldCheck className="h-5 w-5" />,
    accent: "from-violet-500/15 to-violet-500/0 ring-violet-200",
  },
  {
    role: "ADMIN",
    title: "Admin / Manager",
    subtitle: "Marcus Chen",
    description: "Manage clients, projects, tasks, and invite team members.",
    icon: <UserCog className="h-5 w-5" />,
    accent: "from-sky-500/15 to-sky-500/0 ring-sky-200",
  },
  {
    role: "MEMBER",
    title: "Team Member",
    subtitle: "Priya Raman",
    description: "View assigned work and update task status.",
    icon: <Users className="h-5 w-5" />,
    accent: "from-slate-500/15 to-slate-500/0 ring-slate-200",
  },
];

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh w-full lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-slate-900 p-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-900">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold">OpsPilot</p>
            <p className="text-xs text-slate-400">Business Operations Dashboard</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-semibold leading-tight">
            One workspace for clients, projects, tasks, team, and reporting.
          </h2>
          <p className="max-w-md text-sm text-slate-300">
            OpsPilot is a multi-tenant SaaS dashboard built with Next.js, Node.js, and PostgreSQL. This is a portfolio demo seeded with fictional data —
            sign in as any role to explore.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ["18", "active clients"],
              ["42", "active projects"],
              ["126", "open tasks"],
              ["9", "team members"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-semibold tabular-nums">{n}</p>
                <p className="text-xs text-slate-400">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          BrightPath Consulting · Demo workspace · No real data
        </p>
      </div>

      <div className="flex items-center justify-center bg-slate-50 p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Compass className="h-4 w-4" />
              </div>
              <p className="text-base font-semibold">OpsPilot</p>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-slate-900">Sign in to OpsPilot</h1>
          <p className="mt-1 text-sm text-slate-600">
            This is a portfolio demo. Pick a role to preview the workspace from that perspective.
          </p>

          <div className="mt-6 space-y-3">
            {ROLES.map((r) => (
              <form key={r.role} action={loginAsAction.bind(null, r.role)}>
                <button
                  type="submit"
                  className={`group relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-4 text-left ring-1 ring-transparent transition hover:border-slate-300 hover:shadow-sm`}
                >
                  <div className={`absolute inset-x-0 top-0 h-16 bg-gradient-to-b ${r.accent} opacity-60`} />
                  <div className="relative flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                      {r.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">
                          Continue as {r.title}
                        </p>
                        <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600">
                          {r.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{r.subtitle}</p>
                      <p className="mt-1.5 text-xs text-slate-600">{r.description}</p>
                    </div>
                  </div>
                </button>
              </form>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-500">
            <p className="font-medium text-slate-700">Real auth disabled in demo.</p>
            <p>Production version supports email + password, OAuth, and email verification.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
