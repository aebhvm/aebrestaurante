import type { MetadataRoute } from "next";
import { getLoginSettings } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getLoginSettings();
  const iconUrl = settings.loginLogoUrl || "/aeb-icon.svg";

  return {
    name: "AEB Restaurante",
    short_name: "AEB Restaurante",
    description: "Gestão profissional de operações para restaurantes e bares",
    start_url: "/login",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7faf8",
    theme_color: "#16705f",
    lang: "pt-BR",
    icons: [
      {
        src: iconUrl,
        sizes: "192x192",
        purpose: "any"
      },
      {
        src: iconUrl,
        sizes: "512x512",
        purpose: "maskable"
      }
    ]
  };
}
