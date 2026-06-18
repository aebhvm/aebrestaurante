import { Save, Trash2 } from "lucide-react";
import { createUserAction, deleteUserAction, updateLoginSettingsAction, updateUserAction } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getLoginSettings, getUsers } from "@/lib/data";

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const params = await searchParams;
  const [users, settings] = await Promise.all([getUsers(), getLoginSettings()]);
  return (
    <>
      <PageHeader title="Usuarios" description="Gestao de perfis, login e textos iniciais da tela de acesso." />
      {params.ok || params.erro ? (
        <div className={`mb-4 rounded-md border px-4 py-3 text-sm ${params.erro ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}>
          {params.erro ?? params.ok}
        </div>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Novo usuario</CardTitle></CardHeader>
            <CardContent>
              <form action={createUserAction} className="space-y-3">
                <Field label="Nome" name="name" />
                <Field label="Usuario de login" name="username" />
                <Field label="Senha" name="password" type="password" minLength={4} placeholder="4 digitos" />
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
                <Field label="Logo" name="loginLogo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" />
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
            <div className="overflow-x-auto">
              <Table>
                <THead><TR><TH>Usuario</TH><TH>Status</TH><TH>Criacao</TH><TH>Ultimo acesso</TH><TH>Editar</TH></TR></THead>
                <TBody>
                  {users.map((user) => (
                    <TR key={user.id}>
                      <TD>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                        <Badge className="mt-2">{user.role}</Badge>
                      </TD>
                      <TD>{user.active ? "Ativo" : "Inativo"}</TD>
                      <TD>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</TD>
                      <TD>{user.lastAccessAt ? new Date(user.lastAccessAt).toLocaleString("pt-BR") : "-"}</TD>
                      <TD>
                        <div className="min-w-[520px] space-y-2">
                          <form action={updateUserAction} className="grid gap-2 md:grid-cols-[1fr_130px_128px_96px_118px_auto]">
                            <input type="hidden" name="id" value={user.id} />
                            <Input aria-label="Nome" name="name" defaultValue={user.name} required />
                            <Input aria-label="Usuario de login" name="username" defaultValue={user.username} required />
                            <NativeSelect aria-label="Cargo" name="role" defaultValue={user.role}>
                              <option value="garcom">Garcom</option>
                              <option value="barman">Barman</option>
                              <option value="estoquista">Estoquista</option>
                              <option value="gestor">Gestor</option>
                            </NativeSelect>
                            <NativeSelect aria-label="Status" name="active" defaultValue={String(user.active)}>
                              <option value="true">Ativo</option>
                              <option value="false">Inativo</option>
                            </NativeSelect>
                            <Input aria-label="Nova senha" name="password" type="password" minLength={4} placeholder="Nova senha" />
                            <Button size="sm"><Save className="size-4" />Salvar</Button>
                          </form>
                          <form action={deleteUserAction} className="flex justify-end">
                            <input type="hidden" name="id" value={user.id} />
                            <Button size="sm" variant="destructive"><Trash2 className="size-4" />Excluir</Button>
                          </form>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  minLength,
  placeholder,
  accept
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  minLength?: number;
  placeholder?: string;
  accept?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input name={name} type={type} defaultValue={defaultValue} required={type !== "file"} minLength={minLength} placeholder={placeholder} accept={accept} />
    </div>
  );
}
