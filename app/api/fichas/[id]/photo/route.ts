import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { hasDatabase, requireDb } from "@/db";
import { barRecipes } from "@/db/schema";
import { demoRecipes } from "@/lib/demo-data";
import { getSession } from "@/lib/session";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !["gestor", "barman", "garcom"].includes(session.role)) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Ficha invalida." }, { status: 400 });

  const photoUrl = hasDatabase
    ? (await requireDb().query.barRecipes.findFirst({ columns: { photoUrl: true }, where: eq(barRecipes.id, id) }))?.photoUrl
    : demoRecipes.find((recipe) => recipe.id === id)?.photoUrl;

  if (!photoUrl) return NextResponse.json({ error: "Foto nao encontrada." }, { status: 404 });

  if (photoUrl.startsWith("data:")) {
    const match = /^data:([^;,]+);base64,(.*)$/s.exec(photoUrl);
    if (!match) return NextResponse.json({ error: "Foto invalida." }, { status: 422 });
    return new NextResponse(Buffer.from(match[2], "base64"), {
      headers: {
        "Content-Type": match[1],
        "Cache-Control": "private, max-age=300"
      }
    });
  }

  const response = NextResponse.redirect(photoUrl);
  response.headers.set("Cache-Control", "private, max-age=300");
  return response;
}
