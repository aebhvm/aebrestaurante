import Link from "next/link";
import { RecipeEditTrigger } from "@/components/recipe-edit-trigger";
import { RecipePhoto } from "@/components/recipe-photo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getRecipes } from "@/lib/data";

type Props = {
  query?: string;
  page: number;
  canManageRecipes: boolean;
};

export async function RecipeGrid({ query, page, canManageRecipes }: Props) {
  const { recipes, hasNext } = await getRecipes(query, page);

  return (
    <section className="grid content-start gap-3 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
      {recipes.map((recipe) => (
        <Card key={recipe.id} className="overflow-hidden">
          <CardContent className="p-3">
            <div className="flex gap-3">
              {recipe.photoPath ? (
                <RecipePhoto src={recipe.photoPath} alt={recipe.drinkName} className="h-24 w-24 shrink-0 rounded-md" sizes="96px" />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">Sem foto</div>
              )}
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <h2 className="truncate text-base font-semibold">{recipe.drinkName}</h2>
                  <p className="truncate text-xs text-muted-foreground">{recipe.glass} | {recipe.garnish ?? "sem guarni\u00e7\u00e3o"}</p>
                </div>
                <div className="text-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Ingredientes</p>
                  <ul className="mt-1 space-y-0.5 text-muted-foreground">
                    {recipe.ingredients.map((ingredient) => <li key={ingredient.item + "-" + ingredient.amount} className="truncate">{ingredient.item}: {ingredient.amount}</li>)}
                    {recipe.ingredientCount > recipe.ingredients.length ? <li className="text-xs">+ {recipe.ingredientCount - recipe.ingredients.length} itens</li> : null}
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-3 border-t pt-2 text-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Preparo</p>
              <p className="mt-1 max-h-16 overflow-hidden text-muted-foreground">{recipe.preparation}</p>
            </div>
            {canManageRecipes ? <div className="mt-2 flex justify-end"><RecipeEditTrigger recipeId={recipe.id} drinkName={recipe.drinkName} /></div> : null}
          </CardContent>
        </Card>
      ))}
      {!recipes.length ? <p className="text-sm text-muted-foreground">Nenhuma ficha encontrada.</p> : null}
      {page > 1 || hasNext ? (
        <div className="col-span-full flex items-center justify-between gap-2 pt-1">
          {page > 1 ? <Button asChild size="sm" variant="secondary"><Link href={pageHref(query, page - 1)}>Anterior</Link></Button> : <span />}
          {hasNext ? <Button asChild size="sm" variant="secondary"><Link href={pageHref(query, page + 1)}>Pr\u00f3xima</Link></Button> : null}
        </div>
      ) : null}
    </section>
  );
}

export function RecipeGridSkeleton() {
  return (
    <section className="grid content-start gap-3 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]" aria-label="Carregando fichas">
      {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-44 animate-pulse rounded-md border bg-muted/50" />)}
    </section>
  );
}

function pageHref(query: string | undefined, page: number) {
  const params = new URLSearchParams({ page: String(page) });
  if (query) params.set("q", query);
  return "/fichas?" + params.toString();
}
