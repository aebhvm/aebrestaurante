import Image from "next/image";
import { createRecipeAction } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getRecipes, getStockProducts } from "@/lib/data";
import { getSession } from "@/lib/session";

export default async function RecipesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = (await getSession())!;
  const params = await searchParams;
  const [recipes, products] = await Promise.all([getRecipes(params.q), getStockProducts(true)]);

  return (
    <>
      <PageHeader title="Ficha técnica do bar" description="Receitas, fotos, ingredientes do estoque, preparo e busca por nome." />
      <form className="mb-4 flex gap-2 md:max-w-md">
        <Input name="q" placeholder="Buscar drink" defaultValue={params.q} />
        <Button variant="secondary">Buscar</Button>
      </form>
      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        {session.role === "gestor" && (
          <Card>
            <CardHeader><CardTitle>Nova ficha</CardTitle></CardHeader>
            <CardContent>
              <form action={createRecipeAction} className="space-y-3">
                <Field label="Nome do drink" name="drinkName" />
                <Field label="Foto" name="photo" type="file" />
                <div className="space-y-2">
                  <Label>Ingredientes do estoque</Label>
                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {products.map((product) => (
                      <div key={product.id} className="grid grid-cols-[1fr_120px] items-center gap-2 rounded-md border p-2">
                        <input type="hidden" name="ingredientProductId" value={product.id} />
                        <span className="text-sm font-medium">{product.name}</span>
                        <Input name="ingredientAmount" aria-label={`Quantidade de ${product.name}`} placeholder="Quantidade" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2"><Label>Modo de preparo</Label><Textarea name="preparation" required /></div>
                <Field label="Copo utilizado" name="glass" />
                <Field label="Guarnição" name="garnish" />
                <div className="space-y-2"><Label>Observações</Label><Textarea name="notes" /></div>
                <Button className="w-full">Salvar ficha</Button>
              </form>
            </CardContent>
          </Card>
        )}
        <section className="grid gap-4 md:grid-cols-2">
          {recipes.map((recipe) => (
            <Card key={recipe.id}>
              <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg bg-muted">
                {recipe.photoUrl ? <Image src={recipe.photoUrl} alt={recipe.drinkName} fill className="object-cover" /> : null}
              </div>
              <CardHeader><CardTitle>{recipe.drinkName}</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Ingredientes</p>
                  <ul className="mt-1 text-muted-foreground">
                    {recipe.ingredients.map((ingredient) => <li key={`${ingredient.item}-${ingredient.amount}`}>{ingredient.item}: {ingredient.amount}</li>)}
                  </ul>
                </div>
                <div><p className="font-medium">Passo a passo</p><p className="text-muted-foreground">{recipe.preparation}</p></div>
                <p className="text-muted-foreground">{recipe.glass} | {recipe.garnish ?? "sem guarnição"}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return <div className="space-y-2"><Label>{label}</Label><Input name={name} type={type} required={name !== "photo" && name !== "garnish"} /></div>;
}
