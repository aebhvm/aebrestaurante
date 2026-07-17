import { createRecipeAction } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { RecipeEditDialog } from "@/components/recipe-edit-dialog";
import { RecipeIngredientPicker } from "@/components/recipe-ingredient-picker";
import { RecipePhoto } from "@/components/recipe-photo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getRecipes, getStockProducts } from "@/lib/data";
import { getSession } from "@/lib/session";

export default async function RecipesPage({ searchParams }: { searchParams: Promise<{ q?: string; ok?: string; erro?: string }> }) {
  const session = (await getSession())!;
  const params = await searchParams;
  const [recipes, products] = await Promise.all([getRecipes(params.q), getStockProducts(true)]);
  const canManageRecipes = ["gestor", "barman"].includes(session.role);

  return (
    <>
      <PageHeader title="Ficha técnica do bar" description="Receitas compactas, ingredientes do estoque e preparo." />
      {(params.ok || params.erro) && <p className={`mb-4 rounded-md border p-3 text-sm ${params.erro ? "border-destructive/40 text-destructive" : "border-emerald-500/40 text-emerald-700"}`}>{params.erro ?? params.ok}</p>}
      <form className="mb-4 flex gap-2 md:max-w-md">
        <Input name="q" placeholder="Buscar drink" defaultValue={params.q} />
        <Button variant="secondary">Buscar</Button>
      </form>
      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        {canManageRecipes && (
          <Card className="self-start">
            <CardHeader className="p-3 pb-2"><CardTitle className="text-base">Nova ficha</CardTitle></CardHeader>
            <CardContent className="p-3 pt-0">
              <form action={createRecipeAction} className="space-y-2.5">
                <Field label="Nome do drink" name="drinkName" />
                <Field label="Foto" name="photo" type="file" required={false} />
                <RecipeIngredientPicker products={products} compact />
                <div className="space-y-1.5"><Label>Modo de preparo</Label><Textarea name="preparation" required className="min-h-20" /></div>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  <Field label="Copo utilizado" name="glass" />
                  <Field label="Guarnição" name="garnish" required={false} />
                </div>
                <div className="space-y-1.5"><Label>Observações</Label><Textarea name="notes" className="min-h-16" /></div>
                <Button size="sm" className="w-full">Salvar</Button>
              </form>
            </CardContent>
          </Card>
        )}
        <section className="grid content-start gap-3 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
          {recipes.map((recipe) => (
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
                {canManageRecipes && <div className="mt-2 flex justify-end"><RecipeEditDialog recipeId={recipe.id} drinkName={recipe.drinkName} /></div>}
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </>
  );
}

function Field({ label, name, type = "text", defaultValue, required = true }: { label: string; name: string; type?: string; defaultValue?: string; required?: boolean }) {
  return <div className="space-y-1.5"><Label>{label}</Label><Input name={name} type={type} defaultValue={defaultValue} required={required} /></div>;
}