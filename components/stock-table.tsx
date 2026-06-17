import { updateStockStatusAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

type RequestRow = {
  id: number;
  product: string;
  quantity: number;
  unit: string;
  reason: string;
  requestDate: string;
  requestTime: string;
  status: string;
  requester?: { name: string } | null;
};

export function StockTable({ requests, canUpdate = false }: { requests: RequestRow[]; canUpdate?: boolean }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <THead>
            <TR>
              <TH>Produto</TH>
              <TH>Solicitante</TH>
              <TH>Quantidade</TH>
              <TH>Data</TH>
              <TH>Status</TH>
              {canUpdate && <TH>Fluxo</TH>}
            </TR>
          </THead>
          <TBody>
            {requests.map((item) => (
              <TR key={item.id}>
                <TD>
                  <p className="font-medium">{item.product}</p>
                  <p className="text-xs text-muted-foreground">{item.reason}</p>
                </TD>
                <TD>{item.requester?.name ?? "-"}</TD>
                <TD>{item.quantity} {item.unit}</TD>
                <TD>{item.requestDate} {item.requestTime}</TD>
                <TD><Badge variant={item.status === "entregue" ? "secondary" : "default"}>{item.status}</Badge></TD>
                {canUpdate && (
                  <TD>
                    <form action={updateStockStatusAction} className="flex gap-2">
                      <input type="hidden" name="id" value={item.id} />
                      <NativeSelect name="status" defaultValue={item.status} className="w-32">
                        <option value="solicitado">Solicitado</option>
                        <option value="separado">Separado</option>
                        <option value="entregue">Entregue</option>
                      </NativeSelect>
                      <Button size="sm" variant="secondary">Salvar</Button>
                    </form>
                  </TD>
                )}
              </TR>
            ))}
          </TBody>
        </Table>
      </CardContent>
    </Card>
  );
}
