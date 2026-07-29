import { NextResponse } from "next/server";
import { getStockProducts } from "@/lib/data";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!["gestor", "barman"].includes(session.role)) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

  const products = await getStockProducts(true);
  return NextResponse.json({ products: products.map((product) => ({ id: product.id, name: product.name })) });
}
