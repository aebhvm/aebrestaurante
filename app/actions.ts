"use server";

import bcrypt from "bcryptjs";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, requireDb } from "@/db";
import { appSettings, auditLogs, barRecipes, news, stations, stockProducts, stockRequests, tasks, users } from "@/db/schema";
import { clearSession, getSession, setSession } from "@/lib/session";
import { dashboardForRole } from "@/lib/permissions";
import {
  loginSchema,
  loginSettingsSchema,
  newsSchema,
  recipeSchema,
  stationSchema,
  stockProductSchema,
  stockRequestSchema,
  stockStatusSchema,
  taskSchema,
  updateUserSchema,
  userSchema
} from "@/lib/validators";
import { todayISO } from "@/lib/utils";
import { demoUsers } from "@/lib/demo-data";

function requireField(formData: FormData, field: string) {
  return String(formData.get(field) ?? "");
}

async function uploadPublicFile(file: File, folder: string) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return (await put(`${folder}/${Date.now()}-${file.name}`, file, { access: "public" })).url;
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  return `data:${file.type || "application/octet-stream"};base64,${bytes.toString("base64")}`;
}

async function requireUser(roles?: string[]) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (roles && !roles.includes(session.role)) redirect(dashboardForRole(session.role));
  return session;
}

async function audit(entity: "user" | "task" | "station" | "recipe" | "stock_product" | "stock_request" | "news" | "app_settings", entityId: number, action: string, actorId: number, status?: string) {
  await requireDb().insert(auditLogs).values({ entity, entityId, action, actorId, status });
}

function goToUsersWith(message: string, type: "ok" | "erro" = "erro"): never {
  redirect(`/usuarios?${type}=${encodeURIComponent(message)}`);
}

export async function loginAction(_: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse({
    username: requireField(formData, "username"),
    password: requireField(formData, "password")
  });
  if (!parsed.success) return { error: "Informe usuário e senha válidos." };

  if (!db && parsed.data.password === "Senha@123") {
    const demo = demoUsers.find((item) => item.username === parsed.data.username.toLowerCase());
    if (demo) {
      await setSession({ id: demo.id, name: demo.name, username: demo.username, role: demo.role });
      redirect(dashboardForRole(demo.role));
    }
  }

  const database = requireDb();
  const [user] = await database.select().from(users).where(eq(users.username, parsed.data.username.toLowerCase())).limit(1);
  if (!user || !user.active || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return { error: "Credenciais inválidas." };
  }

  await database.update(users).set({ lastAccessAt: new Date(), updatedAt: new Date() }).where(eq(users.id, user.id));
  await setSession({ id: user.id, name: user.name, username: user.username, role: user.role });
  redirect(dashboardForRole(user.role));
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function createUserAction(formData: FormData) {
  const session = await requireUser(["gestor"]);
  const parsed = userSchema.safeParse({
    name: requireField(formData, "name"),
    username: requireField(formData, "username").toLowerCase(),
    password: requireField(formData, "password"),
    role: requireField(formData, "role")
  });
  if (!parsed.success) goToUsersWith("Preencha nome, usuário, cargo e uma senha com pelo menos 4 caracteres.");

  const database = requireDb();
  const existing = await database.query.users.findFirst({ where: eq(users.username, parsed.data.username) });
  if (existing) goToUsersWith("Já existe um usuário com esse login.");

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const [created] = await database.insert(users).values({ ...parsed.data, passwordHash, createdBy: session.id }).returning();
  await audit("user", created.id, "create", session.id, created.role);
  revalidatePath("/usuarios");
  goToUsersWith("Usuário criado com sucesso.", "ok");
}

export async function updateUserAction(formData: FormData) {
  const session = await requireUser(["gestor"]);
  const parsed = updateUserSchema.safeParse({
    id: requireField(formData, "id"),
    name: requireField(formData, "name").trim(),
    username: requireField(formData, "username").trim().toLowerCase(),
    password: requireField(formData, "password").trim(),
    role: requireField(formData, "role"),
    active: requireField(formData, "active")
  });
  if (!parsed.success) goToUsersWith("Revise os dados do usuário. A senha nova deve ter pelo menos 4 caracteres.");

  if (parsed.data.id === session.id && (parsed.data.role !== "gestor" || !parsed.data.active)) {
    goToUsersWith("Você não pode remover seu próprio acesso de gestor.");
  }

  const database = requireDb();
  const existing = await database.query.users.findFirst({ where: eq(users.id, parsed.data.id) });
  if (!existing) goToUsersWith("Usuário não encontrado.");

  const duplicate = await database.query.users.findFirst({ where: eq(users.username, parsed.data.username) });
  if (duplicate && duplicate.id !== parsed.data.id) goToUsersWith("Já existe outro usuário com esse login.");

  const patch = parsed.data.password
    ? {
        name: parsed.data.name,
        username: parsed.data.username,
        role: parsed.data.role,
        active: parsed.data.active,
        passwordHash: await bcrypt.hash(parsed.data.password, 12),
        updatedAt: new Date()
      }
    : {
        name: parsed.data.name,
        username: parsed.data.username,
        role: parsed.data.role,
        active: parsed.data.active,
        updatedAt: new Date()
      };

  await database.update(users).set(patch).where(eq(users.id, parsed.data.id));
  await audit("user", parsed.data.id, "update", session.id, parsed.data.role);
  revalidatePath("/usuarios");
  goToUsersWith("Usuário atualizado com sucesso.", "ok");
}

export async function deleteUserAction(formData: FormData) {
  const session = await requireUser(["gestor"]);
  const id = Number(requireField(formData, "id"));
  if (!Number.isInteger(id) || id <= 0) goToUsersWith("Usuário inválido.");
  if (id === session.id) goToUsersWith("Você não pode excluir o próprio usuário logado.");

  const database = requireDb();
  const existing = await database.query.users.findFirst({ where: eq(users.id, id) });
  if (!existing) goToUsersWith("Usuário não encontrado.");

  await audit("user", id, "delete", session.id, existing.role);
  await database.delete(users).where(eq(users.id, id));
  revalidatePath("/usuarios");
  goToUsersWith("Usuário excluído com sucesso.", "ok");
}

export async function updateLoginSettingsAction(formData: FormData) {
  const session = await requireUser(["gestor"]);
  const parsed = loginSettingsSchema.safeParse({
    loginEyebrow: requireField(formData, "loginEyebrow"),
    loginTitle: requireField(formData, "loginTitle"),
    loginSubtitle: requireField(formData, "loginSubtitle")
  });
  if (!parsed.success) goToUsersWith("Preencha os textos da tela de login antes de salvar.");

  const image = formData.get("loginLogo");
  const loginLogoUrl = image instanceof File && image.size > 0 ? await uploadPublicFile(image, "settings") : requireField(formData, "currentLogoUrl") || undefined;
  const database = requireDb();
  const existing = await database.query.appSettings.findFirst();
  const [saved] = existing
    ? await database.update(appSettings).set({ ...parsed.data, loginLogoUrl, updatedAt: new Date() }).where(eq(appSettings.id, existing.id)).returning()
    : await database.insert(appSettings).values({ ...parsed.data, loginLogoUrl, createdBy: session.id }).returning();
  await audit("app_settings", saved.id, existing ? "update" : "create", session.id);
  revalidatePath("/login");
  revalidatePath("/usuarios");
  goToUsersWith("Tela de login atualizada com sucesso.", "ok");
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
    productId: requireField(formData, "productId"),
    quantity: requireField(formData, "quantity")
  });
  const product = await requireDb().query.stockProducts.findFirst({ where: eq(stockProducts.id, parsed.productId) });
  if (!product || !product.active) throw new Error("Produto invalido ou inativo.");
  const now = new Date();
  const [created] = await requireDb()
    .insert(stockRequests)
    .values({
      ...parsed,
      product: product.name,
      unit: product.unit,
      requesterId: session.id,
      requestDate: todayISO(),
      requestTime: now.toTimeString().slice(0, 5),
      createdBy: session.id
    })
    .returning();
  await audit("stock_request", created.id, "create", session.id, created.status);
  revalidatePath("/pedidos");
}

export async function createStockProductAction(formData: FormData) {
  const session = await requireUser(["gestor", "estoquista"]);
  const parsed = stockProductSchema.parse({
    name: requireField(formData, "name"),
    unit: requireField(formData, "unit"),
    active: formData.get("active") !== "false"
  });
  const [created] = await requireDb().insert(stockProducts).values({ ...parsed, createdBy: session.id }).returning();
  await audit("stock_product", created.id, "create", session.id, created.unit);
  revalidatePath("/estoque");
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
    notes: requireField(formData, "notes")
  });
  const image = formData.get("photo");
  const photoUrl = image instanceof File && image.size > 0 ? await uploadPublicFile(image, "recipes") : undefined;
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

export async function upsertStationAction(formData: FormData) {
  const session = await requireUser(["gestor"]);
  const parsed = stationSchema.parse({
    id: requireField(formData, "id") || undefined,
    name: requireField(formData, "name"),
    description: requireField(formData, "description"),
    responsibleId: requireField(formData, "responsibleId"),
    stationDate: requireField(formData, "stationDate") || todayISO()
  });
  const database = requireDb();
  const [saved] = parsed.id
    ? await database
        .update(stations)
        .set({ name: parsed.name, description: parsed.description, responsibleId: parsed.responsibleId, stationDate: parsed.stationDate, updatedAt: new Date() })
        .where(eq(stations.id, parsed.id))
        .returning()
    : await database.insert(stations).values({ ...parsed, createdBy: session.id }).returning();
  await audit("station", saved.id, parsed.id ? "update" : "create", session.id);
  revalidatePath("/pracas");
  revalidatePath("/gestor");
}

export async function deleteStationAction(formData: FormData) {
  const session = await requireUser(["gestor"]);
  const id = Number(requireField(formData, "id"));
  await requireDb().delete(stations).where(eq(stations.id, id));
  await audit("station", id, "delete", session.id);
  revalidatePath("/pracas");
  revalidatePath("/gestor");
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
  const pdfUrl = pdf instanceof File && pdf.size > 0 ? await uploadPublicFile(pdf, "news") : undefined;
  const [created] = await requireDb().insert(news).values({ ...parsed, pdfUrl, createdBy: session.id }).returning();
  await audit("news", created.id, "create", session.id, created.priority);
  revalidatePath("/noticias");
}
