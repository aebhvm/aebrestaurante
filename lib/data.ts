import { and, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { hasDatabase, requireDb } from "@/db";
import {
  auditLogs,
  appSettings,
  barRecipes,
  breaks,
  news,
  shifts,
  stations,
  stockProducts,
  stockRequests,
  tasks,
  users
} from "@/db/schema";
import { demoBreaks, demoLoginSettings, demoNews, demoRecipes, demoShifts, demoStations, demoStockProducts, demoStockRequests, demoTasks, demoUsers } from "@/lib/demo-data";
import type { SessionUser } from "@/lib/session";
import { isTaskOverdue, todayISO } from "@/lib/utils";


type Filters = { date?: string; userId?: number; status?: string; type?: string; q?: string };
const recipesPerPage = 24;

type RecipeCard = {
  id: number;
  drinkName: string;
  photoPath: string | null;
  ingredients: Array<{ item: string; amount: string }>;
  ingredientCount: number;
  preparation: string;
  glass: string;
  garnish: string | null;
};

type RecipePage = { recipes: RecipeCard[]; hasNext: boolean };

function normalizeLoginSettings<T extends { loginTitle: string; loginSubtitle: string }>(settings: T): T {
  return {
    ...settings,
    loginTitle: settings.loginTitle === "Operacao do restaurante em tempo real."
      ? "Operação do restaurante em tempo real."
      : settings.loginTitle === "Gestao precisa para salao, bar e estoque."
        ? "Gestão precisa para salão, bar e estoque."
        : settings.loginTitle,
    loginSubtitle: settings.loginSubtitle === "Acesse tarefas, pracas, escalas, descansos e pedidos de estoque com seguranca."
      ? "Acesse tarefas, praças, escalas, descansos e pedidos de estoque com segurança."
      : settings.loginSubtitle === "Controle tarefas, escalas, pracas, fichas tecnicas, noticias e pedidos de estoque."
        ? "Controle tarefas, escalas, praças, fichas técnicas, notícias e pedidos de estoque."
        : settings.loginSubtitle
  };
}

const getCachedLoginSettings = unstable_cache(
  async () => normalizeLoginSettings((await requireDb().query.appSettings.findFirst({ orderBy: [desc(appSettings.updatedAt)] })) ?? demoLoginSettings),
  ["login-settings"],
  { revalidate: 300, tags: ["login-settings"] }
);

const getCachedRecipes = unstable_cache(
  async (query: string, page: number): Promise<RecipePage> => {
    const rows = await requireDb().query.barRecipes.findMany({
      columns: {
        id: true,
        drinkName: true,
        photoUrl: true,
        ingredients: true,
        preparation: true,
        glass: true,
        garnish: true
      },
      where: query ? ilike(barRecipes.drinkName, `%${query}%`) : undefined,
      orderBy: [barRecipes.drinkName, barRecipes.id],
      limit: recipesPerPage + 1,
      offset: (page - 1) * recipesPerPage
    });

    return {
      hasNext: rows.length > recipesPerPage,
      recipes: rows.slice(0, recipesPerPage).map((recipe) => ({
        id: recipe.id,
        drinkName: recipe.drinkName,
        photoPath: recipe.photoUrl ? `/api/fichas/${recipe.id}/photo` : null,
        ingredients: recipe.ingredients.slice(0, 4).map(({ item, amount }) => ({ item, amount })),
        ingredientCount: recipe.ingredients.length,
        preparation: recipe.preparation.slice(0, 240),
        glass: recipe.glass,
        garnish: recipe.garnish
      }))
    };
  },
  ["recipes"],
  { revalidate: 300, tags: ["recipes"] }
);

const getCachedStockProducts = unstable_cache(
  async (activeOnly: boolean) => requireDb().query.stockProducts.findMany({
    where: activeOnly ? eq(stockProducts.active, true) : undefined,
    orderBy: [stockProducts.name]
  }),
  ["stock-products"],
  { revalidate: 60, tags: ["stock-products"] }
);

export async function getUsers() {
  if (!hasDatabase) return demoUsers;
  return requireDb().query.users.findMany({ orderBy: [desc(users.createdAt)] });
}

export async function getLoginSettings() {
  if (!hasDatabase) return normalizeLoginSettings(demoLoginSettings);
  return getCachedLoginSettings();
}

export async function getManagerDashboard(date = todayISO()) {
  if (!hasDatabase) {
    const dayTasks = demoTasks.filter((task) => task.taskDate === date);
    return {
      pendingTasks: dayTasks.filter((task) => task.status === "pendente" && !isTaskOverdue(task.taskDate, task.taskTime)).length,
      completedTasks: dayTasks.filter((task) => task.status === "concluido").length,
      overdueTasks: dayTasks.filter((task) => task.status === "pendente" && isTaskOverdue(task.taskDate, task.taskTime)).length,
      pendingOrders: demoStockRequests.filter((order) => order.status === "solicitado" && order.requestDate === date).length,
      todaysShifts: demoShifts.filter((shift) => shift.shiftDate === date),
      todaysBreaks: demoBreaks.filter((item) => item.breakDate === date)
    };
  }

  const [dayTasks, pendingOrders, todaysShifts, todaysBreaks] = await Promise.all([
    requireDb().query.tasks.findMany({ where: eq(tasks.taskDate, date) }),
    requireDb().select({ value: sql<number>`count(distinct coalesce(${stockRequests.orderNumber}, ${stockRequests.id}::text))::int` }).from(stockRequests).where(and(eq(stockRequests.status, "solicitado"), eq(stockRequests.requestDate, date))),
    requireDb().query.shifts.findMany({ where: eq(shifts.shiftDate, date), with: { waiter: true, bartender: true, station: true }, orderBy: [shifts.shiftDate] }),
    requireDb().query.breaks.findMany({ where: eq(breaks.breakDate, date), with: { waiter: true, bartender: true }, orderBy: [breaks.startsAt] })
  ]);

  return {
    pendingTasks: dayTasks.filter((task) => task.status === "pendente" && !isTaskOverdue(task.taskDate, task.taskTime)).length,
    completedTasks: dayTasks.filter((task) => task.status === "concluido").length,
    overdueTasks: dayTasks.filter((task) => task.status === "pendente" && isTaskOverdue(task.taskDate, task.taskTime)).length,
    pendingOrders: pendingOrders[0]?.value ?? 0,
    todaysShifts,
    todaysBreaks
  };
}

export async function getTasks(session: SessionUser, filters: Filters = {}) {
  if (!hasDatabase) {
    return demoTasks.filter((task) =>
      (session.role === "gestor" || task.responsibleId === session.id) &&
      (!filters.date || task.taskDate === filters.date) &&
      (!filters.status || task.status === filters.status)
    );
  }

  const conditions = [
    session.role === "gestor" ? undefined : eq(tasks.responsibleId, session.id),
    filters.date ? eq(tasks.taskDate, filters.date) : undefined,
    filters.status ? eq(tasks.status, filters.status as "pendente" | "concluido") : undefined
  ].filter(Boolean);

  return requireDb().query.tasks.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    with: { responsible: true },
    orderBy: [desc(tasks.taskDate), desc(tasks.createdAt)]
  });
}

export async function getStations(session: SessionUser, filters: Filters = {}) {
  if (!hasDatabase) return demoStations.filter((item) => (session.role === "gestor" || item.responsibleId === session.id) && (!filters.date || item.stationDate === filters.date));
  const conditions = [
    session.role === "gestor" ? undefined : eq(stations.responsibleId, session.id),
    filters.date ? eq(stations.stationDate, filters.date) : undefined
  ].filter(Boolean);
  return requireDb().query.stations.findMany({ where: conditions.length ? and(...conditions) : undefined, with: { responsible: true }, orderBy: [desc(stations.stationDate)] });
}

export async function getStationCatalog() {
  if (!hasDatabase) return demoStations;
  const rows = await requireDb().query.stations.findMany({ orderBy: [stations.name] });
  return rows.filter((station, index) => rows.findIndex((item) => item.name.toLowerCase() === station.name.toLowerCase()) === index);
}

export async function getShifts(session: SessionUser, filters: Filters = {}) {
  if (!hasDatabase) return demoShifts.filter((item) => (session.role === "gestor" || item.waiter?.id === session.id || item.bartender?.id === session.id) && (!filters.date || item.shiftDate === filters.date));
  const own = session.role === "gestor" ? undefined : or(eq(shifts.waiterId, session.id), eq(shifts.bartenderId, session.id));
  const conditions = [own, filters.date ? eq(shifts.shiftDate, filters.date) : undefined].filter(Boolean);
  return requireDb().query.shifts.findMany({ where: conditions.length ? and(...conditions) : undefined, with: { waiter: true, bartender: true, station: true }, orderBy: [desc(shifts.shiftDate)] });
}

export async function getBreaks(session: SessionUser, filters: Filters = {}) {
  if (!hasDatabase) return demoBreaks.filter((item) => (session.role === "gestor" || item.waiter?.id === session.id || item.bartender?.id === session.id) && (!filters.date || item.breakDate === filters.date));
  const own = session.role === "gestor" ? undefined : or(eq(breaks.waiterId, session.id), eq(breaks.bartenderId, session.id));
  const conditions = [own, filters.date ? eq(breaks.breakDate, filters.date) : undefined].filter(Boolean);
  return requireDb().query.breaks.findMany({ where: conditions.length ? and(...conditions) : undefined, with: { waiter: true, bartender: true }, orderBy: [desc(breaks.breakDate)] });
}

export async function getRecipes(q?: string, page = 1): Promise<RecipePage> {
  const query = q?.trim() ?? "";
  const normalizedPage = Math.max(1, page);

  if (!hasDatabase) {
    const rows = demoRecipes.filter((item) => !query || item.drinkName.toLowerCase().includes(query.toLowerCase()));
    const start = (normalizedPage - 1) * recipesPerPage;
    return {
      hasNext: rows.length > start + recipesPerPage,
      recipes: rows.slice(start, start + recipesPerPage).map((recipe) => ({
        id: recipe.id,
        drinkName: recipe.drinkName,
        photoPath: recipe.photoUrl ? `/api/fichas/${recipe.id}/photo` : null,
        ingredients: recipe.ingredients.slice(0, 4).map(({ item, amount }) => ({ item, amount })),
        ingredientCount: recipe.ingredients.length,
        preparation: recipe.preparation.slice(0, 240),
        glass: recipe.glass,
        garnish: recipe.garnish ?? null
      }))
    };
  }

  return getCachedRecipes(query, normalizedPage);
}

export async function getStockRequests(session: SessionUser, filters: Filters = {}) {
  if (!hasDatabase) {
    return demoStockRequests.filter((item) =>
      (["gestor", "estoquista"].includes(session.role) || item.requesterId === session.id) &&
      (!filters.date || item.requestDate === filters.date) &&
      (!filters.status || item.status === filters.status)
    );
  }
  const conditions = [
    ["gestor", "estoquista"].includes(session.role) ? undefined : eq(stockRequests.requesterId, session.id),
    filters.date ? eq(stockRequests.requestDate, filters.date) : undefined,
    filters.status ? eq(stockRequests.status, filters.status as "solicitado" | "separado" | "entregue") : undefined
  ].filter(Boolean);
  return requireDb().query.stockRequests.findMany({ where: conditions.length ? and(...conditions) : undefined, with: { requester: true, productRecord: true }, orderBy: [desc(stockRequests.createdAt)] });
}

export async function getStockProducts(activeOnly = false) {
  if (!hasDatabase) return activeOnly ? demoStockProducts.filter((item) => item.active) : demoStockProducts;
  return getCachedStockProducts(activeOnly);
}

export async function getNewsForUser(session: SessionUser, date = todayISO()) {
  if (!hasDatabase) return demoNews;
  const rows = await requireDb().query.news.findMany({
    where: and(
      lte(news.publishedAt, date),
      gte(news.expiresAt, date),
      or(
        eq(news.audience, "todos"),
        session.role === "garcom" ? eq(news.audience, "garcons") : undefined,
        eq(news.audience, "usuarios")
      )
    ),
    with: { recipients: true },
    orderBy: [desc(news.publishedAt)]
  });

  return rows.filter((item) =>
    item.audience === "todos" ||
    (session.role === "garcom" && item.audience === "garcons") ||
    (item.audience === "usuarios" && item.recipients.some((recipient) => recipient.userId === session.id))
  );
}

export async function getActiveNewsForManager(date = todayISO()) {
  if (!hasDatabase) return demoNews;
  return requireDb().query.news.findMany({
    where: gte(news.expiresAt, date),
    with: { recipients: { with: { user: true } } },
    orderBy: [desc(news.publishedAt), desc(news.createdAt)]
  });
}

export async function getAuditLogs(filters: Filters = {}) {
  if (!hasDatabase) return [];
  const conditions = [
    filters.userId ? eq(auditLogs.actorId, filters.userId) : undefined,
    filters.type ? eq(auditLogs.entity, filters.type as never) : undefined,
    filters.status ? eq(auditLogs.status, filters.status) : undefined,
    filters.date ? sql`date(${auditLogs.occurredAt}) = ${filters.date}` : undefined
  ].filter(Boolean);
  return requireDb().query.auditLogs.findMany({ where: conditions.length ? and(...conditions) : undefined, orderBy: [desc(auditLogs.occurredAt)], limit: 100 });
}
