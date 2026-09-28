import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "pdf-parse",
    "pdf-to-img",
    "pdfjs-dist",
    "@napi-rs/canvas",
    "tesseract.js",
  ],
};

export default nextConfig;