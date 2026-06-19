import { deleteStockOrderItemAction, updateStockOrderItemAction, updateStockStatusAction } from "@/app/actions";
import { Save, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";

type RequestRow = {
  id: number;
  orderNumber?: string | null;
  product: string;
  quantity: number;
  unit: string;
  reason?: string | null;
  requestDate: string;
  requestTime: string;
  status: string;
  requester?: { name: string } | null;
};

export function StockTable({ requests, canUpdate = false, canEdit = false, selectedDate = "" }: { requests: RequestRow[]; canUpdate?: boolean; canEdit?: boolean; selectedDate?: string }) {
  const groups = Array.from(requests.reduce((map, item) => {
    const key = item.orderNumber ?? `LEG-${item.id}`;
    const group = map.get(key) ?? { key, items: [] as RequestRow[] };
    group.items.push(item);
    map.set(key, group);
    return map;
  }, new Map<string, { key: string; items: RequestRow[] }>()).values());

  return (
    <div className="space-y-3">
      {groups.map(({ key, items }) => {
        const order = items[0];
        return (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-3">
                <div>
                  <p className="font-medium">Pedido de {order.requester?.name ?? "solicitante"}</p>
                  <p className="text-sm text-muted-foreground">{order.requestDate} às {order.requestTime}</p>
                </div>
                <Badge variant={order.status === "entregue" ? "secondary" : "default"}>{order.status}</Badge>
              </div>
              <ul className="divide-y py-2 text-sm">
                {items.map((item) => (
                  <li key={item.id} className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between">
                    <span>{item.product}</span>
                    {canEdit && order.status === "solicitado" ? (
                      <div className="flex items-center gap-2">
                        <form action={updateStockOrderItemAction} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={item.id} /><input type="hidden" name="date" value={selectedDate || item.requestDate} />
                          <Input name="quantity" type="number" min="1" defaultValue={item.quantity} className="w-20" aria-label={`Quantidade de ${item.product}`} />
                          <Button type="submit" size="icon" variant="secondary" aria-label={`Salvar ${item.product}`}><Save className="size-4" /></Button>
                        </form>
                        <form action={deleteStockOrderItemAction}>
                          <input type="hidden" name="id" value={item.id} /><input type="hidden" name="date" value={selectedDate || item.requestDate} />
                          <Button type="submit" size="icon" variant="ghost" aria-label={`Excluir ${item.product}`}><Trash2 className="size-4" /></Button>
                        </form>
                      </div>
                    ) : <strong>{item.quantity} {item.unit}</strong>}
                  </li>
                ))}
              </ul>
              {canUpdate && (
                <form action={updateStockStatusAction} className="flex flex-col gap-2 border-t pt-3 sm:flex-row sm:justify-end">
                  <input type="hidden" name="ids" value={items.map((item) => item.id).join(",")} />
                  <NativeSelect name="status" defaultValue={order.status} className="sm:w-36">
                    <option value="solicitado">Solicitado</option>
                    <option value="separado">Separado</option>
                    <option value="entregue">Entregue</option>
                  </NativeSelect>
                  <Button size="sm" variant="secondary">Salvar status</Button>
                </form>
              )}
            </CardContent>
          </Card>
        );
      })}
      {!groups.length && <p className="rounded-md border p-4 text-sm text-muted-foreground">Nenhum pedido encontrado.</p>}
    </div>
  );
}
