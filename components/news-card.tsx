import { FileText } from "lucide-react";
import { priorityLabels } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type NewsCardItem = {
  id: number;
  title: string;
  content: string;
  priority: string;
  pdfUrl?: string | null;
};

export function NewsCard({ title, items }: { title: string; items: NewsCardItem[] }) {
  return (
    <Card className="mt-4">
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {items.length ? items.map((item) => (
          <article key={item.id} className="rounded-md border p-3">
            <div className="flex items-center justify-between gap-3"><p className="font-medium">{item.title}</p><Badge>{priorityLabels[item.priority] ?? item.priority}</Badge></div>
            <p className="mt-1 text-sm text-muted-foreground">{item.content}</p>
            {item.pdfUrl && (
              <a className="mt-3 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-primary transition hover:bg-muted" href={`/api/news/${item.id}/pdf`} target="_blank" rel="noreferrer">
                <FileText className="size-4" />
                Visualizar PDF
              </a>
            )}
          </article>
        )) : <p className="text-sm text-muted-foreground">Nenhuma notícia válida encontrada.</p>}
      </CardContent>
    </Card>
  );
}
