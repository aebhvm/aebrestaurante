import { createShiftAction, deleteStationAction, upsertStationAction } from "@/app/actions";
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
import { todayISO } from "@/lib/utils";

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
                    <form action={deleteStationAction}><input type="hidden" name="id" value={station.id} /><Button size="sm" variant="destructive">Excluir praça</Button></form>
                  </div>
                </details>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Adicionar à escala</CardTitle></CardHeader>
          <CardContent>
            <form action={createShiftAction} className="space-y-3">
              <div className="space-y-2"><Label>Funcionário</Label><NativeSelect name="employeeId" required>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.role === "garcom" ? "Garçom" : "Barman"}</option>)}</NativeSelect></div>
              <div className="space-y-2"><Label>Praça</Label><NativeSelect name="stationId" required>{stations.map((station) => <option key={station.id} value={station.id}>{station.name}</option>)}</NativeSelect></div>
              <div className="space-y-2"><Label>Data</Label><Input name="shiftDate" type="date" defaultValue={date} required /></div>
              <Button className="w-full" disabled={!employees.length || !stations.length}>Salvar escala</Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <Card key={row.id}>
            <CardContent className="p-4">
              <p className="font-medium">{row.waiter?.name ?? row.bartender?.name ?? "Funcionário"}</p>
              <p className="text-sm text-muted-foreground">{row.station?.name ?? "Sem praça"}</p>
              {row.station?.description && <p className="mt-1 text-xs text-muted-foreground">{row.station.description}</p>}
              <p className="mt-2 text-xs text-muted-foreground">{row.shiftDate}</p>
            </CardContent>
          </Card>
        ))}
        {!rows.length && <p className="text-sm text-muted-foreground">Nenhuma escala cadastrada para esta data.</p>}
      </section>
    </>
  );
}

function StationForm({ station }: { station?: { id: number; name: string; description?: string | null } }) {
  return (
    <form action={upsertStationAction} className="space-y-3">
      {station && <input type="hidden" name="id" value={station.id} />}
      <div className="space-y-2"><Label>Nome da praça</Label><Input name="name" defaultValue={station?.name} required /></div>
      <div className="space-y-2"><Label>Descrição</Label><Textarea name="description" defaultValue={station?.description ?? ""} /></div>
      <Button className="w-full" size="sm">{station ? "Salvar alterações" : "Cadastrar praça"}</Button>
    </form>
  );
}
