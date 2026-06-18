import { createStockRequestAction } from "@/app/actions";
import { DateStatusFilters } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { StockTable } from "@/components/stock-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { getStockProducts, getStockRequests } from "@/lib/data";
import { getSession } from "@/lib/session";
import { todayISO } from "@/lib/utils";

export default async function StockRequestsPage({ searchParams }: { searchParams: Promise<{ date?: string; status?: string }> }) {
  const session = (await getSession())!;
  const params = await searchParams;
  const filters = { ...params, date: params.date ?? todayISO() };
  const [requests, products] = await Promise.all([getStockRequests(session, filters), getStockProducts(true)]);
  const canRequest = session.role === "gestor" || session.role === "barman";
  const canUpdate = session.role === "gestor" || session.role === "estoquista";

  return (
    <>
      <PageHeader title="Pedidos de estoque" description="Pedidos sempre iniciam na data de hoje e usam apenas produtos cadastrados." />
      <DateStatusFilters statusOptions={[{ value: "solicitado", label: "Solicitado" }, { value: "separado", label: "Separado" }, { value: "entregue", label: "Entregue" }]} />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        {canRequest && (
          <Card>
            <CardHeader><CardTitle>Novo pedido</CardTitle></CardHeader>
            <CardContent>
              <form action={createStockRequestAction} className="space-y-3">
                <div className="space-y-2">
                  <Label>Produto</Label>
                  <NativeSelect name="productId" disabled={!products.length}>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.name} ({product.unit})</option>
                    ))}
                  </NativeSelect>
                </div>
                <div className="space-y-2"><Label>Quantidade</Label><Input name="quantity" type="number" min="1" required /></div>
                <Button className="w-full" disabled={!products.length}>Solicitar</Button>
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
