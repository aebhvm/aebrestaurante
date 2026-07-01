"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";

type Product = { id: number; name: string };
type SavedIngredient = { productId?: number; item: string; amount: string };
type Ingredient = Product & { amount: string };

function normalizeIngredients(products: Product[], initialIngredients: SavedIngredient[] = []) {
  return initialIngredients.flatMap((ingredient) => {
    const product = products.find((item) => item.id === ingredient.productId) ?? products.find((item) => item.name === ingredient.item);
    return product ? [{ ...product, amount: ingredient.amount }] : [];
  });
}

export function RecipeIngredientPicker({ products, initialIngredients = [] }: { products: Product[]; initialIngredients?: SavedIngredient[] }) {
  const [productId, setProductId] = useState(products[0]?.id ?? 0);
  const [amount, setAmount] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => normalizeIngredients(products, initialIngredients));

  function addIngredient() {
    const product = products.find((item) => item.id === productId);
    if (!product || !amount.trim()) return;
    setIngredients((current) => {
      const next = { ...product, amount: amount.trim() };
      return current.some((item) => item.id === product.id)
        ? current.map((item) => item.id === product.id ? next : item)
        : [...current, next];
    });
    setAmount("");
  }

  return (
    <div className="space-y-3">
      <Label>Ingredientes</Label>
      <div className="space-y-2">
        <NativeSelect value={productId} onChange={(event) => setProductId(Number(event.target.value))} disabled={!products.length}>
          {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
        </NativeSelect>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Quantidade, ex.: 30 ml" />
          <Button type="button" variant="secondary" onClick={addIngredient} disabled={!products.length}><Plus className="size-4" />Adicionar</Button>
        </div>
      </div>
      {ingredients.map((ingredient) => (
        <div key={ingredient.id} className="flex items-center justify-between gap-3 rounded-md border p-2 text-sm">
          <span><strong>{ingredient.name}</strong> · {ingredient.amount}</span>
          <Button type="button" size="icon" variant="ghost" aria-label={`Remover ${ingredient.name}`} onClick={() => setIngredients((current) => current.filter((item) => item.id !== ingredient.id))}><Trash2 className="size-4" /></Button>
          <input type="hidden" name="ingredientProductId" value={ingredient.id} />
          <input type="hidden" name="ingredientAmount" value={ingredient.amount} />
        </div>
      ))}
      {!ingredients.length && <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">Nenhum ingrediente adicionado.</p>}
    </div>
  );
}