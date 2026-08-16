import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

export type Role = "OWNER" | "ADMIN" | "MEMBER";
export const ROLES: Role[] = ["OWNER", "ADMIN", "MEMBER"];

const COOKIE = "opspilot_demo_role";

export async function setDemoRole(role: Role) {
  const store = await cookies();
  store.set(COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearDemoRole() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getCurrentRole(): Promise<Role | null> {
  const store = await cookies();
  const v = store.get(COOKIE)?.value;
  if (v === "OWNER" || v === "ADMIN" || v === "MEMBER") return v;
  return null;
}

export async function getCurrentSession() {
  const role = await getCurrentRole();
  if (!role) return null;
  const workspace = await db.workspace.findFirst({
    include: {
      members: { include: { user: true } },
      owner: true,
    },
  });
  if (!workspace) return null;
  const member = workspace.members.find((m) => m.role === role);
  if (!member) return null;
  return { role, workspace, user: member.user, member };
}

export async function requireSession() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  return session;
}

export function can(role: Role, action: Permission) {
  return PERMISSIONS[role].includes(action);
}

export type Permission =
  | "view_dashboard"
  | "manage_clients"
  | "manage_projects"
  | "manage_tasks"
  | "update_assigned_tasks"
  | "manage_team"
  | "manage_workspace"
  | "manage_billing"
  | "view_reports";

const PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: [
    "view_dashboard",
    "manage_clients",
    "manage_projects",
    "manage_tasks",
    "update_assigned_tasks",
    "manage_team",
    "manage_workspace",
    "manage_billing",
    "view_reports",
  ],
  ADMIN: [
    "view_dashboard",
    "manage_clients",
    "manage_projects",
    "manage_tasks",
    "update_assigned_tasks",
    "manage_team",
    "view_reports",
  ],
  MEMBER: ["view_dashboard", "update_assigned_tasks"],
};
