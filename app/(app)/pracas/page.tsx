import { deleteStationAction, upsertStationAction } from "@/app/actions";
import { DateStatusFilters } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { getStations, getUsers } from "@/lib/data";
import { getSession } from "@/lib/session";
import { todayISO } from "@/lib/utils";

export default async function StationsPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const session = (await getSession())!;
  const params = await searchParams;
  const date = params.date ?? todayISO();
  const [rows, users] = await Promise.all([getStations(session, { date }), getUsers()]);

  return (
    <>
      <PageHeader title="Praças" description="Crie, edite e exclua praças com descrição. A data inicia sempre no dia atual." />
      <DateStatusFilters defaultDate={date} />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        {session.role === "gestor" && (
          <Card>
            <CardHeader><CardTitle>Nova praca</CardTitle></CardHeader>
            <CardContent>
              <StationForm users={users} date={date} />
            </CardContent>
          </Card>
        )}
        <Card className={session.role === "gestor" ? "" : "lg:col-span-2"}>
          <CardContent className="p-0">
            <Table>
              <THead><TR><TH>Praca</TH><TH>Descricao</TH><TH>Responsavel</TH><TH>Data</TH>{session.role === "gestor" && <TH>Acoes</TH>}</TR></THead>
              <TBody>
                {rows.map((row) => (
                  <TR key={row.id}>
                    <TD className="font-medium">{row.name}</TD>
                    <TD>{row.description ?? row.notes ?? "-"}</TD>
                    <TD>{row.responsible?.name ?? "-"}</TD>
                    <TD>{row.stationDate}</TD>
                    {session.role === "gestor" && (
                      <TD>
                        <div className="space-y-2">
                          <details>
                            <summary className="cursor-pointer text-sm text-primary">Editar</summary>
                            <div className="mt-2 rounded-md border p-3">
                              <StationForm users={users} date={row.stationDate} station={row} />
                            </div>
                          </details>
                          <form action={deleteStationAction}>
                            <input type="hidden" name="id" value={row.id} />
                            <Button size="sm" variant="destructive">Excluir</Button>
                          </form>
                        </div>
                      </TD>
                    )}
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function StationForm({ users, date, station }: { users: Array<{ id: number; name: string }>; date: string; station?: { id: number; name: string; description?: string | null; responsibleId: number; stationDate: string } }) {
  return (
    <form action={upsertStationAction} className="space-y-3">
      {station && <input type="hidden" name="id" value={station.id} />}
      <div className="space-y-2"><Label>Nome da praca</Label><Input name="name" defaultValue={station?.name} required /></div>
      <div className="space-y-2"><Label>Descricao da praca</Label><Textarea name="description" defaultValue={station?.description ?? ""} /></div>
      <div className="space-y-2">
        <Label>Responsavel</Label>
        <NativeSelect name="responsibleId" defaultValue={station?.responsibleId}>
          {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
        </NativeSelect>
      </div>
      <div className="space-y-2"><Label>Data</Label><Input name="stationDate" type="date" defaultValue={station?.stationDate ?? date} required /></div>
      <Button className="w-full" size="sm">{station ? "Salvar" : "Criar praca"}</Button>
    </form>
  );
}
