import { completeTaskAction } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { getBreaks, getNewsForUser, getShifts, getTasks } from "@/lib/data";
import { getSession } from "@/lib/session";
import { isTaskOverdue, todayISO } from "@/lib/utils";

type TaskItem = {
  id: number;
  title: string;
  description: string;
  taskDate: string;
  taskTime: string;
  status: string;
};

export default async function WaiterDashboard({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const session = (await getSession())!;
  const params = await searchParams;
  const date = todayISO();
  const [tasks, shifts, breaks, news] = await Promise.all([
    getTasks(session, { date }),
    getShifts(session, { date }),
    getBreaks(session, { date }),
    getNewsForUser(session, date)
  ]);

  return (
    <>
      <PageHeader title="Meu painel" description="Somente informações vinculadas ao seu usuário." />
      {(params.ok || params.erro) && <p className={`mb-4 rounded-md border p-3 text-sm ${params.erro ? "border-destructive/40 text-destructive" : "border-emerald-500/40 text-emerald-700"}`}>{params.erro ?? params.ok}</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        <TasksCard tasks={tasks} />
        <ListCard title="Meu descanso" items={breaks.map((item) => `${item.startsAt} às ${item.endsAt}`)} />
        <ListCard title="Minha escala" items={shifts.map((item) => item.station ? `${item.station.name}${item.station.description ? ` - ${item.station.description}` : ""}` : "Sem praça definida")} />
      </div>
      <Card className="mt-4">
        <CardHeader><CardTitle>Notícias para mim</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {news.map((item) => (
            <div key={item.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-3"><p className="font-medium">{item.title}</p><Badge>{item.priority}</Badge></div>
              <p className="mt-1 text-sm text-muted-foreground">{item.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

function TasksCard({ tasks }: { tasks: TaskItem[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Minhas tarefas</CardTitle></CardHeader>
      <CardContent>
        {tasks.length ? (
          <div className="space-y-2">
            {tasks.map((task) => {
              const overdue = task.status === "pendente" && isTaskOverdue(task.taskDate, task.taskTime);
              return (
                <div key={task.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium">{task.taskTime} - {task.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{task.description}</p>
                    </div>
                    <Badge variant={task.status === "concluido" ? "secondary" : "default"}>{task.status === "concluido" ? "Realizada" : overdue ? "Atrasada" : "Pendente"}</Badge>
                  </div>
                  {task.status === "pendente" && (
                    <form action={completeTaskAction} className="mt-3">
                      <input type="hidden" name="id" value={task.id} />
                      <Button className="w-full sm:w-auto" size="sm">Realizado</Button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        ) : <p className="text-sm text-muted-foreground">Nenhuma tarefa para hoje.</p>}
      </CardContent>
    </Card>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        {items.length ? <ul className="space-y-2 text-sm">{items.map((item) => <li key={item} className="rounded-md border p-3">{item}</li>)}</ul> : <p className="text-sm text-muted-foreground">Nenhum registro para hoje.</p>}
      </CardContent>
    </Card>
  );
}
