"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createStockRequestAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";

type Product = { id: number; name: string; unit: string };
type OrderItem = Product & { quantity: number };

export function StockOrderBuilder({ products }: { products: Product[] }) {
  const [productId, setProductId] = useState(products[0]?.id ?? 0);
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<OrderItem[]>([]);

  function addItem() {
    const product = products.find((item) => item.id === productId);
    if (!product || quantity < 1) return;
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      return existing
        ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)
        : [...current, { ...product, quantity }];
    });
    setQuantity(1);
  }

  return (
    <form action={createStockRequestAction} className="space-y-4">
      <div className="space-y-2">
        <Label>Produto</Label>
        <NativeSelect value={productId} onChange={(event) => setProductId(Number(event.target.value))} disabled={!products.length}>
          {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
        </NativeSelect>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <div className="space-y-2"><Label>Quantidade</Label><Input type="number" min={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} /></div>
        <Button type="button" variant="secondary" className="mt-7" onClick={addItem} disabled={!products.length}><Plus className="size-4" />Adicionar</Button>
      </div>

      <div className="space-y-2 border-t pt-3">
        <Label>Lista do pedido</Label>
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border p-2 text-sm">
            <div><p className="font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.quantity} {item.unit}</p></div>
            <Button type="button" size="icon" variant="ghost" aria-label={`Remover ${item.name}`} onClick={() => setItems((current) => current.filter((candidate) => candidate.id !== item.id))}><Trash2 className="size-4" /></Button>
            <input type="hidden" name="productId" value={item.id} />
            <input type="hidden" name="quantity" value={item.quantity} />
          </div>
        ))}
        {!items.length && <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">Adicione os produtos antes de enviar.</p>}
      </div>
      <Button className="w-full" disabled={!items.length}>Enviar lista ao estoque</Button>
    </form>
  );
}
