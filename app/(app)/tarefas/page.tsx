import { createTaskAction, deleteTaskAction, updateTaskAction } from "@/app/actions";
import { DateStatusFilters } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { getTasks, getUsers } from "@/lib/data";
import { getSession } from "@/lib/session";
import { priorityLabels, taskStatusLabels, todayISO } from "@/lib/utils";

type TaskValues = {
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

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ date?: string; status?: string; ok?: string; erro?: string }> }) {
  const session = (await getSession())!;
  const params = await searchParams;
  const date = params.date ?? todayISO();
  const [tasks, users] = await Promise.all([getTasks(session, { ...params, date }), getUsers()]);

  return (
    <>
      <PageHeader title="Tarefas" description="Criação, acompanhamento e conclusão de atividades operacionais." />
      {(params.ok || params.erro) && <p className={`mb-4 rounded-md border p-3 text-sm ${params.erro ? "border-destructive/40 text-destructive" : "border-emerald-500/40 text-emerald-700"}`}>{params.erro ?? params.ok}</p>}
      <DateStatusFilters defaultDate={date} statusOptions={[{ value: "pendente", label: "Pendente" }, { value: "concluido", label: "Concluído" }]} />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        {session.role === "gestor" && (
          <Card>
            <CardHeader><CardTitle>Nova tarefa</CardTitle></CardHeader>
            <CardContent>
              <TaskForm users={users} date={date} />
            </CardContent>
          </Card>
        )}
        <Card className={session.role === "gestor" ? "" : "lg:col-span-2"}>
          <CardContent className="p-0">
            <Table>
              <THead><TR><TH>Tarefa</TH><TH>Responsável</TH><TH>Data</TH><TH>Prioridade</TH><TH>Status</TH><TH>Ações</TH></TR></THead>
              <TBody>
                {tasks.map((task) => (
                  <TR key={task.id}>
                    <TD><p className="font-medium">{task.title}</p><p className="text-xs text-muted-foreground">{task.description}</p></TD>
                    <TD>{task.responsible?.name ?? "-"}</TD>
                    <TD>{task.taskDate} {task.taskTime}</TD>
                    <TD><Badge>{priorityLabels[task.priority] ?? task.priority}</Badge></TD>
                    <TD><Badge variant={task.status === "concluido" ? "secondary" : "default"}>{taskStatusLabels[task.status] ?? task.status}</Badge></TD>
                    <TD className="align-top">
                      <details className="min-w-56">
                        <summary className="cursor-pointer text-sm font-medium text-primary">Editar</summary>
                        <div className="mt-3 space-y-3">
                          <TaskForm
                            users={users}
                            date={date}
                            task={{
                              id: task.id,
                              title: task.title,
                              description: task.description,
                              responsibleId: task.responsibleId,
                              taskDate: task.taskDate,
                              taskTime: task.taskTime,
                              priority: task.priority,
                              status: task.status,
                              notes: "notes" in task && typeof task.notes === "string" ? task.notes : null
                            }}
                          />
                          <form action={deleteTaskAction}>
                            <input type="hidden" name="id" value={task.id} />
                            <input type="hidden" name="date" value={date} />
                            <Button className="w-full" size="sm" variant="destructive">Excluir</Button>
                          </form>
                        </div>
                      </details>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function TaskForm({ users, date, task }: { users: Array<{ id: number; name: string }>; date: string; task?: TaskValues }) {
  return (
    <form action={task ? updateTaskAction : createTaskAction} className="space-y-3">
      {task && <input type="hidden" name="id" value={task.id} />}
      <Field label="Título" name="title" defaultValue={task?.title} />
      <div className="space-y-2"><Label>Descrição</Label><Textarea name="description" defaultValue={task?.description} required /></div>
      <div className="space-y-2"><Label>Responsável</Label><NativeSelect name="responsibleId" defaultValue={task?.responsibleId ?? ""} required>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</NativeSelect></div>
      <Field label="Data" name="taskDate" type="date" defaultValue={task?.taskDate ?? date} />
      <Field label="Horário" name="taskTime" type="time" defaultValue={task?.taskTime} />
      <div className="space-y-2"><Label>Prioridade</Label><NativeSelect name="priority" defaultValue={task?.priority ?? "media"}><option value="media">Média</option><option value="alta">Alta</option><option value="critica">Crítica</option><option value="baixa">Baixa</option></NativeSelect></div>
      {task ? <div className="space-y-2"><Label>Status</Label><NativeSelect name="status" defaultValue={task.status}><option value="pendente">Pendente</option><option value="concluido">Concluído</option></NativeSelect></div> : <input type="hidden" name="status" value="pendente" />}
      <div className="space-y-2"><Label>Observações</Label><Textarea name="notes" defaultValue={task?.notes ?? ""} /></div>
      <Button className="w-full" size={task ? "sm" : "default"}>{task ? "Salvar alterações" : "Criar tarefa"}</Button>
    </form>
  );
}

function Field({ label, name, type = "text", defaultValue }: { label: string; name: string; type?: string; defaultValue?: string }) {
  return <div className="space-y-2"><Label>{label}</Label><Input name={name} type={type} defaultValue={defaultValue} required /></div>;
}
