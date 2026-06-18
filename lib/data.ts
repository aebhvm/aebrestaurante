import { and, count, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  auditLogs,
  appSettings,
  barRecipes,
  breaks,
  news,
  newsRecipients,
  shifts,
  stations,
  stockProducts,
  stockRequests,
  tasks,
  users
} from "@/db/schema";
import { demoBreaks, demoLoginSettings, demoNews, demoRecipes, demoShifts, demoStations, demoStockProducts, demoStockRequests, demoTasks, demoUsers } from "@/lib/demo-data";
import type { SessionUser } from "@/lib/session";
import { todayISO } from "@/lib/utils";

type Filters = { date?: string; userId?: number; status?: string; type?: string; q?: string };

export async function getUsers() {
  if (!db) return demoUsers;
  return db.query.users.findMany({ orderBy: [desc(users.createdAt)] });
}

export async function getLoginSettings() {
  if (!db) return demoLoginSettings;
  return (await db.query.appSettings.findFirst({ orderBy: [desc(appSettings.updatedAt)] })) ?? demoLoginSettings;
}

export async function getManagerDashboard(date = todayISO()) {
  if (!db) {
    const dayTasks = demoTasks.filter((task) => task.taskDate === date);
    return {
      pendingTasks: dayTasks.filter((task) => task.status === "pendente").length,
      completedTasks: dayTasks.filter((task) => task.status === "concluido").length,
      overdueTasks: dayTasks.filter((task) => task.status === "pendente" && task.taskTime < new Date().toTimeString().slice(0, 5)).length,
      pendingOrders: demoStockRequests.filter((order) => order.status === "solicitado" && order.requestDate === date).length,
      todaysShifts: demoShifts.filter((shift) => shift.shiftDate === date),
      todaysBreaks: demoBreaks.filter((item) => item.breakDate === date)
    };
  }

  const now = new Date().toTimeString().slice(0, 5);
  const [pendingTasks, completedTasks, overdueTasks, pendingOrders, todaysShifts, todaysBreaks] = await Promise.all([
    db.select({ value: count() }).from(tasks).where(and(eq(tasks.status, "pendente"), eq(tasks.taskDate, date))),
    db.select({ value: count() }).from(tasks).where(and(eq(tasks.status, "concluido"), eq(tasks.taskDate, date))),
    db.select({ value: count() }).from(tasks).where(and(eq(tasks.status, "pendente"), eq(tasks.taskDate, date), sql`${tasks.taskTime} < ${now}`)),
    db.select({ value: count() }).from(stockRequests).where(and(eq(stockRequests.status, "solicitado"), eq(stockRequests.requestDate, date))),
    db.query.shifts.findMany({ where: eq(shifts.shiftDate, date), with: { waiter: true, bartender: true, station: true }, orderBy: [shifts.shiftDate] }),
    db.query.breaks.findMany({ where: eq(breaks.breakDate, date), with: { waiter: true, bartender: true }, orderBy: [breaks.startsAt] })
  ]);

  return {
    pendingTasks: pendingTasks[0]?.value ?? 0,
    completedTasks: completedTasks[0]?.value ?? 0,
    overdueTasks: overdueTasks[0]?.value ?? 0,
    pendingOrders: pendingOrders[0]?.value ?? 0,
    todaysShifts,
    todaysBreaks
  };
}

export async function getTasks(session: SessionUser, filters: Filters = {}) {
  if (!db) {
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

  return db.query.tasks.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    with: { responsible: true },
    orderBy: [desc(tasks.taskDate), desc(tasks.createdAt)]
  });
}

export async function getStations(session: SessionUser, filters: Filters = {}) {
  if (!db) return demoStations.filter((item) => (session.role === "gestor" || item.responsibleId === session.id) && (!filters.date || item.stationDate === filters.date));
  const conditions = [
    session.role === "gestor" ? undefined : eq(stations.responsibleId, session.id),
    filters.date ? eq(stations.stationDate, filters.date) : undefined
  ].filter(Boolean);
  return db.query.stations.findMany({ where: conditions.length ? and(...conditions) : undefined, with: { responsible: true }, orderBy: [desc(stations.stationDate)] });
}

export async function getShifts(session: SessionUser, filters: Filters = {}) {
  if (!db) return demoShifts.filter((item) => (session.role === "gestor" || item.waiter?.id === session.id || item.bartender?.id === session.id) && (!filters.date || item.shiftDate === filters.date));
  const own = session.role === "gestor" ? undefined : or(eq(shifts.waiterId, session.id), eq(shifts.bartenderId, session.id));
  const conditions = [own, filters.date ? eq(shifts.shiftDate, filters.date) : undefined].filter(Boolean);
  return db.query.shifts.findMany({ where: conditions.length ? and(...conditions) : undefined, with: { waiter: true, bartender: true, station: true }, orderBy: [desc(shifts.shiftDate)] });
}

export async function getBreaks(session: SessionUser, filters: Filters = {}) {
  if (!db) return demoBreaks.filter((item) => (session.role === "gestor" || item.waiter?.id === session.id || item.bartender?.id === session.id) && (!filters.date || item.breakDate === filters.date));
  const own = session.role === "gestor" ? undefined : or(eq(breaks.waiterId, session.id), eq(breaks.bartenderId, session.id));
  const conditions = [own, filters.date ? eq(breaks.breakDate, filters.date) : undefined].filter(Boolean);
  return db.query.breaks.findMany({ where: conditions.length ? and(...conditions) : undefined, with: { waiter: true, bartender: true }, orderBy: [desc(breaks.breakDate)] });
}

export async function getRecipes(q?: string) {
  if (!db) return demoRecipes.filter((item) => !q || item.drinkName.toLowerCase().includes(q.toLowerCase()));
  return db.query.barRecipes.findMany({
    where: q ? ilike(barRecipes.drinkName, `%${q}%`) : undefined,
    orderBy: [barRecipes.drinkName]
  });
}

export async function getStockRequests(session: SessionUser, filters: Filters = {}) {
  if (!db) {
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
  return db.query.stockRequests.findMany({ where: conditions.length ? and(...conditions) : undefined, with: { requester: true, productRecord: true }, orderBy: [desc(stockRequests.createdAt)] });
}

export async function getStockProducts(activeOnly = false) {
  if (!db) return activeOnly ? demoStockProducts.filter((item) => item.active) : demoStockProducts;
  return db.query.stockProducts.findMany({
    where: activeOnly ? eq(stockProducts.active, true) : undefined,
    orderBy: [stockProducts.name]
  });
}

export async function getNewsForUser(session: SessionUser, date = todayISO()) {
  if (!db) return demoNews;
  return db.query.news.findMany({
    where: and(
      lte(news.publishedAt, date),
      gte(news.expiresAt, date),
      or(
        eq(news.audience, "todos"),
        session.role === "garcom" ? eq(news.audience, "garcons") : undefined,
        sql`exists (
          select 1 from ${newsRecipients}
          where ${newsRecipients.newsId} = ${news.id}
          and ${newsRecipients.userId} = ${session.id}
        )`
      )
    ),
    with: { recipients: true },
    orderBy: [desc(news.publishedAt)]
  });
}

export async function getAuditLogs(filters: Filters = {}) {
  if (!db) return [];
  const conditions = [
    filters.userId ? eq(auditLogs.actorId, filters.userId) : undefined,
    filters.type ? eq(auditLogs.entity, filters.type as never) : undefined,
    filters.status ? eq(auditLogs.status, filters.status) : undefined,
    filters.date ? sql`date(${auditLogs.occurredAt}) = ${filters.date}` : undefined
  ].filter(Boolean);
  return db.query.auditLogs.findMany({ where: conditions.length ? and(...conditions) : undefined, orderBy: [desc(auditLogs.occurredAt)], limit: 100 });
}
