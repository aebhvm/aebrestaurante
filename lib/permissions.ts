import type { UserRole } from "@/db/schema";

export const roleLabels: Record<UserRole, string> = {
  gestor: "Gestor",
  garcom: "Garçom",
  barman: "Barman",
  estoquista: "Estoquista"
};

export const protectedRoutes: Record<string, UserRole[]> = {
  "/gestor": ["gestor"],
  "/garcom": ["garcom", "barman"],
  "/estoque": ["estoquista", "gestor", "barman"],
  "/usuarios": ["gestor"],
  "/tarefas": ["gestor"],
  "/pracas": ["gestor"],
  "/escalas": ["gestor"],
  "/descansos": ["gestor"],
  "/fichas": ["gestor", "barman", "garcom"],
  "/pedidos": ["gestor", "barman", "estoquista"],
  "/noticias": ["gestor", "garcom", "barman"],
  "/historico": ["gestor", "estoquista"]
};

export function canAccess(pathname: string, role: UserRole) {
  const route = Object.entries(protectedRoutes).find(([prefix]) => pathname.startsWith(prefix));
  return route ? route[1].includes(role) : true;
}

export function dashboardForRole(role: UserRole) {
  if (role === "gestor") return "/gestor";
  if (role === "estoquista") return "/estoque";
  return "/garcom";
}
