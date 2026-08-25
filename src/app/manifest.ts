import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "cutting mat designer — Parametric Craft Studio",
    short_name: "Mat Designer",
    description:
      "A parametric studio for designing custom self-healing craft and drafting cutting mats.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
