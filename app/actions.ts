"use server";

import bcrypt from "bcryptjs";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, requireDb } from "@/db";
import { auditLogs, barRecipes, news, stockRequests, tasks, users } from "@/db/schema";
import { clearSession, getSession, setSession } from "@/lib/session";
import { dashboardForRole } from "@/lib/permissions";
import { loginSchema, newsSchema, recipeSchema, stockRequestSchema, stockStatusSchema, taskSchema, userSchema } from "@/lib/validators";
import { todayISO } from "@/lib/utils";
import { demoUsers } from "@/lib/demo-data";

function requireField(formData: FormData, field: string) {
  return String(formData.get(field) ?? "");
}

async function requireUser(roles?: string[]) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (roles && !roles.includes(session.role)) redirect(dashboardForRole(session.role));
  return session;
}

async function audit(entity: "user" | "task" | "recipe" | "stock_request" | "news", entityId: number, action: string, actorId: number, status?: string) {
  await requireDb().insert(auditLogs).values({ entity, entityId, action, actorId, status });
}

export async function loginAction(_: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: requireField(formData, "email"),
    password: requireField(formData, "password")
  });
  if (!parsed.success) return { error: "Informe email e senha validos." };

  if (!db && parsed.data.password === "Senha@123") {
    const demo = demoUsers.find((item) => item.email === parsed.data.email.toLowerCase());
    if (demo) {
      await setSession({ id: demo.id, name: demo.name, email: demo.email, role: demo.role });
      redirect(dashboardForRole(demo.role));
    }
  }

  const database = requireDb();
  const [user] = await database.select().from(users).where(eq(users.email, parsed.data.email.toLowerCase())).limit(1);
  if (!user || !user.active || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return { error: "Credenciais invalidas." };
  }

  await database.update(users).set({ lastAccessAt: new Date(), updatedAt: new Date() }).where(eq(users.id, user.id));
  await setSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  redirect(dashboardForRole(user.role));
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function createUserAction(formData: FormData) {
  const session = await requireUser(["gestor"]);
  const parsed = userSchema.parse({
    name: requireField(formData, "name"),
    email: requireField(formData, "email").toLowerCase(),
    password: requireField(formData, "password"),
    role: requireField(formData, "role")
  });
  const passwordHash = await bcrypt.hash(parsed.password, 12);
  const [created] = await requireDb().insert(users).values({ ...parsed, passwordHash, createdBy: session.id }).returning();
  await audit("user", created.id, "create", session.id, created.role);
  revalidatePath("/usuarios");
}

export async function createTaskAction(formData: FormData) {
  const session = await requireUser(["gestor"]);
  const parsed = taskSchema.parse({
    title: requireField(formData, "title"),
    description: requireField(formData, "description"),
    responsibleId: requireField(formData, "responsibleId"),
    taskDate: requireField(formData, "taskDate"),
    taskTime: requireField(formData, "taskTime"),
    priority: requireField(formData, "priority"),
    status: requireField(formData, "status") || "pendente",
    notes: requireField(formData, "notes")
  });
  const [created] = await requireDb().insert(tasks).values({ ...parsed, createdBy: session.id }).returning();
  await audit("task", created.id, "create", session.id, created.status);
  revalidatePath("/tarefas");
}

export async function createStockRequestAction(formData: FormData) {
  const session = await requireUser(["gestor", "barman"]);
  const parsed = stockRequestSchema.parse({
    product: requireField(formData, "product"),
    quantity: requireField(formData, "quantity"),
    unit: requireField(formData, "unit"),
    reason: requireField(formData, "reason")
  });
  const now = new Date();
  const [created] = await requireDb()
    .insert(stockRequests)
    .values({
      ...parsed,
      requesterId: session.id,
      requestDate: todayISO(),
      requestTime: now.toTimeString().slice(0, 5),
      createdBy: session.id
    })
    .returning();
  await audit("stock_request", created.id, "create", session.id, created.status);
  revalidatePath("/pedidos");
}

export async function updateStockStatusAction(formData: FormData) {
  const session = await requireUser(["gestor", "estoquista"]);
  const parsed = stockStatusSchema.parse({
    id: requireField(formData, "id"),
    status: requireField(formData, "status")
  });
  const patch =
    parsed.status === "separado"
      ? { status: parsed.status, separatedBy: session.id, updatedAt: new Date() }
      : parsed.status === "entregue"
        ? { status: parsed.status, deliveredBy: session.id, deliveredAt: new Date(), updatedAt: new Date() }
        : { status: parsed.status, updatedAt: new Date() };
  await requireDb().update(stockRequests).set(patch).where(eq(stockRequests.id, parsed.id));
  await audit("stock_request", parsed.id, "status_update", session.id, parsed.status);
  revalidatePath("/pedidos");
  revalidatePath("/estoque");
}

export async function createRecipeAction(formData: FormData) {
  const session = await requireUser(["gestor"]);
  const parsed = recipeSchema.parse({
    drinkName: requireField(formData, "drinkName"),
    category: requireField(formData, "category"),
    preparation: requireField(formData, "preparation"),
    glass: requireField(formData, "glass"),
    garnish: requireField(formData, "garnish"),
    prepTimeMinutes: requireField(formData, "prepTimeMinutes"),
    notes: requireField(formData, "notes")
  });
  const image = formData.get("photo");
  const photoUrl = image instanceof File && image.size > 0 ? (await put(`recipes/${Date.now()}-${image.name}`, image, { access: "public" })).url : undefined;
  const ingredients = requireField(formData, "ingredients")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [item, amount = "a gosto"] = line.split("-");
      return { item: item.trim(), amount: amount.trim() };
    });
  const [created] = await requireDb().insert(barRecipes).values({ ...parsed, photoUrl, ingredients, createdBy: session.id }).returning();
  await audit("recipe", created.id, "create", session.id, created.category);
  revalidatePath("/fichas");
}

export async function createNewsAction(formData: FormData) {
  const session = await requireUser(["gestor"]);
  const parsed = newsSchema.parse({
    title: requireField(formData, "title"),
    content: requireField(formData, "content"),
    priority: requireField(formData, "priority"),
    publishedAt: requireField(formData, "publishedAt"),
    expiresAt: requireField(formData, "expiresAt"),
    audience: requireField(formData, "audience")
  });
  const pdf = formData.get("pdf");
  const pdfUrl = pdf instanceof File && pdf.size > 0 ? (await put(`news/${Date.now()}-${pdf.name}`, pdf, { access: "public" })).url : undefined;
  const [created] = await requireDb().insert(news).values({ ...parsed, pdfUrl, createdBy: session.id }).returning();
  await audit("news", created.id, "create", session.id, created.priority);
  revalidatePath("/noticias");
}
