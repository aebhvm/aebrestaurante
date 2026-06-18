import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { appSettings, barRecipes, breaks, news, stations, stockProducts, stockRequests, tasks, users, shifts } from "@/db/schema";

const today = new Date().toISOString().slice(0, 10);

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const db = drizzle(neon(process.env.DATABASE_URL));
  const passwordHash = await bcrypt.hash("Senha@123", 12);

  const [gestor, garcom, barman, estoquista] = await db
    .insert(users)
    .values([
      { name: "Marina Gestora", username: "gestor", role: "gestor", passwordHash },
      { name: "Lucas Garcom", username: "lucas", role: "garcom", passwordHash },
      { name: "Bia Barman", username: "bia", role: "barman", passwordHash },
      { name: "Rafael Estoque", username: "estoque", role: "estoquista", passwordHash }
    ])
    .returning();

  await db.insert(appSettings).values({
    loginEyebrow: "AEB Restaurante",
    loginTitle: "Operacao do restaurante em tempo real.",
    loginSubtitle: "Acesse tarefas, pracas, escalas, descansos e pedidos de estoque com seguranca.",
    createdBy: gestor.id
  });

  const [deck] = await db
    .insert(stations)
    .values({
      name: "Deck principal",
      description: "Mesas 1 a 8",
      responsibleId: garcom.id,
      stationDate: today,
      notes: "Priorizar mesas 1 a 8",
      createdBy: gestor.id
    })
    .returning();

  await db.insert(tasks).values([
    {
      title: "Conferir mise en place",
      description: "Checar guardanapos, talheres e tacas antes da abertura.",
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
    { waiterId: garcom.id, shiftDate: today, startsAt: "00:00", endsAt: "00:00", stationId: deck.id, functionName: "Escala", createdBy: gestor.id },
    { bartenderId: barman.id, shiftDate: today, startsAt: "00:00", endsAt: "00:00", stationId: deck.id, functionName: "Escala", createdBy: gestor.id }
  ]);

  await db.insert(breaks).values([
    { waiterId: garcom.id, breakDate: today, startsAt: "20:00", endsAt: "21:00", createdBy: gestor.id },
    { bartenderId: barman.id, breakDate: today, startsAt: "21:00", endsAt: "22:00", createdBy: gestor.id }
  ]);

  await db.insert(barRecipes).values({
    drinkName: "Negroni da Casa",
    category: "Classicos",
    ingredients: [
      { item: "Gin", amount: "30 ml" },
      { item: "Campari", amount: "30 ml" },
      { item: "Vermute tinto", amount: "30 ml" }
    ],
    preparation: "Mexer com gelo por 20 segundos e coar sobre gelo grande.",
    glass: "Old fashioned",
    garnish: "Casca de laranja",
    createdBy: gestor.id
  });

  const [xarope] = await db.insert(stockProducts).values({ name: "Xarope de acucar", unit: "garrafa", createdBy: estoquista.id }).returning();
  await db.insert(stockProducts).values([
    { name: "Guardanapo premium", unit: "pacote", createdBy: estoquista.id },
    { name: "Limao tahiti", unit: "kg", createdBy: estoquista.id }
  ]);

  await db.insert(stockRequests).values({
    requesterId: barman.id,
    productId: xarope.id,
    product: xarope.name,
    quantity: 2,
    unit: xarope.unit,
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

  console.log("Seed concluido. Usuarios: gestor, lucas, bia, estoque / Senha@123");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
