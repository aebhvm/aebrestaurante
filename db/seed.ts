import bcrypt from "bcryptjs";
import { requireDb } from "@/db";
import { barRecipes, breaks, news, stations, stockRequests, tasks, users, shifts } from "@/db/schema";

const today = new Date().toISOString().slice(0, 10);

async function main() {
  const db = requireDb();
  const passwordHash = await bcrypt.hash("Senha@123", 12);

  const [gestor, garcom, barman, estoquista] = await db
    .insert(users)
    .values([
      { name: "Marina Gestora", email: "gestor@bar.local", role: "gestor", passwordHash },
      { name: "Lucas Garcom", email: "garcom@bar.local", role: "garcom", passwordHash },
      { name: "Bia Barman", email: "barman@bar.local", role: "barman", passwordHash },
      { name: "Rafael Estoque", email: "estoque@bar.local", role: "estoquista", passwordHash }
    ])
    .returning();

  const [deck] = await db
    .insert(stations)
    .values({ name: "Deck principal", responsibleId: garcom.id, stationDate: today, notes: "Priorizar mesas 1 a 8", createdBy: gestor.id })
    .returning();

  await db.insert(tasks).values([
    {
      title: "Conferir mise en place",
      description: "Checar guardanapos, talheres e taças antes da abertura.",
      responsibleId: garcom.id,
      taskDate: today,
      taskTime: "16:00",
      priority: "alta",
      createdBy: gestor.id
    },
    {
      title: "Organizar speed rack",
      description: "Reposicionar destilados e xaropes por giro.",
      responsibleId: barman.id,
      taskDate: today,
      taskTime: "17:00",
      priority: "media",
      createdBy: gestor.id
    }
  ]);

  await db.insert(shifts).values([
    { waiterId: garcom.id, shiftDate: today, startsAt: "16:00", endsAt: "00:00", stationId: deck.id, functionName: "Atendimento", createdBy: gestor.id },
    { bartenderId: barman.id, shiftDate: today, startsAt: "16:00", endsAt: "00:00", stationId: deck.id, functionName: "Bar", createdBy: gestor.id }
  ]);

  await db.insert(breaks).values([
    { waiterId: garcom.id, breakDate: today, startsAt: "20:00", endsAt: "21:00", createdBy: gestor.id },
    { bartenderId: barman.id, breakDate: today, startsAt: "21:00", endsAt: "22:00", createdBy: gestor.id }
  ]);

  await db.insert(barRecipes).values({
    drinkName: "Negroni da Casa",
    category: "Clássicos",
    ingredients: [
      { item: "Gin", amount: "30 ml" },
      { item: "Campari", amount: "30 ml" },
      { item: "Vermute tinto", amount: "30 ml" }
    ],
    preparation: "Mexer com gelo por 20 segundos e coar sobre gelo grande.",
    glass: "Old fashioned",
    garnish: "Casca de laranja",
    prepTimeMinutes: 4,
    createdBy: gestor.id
  });

  await db.insert(stockRequests).values({
    requesterId: barman.id,
    product: "Xarope de acucar",
    quantity: 2,
    unit: "garrafa",
    reason: "Reposicao para o turno da noite",
    requestDate: today,
    requestTime: "18:20",
    createdBy: barman.id
  });

  await db.insert(news).values({
    title: "Briefing do servico",
    content: "Hoje teremos menu executivo ate 19h e reserva grande as 21h.",
    priority: "alta",
    publishedAt: today,
    expiresAt: today,
    audience: "todos",
    createdBy: gestor.id
  });

  console.log("Seed concluido. Logins: gestor@bar.local, garcom@bar.local, barman@bar.local, estoque@bar.local / Senha@123");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
