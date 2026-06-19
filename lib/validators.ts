import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(2),
  password: z.string().min(4)
});

export const userSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(2).max(80),
  password: z.string().min(4),
  role: z.enum(["gestor", "garcom", "barman", "estoquista"])
});

export const updateUserSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().min(2),
  username: z.string().min(2).max(80),
  password: z.string(),
  role: z.enum(["gestor", "garcom", "barman", "estoquista"]),
  active: z.coerce.boolean().default(true)
}).refine((data) => data.password.length === 0 || data.password.length >= 4, {
  message: "Senha deve ter pelo menos 4 caracteres.",
  path: ["password"]
});

export const taskSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  responsibleId: z.coerce.number().int().positive(),
  taskDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  taskTime: z.string().min(4),
  priority: z.enum(["baixa", "media", "alta", "critica"]),
  status: z.enum(["pendente", "concluido"]).default("pendente"),
  notes: z.string().optional()
});

export const stockProductSchema = z.object({
  name: z.string().min(2),
  unit: z.string().min(1),
  active: z.coerce.boolean().default(true)
});

export const updateStockProductSchema = stockProductSchema.extend({
  id: z.coerce.number().int().positive()
});

export const stationSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  name: z.string().min(2),
  description: z.string().optional()
});

export const shiftSchema = z.object({
  employeeId: z.coerce.number().int().positive(),
  stationId: z.coerce.number().int().positive(),
  shiftDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export const breakSchema = z.object({
  employeeId: z.coerce.number().int().positive(),
  breakDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startsAt: z.string().regex(/^\d{2}:\d{2}$/),
  endsAt: z.string().regex(/^\d{2}:\d{2}$/)
});

export const stockStatusSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(["solicitado", "separado", "entregue"])
});

export const recipeSchema = z.object({
  drinkName: z.string().min(2),
  preparation: z.string().min(5),
  glass: z.string().min(2),
  garnish: z.string().optional(),
  notes: z.string().optional()
});

export const loginSettingsSchema = z.object({
  loginEyebrow: z.string().trim().min(1).max(120),
  loginTitle: z.string().trim().min(1).max(220),
  loginSubtitle: z.string().trim().min(1).max(1000)
});

export const newsSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(5),
  priority: z.enum(["baixa", "media", "alta", "critica"]),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  audience: z.enum(["todos", "usuarios", "garcons"])
}).refine((data) => data.expiresAt >= data.publishedAt, { message: "Validade deve ser posterior à publicação.", path: ["expiresAt"] });

export const filterSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  userId: z.coerce.number().int().positive().optional(),
  status: z.string().optional(),
  type: z.string().optional()
});
