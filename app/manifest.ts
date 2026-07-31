import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const iconUrl = "/api/pwa-icon";

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
        src: `${iconUrl}?size=192`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: `${iconUrl}?size=512`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
