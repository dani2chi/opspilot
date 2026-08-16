"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { setDemoRole, clearDemoRole, type Role } from "@/lib/auth";
import { db } from "@/lib/db";

export async function switchRoleAction(role: Role) {
  await setDemoRole(role);
  revalidatePath("/", "layout");
}

export async function logoutAction() {
  await clearDemoRole();
  redirect("/login");
}

export async function updateTaskStatusAction(taskId: string, status: string) {
  await db.task.update({ where: { id: taskId }, data: { status } });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function updateClientStatusAction(clientId: string, status: string) {
  await db.client.update({ where: { id: clientId }, data: { status } });
  revalidatePath("/clients");
}
