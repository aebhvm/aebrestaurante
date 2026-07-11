"use client";

import { useState } from "react";
import { Pencil, Save, Trash2, X } from "lucide-react";
import { deleteUserAction, updateUserAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import type { UserRole } from "@/db/schema";

type EditableUser = {
  id: number;
  name: string;
  username: string;
  role: UserRole;
  active: boolean;
};

export function UserEditDialog({ user }: { user: EditableUser }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Pencil className="size-4" />
        Editar
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label={`Editar ${user.name}`}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border bg-card p-4 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3 border-b pb-3">
              <div>
                <h2 className="text-lg font-semibold">Editar usuário</h2>
                <p className="text-sm text-muted-foreground">{user.name}</p>
              </div>
              <Button type="button" size="icon" variant="ghost" aria-label="Fechar" onClick={() => setOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <form action={updateUserAction} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="id" value={user.id} />
              <div className="space-y-1.5">
                <Label>Nome</Label>
                <Input aria-label="Nome" name="name" defaultValue={user.name} required />
              </div>
              <div className="space-y-1.5">
                <Label>Usuário de login</Label>
                <Input aria-label="Usuário de login" name="username" defaultValue={user.username} required />
              </div>
              <div className="space-y-1.5">
                <Label>Cargo</Label>
                <NativeSelect aria-label="Cargo" name="role" defaultValue={user.role}>
                  <option value="garcom">Garçom</option>
                  <option value="barman">Barman</option>
                  <option value="estoquista">Estoquista</option>
                  <option value="gestor">Gestor</option>
                </NativeSelect>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <NativeSelect aria-label="Status" name="active" defaultValue={String(user.active)}>
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </NativeSelect>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Nova senha</Label>
                <Input aria-label="Nova senha" name="password" type="password" minLength={4} placeholder="Deixe em branco para manter" />
              </div>
              <div className="flex justify-end md:col-span-2">
                <Button size="sm"><Save className="size-4" />Salvar</Button>
              </div>
            </form>
            <form action={deleteUserAction} className="mt-3 border-t pt-3">
              <input type="hidden" name="id" value={user.id} />
              <Button size="sm" variant="destructive"><Trash2 className="size-4" />Excluir</Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}