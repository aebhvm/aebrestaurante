import { DateStatusFilters } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getBreaks } from "@/lib/data";
import { getSession } from "@/lib/session";

export default async function BreaksPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const session = (await getSession())!;
  const rows = await getBreaks(session, await searchParams);
  return (
    <>
      <PageHeader title="Descansos" description="Janelas de pausa por garcom e barman." />
      <DateStatusFilters />
      <Card><CardContent className="p-0"><Table><THead><TR><TH>Colaborador</TH><TH>Data</TH><TH>Inicio</TH><TH>Fim</TH></TR></THead><TBody>
        {rows.map((row) => <TR key={row.id}><TD>{row.waiter?.name ?? row.bartender?.name ?? "-"}</TD><TD>{row.breakDate}</TD><TD>{row.startsAt}</TD><TD>{row.endsAt}</TD></TR>)}
      </TBody></Table></CardContent></Card>
    </>
  );
}
