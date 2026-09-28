"use client";

import { useState } from "react";
import { Pencil, Save, Trash2, X } from "lucide-react";
import { deleteTaskAction, updateTaskAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type EditableTask = {
  id: number;
  title: string;
  description: string;
  responsibleId: number;
  taskDate: string;
  taskTime: string;
  priority: string;
  status: string;
  notes?: string | null;
};

type Employee = { id: number; name: string };

export function TaskEditDialog({ task, users, date }: { task: EditableTask; users: Employee[]; date: string }) {
  const [open, setOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function openDialog() {
    setConfirmingDelete(false);
    setOpen(true);
  }

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={openDialog}>
        <Pencil className="size-4" />
        Editar
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label={`Editar ${task.title}`}>
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border bg-card p-4 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3 border-b pb-3">
              <div>
                <h2 className="text-lg font-semibold">Editar tarefa</h2>
                <p className="text-sm text-muted-foreground">{task.title}</p>
              </div>
              <Button type="button" size="icon" variant="ghost" aria-label="Fechar" onClick={() => setOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>

            <form action={updateTaskAction} onSubmit={() => setOpen(false)} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="id" value={task.id} />
              <div className="space-y-2 md:col-span-2"><Label>Título</Label><Input name="title" defaultValue={task.title} required /></div>
              <div className="space-y-2 md:col-span-2"><Label>Descrição</Label><Textarea name="description" defaultValue={task.description} required /></div>
              <div className="space-y-2 md:col-span-2"><Label>Responsável</Label><NativeSelect name="responsibleId" defaultValue={task.responsibleId} required>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</NativeSelect></div>
              <div className="space-y-2"><Label>Data</Label><Input name="taskDate" type="date" defaultValue={task.taskDate} required /></div>
              <div className="space-y-2"><Label>Horário</Label><Input name="taskTime" type="time" defaultValue={task.taskTime} required /></div>
              <div className="space-y-2"><Label>Prioridade</Label><NativeSelect name="priority" defaultValue={task.priority}><option value="media">Média</option><option value="alta">Alta</option><option value="critica">Crítica</option><option value="baixa">Baixa</option></NativeSelect></div>
              <div className="space-y-2"><Label>Status</Label><NativeSelect name="status" defaultValue={task.status}><option value="pendente">Pendente</option><option value="concluido">Concluído</option></NativeSelect></div>
              <div className="space-y-2 md:col-span-2"><Label>Observações</Label><Textarea name="notes" defaultValue={task.notes ?? ""} /></div>
              <div className="flex justify-end md:col-span-2"><Button type="submit" size="sm"><Save className="size-4" />Salvar alterações</Button></div>
            </form>

            <form action={deleteTaskAction} onSubmit={() => setOpen(false)} className="mt-3 border-t pt-3">
              <input type="hidden" name="id" value={task.id} />
              <input type="hidden" name="date" value={date} />
              {confirmingDelete ? (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-destructive">Confirmar exclusão desta tarefa?</p>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmingDelete(false)}>Cancelar</Button>
                    <Button type="submit" size="sm" variant="destructive"><Trash2 className="size-4" />Confirmar exclusão</Button>
                  </div>
                </div>
              ) : (
                <Button type="button" size="sm" variant="destructive" onClick={() => setConfirmingDelete(true)}><Trash2 className="size-4" />Excluir</Button>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
