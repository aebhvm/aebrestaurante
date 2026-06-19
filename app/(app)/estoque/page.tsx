import { Boxes, CheckCircle2, History, PackageCheck } from "lucide-react";
import { createStockProductAction, deleteStockProductAction, updateStockProductAction } from "@/app/actions";
import { DateStatusFilters } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StockTable } from "@/components/stock-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { getStockProducts, getStockRequests } from "@/lib/data";
import { getSession } from "@/lib/session";
import { todayISO } from "@/lib/utils";

export default async function StockDashboard({ searchParams }: { searchParams: Promise<{ date?: string; ok?: string; erro?: string }> }) {
  const session = (await getSession())!;
  const params = await searchParams;
  const date = params.date ?? todayISO();
  const [requests, products] = await Promise.all([getStockRequests(session, { date }), getStockProducts()]);
  const orders = Array.from(new Set(requests.map((item) => item.orderNumber ?? `LEG-${item.id}`))).map((key) => requests.find((item) => (item.orderNumber ?? `LEG-${item.id}`) === key)!);
  return (
    <>
      <PageHeader title="Estoque" description="Cadastre produtos e consulte os pedidos pela data selecionada." />
      {(params.ok || params.erro) && <p className={`mb-4 rounded-md border p-3 text-sm ${params.erro ? "border-destructive/40 text-destructive" : "border-emerald-500/40 text-emerald-700"}`}>{params.erro ?? params.ok}</p>}
      <DateStatusFilters defaultDate={date} />
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Pendentes" value={orders.filter((item) => item.status === "solicitado").length} icon={Boxes} tone="amber" />
        <StatCard label="Separados" value={orders.filter((item) => item.status === "separado").length} icon={PackageCheck} />
        <StatCard label="Entregues" value={orders.filter((item) => item.status === "entregue").length} icon={CheckCircle2} tone="green" />
        <StatCard label="Pedidos na data" value={orders.length} icon={History} />
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
        <section className="grid content-start gap-3 sm:grid-cols-2">
          {products.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3"><div><p className="font-medium">{product.name}</p><p className="text-sm text-muted-foreground">{product.unit} · {product.active ? "Ativo" : "Inativo"}</p></div></div>
                <details className="mt-3 border-t pt-3">
                  <summary className="cursor-pointer text-sm font-medium text-primary">Editar produto</summary>
                  <form action={updateStockProductAction} className="mt-3 space-y-2">
                    <input type="hidden" name="id" value={product.id} /><input type="hidden" name="date" value={date} />
                    <div className="space-y-1"><Label>Produto</Label><Input name="name" defaultValue={product.name} required /></div>
                    <div className="space-y-1"><Label>Unidade</Label><Input name="unit" defaultValue={product.unit} required /></div>
                    <div className="space-y-1"><Label>Status</Label><NativeSelect name="active" defaultValue={String(product.active)}><option value="true">Ativo</option><option value="false">Inativo</option></NativeSelect></div>
                    <Button size="sm" className="w-full">Salvar alterações</Button>
                  </form>
                  <form action={deleteStockProductAction} className="mt-2"><input type="hidden" name="id" value={product.id} /><input type="hidden" name="date" value={date} /><Button size="sm" variant="destructive" className="w-full">Excluir produto</Button></form>
                </details>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </>
  );
}
