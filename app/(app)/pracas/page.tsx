import { DateStatusFilters } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getStations } from "@/lib/data";
import { getSession } from "@/lib/session";

export default async function StationsPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const session = (await getSession())!;
  const rows = await getStations(session, await searchParams);
  return (
    <>
      <PageHeader title="Pracas" description="Distribuicao de areas por responsavel e data." />
      <DateStatusFilters />
      <Card><CardContent className="p-0"><Table><THead><TR><TH>Praca</TH><TH>Responsavel</TH><TH>Data</TH><TH>Observacoes</TH></TR></THead><TBody>
        {rows.map((row) => <TR key={row.id}><TD className="font-medium">{row.name}</TD><TD>{row.responsible?.name ?? "-"}</TD><TD>{row.stationDate}</TD><TD>{row.notes ?? "-"}</TD></TR>)}
      </TBody></Table></CardContent></Card>
    </>
  );
}
