import { createUserAction } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getUsers } from "@/lib/data";

export default async function UsersPage() {
  const users = await getUsers();
  return (
    <>
      <PageHeader title="Usuarios" description="Gestao de perfis, cargos, ultimo acesso e auditoria de criacao." />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader><CardTitle>Novo usuario</CardTitle></CardHeader>
          <CardContent>
            <form action={createUserAction} className="space-y-3">
              <Field label="Nome" name="name" />
              <Field label="Email" name="email" type="email" />
              <Field label="Senha" name="password" type="password" />
              <div className="space-y-2">
                <Label>Cargo</Label>
                <NativeSelect name="role">
                  <option value="garcom">Garcom</option>
                  <option value="barman">Barman</option>
                  <option value="estoquista">Estoquista</option>
                  <option value="gestor">Gestor</option>
                </NativeSelect>
              </div>
              <Button className="w-full">Criar</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <Table>
              <THead><TR><TH>Nome</TH><TH>Cargo</TH><TH>Criacao</TH><TH>Ultimo acesso</TH></TR></THead>
              <TBody>
                {users.map((user) => (
                  <TR key={user.id}>
                    <TD><p className="font-medium">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></TD>
                    <TD><Badge>{user.role}</Badge></TD>
                    <TD>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</TD>
                    <TD>{user.lastAccessAt ? new Date(user.lastAccessAt).toLocaleString("pt-BR") : "-"}</TD>
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
