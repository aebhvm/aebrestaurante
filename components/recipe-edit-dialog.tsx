"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Pencil, Save, Trash2, X } from "lucide-react";
import { deleteRecipeAction, getRecipeEditorDataAction, updateRecipeAction } from "@/app/actions";
import { RecipeIngredientPicker } from "@/components/recipe-ingredient-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type EditorData = Awaited<ReturnType<typeof getRecipeEditorDataAction>>;

export function RecipeEditDialog({ recipeId, drinkName }: { recipeId: number; drinkName: string }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<EditorData | null>(null);
  const [error, setError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function openDialog() {
    setOpen(true);
    setConfirmingDelete(false);
    if (data) return;
    setError("");
    startTransition(async () => {
      try {
        setData(await getRecipeEditorDataAction(recipeId));
      } catch {
        setError("Não foi possível carregar esta ficha. Feche e tente novamente.");
      }
    });
  }

  return (
    <>
      <Button type="button" size="sm" variant="ghost" className="h-8 px-2 text-primary" onClick={openDialog}>
        <Pencil className="size-4" />
        Editar
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label={`Editar ${drinkName}`}>
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg border bg-card p-4 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3 border-b pb-3">
              <div>
                <h2 className="text-lg font-semibold">Editar ficha</h2>
                <p className="text-sm text-muted-foreground">{drinkName}</p>
              </div>
              <Button type="button" size="icon" variant="ghost" aria-label="Fechar" onClick={() => setOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            {isPending && <p className="py-10 text-center text-sm text-muted-foreground">Carregando ficha...</p>}
            {error && <p className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">{error}</p>}
            {data && <RecipeEditor recipe={data.recipe} products={data.products} onClose={() => setOpen(false)} confirmingDelete={confirmingDelete} setConfirmingDelete={setConfirmingDelete} />}
          </div>
        </div>
      )}
    </>
  );
}

function RecipeEditor({ recipe, products, onClose, confirmingDelete, setConfirmingDelete }: EditorData & { onClose: () => void; confirmingDelete: boolean; setConfirmingDelete: (value: boolean) => void }) {
  return (
    <>
      {recipe.photoUrl ? (
        <a href={recipe.photoUrl} target="_blank" rel="noreferrer" className="relative mb-4 block h-32 overflow-hidden rounded-md bg-muted" aria-label={`Abrir foto de ${recipe.drinkName} em tamanho ampliado`}>
          <Image src={recipe.photoUrl} alt={recipe.drinkName} fill sizes="320px" className="object-contain p-1" />
        </a>
      ) : null}
      <form action={updateRecipeAction} onSubmit={onClose} className="grid gap-3 md:grid-cols-2">
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
          <Button type="submit" size="sm"><Save className="size-4" />Salvar</Button>
        </div>
      </form>
      <form action={deleteRecipeAction} onSubmit={onClose} className="mt-3 border-t pt-3">
        <input type="hidden" name="id" value={recipe.id} />
        {confirmingDelete ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-destructive">Confirmar exclusão desta ficha?</p>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmingDelete(false)}>Cancelar</Button>
              <Button type="submit" size="sm" variant="destructive"><Trash2 className="size-4" />Confirmar exclusão</Button>
            </div>
          </div>
        ) : (
          <Button type="button" size="sm" variant="destructive" onClick={() => setConfirmingDelete(true)}><Trash2 className="size-4" />Excluir</Button>
        )}
      </form>
    </>
  );
}

function Field({ label, name, type = "text", defaultValue, required = true }: { label: string; name: string; type?: string; defaultValue?: string; required?: boolean }) {
  return <div className="space-y-2"><Label>{label}</Label><Input name={name} type={type} defaultValue={defaultValue} required={required} /></div>;
}