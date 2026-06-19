import {
  createShiftAction,
  deleteShiftAction,
  deleteStationAction,
  updateShiftAction,
  upsertStationAction
} from "@/app/actions";
import { DateStatusFilters } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getShifts, getStationCatalog, getUsers } from "@/lib/data";
import { getSession } from "@/lib/session";
import { formatDateBR, todayISO } from "@/lib/utils";

type Employee = { id: number; name: string; role: string };
type Station = { id: number; name: string; description?: string | null };
type Shift = { id: number; waiterId?: number | null; bartenderId?: number | null; stationId?: number | null; shiftDate: string };

export default async function ShiftsPage({ searchParams }: { searchParams: Promise<{ date?: string; ok?: string; erro?: string }> }) {
  const session = (await getSession())!;
  const params = await searchParams;
  const date = params.date ?? todayISO();
  const [rows, stations, allUsers] = await Promise.all([getShifts(session, { date }), getStationCatalog(), getUsers()]);
  const employees = allUsers.filter((user) => user.active && ["garcom", "barman"].includes(user.role));

  return (
    <>
      <PageHeader title="Escalas" description="Cadastre praças e defina onde cada funcionário trabalhará no dia." />
      {(params.ok || params.erro) && <p className={`mb-4 rounded-md border p-3 text-sm ${params.erro ? "border-destructive/40 text-destructive" : "border-emerald-500/40 text-emerald-700"}`}>{params.erro ?? params.ok}</p>}
      <DateStatusFilters defaultDate={date} />

      <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <Card key={row.id}>
            <CardContent className="p-4">
              <p className="font-medium">{row.waiter?.name ?? row.bartender?.name ?? "Funcionário"}</p>
              <p className="text-sm text-muted-foreground">{row.station?.name ?? "Sem praça"}</p>
              {row.station?.description && <p className="mt-1 text-xs text-muted-foreground">{row.station.description}</p>}
              <p className="mt-2 text-xs text-muted-foreground">{formatDateBR(row.shiftDate)}</p>
              <details className="mt-3 border-t pt-3">
                <summary className="cursor-pointer text-sm font-medium text-primary">Editar</summary>
                <div className="mt-3 space-y-3">
                  <ShiftForm
                    employees={employees}
                    stations={stations}
                    date={date}
                    shift={{
                      id: row.id,
                      waiterId: row.waiter?.id,
                      bartenderId: row.bartender?.id,
                      stationId: row.station?.id,
                      shiftDate: row.shiftDate
                    }}
                  />
                  <form action={deleteShiftAction}>
                    <input type="hidden" name="id" value={row.id} />
                    <input type="hidden" name="date" value={date} />
                    <Button className="w-full" size="sm" variant="destructive">Excluir</Button>
                  </form>
                </div>
              </details>
            </CardContent>
          </Card>
        ))}
        {!rows.length && <p className="text-sm text-muted-foreground">Nenhuma escala cadastrada para esta data.</p>}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Cadastrar praça</CardTitle></CardHeader>
          <CardContent>
            <StationForm />
            <div className="mt-4 space-y-2 border-t pt-4">
              {stations.map((station) => (
                <details key={station.id} className="rounded-md border p-3">
                  <summary className="cursor-pointer font-medium">{station.name}</summary>
                  <p className="mt-1 text-sm text-muted-foreground">{station.description || "Sem descrição"}</p>
                  <div className="mt-3 space-y-2">
                    <StationForm station={station} />
                    <form action={deleteStationAction}><input type="hidden" name="id" value={station.id} /><Button size="sm" variant="destructive">Excluir</Button></form>
                  </div>
                </details>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Adicionar à escala</CardTitle></CardHeader>
          <CardContent><ShiftForm employees={employees} stations={stations} date={date} /></CardContent>
        </Card>
      </section>

    </>
  );
}

function ShiftForm({ employees, stations, date, shift }: { employees: Employee[]; stations: Station[]; date: string; shift?: Shift }) {
  const employeeId = shift?.waiterId ?? shift?.bartenderId;
  return (
    <form action={shift ? updateShiftAction : createShiftAction} className="space-y-3">
      {shift && <input type="hidden" name="id" value={shift.id} />}
      <div className="space-y-2"><Label>Funcionário</Label><NativeSelect name="employeeId" defaultValue={employeeId ?? ""} required>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.role === "garcom" ? "Garçom" : "Barman"}</option>)}</NativeSelect></div>
      <div className="space-y-2"><Label>Praça</Label><NativeSelect name="stationId" defaultValue={shift?.stationId ?? ""} required>{stations.map((station) => <option key={station.id} value={station.id}>{station.name}</option>)}</NativeSelect></div>
      <div className="space-y-2"><Label>Data</Label><Input name="shiftDate" type="date" defaultValue={shift?.shiftDate ?? date} required /></div>
      <Button className="w-full" size={shift ? "sm" : "default"} disabled={!employees.length || !stations.length}>Salvar</Button>
    </form>
  );
}

function StationForm({ station }: { station?: Station }) {
  return (
    <form action={upsertStationAction} className="space-y-3">
      {station && <input type="hidden" name="id" value={station.id} />}
      <div className="space-y-2"><Label>Nome da praça</Label><Input name="name" defaultValue={station?.name} required /></div>
      <div className="space-y-2"><Label>Descrição</Label><Textarea name="description" defaultValue={station?.description ?? ""} /></div>
      <Button className="w-full" size="sm">{station ? "Salvar" : "Cadastrar praça"}</Button>
    </form>
  );
}
