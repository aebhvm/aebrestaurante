import { createTaskAction } from "@/app/actions";
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

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ date?: string; status?: string }> }) {
  const session = (await getSession())!;
  const params = await searchParams;
  const [tasks, users] = await Promise.all([getTasks(session, params), getUsers()]);

  return (
    <>
      <PageHeader title="Tarefas" description="Criacao, acompanhamento e conclusao de atividades operacionais." />
      <DateStatusFilters statusOptions={[{ value: "pendente", label: "Pendente" }, { value: "concluido", label: "Concluido" }]} />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        {session.role === "gestor" && (
          <Card>
            <CardHeader><CardTitle>Nova tarefa</CardTitle></CardHeader>
            <CardContent>
              <form action={createTaskAction} className="space-y-3">
                <Field label="Titulo" name="title" />
                <div className="space-y-2"><Label>Descricao</Label><Textarea name="description" required /></div>
                <div className="space-y-2"><Label>Responsavel</Label><NativeSelect name="responsibleId">{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</NativeSelect></div>
                <Field label="Data" name="taskDate" type="date" />
                <Field label="Horario" name="taskTime" type="time" />
                <div className="space-y-2"><Label>Prioridade</Label><NativeSelect name="priority"><option value="media">Media</option><option value="alta">Alta</option><option value="critica">Critica</option><option value="baixa">Baixa</option></NativeSelect></div>
                <input type="hidden" name="status" value="pendente" />
                <Button className="w-full">Criar tarefa</Button>
              </form>
            </CardContent>
          </Card>
        )}
        <Card className={session.role === "gestor" ? "" : "lg:col-span-2"}>
          <CardContent className="p-0">
            <Table>
              <THead><TR><TH>Tarefa</TH><TH>Responsavel</TH><TH>Data</TH><TH>Prioridade</TH><TH>Status</TH></TR></THead>
              <TBody>
                {tasks.map((task) => (
                  <TR key={task.id}>
                    <TD><p className="font-medium">{task.title}</p><p className="text-xs text-muted-foreground">{task.description}</p></TD>
                    <TD>{task.responsible?.name ?? "-"}</TD>
                    <TD>{task.taskDate} {task.taskTime}</TD>
                    <TD><Badge>{task.priority}</Badge></TD>
                    <TD><Badge variant={task.status === "concluido" ? "secondary" : "default"}>{task.status}</Badge></TD>
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

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return <div className="space-y-2"><Label>{label}</Label><Input name={name} type={type} required /></div>;
}
