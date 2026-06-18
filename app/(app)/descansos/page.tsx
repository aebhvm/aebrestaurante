import { createBreakAction } from "@/app/actions";
import { DateStatusFilters } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { getBreaks, getUsers } from "@/lib/data";
import { getSession } from "@/lib/session";
import { todayISO } from "@/lib/utils";

export default async function BreaksPage({ searchParams }: { searchParams: Promise<{ date?: string; ok?: string; erro?: string }> }) {
  const session = (await getSession())!;
  const params = await searchParams;
  const date = params.date ?? todayISO();
  const [rows, allUsers] = await Promise.all([getBreaks(session, { date }), getUsers()]);
  const employees = allUsers.filter((user) => user.active && ["garcom", "barman"].includes(user.role));

  return (
    <>
      <PageHeader title="Descansos" description="Defina o horário de descanso de cada garçom e barman." />
      {(params.ok || params.erro) && <p className={`mb-4 rounded-md border p-3 text-sm ${params.erro ? "border-destructive/40 text-destructive" : "border-emerald-500/40 text-emerald-700"}`}>{params.erro ?? params.ok}</p>}
      <DateStatusFilters defaultDate={date} />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader><CardTitle>Novo descanso</CardTitle></CardHeader>
          <CardContent>
            <form action={createBreakAction} className="space-y-3">
              <div className="space-y-2"><Label>Funcionário</Label><NativeSelect name="employeeId">{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}</NativeSelect></div>
              <div className="space-y-2"><Label>Data</Label><Input name="breakDate" type="date" defaultValue={date} required /></div>
              <div className="grid grid-cols-2 gap-2"><div className="space-y-2"><Label>Início</Label><Input name="startsAt" type="time" required /></div><div className="space-y-2"><Label>Fim</Label><Input name="endsAt" type="time" required /></div></div>
              <Button className="w-full" disabled={!employees.length}>Salvar descanso</Button>
            </form>
          </CardContent>
        </Card>
        <section className="grid content-start gap-3 sm:grid-cols-2">
          {rows.map((row) => <Card key={row.id}><CardContent className="p-4"><p className="font-medium">{row.waiter?.name ?? row.bartender?.name ?? "Funcionário"}</p><p className="text-sm text-muted-foreground">{row.startsAt} às {row.endsAt}</p><p className="mt-2 text-xs text-muted-foreground">{row.breakDate}</p></CardContent></Card>)}
          {!rows.length && <p className="text-sm text-muted-foreground">Nenhum descanso cadastrado para esta data.</p>}
        </section>
      </div>
    </>
  );
}
