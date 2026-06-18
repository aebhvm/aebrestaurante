import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["gestor", "garcom", "barman", "estoquista"]);
export const priorityEnum = pgEnum("priority", ["baixa", "media", "alta", "critica"]);
export const taskStatusEnum = pgEnum("task_status", ["pendente", "concluido"]);
export const stockStatusEnum = pgEnum("stock_status", ["solicitado", "separado", "entregue"]);
export const newsAudienceEnum = pgEnum("news_audience", ["todos", "usuarios", "garcons"]);
export const auditEntityEnum = pgEnum("audit_entity", [
  "user",
  "task",
  "station",
  "shift",
  "break",
  "recipe",
  "stock_product",
  "stock_request",
  "news",
  "app_settings"
]);

const lifecycle = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
};

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 140 }).notNull(),
    username: varchar("username", { length: 80 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: roleEnum("role").notNull().default("garcom"),
    imageUrl: text("image_url"),
    active: boolean("active").notNull().default(true),
    lastAccessAt: timestamp("last_access_at", { withTimezone: true }),
    createdBy: integer("created_by").references((): any => users.id, { onDelete: "set null" }),
    ...lifecycle
  },
  (table) => ({
    usernameIdx: uniqueIndex("users_username_idx").on(table.username),
    roleIdx: index("users_role_idx").on(table.role)
  })
);

export const tasks = pgTable(
  "tasks",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description").notNull(),
    responsibleId: integer("responsible_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    taskDate: date("task_date").notNull(),
    taskTime: varchar("task_time", { length: 8 }).notNull(),
    priority: priorityEnum("priority").notNull().default("media"),
    status: taskStatusEnum("status").notNull().default("pendente"),
    notes: text("notes"),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    ...lifecycle
  },
  (table) => ({
    responsibleDateIdx: index("tasks_responsible_date_idx").on(table.responsibleId, table.taskDate),
    statusIdx: index("tasks_status_idx").on(table.status),
    dateIdx: index("tasks_date_idx").on(table.taskDate)
  })
);

export const stations = pgTable(
  "stations",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    responsibleId: integer("responsible_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    stationDate: date("station_date").notNull(),
    notes: text("notes"),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    ...lifecycle
  },
  (table) => ({
    responsibleDateIdx: index("stations_responsible_date_idx").on(table.responsibleId, table.stationDate),
    dateIdx: index("stations_date_idx").on(table.stationDate)
  })
);

export const shifts = pgTable(
  "shifts",
  {
    id: serial("id").primaryKey(),
    waiterId: integer("waiter_id").references(() => users.id, { onDelete: "cascade" }),
    bartenderId: integer("bartender_id").references(() => users.id, { onDelete: "cascade" }),
    shiftDate: date("shift_date").notNull(),
    startsAt: varchar("starts_at", { length: 8 }).notNull().default("00:00"),
    endsAt: varchar("ends_at", { length: 8 }).notNull().default("00:00"),
    stationId: integer("station_id").references(() => stations.id, { onDelete: "set null" }),
    functionName: varchar("function_name", { length: 120 }).notNull().default("Escala"),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    ...lifecycle
  },
  (table) => ({
    waiterDateIdx: index("shifts_waiter_date_idx").on(table.waiterId, table.shiftDate),
    bartenderDateIdx: index("shifts_bartender_date_idx").on(table.bartenderId, table.shiftDate),
    dateIdx: index("shifts_date_idx").on(table.shiftDate)
  })
);

export const breaks = pgTable(
  "breaks",
  {
    id: serial("id").primaryKey(),
    waiterId: integer("waiter_id").references(() => users.id, { onDelete: "cascade" }),
    bartenderId: integer("bartender_id").references(() => users.id, { onDelete: "cascade" }),
    breakDate: date("break_date").notNull(),
    startsAt: varchar("starts_at", { length: 8 }).notNull(),
    endsAt: varchar("ends_at", { length: 8 }).notNull(),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    ...lifecycle
  },
  (table) => ({
    waiterDateIdx: index("breaks_waiter_date_idx").on(table.waiterId, table.breakDate),
    bartenderDateIdx: index("breaks_bartender_date_idx").on(table.bartenderId, table.breakDate),
    dateIdx: index("breaks_date_idx").on(table.breakDate)
  })
);

export const barRecipes = pgTable(
  "bar_recipes",
  {
    id: serial("id").primaryKey(),
    drinkName: varchar("drink_name", { length: 180 }).notNull(),
    category: varchar("category", { length: 120 }).notNull(),
    photoUrl: text("photo_url"),
    ingredients: jsonb("ingredients").$type<Array<{ item: string; amount: string }>>().notNull().default(sql`'[]'::jsonb`),
    preparation: text("preparation").notNull(),
    glass: varchar("glass", { length: 120 }).notNull(),
    garnish: varchar("garnish", { length: 160 }),
    notes: text("notes"),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    ...lifecycle
  },
  (table) => ({
    nameIdx: index("bar_recipes_name_idx").on(table.drinkName),
    categoryIdx: index("bar_recipes_category_idx").on(table.category)
  })
);

export const stockProducts = pgTable(
  "stock_products",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    unit: varchar("unit", { length: 40 }).notNull(),
    active: boolean("active").notNull().default(true),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    ...lifecycle
  },
  (table) => ({
    nameIdx: uniqueIndex("stock_products_name_idx").on(table.name),
    activeIdx: index("stock_products_active_idx").on(table.active)
  })
);

export const stockRequests = pgTable(
  "stock_requests",
  {
    id: serial("id").primaryKey(),
    requesterId: integer("requester_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    productId: integer("product_id").notNull().references(() => stockProducts.id, { onDelete: "restrict" }),
    product: varchar("product", { length: 160 }).notNull(),
    quantity: integer("quantity").notNull(),
    unit: varchar("unit", { length: 40 }).notNull(),
    reason: text("reason"),
    requestDate: date("request_date").notNull(),
    requestTime: varchar("request_time", { length: 8 }).notNull(),
    status: stockStatusEnum("status").notNull().default("solicitado"),
    separatedBy: integer("separated_by").references(() => users.id, { onDelete: "set null" }),
    deliveredBy: integer("delivered_by").references(() => users.id, { onDelete: "set null" }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    ...lifecycle
  },
  (table) => ({
    requesterDateIdx: index("stock_requests_requester_date_idx").on(table.requesterId, table.requestDate),
    statusIdx: index("stock_requests_status_idx").on(table.status),
    dateIdx: index("stock_requests_date_idx").on(table.requestDate)
  })
);

export const appSettings = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  loginLogoUrl: text("login_logo_url"),
  loginEyebrow: varchar("login_eyebrow", { length: 120 }).notNull().default("AEB Restaurante"),
  loginTitle: varchar("login_title", { length: 220 }).notNull().default("Gestao precisa para salao, bar e estoque."),
  loginSubtitle: text("login_subtitle").notNull().default("Controle tarefas, escalas, pracas, fichas tecnicas, noticias e pedidos de estoque."),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
  ...lifecycle
});

export const news = pgTable(
  "news",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 180 }).notNull(),
    content: text("content").notNull(),
    priority: priorityEnum("priority").notNull().default("media"),
    publishedAt: date("published_at").notNull(),
    expiresAt: date("expires_at").notNull(),
    pdfUrl: text("pdf_url"),
    audience: newsAudienceEnum("audience").notNull().default("todos"),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    ...lifecycle
  },
  (table) => ({
    activeIdx: index("news_active_idx").on(table.publishedAt, table.expiresAt),
    audienceIdx: index("news_audience_idx").on(table.audience)
  })
);

export const newsRecipients = pgTable(
  "news_recipients",
  {
    newsId: integer("news_id").notNull().references(() => news.id, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" })
  },
  (table) => ({
    pk: primaryKey({ columns: [table.newsId, table.userId] })
  })
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    entity: auditEntityEnum("entity").notNull(),
    entityId: integer("entity_id").notNull(),
    action: varchar("action", { length: 80 }).notNull(),
    actorId: integer("actor_id").references(() => users.id, { onDelete: "set null" }),
    status: varchar("status", { length: 80 }),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`)
  },
  (table) => ({
    filtersIdx: index("audit_logs_filters_idx").on(table.occurredAt, table.actorId, table.entity, table.status)
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  stockRequests: many(stockRequests)
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  responsible: one(users, { fields: [tasks.responsibleId], references: [users.id] }),
  creator: one(users, { fields: [tasks.createdBy], references: [users.id] })
}));

export const stationRelations = relations(stations, ({ one }) => ({
  responsible: one(users, { fields: [stations.responsibleId], references: [users.id] })
}));

export const shiftRelations = relations(shifts, ({ one }) => ({
  waiter: one(users, { fields: [shifts.waiterId], references: [users.id] }),
  bartender: one(users, { fields: [shifts.bartenderId], references: [users.id] }),
  station: one(stations, { fields: [shifts.stationId], references: [stations.id] })
}));

export const breakRelations = relations(breaks, ({ one }) => ({
  waiter: one(users, { fields: [breaks.waiterId], references: [users.id] }),
  bartender: one(users, { fields: [breaks.bartenderId], references: [users.id] })
}));

export const stockRequestRelations = relations(stockRequests, ({ one }) => ({
  requester: one(users, { fields: [stockRequests.requesterId], references: [users.id] }),
  productRecord: one(stockProducts, { fields: [stockRequests.productId], references: [stockProducts.id] })
}));

export const newsRelations = relations(news, ({ many, one }) => ({
  recipients: many(newsRecipients),
  creator: one(users, { fields: [news.createdBy], references: [users.id] })
}));

export const newsRecipientRelations = relations(newsRecipients, ({ one }) => ({
  news: one(news, { fields: [newsRecipients.newsId], references: [news.id] }),
  user: one(users, { fields: [newsRecipients.userId], references: [users.id] })
}));

export type UserRole = (typeof roleEnum.enumValues)[number];
export type User = typeof users.$inferSelect;
