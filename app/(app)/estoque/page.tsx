import { Boxes, CheckCircle2, History, PackageCheck } from "lucide-react";
import { createStockProductAction } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StockTable } from "@/components/stock-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getStockProducts, getStockRequests } from "@/lib/data";
import { getSession } from "@/lib/session";
import { todayISO } from "@/lib/utils";

export default async function StockDashboard() {
  const session = (await getSession())!;
  const [requests, products] = await Promise.all([getStockRequests(session, { date: todayISO() }), getStockProducts()]);
  return (
    <>
      <PageHeader title="Estoque" description="Cadastre produtos e acompanhe pedidos do dia." />
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Pendentes" value={requests.filter((item) => item.status === "solicitado").length} icon={Boxes} tone="amber" />
        <StatCard label="Separados" value={requests.filter((item) => item.status === "separado").length} icon={PackageCheck} />
        <StatCard label="Entregues" value={requests.filter((item) => item.status === "entregue").length} icon={CheckCircle2} tone="green" />
        <StatCard label="Histórico do dia" value={requests.length} icon={History} />
      </section>
      <div className="mt-6">
        <StockTable requests={requests} canUpdate />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader><CardTitle>Novo produto</CardTitle></CardHeader>
          <CardContent>
            <form action={createStockProductAction} className="space-y-3">
              <div className="space-y-2"><Label>Produto</Label><Input name="name" required /></div>
              <div className="space-y-2"><Label>Unidade</Label><Input name="unit" placeholder="un, kg, caixa, garrafa" required /></div>
              <Button className="w-full">Cadastrar produto</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <Table>
              <THead><TR><TH>Produto</TH><TH>Unidade</TH><TH>Status</TH></TR></THead>
              <TBody>
                {products.map((product) => (
                  <TR key={product.id}>
                    <TD className="font-medium">{product.name}</TD>
                    <TD>{product.unit}</TD>
                    <TD>{product.active ? "Ativo" : "Inativo"}</TD>
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
