import { createUserAction, updateLoginSettingsAction } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getLoginSettings, getUsers } from "@/lib/data";

export default async function UsersPage() {
  const [users, settings] = await Promise.all([getUsers(), getLoginSettings()]);
  return (
    <>
      <PageHeader title="Usuarios" description="Gestao de perfis, login e textos iniciais da tela de acesso." />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Novo usuario</CardTitle></CardHeader>
            <CardContent>
              <form action={createUserAction} className="space-y-3">
                <Field label="Nome" name="name" />
                <Field label="Usuario de login" name="username" />
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
            <CardHeader><CardTitle>Tela de login</CardTitle></CardHeader>
            <CardContent>
              {settings.loginLogoUrl ? <img src={settings.loginLogoUrl} alt="Logo atual" className="mb-3 h-14 w-auto rounded-md object-contain" /> : null}
              <form action={updateLoginSettingsAction} className="space-y-3">
                <input type="hidden" name="currentLogoUrl" value={settings.loginLogoUrl ?? ""} />
                <Field label="Logo" name="loginLogo" type="file" />
                <Field label="Texto pequeno" name="loginEyebrow" defaultValue={settings.loginEyebrow} />
                <Field label="Titulo inicial" name="loginTitle" defaultValue={settings.loginTitle} />
                <Field label="Subtitulo inicial" name="loginSubtitle" defaultValue={settings.loginSubtitle} />
                <Button className="w-full">Salvar login</Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <THead><TR><TH>Nome</TH><TH>Cargo</TH><TH>Criacao</TH><TH>Ultimo acesso</TH></TR></THead>
              <TBody>
                {users.map((user) => (
                  <TR key={user.id}>
                    <TD><p className="font-medium">{user.name}</p><p className="text-xs text-muted-foreground">@{user.username}</p></TD>
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

function Field({ label, name, type = "text", defaultValue }: { label: string; name: string; type?: string; defaultValue?: string }) {
  return <div className="space-y-2"><Label>{label}</Label><Input name={name} type={type} defaultValue={defaultValue} required={type !== "file"} /></div>;
}
