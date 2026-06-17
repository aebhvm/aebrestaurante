import { and, count, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  auditLogs,
  barRecipes,
  breaks,
  news,
  newsRecipients,
  shifts,
  stations,
  stockRequests,
  tasks,
  users
} from "@/db/schema";
import { demoBreaks, demoNews, demoRecipes, demoShifts, demoStations, demoStockRequests, demoTasks, demoUsers } from "@/lib/demo-data";
import type { SessionUser } from "@/lib/session";
import { todayISO } from "@/lib/utils";

type Filters = { date?: string; userId?: number; status?: string; type?: string; q?: string };

export async function getUsers() {
  if (!db) return demoUsers;
  return db.query.users.findMany({ orderBy: [desc(users.createdAt)] });
}

export async function getManagerDashboard(date = todayISO()) {
  if (!db) {
    return {
      totalWaiters: demoUsers.filter((user) => user.role === "garcom").length,
      pendingTasks: demoTasks.filter((task) => task.status === "pendente" && task.taskDate === date).length,
      pendingOrders: demoStockRequests.filter((order) => order.status === "solicitado" && order.requestDate === date).length,
      activeNews: demoNews.length,
      todaysShifts: demoShifts.filter((shift) => shift.shiftDate === date).length,
      hourBreaks: demoBreaks.filter((item) => item.breakDate === date).length,
      charts: buildDemoCharts()
    };
  }

  const [waiters, pendingTasks, pendingOrders, activeNews, todaysShifts, hourBreaks, completedTasks, orders] = await Promise.all([
    db.select({ value: count() }).from(users).where(eq(users.role, "garcom")),
    db.select({ value: count() }).from(tasks).where(and(eq(tasks.status, "pendente"), eq(tasks.taskDate, date))),
    db.select({ value: count() }).from(stockRequests).where(and(eq(stockRequests.status, "solicitado"), eq(stockRequests.requestDate, date))),
    db.select({ value: count() }).from(news).where(and(lte(news.publishedAt, date), gte(news.expiresAt, date))),
    db.select({ value: count() }).from(shifts).where(eq(shifts.shiftDate, date)),
    db.select({ value: count() }).from(breaks).where(and(eq(breaks.breakDate, date), sql`(${breaks.endsAt}::time - ${breaks.startsAt}::time) = interval '1 hour'`)),
    db.select({ day: tasks.taskDate, value: count() }).from(tasks).where(eq(tasks.status, "concluido")).groupBy(tasks.taskDate).orderBy(tasks.taskDate).limit(7),
    db.select({ day: stockRequests.requestDate, value: count() }).from(stockRequests).groupBy(stockRequests.requestDate).orderBy(stockRequests.requestDate).limit(7)
  ]);

  return {
    totalWaiters: waiters[0]?.value ?? 0,
    pendingTasks: pendingTasks[0]?.value ?? 0,
    pendingOrders: pendingOrders[0]?.value ?? 0,
    activeNews: activeNews[0]?.value ?? 0,
    todaysShifts: todaysShifts[0]?.value ?? 0,
    hourBreaks: hourBreaks[0]?.value ?? 0,
    charts: {
      completedTasks,
      orders,
      productivity: completedTasks.map((item, index) => ({ day: item.day, value: Number(item.value) + index + 2 }))
    }
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
  return db.query.stockRequests.findMany({ where: conditions.length ? and(...conditions) : undefined, with: { requester: true }, orderBy: [desc(stockRequests.createdAt)] });
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
        eq(newsRecipients.userId, session.id)
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

function buildDemoCharts() {
  const today = todayISO();
  return {
    completedTasks: [
      { day: today, value: 4 },
      { day: "2026-06-12", value: 7 },
      { day: "2026-06-11", value: 5 }
    ],
    orders: [
      { day: today, value: 6 },
      { day: "2026-06-12", value: 3 },
      { day: "2026-06-11", value: 4 }
    ],
    productivity: [
      { day: today, value: 86 },
      { day: "2026-06-12", value: 78 },
      { day: "2026-06-11", value: 81 }
    ]
  };
}
