import { createTaskAction } from "@/app/actions";
import { DateStatusFilters } from "@/components/filters";
import { PageHeader } from "@/components/page-header";
import { TaskEditDialog } from "@/components/task-edit-dialog";
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
import { formatDateBR, priorityLabels, taskStatusLabels, todayISO } from "@/lib/utils";

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
                    <TD>{formatDateBR(task.taskDate)} {task.taskTime}</TD>
                    <TD><Badge>{priorityLabels[task.priority] ?? task.priority}</Badge></TD>
                    <TD><Badge variant={task.status === "concluido" ? "secondary" : "default"}>{taskStatusLabels[task.status] ?? task.status}</Badge></TD>
                    <TD className="align-top">
                      <details className="min-w-56">
                        <summary className="cursor-pointer text-sm font-medium text-primary">Editar</summary>
                        <TaskEditDialog
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

function TaskForm({ users, date }: { users: Array<{ id: number; name: string }>; date: string }) {
  return (
    <form action={createTaskAction} className="space-y-3">
      <Field label="Título" name="title" />
      <div className="space-y-2"><Label>Descrição</Label><Textarea name="description" required /></div>
      <div className="space-y-2"><Label>Responsável</Label><NativeSelect name="responsibleId" required>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</NativeSelect></div>
      <Field label="Data" name="taskDate" type="date" defaultValue={date} />
      <Field label="Horário" name="taskTime" type="time" />
      <div className="space-y-2"><Label>Prioridade</Label><NativeSelect name="priority"><option value="media">Média</option><option value="alta">Alta</option><option value="critica">Crítica</option><option value="baixa">Baixa</option></NativeSelect></div>
      <input type="hidden" name="status" value="pendente" />
      <div className="space-y-2"><Label>Observações</Label><Textarea name="notes" /></div>
      <Button className="w-full">Criar tarefa</Button>
    </form>
  );
}

function Field({ label, name, type = "text", defaultValue }: { label: string; name: string; type?: string; defaultValue?: string }) {
  return <div className="space-y-2"><Label>{label}</Label><Input name={name} type={type} defaultValue={defaultValue} required /></div>;
}
