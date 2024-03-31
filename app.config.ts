import { defineConfig } from "@solidjs/start/config"

export default defineConfig({
  vite: {
    optimizeDeps: {
      esbuildOptions: {
        target: "esnext",
      },
    },
  },
  server: {
    preset: "cloudflare_module",
    rollupConfig: {
      external: ["__STATIC_CONTENT_MANIFEST", "node:async_hooks"],
    },
    prerender: {
      routes: ["/"],
    },
  },
})
