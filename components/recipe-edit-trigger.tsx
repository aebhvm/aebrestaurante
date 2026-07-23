"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

type DialogComponent = typeof import("@/components/recipe-edit-dialog").RecipeEditDialog;

export function RecipeEditTrigger({ recipeId, drinkName }: { recipeId: number; drinkName: string }) {
  const [Dialog, setDialog] = useState<DialogComponent | null>(null);
  const [loading, setLoading] = useState(false);

  async function openEditor() {
    setLoading(true);
    try {
      const module = await import("@/components/recipe-edit-dialog");
      setDialog(() => module.RecipeEditDialog);
    } catch {
      setLoading(false);
    }
  }

  if (Dialog) return <Dialog recipeId={recipeId} drinkName={drinkName} defaultOpen />;

  return (
    <Button type="button" size="sm" variant="ghost" className="h-8 px-2 text-primary" onClick={() => void openEditor()} disabled={loading}>
      <Pencil className="size-4" />
      {loading ? "Abrindo..." : "Editar"}
    </Button>
  );
}
