import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(2),
  password: z.string().min(6)
});

export const userSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(2).max(80),
  password: z.string().min(8),
  role: z.enum(["gestor", "garcom", "barman", "estoquista"])
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

export const stockRequestSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive()
});

export const stockProductSchema = z.object({
  name: z.string().min(2),
  unit: z.string().min(1),
  active: z.coerce.boolean().default(true)
});

export const stationSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  name: z.string().min(2),
  description: z.string().optional(),
  responsibleId: z.coerce.number().int().positive(),
  stationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export const stockStatusSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(["solicitado", "separado", "entregue"])
});

export const recipeSchema = z.object({
  drinkName: z.string().min(2),
  category: z.string().min(2),
  preparation: z.string().min(5),
  glass: z.string().min(2),
  garnish: z.string().optional(),
  notes: z.string().optional()
});

export const loginSettingsSchema = z.object({
  loginEyebrow: z.string().min(2),
  loginTitle: z.string().min(2),
  loginSubtitle: z.string().min(2)
});

export const newsSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(5),
  priority: z.enum(["baixa", "media", "alta", "critica"]),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  audience: z.enum(["todos", "usuarios", "garcons"])
});

export const filterSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  userId: z.coerce.number().int().positive().optional(),
  status: z.string().optional(),
  type: z.string().optional()
});
