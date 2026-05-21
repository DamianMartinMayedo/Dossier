import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite acceder al dev server desde la IP LAN (iPhone, otros dispositivos)
  // sin que Next bloquee los recursos HMR. Sólo afecta a `next dev`; en build
  // de producción no se usa.
  allowedDevOrigins: ["192.168.1.137"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  // lucide-react expone ~1500 iconos como named exports. Sin esta opción,
  // Next mete TODOS en el grafo de módulos en dev → primer compile cuelga
  // varios minutos. Con `optimizePackageImports` reescribe los imports a
  // sub-paths individuales (`lucide-react/dist/esm/icons/arrow-right`).
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
