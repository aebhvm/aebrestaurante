import { DateStatusFilters } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getShifts } from "@/lib/data";
import { getSession } from "@/lib/session";

export default async function ShiftsPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const session = (await getSession())!;
  const rows = await getShifts(session, await searchParams);
  return (
    <>
      <PageHeader title="Escalas" description="Turnos, horarios, praca e funcao." />
      <DateStatusFilters />
      <Card><CardContent className="p-0"><Table><THead><TR><TH>Colaborador</TH><TH>Data</TH><TH>Entrada</TH><TH>Saida</TH><TH>Praca</TH><TH>Funcao</TH></TR></THead><TBody>
        {rows.map((row) => <TR key={row.id}><TD>{row.waiter?.name ?? row.bartender?.name ?? "-"}</TD><TD>{row.shiftDate}</TD><TD>{row.startsAt}</TD><TD>{row.endsAt}</TD><TD>{row.station?.name ?? "-"}</TD><TD>{row.functionName}</TD></TR>)}
      </TBody></Table></CardContent></Card>
    </>
  );
}
