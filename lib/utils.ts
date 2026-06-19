import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(value));
}

export function formatDateBR(value: string) {
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function brasiliaParts(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date).reduce<Record<string, string>>((parts, item) => {
    if (item.type !== "literal") parts[item.type] = item.value;
    return parts;
  }, {});
}

export function todayISO(date = new Date()) {
  const parts = brasiliaParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function brasiliaTime(date = new Date()) {
  const parts = brasiliaParts(date);
  return `${parts.hour}:${parts.minute}`;
}

export function isTaskOverdue(taskDate: string, taskTime: string, now = new Date()) {
  const today = todayISO(now);
  return taskDate < today || (taskDate === today && taskTime < brasiliaTime(now));
}
