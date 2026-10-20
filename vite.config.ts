import { defineConfig, type Plugin } from "vite";

const runtimeCsp =
  "default-src 'none'; script-src 'self' 'unsafe-eval'; style-src 'unsafe-inline'; img-src 'none'; media-src 'none'; frame-src 'none'; connect-src 'none'; font-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";

function runtimeSecurityHeaders(): Plugin {
  const apply = (
    request: { url?: string; headers: Record<string, string | string[] | undefined> },
    response: { setHeader: (name: string, value: string) => void },
  ) => {
    const rawUrl = request.url ?? "";
    const pathname = rawUrl.split("?", 1)[0];

    // Ensure Rolldown pre-bundled CSS imports inside node_modules (e.g. monaco-editor)
    // are always transformed into JS modules by Vite rather than hitting SSR HTML fallback
    if (
      (pathname.startsWith("/app/applet/node_modules/") ||
        pathname.startsWith("/node_modules/monaco-editor/")) &&
      pathname.endsWith(".css")
    ) {
      request.headers["sec-fetch-dest"] = "script";
      request.headers["accept"] = "*/*";
    }

    if (pathname !== "/react-runtime.html") return;
    response.setHeader("Content-Security-Policy", runtimeCsp);
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "no-referrer");
  };

  return {
    name: "runtime-security-headers",
    configureServer(server) {
      server.httpServer?.prependListener("request", (request, response) => {
        apply(request, response);
      });
    },
    configurePreviewServer(server) {
      server.httpServer?.prependListener("request", (request, response) => {
        apply(request, response);
      });
    },
  };
}
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      server: {
        entry: "server",
      },
    }),
    nitro(),
    viteReact(),
    runtimeSecurityHeaders(),
  ],
  test: {
    setupFiles: ["./src/test/setup.ts"],
    server: {
      deps: {
        inline: ["p-retry"],
      },
    },
  },
  optimizeDeps: {
    include: ["monaco-editor", "react-markdown"],
  },
});
