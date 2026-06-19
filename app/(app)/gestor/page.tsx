import { Boxes, CalendarClock, CheckCircle2, ClipboardList, PauseCircle, TimerOff } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getManagerDashboard } from "@/lib/data";
import { todayISO } from "@/lib/utils";

export default async function ManagerDashboard({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const params = await searchParams;
  const date = params.date ?? todayISO();
  const data = await getManagerDashboard(date);

  return (
    <>
      <PageHeader title="Dashboard do gestor" description="Resumo operacional do dia." />
      <form className="mb-4 flex max-w-sm gap-2">
        <Input name="date" type="date" defaultValue={date} />
        <Button variant="secondary">Filtrar</Button>
      </form>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tarefas pendentes" value={data.pendingTasks} icon={ClipboardList} tone="amber" />
        <StatCard label="Tarefas realizadas" value={data.completedTasks} icon={CheckCircle2} tone="green" />
        <StatCard label="Tarefas atrasadas" value={data.overdueTasks} icon={TimerOff} tone="rose" />
        <StatCard label="Pedidos pendentes" value={data.pendingOrders} icon={Boxes} tone="rose" />
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="size-4" />Escala da data</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.todaysShifts.length ? data.todaysShifts.map((shift) => (
              <div key={shift.id} className="rounded-md border p-3 text-sm">
                <p className="font-medium">{shift.waiter?.name ?? shift.bartender?.name ?? "Funcionario"}</p>
                <p className="text-muted-foreground">{shift.station?.name ?? "Sem praca vinculada"}</p>
                {shift.station?.description && <p className="mt-1 text-xs text-muted-foreground">{shift.station.description}</p>}
              </div>
            )) : <p className="text-sm text-muted-foreground">Nenhuma escala cadastrada para a data.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><PauseCircle className="size-4" />Descansos da data</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.todaysBreaks.length ? data.todaysBreaks.map((item) => (
              <div key={item.id} className="rounded-md border p-3 text-sm">
                <p className="font-medium">{item.waiter?.name ?? item.bartender?.name ?? "Funcionario"}</p>
                <p className="text-muted-foreground">{item.startsAt} as {item.endsAt}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground">Nenhum descanso cadastrado para a data.</p>}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
