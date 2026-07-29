import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
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
        src: "/aeb-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/aeb-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ]
  };
}
