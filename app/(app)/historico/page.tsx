import { DateStatusFilters } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getAuditLogs } from "@/lib/data";

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ date?: string; status?: string; type?: string; userId?: string }> }) {
  const params = await searchParams;
  const rows = await getAuditLogs({ ...params, userId: params.userId ? Number(params.userId) : undefined });
  return (
    <>
      <PageHeader title="Historico" description="Auditoria por data, usuario, tipo e status." />
      <DateStatusFilters />
      <Card><CardContent className="p-0"><Table><THead><TR><TH>Data</TH><TH>Entidade</TH><TH>Registro</TH><TH>Acao</TH><TH>Status</TH><TH>Usuario</TH></TR></THead><TBody>
        {rows.map((row) => <TR key={row.id}><TD>{new Date(row.occurredAt).toLocaleString("pt-BR")}</TD><TD>{row.entity}</TD><TD>{row.entityId}</TD><TD>{row.action}</TD><TD>{row.status ? <Badge>{row.status}</Badge> : "-"}</TD><TD>{row.actorId ?? "-"}</TD></TR>)}
      </TBody></Table></CardContent></Card>
    </>
  );
}
