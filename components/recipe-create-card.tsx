"use client";

import { createRecipeAction } from "@/app/actions";
import { RecipeIngredientPicker } from "@/components/recipe-ingredient-picker";
import { useRecipeProducts } from "@/components/use-recipe-products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function RecipeCreateCard() {
  const { products, loading, error, ensureProducts } = useRecipeProducts();
  const hasProducts = products.length > 0;

  return (
    <Card className="self-start">
      <CardHeader className="p-3 pb-2"><CardTitle className="text-base">Nova ficha</CardTitle></CardHeader>
      <CardContent className="p-3 pt-0">
        <form action={createRecipeAction} className="space-y-2.5">
          <Field label="Nome do drink" name="drinkName" />
          <Field label="Foto" name="photo" type="file" required={false} />
          {hasProducts ? (
            <RecipeIngredientPicker products={products} compact />
          ) : (
            <div className="space-y-2">
              <Label>Ingredientes</Label>
              <Button type="button" variant="secondary" className="w-full" onClick={() => void ensureProducts()} disabled={loading}>
                {loading ? "Carregando..." : "Carregar ingredientes"}
              </Button>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
          )}
          <div className="space-y-1.5"><Label>Modo de preparo</Label><Textarea name="preparation" required className="min-h-20" /></div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <Field label="Copo utilizado" name="glass" />
            <Field label="Guarnição" name="garnish" required={false} />
          </div>
          <div className="space-y-1.5"><Label>Observações</Label><Textarea name="notes" className="min-h-16" /></div>
          <Button size="sm" className="w-full" disabled={!hasProducts}>Salvar</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, name, type = "text", defaultValue, required = true }: { label: string; name: string; type?: string; defaultValue?: string; required?: boolean }) {
  return <div className="space-y-1.5"><Label>{label}</Label><Input name={name} type={type} defaultValue={defaultValue} required={required} /></div>;
}
