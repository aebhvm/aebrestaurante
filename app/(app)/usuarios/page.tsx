import { Pencil, Save, Trash2 } from "lucide-react";
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
import { roleLabels } from "@/lib/permissions";

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const params = await searchParams;
  const [users, settings] = await Promise.all([getUsers(), getLoginSettings()]);
  return (
    <>
      <PageHeader title="Usuários" description="Gestão de perfis, login e textos iniciais da tela de acesso." />
      {params.ok || params.erro ? (
        <div className={`mb-4 rounded-md border px-4 py-3 text-sm ${params.erro ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}>
          {params.erro ?? params.ok}
        </div>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Novo usuário</CardTitle></CardHeader>
            <CardContent>
              <form action={createUserAction} className="space-y-3">
                <Field label="Nome" name="name" />
                <Field label="Usuário de login" name="username" />
                <Field label="Senha" name="password" type="password" minLength={4} placeholder="4 dígitos" />
                <div className="space-y-2">
                  <Label>Cargo</Label>
                  <NativeSelect name="role">
                    <option value="garcom">Garçom</option>
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
                <Field label="Título inicial" name="loginTitle" defaultValue={settings.loginTitle} />
                <Field label="Subtítulo inicial" name="loginSubtitle" defaultValue={settings.loginSubtitle} />
                <Button className="w-full">Salvar login</Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <THead><TR><TH>Usuário</TH><TH>Status</TH><TH>Criação</TH><TH>Último acesso</TH><TH className="text-right">Ações</TH></TR></THead>
                <TBody>
                  {users.map((user) => (
                    <TR key={user.id}>
                      <TD>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                        <Badge className="mt-2">{roleLabels[user.role]}</Badge>
                      </TD>
                      <TD>{user.active ? "Ativo" : "Inativo"}</TD>
                      <TD>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</TD>
                      <TD>{user.lastAccessAt ? new Date(user.lastAccessAt).toLocaleString("pt-BR") : "-"}</TD>
                      <TD className="align-top">
                        <details className="group min-w-[300px]">
                          <summary className="focus-ring ml-auto inline-flex h-8 cursor-pointer list-none items-center justify-center gap-2 rounded-md border bg-background px-2.5 text-sm font-medium hover:bg-muted">
                            <Pencil className="size-4" />
                            Editar
                          </summary>
                          <div className="mt-3 rounded-md border bg-muted/30 p-3">
                            <form action={updateUserAction} className="grid gap-2 md:grid-cols-2 xl:grid-cols-[1fr_150px_150px_120px]">
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
                            <div className="space-y-1.5 md:col-span-2 xl:col-span-3">
                              <Label>Nova senha</Label>
                              <Input aria-label="Nova senha" name="password" type="password" minLength={4} placeholder="Deixe em branco para manter" />
                            </div>
                            <div className="flex items-end">
                              <Button size="sm" className="w-full"><Save className="size-4" />Salvar</Button>
                            </div>
                          </form>
                          <form action={deleteUserAction} className="mt-3 flex justify-end">
                            <input type="hidden" name="id" value={user.id} />
                            <Button size="sm" variant="destructive"><Trash2 className="size-4" />Excluir</Button>
                          </form>
                          </div>
                        </details>
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
