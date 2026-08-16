import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Deterministic PRNG so seeds are reproducible.
let seedVal = 1729;
const rand = () => {
  seedVal = (seedVal * 1103515245 + 12345) & 0x7fffffff;
  return seedVal / 0x7fffffff;
};
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const pickN = <T,>(arr: T[], n: number) => {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rand() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
};
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);
const daysFromNow = (n: number) => new Date(Date.now() + n * 86400000);

async function main() {
  console.log("🌱 Seeding OpsPilot…");

  // Wipe.
  await db.comment.deleteMany();
  await db.activityLog.deleteMany();
  await db.task.deleteMany();
  await db.milestone.deleteMany();
  await db.project.deleteMany();
  await db.client.deleteMany();
  await db.workspaceMember.deleteMany();
  await db.workspace.deleteMany();
  await db.user.deleteMany();

  // Users — 9 team members, with the first three being the demo roles.
  const teamData = [
    { name: "Naomi Ortega", email: "naomi.ortega@brightpath.demo", role: "OWNER" },
    { name: "Marcus Chen", email: "marcus.chen@brightpath.demo", role: "ADMIN" },
    { name: "Priya Raman", email: "priya.raman@brightpath.demo", role: "MEMBER" },
    { name: "Devon Hayes", email: "devon.hayes@brightpath.demo", role: "ADMIN" },
    { name: "Sofia Marchetti", email: "sofia.marchetti@brightpath.demo", role: "MEMBER" },
    { name: "Kwame Boateng", email: "kwame.boateng@brightpath.demo", role: "MEMBER" },
    { name: "Iris Lindqvist", email: "iris.lindqvist@brightpath.demo", role: "MEMBER" },
    { name: "Ramon Ortiz", email: "ramon.ortiz@brightpath.demo", role: "MEMBER" },
    { name: "Yuki Tanaka", email: "yuki.tanaka@brightpath.demo", role: "MEMBER" },
  ];
  const users = await Promise.all(
    teamData.map((t) => db.user.create({ data: { name: t.name, email: t.email } })),
  );

  const owner = users[0];
  const workspace = await db.workspace.create({
    data: {
      name: "BrightPath Consulting",
      slug: "brightpath",
      industry: "Consulting Agency",
      companySize: "5-20",
      timezone: "Europe/London",
      ownerId: owner.id,
    },
  });

  await Promise.all(
    users.map((u, i) =>
      db.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: u.id,
          role: teamData[i].role,
          status: "ACTIVE",
          joinedAt: daysAgo(120 - i * 10),
        },
      }),
    ),
  );

  // Clients — 18.
  const clientSeeds = [
    { name: "Halberd Logistics", contact: "Anika Patel", industry: "Logistics", size: "50-200" },
    { name: "Northwind Hospitality", contact: "Theo Whitfield", industry: "Hospitality", size: "200-500" },
    { name: "Linden & Co.", contact: "Margot Linden", industry: "Legal", size: "11-50" },
    { name: "Cobalt Robotics", contact: "Jin Park", industry: "Manufacturing", size: "200-500" },
    { name: "Saltwater Studios", contact: "Frida Bergström", industry: "Media", size: "11-50" },
    { name: "Provident Health", contact: "Dr. Imani Daniels", industry: "Healthcare", size: "500+" },
    { name: "Rye & Field Markets", contact: "Owen McCallister", industry: "Retail", size: "50-200" },
    { name: "Beacon Energy", contact: "Lillian Cho", industry: "Energy", size: "200-500" },
    { name: "Foxglove Botanicals", contact: "Yara Khoury", industry: "Consumer Goods", size: "11-50" },
    { name: "Veritas Insurance", contact: "Hugo Almeida", industry: "Insurance", size: "500+" },
    { name: "Kestrel Aerospace", contact: "Eli Sandström", industry: "Aerospace", size: "500+" },
    { name: "Granite Capital Partners", contact: "Camila Reyes", industry: "Financial Services", size: "50-200" },
    { name: "Mossridge Vineyards", contact: "Stella Whitcomb", industry: "Hospitality", size: "11-50" },
    { name: "Tidewater Marine", contact: "Captain Liam Brennan", industry: "Logistics", size: "11-50" },
    { name: "Aperture Optics", contact: "Naomi Vance", industry: "Manufacturing", size: "50-200" },
    { name: "Lambent Labs", contact: "Idris Nakamura", industry: "Biotech", size: "11-50" },
    { name: "Hollow Oak Brewing", contact: "Roisin Kelleher", industry: "Consumer Goods", size: "11-50" },
    { name: "Polaris Edu", contact: "Tomás Vega", industry: "Education", size: "50-200" },
  ];
  const clients = await Promise.all(
    clientSeeds.map((c, i) =>
      db.client.create({
        data: {
          workspaceId: workspace.id,
          name: c.name,
          contactName: c.contact,
          email: `${c.contact.split(" ")[0].toLowerCase()}@${c.name.toLowerCase().replace(/[^a-z]/g, "")}.demo`,
          phone: `+44 20 ${7000 + i * 13} ${1000 + i * 47}`,
          website: `https://${c.name.toLowerCase().replace(/[^a-z]/g, "")}.demo`,
          industry: c.industry,
          companySize: c.size,
          status: i === 6 ? "PAUSED" : i === 17 ? "ARCHIVED" : "ACTIVE",
          notes: `${c.contact} prefers async updates via the shared dashboard. Last review on ${daysAgo(20 + i).toLocaleDateString()}.`,
          createdAt: daysAgo(180 - i * 5),
        },
      }),
    ),
  );

  // Projects — ~42 across clients.
  const projectStatuses = ["PLANNING", "IN_PROGRESS", "IN_PROGRESS", "IN_PROGRESS", "BLOCKED", "REVIEW", "COMPLETED"];
  const priorities = ["LOW", "MEDIUM", "MEDIUM", "HIGH", "URGENT"];
  const projectKinds = [
    "Operations dashboard rebuild",
    "Customer onboarding redesign",
    "Quarterly reporting automation",
    "Internal portal migration",
    "Vendor performance tracker",
    "Field-team mobile rollout",
    "Compliance audit workflow",
    "Inventory reconciliation tool",
    "Renewals pipeline overhaul",
    "Knowledge-base consolidation",
    "Stakeholder reporting refresh",
    "Service-desk routing rework",
    "Forecasting model integration",
    "Procurement intake portal",
    "Brand portal handover",
    "Data warehouse cutover",
    "Partner directory rebuild",
    "Frontline training portal",
  ];

  const projects = [];
  let projectCount = 0;
  for (const client of clients) {
    const n = client.status === "ARCHIVED" ? 1 : 1 + Math.floor(rand() * 3);
    for (let i = 0; i < n; i++) {
      if (projectCount >= 42) break;
      const status = client.status === "ARCHIVED" ? "ARCHIVED" : pick(projectStatuses);
      const startDate = daysAgo(30 + Math.floor(rand() * 90));
      const dueDate = daysFromNow(-10 + Math.floor(rand() * 60));
      const progress =
        status === "COMPLETED"
          ? 100
          : status === "ARCHIVED"
            ? 100
            : status === "PLANNING"
              ? Math.floor(rand() * 15)
              : status === "BLOCKED"
                ? 30 + Math.floor(rand() * 30)
                : status === "REVIEW"
                  ? 80 + Math.floor(rand() * 15)
                  : 25 + Math.floor(rand() * 60);
      const project = await db.project.create({
        data: {
          workspaceId: workspace.id,
          clientId: client.id,
          name: `${pick(projectKinds)} — ${client.name.split(" ")[0]}`,
          description: `Cross-functional engagement with ${client.name}. Focus on operational visibility, cleaner workflows, and faster reporting cycles.`,
          status,
          priority: pick(priorities),
          progress,
          ownerId: pick([users[0], users[1], users[3]]).id,
          startDate,
          dueDate,
          budget: 8000 + Math.floor(rand() * 60) * 1000,
          createdAt: startDate,
        },
      });
      projects.push(project);
      projectCount++;

      // Milestones — 3-5 per project.
      const mCount = 3 + Math.floor(rand() * 3);
      const mTitles = ["Discovery & planning", "UI implementation", "API & data layer", "Testing & QA", "Launch", "Handover"];
      for (let m = 0; m < mCount; m++) {
        const mProgress = m < Math.floor((progress / 100) * mCount) ? 100 : m === Math.floor((progress / 100) * mCount) ? 50 : 0;
        await db.milestone.create({
          data: {
            projectId: project.id,
            title: mTitles[m],
            description: `Phase ${m + 1} deliverables for ${project.name}.`,
            dueDate: daysFromNow(-20 + m * 14),
            status: mProgress === 100 ? "DONE" : mProgress > 0 ? "IN_PROGRESS" : "PENDING",
            progress: mProgress,
            order: m,
          },
        });
      }
    }
    if (projectCount >= 42) break;
  }

  // Tasks — ~126.
  const taskStatuses = ["BACKLOG", "TODO", "TODO", "IN_PROGRESS", "IN_PROGRESS", "REVIEW", "DONE", "DONE"];
  const taskTitles = [
    "Wire up dashboard metrics endpoint",
    "Sketch onboarding flow in Figma",
    "Migrate legacy reports to new schema",
    "Write integration tests for billing webhook",
    "Refactor permissions middleware",
    "Add CSV export for client list",
    "Audit role-gated routes for regressions",
    "Draft handover doc for client review",
    "Update typography tokens to match brand v2",
    "Replace polling with realtime subscriptions",
    "Set up Sentry error grouping",
    "Document API for partner team",
    "Move staging DB to managed Postgres",
    "Configure deploy previews",
    "Prep retro deck for Friday",
    "Compile QA test matrix",
    "Reconcile invoice line items",
    "Patch broken filter on archived clients",
    "Improve empty state copy",
    "Add overdue badge to task cards",
    "Cut release notes for v1.4",
    "Build CSV importer for vendor list",
    "Spike feature flag library",
    "Walk through staging with stakeholder",
  ];

  let taskCount = 0;
  for (const project of projects) {
    if (taskCount >= 126) break;
    const n = 2 + Math.floor(rand() * 4);
    for (let i = 0; i < n; i++) {
      if (taskCount >= 126) break;
      const status = project.status === "COMPLETED" || project.status === "ARCHIVED" ? "DONE" : pick(taskStatuses);
      const dueOffset = -7 + Math.floor(rand() * 30);
      await db.task.create({
        data: {
          workspaceId: workspace.id,
          projectId: project.id,
          title: pick(taskTitles),
          description: `${pick(["Spec'd in last sync.", "Carried over from previous sprint.", "Blocked on client feedback.", "Smaller-than-expected scope."])} Owner reviews on Mondays.`,
          status,
          priority: pick(priorities),
          assigneeId: pick(users).id,
          dueDate: daysFromNow(dueOffset),
          createdById: pick([users[0], users[1], users[3]]).id,
          createdAt: daysAgo(2 + Math.floor(rand() * 30)),
        },
      });
      taskCount++;
    }
  }

  // Activity log — recent events.
  const activities = [
    { actor: users[1], action: "completed", entityType: "Task", description: "Marked 'Wire up dashboard metrics endpoint' as Done" },
    { actor: users[2], action: "commented", entityType: "Task", description: "Left a comment on 'Sketch onboarding flow in Figma'" },
    { actor: users[0], action: "created", entityType: "Project", description: `Created project for ${clients[1].name}` },
    { actor: users[3], action: "updated", entityType: "Project", description: `Moved Saltwater Studios engagement to In Progress` },
    { actor: users[1], action: "assigned", entityType: "Task", description: `Assigned 'Refactor permissions middleware' to ${users[4].name}` },
    { actor: users[0], action: "created", entityType: "Client", description: `Added ${clients[5].name} as a new client` },
    { actor: users[4], action: "completed", entityType: "Task", description: "Marked 'Add CSV export for client list' as Done" },
    { actor: users[2], action: "updated", entityType: "Task", description: "Changed priority of 'Patch broken filter on archived clients' to High" },
    { actor: users[5], action: "completed", entityType: "Task", description: "Marked 'Cut release notes for v1.4' as Done" },
    { actor: users[1], action: "updated", entityType: "Project", description: "Updated milestone 'UI implementation' progress to 70%" },
    { actor: users[0], action: "commented", entityType: "Project", description: `Left a note on the ${clients[0].name} engagement` },
    { actor: users[6], action: "completed", entityType: "Task", description: "Marked 'Compile QA test matrix' as Done" },
  ];

  for (let i = 0; i < activities.length; i++) {
    const a = activities[i];
    await db.activityLog.create({
      data: {
        workspaceId: workspace.id,
        actorId: a.actor.id,
        entityType: a.entityType,
        entityId: workspace.id,
        action: a.action,
        description: a.description,
        createdAt: new Date(Date.now() - i * 1000 * 60 * 47),
      },
    });
  }

  console.log(`✅ Seed complete: ${users.length} users, ${clients.length} clients, ${projects.length} projects, ${taskCount} tasks.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
