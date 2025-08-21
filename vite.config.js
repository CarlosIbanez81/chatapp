import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration med Content Security Policy (CSP) header
export default defineConfig({
  plugins: [
    react(),
    {
      name: "csp-header",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          res.setHeader(
            "Content-Security-Policy",
            "default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' https://i.pravatar.cc https://freeimage.host data: blob:; connect-src 'self' https://chatify-api.up.railway.app; style-src 'self' 'unsafe-inline';"
          );
          next();
        });
      },
    },
  ],
});
