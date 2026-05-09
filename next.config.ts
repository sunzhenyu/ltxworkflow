import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/blog/open-source-video-models-production-ready-2026",
        destination: "/blog/open-source-video-models-production-ready",
        permanent: true,
      },
      {
        source: "/blog/ltx-2-3-vs-sora-open-source-wins",
        destination: "/blog/ltx-23-vs-sora-open-source-wins",
        permanent: true,
      },
      {
        source: "/blog/how-to-download-and-install-taeltx23safetensors-for-ltx-23-complete-tutorial",
        destination: "/blog/taeltx2-3-safetensors-download-install-guide",
        permanent: true,
      },
      {
        source: "/blog/getting-started-with-ltx-23-complete-tutorial",
        destination: "/guide",
        permanent: true,
      },
      {
        source: "/blog/ltx-23-release-whats-new-in-lightricks-latest-video-model",
        destination: "/changelog",
        permanent: true,
      },
      {
        source: "/blog/ltx-23-optimization-guide-best-practices-for-quality-and-speed",
        destination: "/guide",
        permanent: true,
      },
      {
        source: "/blog/prompt-engineering-guide-2026",
        destination: "/blog",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
