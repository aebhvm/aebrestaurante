import { createStockRequestAction } from "@/app/actions";
import { DateStatusFilters } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { StockTable } from "@/components/stock-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStockProducts, getStockRequests } from "@/lib/data";
import { getSession } from "@/lib/session";
import { todayISO } from "@/lib/utils";

export default async function StockRequestsPage({ searchParams }: { searchParams: Promise<{ date?: string; status?: string; ok?: string; erro?: string }> }) {
  const session = (await getSession())!;
  const params = await searchParams;
  const filters = { ...params, date: params.date ?? todayISO() };
  const [requests, products] = await Promise.all([getStockRequests(session, filters), getStockProducts(true)]);
  const canRequest = session.role === "gestor" || session.role === "barman";
  const canUpdate = session.role === "gestor" || session.role === "estoquista";

  return (
    <>
      <PageHeader title="Pedidos de estoque" description="Pedidos sempre iniciam na data de hoje e usam apenas produtos cadastrados." />
      {(params.ok || params.erro) && <p className={`mb-4 rounded-md border p-3 text-sm ${params.erro ? "border-destructive/40 text-destructive" : "border-emerald-500/40 text-emerald-700"}`}>{params.erro ?? params.ok}</p>}
      <DateStatusFilters statusOptions={[{ value: "solicitado", label: "Solicitado" }, { value: "separado", label: "Separado" }, { value: "entregue", label: "Entregue" }]} />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        {canRequest && (
          <Card>
            <CardHeader><CardTitle>Novo pedido</CardTitle></CardHeader>
            <CardContent>
              <form action={createStockRequestAction} className="space-y-3">
                <Label>Itens do pedido</Label>
                <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                  {products.map((product) => (
                    <div key={product.id} className="grid grid-cols-[1fr_88px] items-center gap-2 rounded-md border p-2">
                      <input type="hidden" name="productId" value={product.id} />
                      <div><p className="text-sm font-medium">{product.name}</p><p className="text-xs text-muted-foreground">{product.unit}</p></div>
                      <Input aria-label={`Quantidade de ${product.name}`} name="quantity" type="number" min="0" placeholder="0" />
                    </div>
                  ))}
                </div>
                <Button className="w-full" disabled={!products.length}>Enviar pedido</Button>
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
