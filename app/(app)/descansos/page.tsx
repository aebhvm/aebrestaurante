import { createBreakAction, deleteBreakAction, updateBreakAction } from "@/app/actions";
import { DateStatusFilters } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { getBreaks, getUsers } from "@/lib/data";
import { getSession } from "@/lib/session";
import { formatDateBR, todayISO } from "@/lib/utils";

type Employee = { id: number; name: string };
type BreakItem = { id: number; waiterId?: number | null; bartenderId?: number | null; breakDate: string; startsAt: string; endsAt: string };

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
          <CardContent><BreakForm employees={employees} date={date} /></CardContent>
        </Card>
        <section className="grid content-start gap-3 sm:grid-cols-2">
          {rows.map((row) => (
            <Card key={row.id}>
              <CardContent className="p-4">
                <p className="font-medium">{row.waiter?.name ?? row.bartender?.name ?? "Funcionário"}</p>
                <p className="text-sm text-muted-foreground">{row.startsAt} às {row.endsAt}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDateBR(row.breakDate)}</p>
                <details className="mt-3 border-t pt-3">
                  <summary className="cursor-pointer text-sm font-medium text-primary">Editar</summary>
                  <div className="mt-3 space-y-3">
                    <BreakForm
                      employees={employees}
                      date={date}
                      breakItem={{
                        id: row.id,
                        waiterId: row.waiter?.id,
                        bartenderId: row.bartender?.id,
                        breakDate: row.breakDate,
                        startsAt: row.startsAt,
                        endsAt: row.endsAt
                      }}
                    />
                    <form action={deleteBreakAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <input type="hidden" name="date" value={date} />
                      <Button className="w-full" size="sm" variant="destructive">Excluir</Button>
                    </form>
                  </div>
                </details>
              </CardContent>
            </Card>
          ))}
          {!rows.length && <p className="text-sm text-muted-foreground">Nenhum descanso cadastrado para esta data.</p>}
        </section>
      </div>
    </>
  );
}

function BreakForm({ employees, date, breakItem }: { employees: Employee[]; date: string; breakItem?: BreakItem }) {
  const employeeId = breakItem?.waiterId ?? breakItem?.bartenderId;
  return (
    <form action={breakItem ? updateBreakAction : createBreakAction} className="space-y-3">
      {breakItem && <input type="hidden" name="id" value={breakItem.id} />}
      <div className="space-y-2"><Label>Funcionário</Label><NativeSelect name="employeeId" defaultValue={employeeId ?? ""} required>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}</NativeSelect></div>
      <div className="space-y-2"><Label>Data</Label><Input name="breakDate" type="date" defaultValue={breakItem?.breakDate ?? date} required /></div>
      <div className="grid grid-cols-2 gap-2"><div className="space-y-2"><Label>Início</Label><Input name="startsAt" type="time" defaultValue={breakItem?.startsAt} required /></div><div className="space-y-2"><Label>Fim</Label><Input name="endsAt" type="time" defaultValue={breakItem?.endsAt} required /></div></div>
      <Button className="w-full" size={breakItem ? "sm" : "default"} disabled={!employees.length}>Salvar</Button>
    </form>
  );
}
