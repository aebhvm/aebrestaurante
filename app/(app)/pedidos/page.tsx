import { createStockRequestAction } from "@/app/actions";
import { DateStatusFilters } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { StockTable } from "@/components/stock-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getStockRequests } from "@/lib/data";
import { getSession } from "@/lib/session";

export default async function StockRequestsPage({ searchParams }: { searchParams: Promise<{ date?: string; status?: string }> }) {
  const session = (await getSession())!;
  const requests = await getStockRequests(session, await searchParams);
  const canRequest = session.role === "gestor" || session.role === "barman";
  const canUpdate = session.role === "gestor" || session.role === "estoquista";

  return (
    <>
      <PageHeader title="Pedidos de estoque" description="Fluxo Barman ou Gestor para Estoquista e confirmacao de entrega." />
      <DateStatusFilters statusOptions={[{ value: "solicitado", label: "Solicitado" }, { value: "separado", label: "Separado" }, { value: "entregue", label: "Entregue" }]} />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        {canRequest && (
          <Card>
            <CardHeader><CardTitle>Novo pedido</CardTitle></CardHeader>
            <CardContent>
              <form action={createStockRequestAction} className="space-y-3">
                <Field label="Produto" name="product" />
                <Field label="Quantidade" name="quantity" type="number" />
                <Field label="Unidade" name="unit" />
                <div className="space-y-2"><Label>Motivo</Label><Textarea name="reason" required /></div>
                <Button className="w-full">Solicitar</Button>
              </form>
            </CardContent>
          </Card>
        )}
        <div className={canRequest ? "" : "lg:col-span-2"}>
          <StockTable requests={requests} canUpdate={canUpdate} />
        </div>
      </div>
    </>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return <div className="space-y-2"><Label>{label}</Label><Input name={name} type={type} required /></div>;
}
