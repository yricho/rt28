import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;

// Aktifkan binding Cloudflare (KV, R2, dll.) saat `next dev`.
import("@opennextjs/cloudflare").then((m) =>
  m.initOpenNextCloudflareForDev(),
);

