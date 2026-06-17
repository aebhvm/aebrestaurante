import { todayISO } from "@/lib/utils";

const today = todayISO();

export const demoUsers = [
  { id: 1, name: "Marina Gestora", email: "gestor@bar.local", role: "gestor" as const, active: true, lastAccessAt: new Date(), createdAt: new Date() },
  { id: 2, name: "Lucas Garcom", email: "garcom@bar.local", role: "garcom" as const, active: true, lastAccessAt: new Date(), createdAt: new Date() },
  { id: 3, name: "Bia Barman", email: "barman@bar.local", role: "barman" as const, active: true, lastAccessAt: new Date(), createdAt: new Date() },
  { id: 4, name: "Rafael Estoque", email: "estoque@bar.local", role: "estoquista" as const, active: true, lastAccessAt: new Date(), createdAt: new Date() }
];

export const demoTasks = [
  { id: 1, title: "Conferir mise en place", responsibleId: 2, responsible: demoUsers[1], taskDate: today, taskTime: "16:00", priority: "alta", status: "pendente", description: "Checar salao antes da abertura." },
  { id: 2, title: "Organizar speed rack", responsibleId: 3, responsible: demoUsers[2], taskDate: today, taskTime: "17:00", priority: "media", status: "concluido", description: "Reposicionar garrafas por giro." }
];

export const demoStations = [
  { id: 1, name: "Deck principal", responsibleId: 2, responsible: demoUsers[1], stationDate: today, notes: "Mesas 1 a 8" }
];

export const demoShifts = [
  { id: 1, shiftDate: today, startsAt: "16:00", endsAt: "00:00", functionName: "Atendimento", waiter: demoUsers[1], bartender: null, station: demoStations[0] },
  { id: 2, shiftDate: today, startsAt: "16:00", endsAt: "00:00", functionName: "Bar", waiter: null, bartender: demoUsers[2], station: demoStations[0] }
];

export const demoBreaks = [
  { id: 1, breakDate: today, startsAt: "20:00", endsAt: "21:00", waiter: demoUsers[1], bartender: null },
  { id: 2, breakDate: today, startsAt: "21:00", endsAt: "22:00", waiter: null, bartender: demoUsers[2] }
];

export const demoRecipes = [
  {
    id: 1,
    drinkName: "Negroni da Casa",
    category: "Classicos",
    photoUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=80",
    ingredients: [
      { item: "Gin", amount: "30 ml" },
      { item: "Campari", amount: "30 ml" },
      { item: "Vermute tinto", amount: "30 ml" }
    ],
    preparation: "Mexer com gelo por 20 segundos e coar sobre gelo grande.",
    glass: "Old fashioned",
    garnish: "Casca de laranja",
    prepTimeMinutes: 4
  }
];

export const demoStockRequests = [
  { id: 1, requesterId: 3, requester: demoUsers[2], product: "Xarope de acucar", quantity: 2, unit: "garrafa", reason: "Reposicao", requestDate: today, requestTime: "18:20", status: "solicitado" },
  { id: 2, requesterId: 1, requester: demoUsers[0], product: "Guardanapo premium", quantity: 5, unit: "pacote", reason: "Evento", requestDate: today, requestTime: "15:30", status: "separado" }
];

export const demoNews = [
  { id: 1, title: "Briefing do servico", content: "Menu executivo ate 19h e reserva grande as 21h.", priority: "alta", audience: "todos", publishedAt: today, expiresAt: today }
];
