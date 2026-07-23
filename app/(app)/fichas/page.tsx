import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { RecipeCreateCard } from "@/components/recipe-create-card";
import { RecipeGrid, RecipeGridSkeleton } from "@/components/recipe-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSession } from "@/lib/session";

export default async function RecipesPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; ok?: string; erro?: string }> }) {
  const session = (await getSession())!;
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page) || 1);
  const canManageRecipes = ["gestor", "barman"].includes(session.role);

  return (
    <>
      <PageHeader title="Ficha técnica do bar" description="Receitas compactas, ingredientes do estoque e preparo." />
      {(params.ok || params.erro) && <p className={`mb-4 rounded-md border p-3 text-sm ${params.erro ? "border-destructive/40 text-destructive" : "border-emerald-500/40 text-emerald-700"}`}>{params.erro ?? params.ok}</p>}
      <form className="mb-4 flex gap-2 md:max-w-md">
        <Input name="q" placeholder="Buscar drink" defaultValue={params.q} />
        <Button variant="secondary">Buscar</Button>
      </form>
      <div className={canManageRecipes ? "grid gap-4 xl:grid-cols-[320px_1fr]" : ""}>
        {canManageRecipes ? <RecipeCreateCard /> : null}
        <Suspense fallback={<RecipeGridSkeleton />}>
          <RecipeGrid query={params.q} page={currentPage} canManageRecipes={canManageRecipes} />
        </Suspense>
      </div>
    </>
  );
}
