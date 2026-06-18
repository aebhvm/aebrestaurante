import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { getBreaks, getNewsForUser, getShifts, getStations, getTasks } from "@/lib/data";
import { getSession } from "@/lib/session";
import { todayISO } from "@/lib/utils";

export default async function WaiterDashboard() {
  const session = (await getSession())!;
  const date = todayISO();
  const [tasks, stations, shifts, breaks, news] = await Promise.all([
    getTasks(session, { date }),
    getStations(session, { date }),
    getShifts(session, { date }),
    getBreaks(session, { date }),
    getNewsForUser(session, date)
  ]);

  return (
    <>
      <PageHeader title="Meu painel" description="Somente informações vinculadas ao seu usuário." />
      <div className="grid gap-4 lg:grid-cols-2">
        <ListCard title="Minhas tarefas" items={tasks.map((item) => `${item.taskTime} - ${item.title}`)} />
        <ListCard title="Minha praca" items={stations.map((item) => `${item.name} - ${item.notes ?? "sem observacoes"}`)} />
        <ListCard title="Meu descanso" items={breaks.map((item) => `${item.startsAt} as ${item.endsAt}`)} />
        <ListCard title="Minha escala" items={shifts.map((item) => `${item.startsAt} as ${item.endsAt} - ${item.functionName}`)} />
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Notícias para mim</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {news.map((item) => (
            <div key={item.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{item.title}</p>
                <Badge>{item.priority}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{item.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <ul className="space-y-2 text-sm">
            {items.map((item) => (
              <li key={item} className="rounded-md border p-3">{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum registro para hoje.</p>
        )}
      </CardContent>
    </Card>
  );
}
