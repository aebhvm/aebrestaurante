import type { UserRole } from "@/db/schema";

export const roleLabels: Record<UserRole, string> = {
  gestor: "Gestor",
  garcom: "Garcom",
  barman: "Barman",
  estoquista: "Estoquista"
};

export const protectedRoutes: Record<string, UserRole[]> = {
  "/gestor": ["gestor"],
  "/garcom": ["garcom", "barman"],
  "/estoque": ["estoquista", "gestor"],
  "/usuarios": ["gestor"],
  "/tarefas": ["gestor", "garcom", "barman"],
  "/pracas": ["gestor", "garcom", "barman"],
  "/escalas": ["gestor", "garcom", "barman"],
  "/descansos": ["gestor", "garcom", "barman"],
  "/fichas": ["gestor", "barman", "garcom"],
  "/pedidos": ["gestor", "barman", "estoquista"],
  "/noticias": ["gestor", "garcom", "barman", "estoquista"],
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
