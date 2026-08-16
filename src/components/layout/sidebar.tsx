"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  KanbanSquare,
  UserCog,
  Settings,
  BarChart3,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/projects", label: "Projects", icon: Briefcase },
  { href: "/tasks", label: "Tasks", icon: KanbanSquare },
  { href: "/team", label: "Team", icon: UserCog },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ workspaceName }: { workspaceName: string }) {
  const path = usePathname();
  return (
    <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:border-r md:border-slate-200 md:bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
          <Compass className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-900">OpsPilot</p>
          <p className="text-[11px] text-slate-500 truncate max-w-[140px]">{workspaceName}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 px-3 py-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-700">Demo workspace</p>
          <p className="mt-1 text-[11px] text-slate-500">
            Switch roles from the top bar to see permissions change.
          </p>
        </div>
      </div>
    </aside>
  );
}
