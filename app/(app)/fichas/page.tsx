import { createRecipeAction } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { RecipeCards } from "@/components/recipe-cards";
import { RecipeIngredientPicker } from "@/components/recipe-ingredient-picker";
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
        <RecipeCards recipes={recipes} products={products} canManageRecipes={canManageRecipes} />
      </div>
    </>
  );
}

function Field({ label, name, type = "text", defaultValue, required = true }: { label: string; name: string; type?: string; defaultValue?: string; required?: boolean }) {
  return <div className="space-y-1.5"><Label>{label}</Label><Input name={name} type={type} defaultValue={defaultValue} required={required} /></div>;
}
