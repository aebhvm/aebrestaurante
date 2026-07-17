"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { RecipeEditDialog } from "@/components/recipe-edit-dialog";
import { RecipePhoto } from "@/components/recipe-photo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Product = { id: number; name: string };
type Ingredient = { productId?: number; item: string; amount: string };
type Recipe = {
  id: number;
  drinkName: string;
  photoUrl?: string | null;
  ingredients: Ingredient[];
  preparation: string;
  glass: string;
  garnish?: string | null;
  notes?: string | null;
};

export function RecipeCards({ recipes, products, canManageRecipes }: { recipes: Recipe[]; products: Product[]; canManageRecipes: boolean }) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  return (
    <>
      <section className="grid content-start gap-3 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
        {recipes.map((recipe) => {
          const notes = "notes" in recipe ? recipe.notes ?? "" : "";
          return (
            <Card key={recipe.id} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex gap-3">
                  {recipe.photoUrl ? (
                    <RecipePhoto src={recipe.photoUrl} alt={recipe.drinkName} className="h-24 w-24 shrink-0 rounded-md" sizes="96px" />
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">Sem foto</div>
                  )}
                  <div className="min-w-0 flex-1 space-y-2">
                    <div>
                      <h2 className="truncate text-base font-semibold">{recipe.drinkName}</h2>
                      <p className="truncate text-xs text-muted-foreground">{recipe.glass} | {recipe.garnish ?? "sem guarnição"}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Ingredientes</p>
                      <ul className="mt-1 space-y-0.5 text-muted-foreground">
                        {recipe.ingredients.slice(0, 4).map((ingredient) => <li key={`${ingredient.item}-${ingredient.amount}`} className="truncate">{ingredient.item}: {ingredient.amount}</li>)}
                        {recipe.ingredients.length > 4 ? <li className="text-xs">+ {recipe.ingredients.length - 4} itens</li> : null}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="mt-3 border-t pt-2 text-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Preparo</p>
                  <p className="mt-1 max-h-16 overflow-hidden text-muted-foreground">{recipe.preparation}</p>
                </div>
                {canManageRecipes ? (
                  <div className="mt-2 flex justify-end">
                    <Button type="button" size="sm" variant="ghost" className="h-8 px-2 text-primary" onClick={() => setSelectedRecipe({ ...recipe, notes })}>
                      <Pencil className="size-4" />
                      Editar
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </section>
      {selectedRecipe ? (
        <RecipeEditDialog recipe={selectedRecipe} products={products} open={Boolean(selectedRecipe)} onOpenChange={(open) => !open && setSelectedRecipe(null)} />
      ) : null}
    </>
  );
}
