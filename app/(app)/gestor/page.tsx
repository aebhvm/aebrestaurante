import { Boxes, CalendarClock, ClipboardCheck, ClipboardList, Newspaper, PauseCircle, Users } from "lucide-react";
import { DashboardCharts } from "@/components/charts";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { getManagerDashboard } from "@/lib/data";
import { todayISO } from "@/lib/utils";

export default async function ManagerDashboard({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const params = await searchParams;
  const date = params.date ?? todayISO();
  const data = await getManagerDashboard(date);

  return (
    <>
      <PageHeader title="Dashboard do gestor" description="Visao executiva do dia, gargalos operacionais e indicadores de produtividade." />
      <form className="mb-4 max-w-xs">
        <input name="date" type="date" defaultValue={date} className="focus-ring h-9 w-full rounded-md border bg-background px-3 text-sm" />
      </form>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total de garcons" value={data.totalWaiters} icon={Users} />
        <StatCard label="Tarefas pendentes" value={data.pendingTasks} icon={ClipboardList} tone="amber" />
        <StatCard label="Pedidos pendentes" value={data.pendingOrders} icon={Boxes} tone="rose" />
        <StatCard label="Noticias ativas" value={data.activeNews} icon={Newspaper} tone="green" />
        <StatCard label="Escalas do dia" value={data.todaysShifts} icon={CalendarClock} />
        <StatCard label="Descansos de 1h" value={data.hourBreaks} icon={PauseCircle} tone="green" />
      </section>
      <section className="mt-6">
        <DashboardCharts completedTasks={data.charts.completedTasks} orders={data.charts.orders} productivity={data.charts.productivity} />
      </section>
    </>
  );
}
