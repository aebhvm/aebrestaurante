import { createNewsAction } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getNewsForUser } from "@/lib/data";
import { getSession } from "@/lib/session";
import { todayISO } from "@/lib/utils";

export default async function NewsPage() {
  const session = (await getSession())!;
  const rows = await getNewsForUser(session, todayISO());

  return (
    <>
      <PageHeader title="Mural de noticias" description="Comunicados por destinatario, prioridade, validade e PDF." />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        {session.role === "gestor" && (
          <Card>
            <CardHeader><CardTitle>Nova noticia</CardTitle></CardHeader>
            <CardContent>
              <form action={createNewsAction} className="space-y-3">
                <Field label="Titulo" name="title" />
                <div className="space-y-2"><Label>Conteudo</Label><Textarea name="content" required /></div>
                <div className="space-y-2"><Label>Prioridade</Label><NativeSelect name="priority"><option value="media">Media</option><option value="alta">Alta</option><option value="critica">Critica</option><option value="baixa">Baixa</option></NativeSelect></div>
                <Field label="Publicacao" name="publishedAt" type="date" />
                <Field label="Validade" name="expiresAt" type="date" />
                <div className="space-y-2"><Label>Destinatarios</Label><NativeSelect name="audience"><option value="todos">Todos</option><option value="usuarios">Usuarios especificos</option><option value="garcons">Apenas garcons</option></NativeSelect></div>
                <Field label="PDF" name="pdf" type="file" />
                <Button className="w-full">Publicar</Button>
              </form>
            </CardContent>
          </Card>
        )}
        <section className="grid gap-4 md:grid-cols-2">
          {rows.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3"><CardTitle>{item.title}</CardTitle><Badge>{item.priority}</Badge></div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.content}</p>
                <p className="mt-4 text-xs text-muted-foreground">{item.publishedAt} ate {item.expiresAt} | {item.audience}</p>
                {((pdfUrl) =>
                  pdfUrl ? <a className="mt-3 inline-flex text-sm text-primary" href={pdfUrl}>Abrir PDF</a> : null)(
                  "pdfUrl" in item && typeof item.pdfUrl === "string" ? item.pdfUrl : null
                )}
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return <div className="space-y-2"><Label>{label}</Label><Input name={name} type={type} required={type !== "file"} /></div>;
}
