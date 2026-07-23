import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Uploads de PDF (admin) chegam via server action; limite de negócio
      // é 25MB (ver MAX_BYTES em features/admin/pdfs/actions.ts) — margem
      // extra aqui cobre o overhead do multipart/form-data.
      bodySizeLimit: "30mb",
    },
  },
};

export default nextConfig;
