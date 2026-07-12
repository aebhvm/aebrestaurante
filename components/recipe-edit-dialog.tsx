"use client";

import { useState } from "react";
import { Pencil, Save, Trash2, X } from "lucide-react";
import { deleteRecipeAction, updateRecipeAction } from "@/app/actions";
import { RecipeIngredientPicker } from "@/components/recipe-ingredient-picker";
import { RecipePhoto } from "@/components/recipe-photo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Product = { id: number; name: string };
type Ingredient = { productId?: number; item: string; amount: string };
type EditableRecipe = {
  id: number;
  drinkName: string;
  photoUrl?: string | null;
  ingredients: Ingredient[];
  preparation: string;
  glass: string;
  garnish?: string | null;
  notes?: string | null;
};

export function RecipeEditDialog({ recipe, products }: { recipe: EditableRecipe; products: Product[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" size="sm" variant="ghost" className="h-8 px-2 text-primary" onClick={() => setOpen(true)}>
        <Pencil className="size-4" />
        Editar
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label={`Editar ${recipe.drinkName}`}>
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg border bg-card p-4 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3 border-b pb-3">
              <div>
                <h2 className="text-lg font-semibold">Editar ficha</h2>
                <p className="text-sm text-muted-foreground">{recipe.drinkName}</p>
              </div>
              <Button type="button" size="icon" variant="ghost" aria-label="Fechar" onClick={() => setOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            {recipe.photoUrl ? <RecipePhoto src={recipe.photoUrl} alt={recipe.drinkName} className="mb-4 h-32 rounded-md" sizes="320px" /> : null}
            <form action={updateRecipeAction} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="id" value={recipe.id} />
              <input type="hidden" name="currentPhotoUrl" value={recipe.photoUrl ?? ""} />
              <Field label="Nome do drink" name="drinkName" defaultValue={recipe.drinkName} />
              <Field label="Trocar foto" name="photo" type="file" required={false} />
              <div className="md:col-span-2">
                <RecipeIngredientPicker products={products} initialIngredients={recipe.ingredients} compact />
              </div>
              <div className="space-y-2 md:col-span-2"><Label>Modo de preparo</Label><Textarea name="preparation" defaultValue={recipe.preparation} required className="min-h-28" /></div>
              <Field label="Copo utilizado" name="glass" defaultValue={recipe.glass} />
              <Field label="Guarnição" name="garnish" defaultValue={recipe.garnish ?? ""} required={false} />
              <div className="space-y-2 md:col-span-2"><Label>Observações</Label><Textarea name="notes" defaultValue={recipe.notes ?? ""} className="min-h-20" /></div>
              <div className="flex justify-end md:col-span-2">
                <Button size="sm"><Save className="size-4" />Salvar</Button>
              </div>
            </form>
            <form action={deleteRecipeAction} className="mt-3 border-t pt-3">
              <input type="hidden" name="id" value={recipe.id} />
              <Button size="sm" variant="destructive"><Trash2 className="size-4" />Excluir</Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, name, type = "text", defaultValue, required = true }: { label: string; name: string; type?: string; defaultValue?: string; required?: boolean }) {
  return <div className="space-y-2"><Label>{label}</Label><Input name={name} type={type} defaultValue={defaultValue} required={required} /></div>;
}