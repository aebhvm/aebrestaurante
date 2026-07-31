import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";
import { getLoginSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

const allowedSizes = new Set([180, 192, 512]);

function parseDataUrl(value: string) {
  const match = value.match(/^data:[^;]+;base64,(.+)$/s);
  return match ? Buffer.from(match[1], "base64") : null;
}

async function loadLogo(request: NextRequest, logoUrl?: string | null) {
  if (logoUrl) {
    const dataUrl = parseDataUrl(logoUrl);
    if (dataUrl) return dataUrl;

    const response = await fetch(logoUrl, { cache: "no-store" });
    if (response.ok) return Buffer.from(await response.arrayBuffer());
  }

  const fallback = await fetch(new URL("/aeb-icon.svg", request.url), { cache: "no-store" });
  return Buffer.from(await fallback.arrayBuffer());
}

export async function GET(request: NextRequest) {
  const requestedSize = Number(request.nextUrl.searchParams.get("size") || "512");
  const size = allowedSizes.has(requestedSize) ? requestedSize : 512;
  const settings = await getLoginSettings();
  const source = await loadLogo(request, settings.loginLogoUrl);
  const icon = await sharp(source)
    .resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toBuffer();

  return new NextResponse(new Uint8Array(icon), {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "Content-Type": "image/png"
    }
  });
}
