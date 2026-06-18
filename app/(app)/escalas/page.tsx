import { DateStatusFilters } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getShifts } from "@/lib/data";
import { getSession } from "@/lib/session";
import { todayISO } from "@/lib/utils";

export default async function ShiftsPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const session = (await getSession())!;
  const params = await searchParams;
  const date = params.date ?? todayISO();
  const rows = await getShifts(session, { date });
  return (
    <>
      <PageHeader title="Escalas" description="Escala do dia por funcionario e praca." />
      <DateStatusFilters defaultDate={date} />
      <Card><CardContent className="p-0"><Table><THead><TR><TH>Colaborador</TH><TH>Data</TH><TH>Praca</TH></TR></THead><TBody>
        {rows.map((row) => <TR key={row.id}><TD>{row.waiter?.name ?? row.bartender?.name ?? "-"}</TD><TD>{row.shiftDate}</TD><TD>{row.station?.name ?? "-"}</TD></TR>)}
      </TBody></Table></CardContent></Card>
    </>
  );
}
