import { createNewsAction, deleteNewsAction, updateNewsAction } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getActiveNewsForManager, getNewsForUser, getUsers } from "@/lib/data";
import { getSession } from "@/lib/session";
import { todayISO } from "@/lib/utils";

type NewsValues = {
  id: number;
  title: string;
  content: string;
  priority: "baixa" | "media" | "alta" | "critica";
  publishedAt: string;
  expiresAt: string;
  audience: "todos" | "usuarios" | "garcons";
  pdfUrl?: string | null;
  recipientIds?: number[];
};

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const session = (await getSession())!;
  const params = await searchParams;
  const isManager = session.role === "gestor";
  const [rows, users] = await Promise.all([
    isManager ? getActiveNewsForManager(todayISO()) : getNewsForUser(session, todayISO()),
    isManager ? getUsers() : Promise.resolve([])
  ]);
  const recipients = users.filter((user) => user.active && ["garcom", "barman"].includes(user.role));

  return (
    <>
      <PageHeader title="Mural de notícias" description="Comunicados por destinatário, prioridade e validade." />
      {(params.ok || params.erro) && <p className={`mb-4 rounded-md border p-3 text-sm ${params.erro ? "border-destructive/40 text-destructive" : "border-emerald-500/40 text-emerald-700"}`}>{params.erro ?? params.ok}</p>}
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        {isManager && <Card><CardHeader><CardTitle>Nova notícia</CardTitle></CardHeader><CardContent><NewsForm users={recipients} /></CardContent></Card>}
        <section className={`grid content-start gap-4 md:grid-cols-2 ${isManager ? "" : "lg:col-span-2"}`}>
          {rows.map((item) => {
            const recipientIds = "recipients" in item && Array.isArray(item.recipients) ? item.recipients.map((recipient) => recipient.userId) : [];
            const values: NewsValues = { id: item.id, title: item.title, content: item.content, priority: item.priority as NewsValues["priority"], publishedAt: item.publishedAt, expiresAt: item.expiresAt, audience: item.audience as NewsValues["audience"], pdfUrl: "pdfUrl" in item && typeof item.pdfUrl === "string" ? item.pdfUrl : null, recipientIds };
            return (
              <Card key={item.id}>
                <CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>{item.title}</CardTitle><Badge>{item.priority}</Badge></div></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.content}</p>
                  <p className="mt-4 text-xs text-muted-foreground">Publicada em {item.publishedAt} · válida até {item.expiresAt}</p>
                  {values.pdfUrl && <a className="mt-3 inline-flex text-sm text-primary" href={values.pdfUrl}>Abrir PDF</a>}
                  {isManager && (
                    <details className="mt-4 border-t pt-3">
                      <summary className="cursor-pointer text-sm font-medium text-primary">Editar notícia</summary>
                      <div className="mt-3"><NewsForm users={recipients} news={values} /></div>
                      <form action={deleteNewsAction} className="mt-2"><input type="hidden" name="id" value={item.id} /><Button className="w-full" size="sm" variant="destructive">Excluir notícia</Button></form>
                    </details>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {!rows.length && <p className="text-sm text-muted-foreground">Nenhuma notícia válida encontrada.</p>}
        </section>
      </div>
    </>
  );
}

function NewsForm({ users, news }: { users: Array<{ id: number; name: string; role: string }>; news?: NewsValues }) {
  return (
    <form action={news ? updateNewsAction : createNewsAction} className="space-y-3">
      {news && <><input type="hidden" name="id" value={news.id} /><input type="hidden" name="currentPdfUrl" value={news.pdfUrl ?? ""} /></>}
      <Field label="Título" name="title" defaultValue={news?.title} />
      <div className="space-y-2"><Label>Conteúdo</Label><Textarea name="content" defaultValue={news?.content} required /></div>
      <div className="space-y-2"><Label>Prioridade</Label><NativeSelect name="priority" defaultValue={news?.priority ?? "media"}><option value="media">Média</option><option value="alta">Alta</option><option value="critica">Crítica</option><option value="baixa">Baixa</option></NativeSelect></div>
      <Field label="Publicação" name="publishedAt" type="date" defaultValue={news?.publishedAt ?? todayISO()} />
      <Field label="Validade" name="expiresAt" type="date" defaultValue={news?.expiresAt ?? todayISO()} />
      <div className="space-y-2"><Label>Destinatários</Label><NativeSelect name="audience" defaultValue={news?.audience ?? "todos"}><option value="todos">Todos</option><option value="usuarios">Usuários específicos</option><option value="garcons">Apenas garçons</option></NativeSelect></div>
      <div className="space-y-2"><Label>Usuários específicos</Label><div className="max-h-36 space-y-1 overflow-y-auto rounded-md border p-2">{users.map((user) => <label key={user.id} className="flex items-center gap-2 text-sm"><input type="checkbox" name="recipientIds" value={user.id} defaultChecked={news?.recipientIds?.includes(user.id)} />{user.name}</label>)}</div></div>
      <Field label="PDF" name="pdf" type="file" />
      <Button className="w-full">{news ? "Salvar notícia" : "Publicar"}</Button>
    </form>
  );
}

function Field({ label, name, type = "text", defaultValue }: { label: string; name: string; type?: string; defaultValue?: string }) {
  return <div className="space-y-2"><Label>{label}</Label><Input name={name} type={type} defaultValue={defaultValue} required={type !== "file"} /></div>;
}
