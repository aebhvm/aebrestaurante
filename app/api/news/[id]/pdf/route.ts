import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { news } from "@/db/schema";
import { requireDb } from "@/db";
import { getSession } from "@/lib/session";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new NextResponse("Não autorizado", { status: 401 });

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return new NextResponse("Notícia inválida", { status: 400 });

  const item = await requireDb().query.news.findFirst({
    where: eq(news.id, id),
    with: { recipients: true }
  });
  if (!item?.pdfUrl) return new NextResponse("PDF não encontrado", { status: 404 });

  const allowed = session.role === "gestor" || item.audience === "todos" || (session.role === "garcom" && item.audience === "garcons") || item.recipients.some((recipient) => recipient.userId === session.id);
  if (!allowed) return new NextResponse("Acesso negado", { status: 403 });

  if (/^https?:\/\//i.test(item.pdfUrl)) return NextResponse.redirect(item.pdfUrl);

  const match = item.pdfUrl.match(/^data:([^;,]+)?(;base64)?,(.*)$/s);
  if (!match) return new NextResponse("Formato de PDF inválido", { status: 415 });
  const bytes = match[2] ? Buffer.from(match[3], "base64") : Buffer.from(decodeURIComponent(match[3]), "utf8");

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": match[1] || "application/pdf",
      "Content-Disposition": `inline; filename="noticia-${id}.pdf"`,
      "Cache-Control": "private, no-store"
    }
  });
}
