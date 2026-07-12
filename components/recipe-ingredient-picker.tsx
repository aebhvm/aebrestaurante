"use client";

import { useState } from "react";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Product = { id: number; name: string };
type SavedIngredient = { productId?: number; item: string; amount: string };
type Ingredient = Product & { amount: string };

function normalizeIngredients(products: Product[], initialIngredients: SavedIngredient[] = []) {
  return initialIngredients.flatMap((ingredient) => {
    const product = products.find((item) => item.id === ingredient.productId) ?? products.find((item) => item.name === ingredient.item);
    return product ? [{ ...product, amount: ingredient.amount }] : [];
  });
}

export function RecipeIngredientPicker({ products, initialIngredients = [], compact = false }: { products: Product[]; initialIngredients?: SavedIngredient[]; compact?: boolean }) {
  const [productId, setProductId] = useState(0);
  const [productSearch, setProductSearch] = useState("");
  const [amount, setAmount] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => normalizeIngredients(products, initialIngredients));
  const [editingId, setEditingId] = useState<number | null>(null);

  const normalizedSearch = productSearch.trim().toLowerCase();
  const filteredProducts = normalizedSearch
    ? products.filter((product) => product.name.toLowerCase().includes(normalizedSearch)).slice(0, 8)
    : products.slice(0, 8);

  function selectProduct(product: Product) {
    setProductId(product.id);
    setProductSearch(product.name);
  }

  function clearEditor() {
    setProductId(0);
    setProductSearch("");
    setAmount("");
    setEditingId(null);
  }

  function saveIngredient() {
    const product = products.find((item) => item.id === productId);
    if (!product || !amount.trim()) return;

    setIngredients((current) => {
      const next = { ...product, amount: amount.trim() };
      const withoutEditing = editingId ? current.filter((item) => item.id !== editingId) : current;

      return withoutEditing.some((item) => item.id === product.id)
        ? withoutEditing.map((item) => item.id === product.id ? next : item)
        : [...withoutEditing, next];
    });
    clearEditor();
  }

  function editIngredient(ingredient: Ingredient) {
    setProductId(ingredient.id);
    setProductSearch(ingredient.name);
    setAmount(ingredient.amount);
    setEditingId(ingredient.id);
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <Label>Ingredientes</Label>
      <div className="space-y-2">
        <div className="relative">
          <Input
            value={productSearch}
            onChange={(event) => {
              setProductSearch(event.target.value);
              setProductId(0);
            }}
            placeholder="Digite o nome do ingrediente"
            disabled={!products.length}
            autoComplete="off"
          />
          {productSearch.trim() && !productId ? (
            <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-background shadow-lg">
              {filteredProducts.length ? (
                filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => selectProduct(product)}
                  >
                    {product.name}
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-sm text-muted-foreground">Nenhum ingrediente encontrado.</p>
              )}
            </div>
          ) : null}
        </div>
        <div className={compact ? "contents" : "grid grid-cols-[1fr_auto] gap-2"}>
          <Input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Qtd., ex.: 30 ml" />
          <Button type="button" variant="secondary" onClick={saveIngredient} disabled={!products.length || !productId || !amount.trim()}>
            {editingId ? <Save className="size-4" /> : <Plus className="size-4" />}
            {editingId ? "Salvar ingrediente" : "Adicionar"}
          </Button>
        </div>
      </div>
      {ingredients.map((ingredient) => (
        <div key={ingredient.id} className="flex items-center justify-between gap-3 rounded-md border px-2 py-1.5 text-sm">
          <span><strong>{ingredient.name}</strong> - {ingredient.amount}</span>
          <div className="flex shrink-0 items-center gap-1">
            <Button type="button" size="sm" variant="ghost" className="h-8 px-2" onClick={() => editIngredient(ingredient)}><Pencil className="size-4" />Editar</Button>
            <Button type="button" size="icon" variant="ghost" aria-label={`Remover ${ingredient.name}`} onClick={() => setIngredients((current) => current.filter((item) => item.id !== ingredient.id))}><Trash2 className="size-4" /></Button>
          </div>
          <input type="hidden" name="ingredientProductId" value={ingredient.id} />
          <input type="hidden" name="ingredientAmount" value={ingredient.amount} />
        </div>
      ))}
      {!ingredients.length && <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">Nenhum ingrediente adicionado.</p>}
    </div>
  );
}
