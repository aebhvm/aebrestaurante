import Image from "next/image";
import { createRecipeAction } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getRecipes } from "@/lib/data";
import { getSession } from "@/lib/session";

export default async function RecipesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = (await getSession())!;
  const params = await searchParams;
  const recipes = await getRecipes(params.q);

  return (
    <>
      <PageHeader title="Ficha tecnica do bar" description="Receitas, fotos, ingredientes, preparo e busca por nome." />
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
                <Field label="Categoria" name="category" />
                <Field label="Foto" name="photo" type="file" />
                <div className="space-y-2"><Label>Ingredientes</Label><Textarea name="ingredients" placeholder="Gin - 30 ml" /></div>
                <div className="space-y-2"><Label>Modo de preparo</Label><Textarea name="preparation" required /></div>
                <Field label="Copo utilizado" name="glass" />
                <Field label="Guarnicao" name="garnish" />
                <Field label="Tempo de preparo" name="prepTimeMinutes" type="number" />
                <div className="space-y-2"><Label>Observacoes</Label><Textarea name="notes" /></div>
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
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{recipe.drinkName}</CardTitle>
                  <Badge>{recipe.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Ingredientes</p>
                  <ul className="mt-1 text-muted-foreground">
                    {recipe.ingredients.map((ingredient) => <li key={`${ingredient.item}-${ingredient.amount}`}>{ingredient.item}: {ingredient.amount}</li>)}
                  </ul>
                </div>
                <div><p className="font-medium">Passo a passo</p><p className="text-muted-foreground">{recipe.preparation}</p></div>
                <p className="text-muted-foreground">{recipe.glass} | {recipe.garnish ?? "sem guarnicao"} | {recipe.prepTimeMinutes} min</p>
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
