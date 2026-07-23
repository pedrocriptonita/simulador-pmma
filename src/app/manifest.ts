import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Simulador PM MA 2026",
    short_name: "PM MA 2026",
    description:
      "Simulados no formato Cebraspe (nota líquida) para o concurso da Polícia Militar do Maranhão 2026.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1447e6",
    lang: "pt-BR",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
