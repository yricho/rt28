import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // OpenNext Cloudflare membundle output standalone (`.next/standalone`).
  output: "standalone",
};

export default nextConfig;

// Aktifkan binding Cloudflare (KV, R2, dll.) saat `next dev`.
import("@opennextjs/cloudflare").then((m) =>
  m.initOpenNextCloudflareForDev(),
);

