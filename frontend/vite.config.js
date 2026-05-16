import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api/report": "http://localhost:4000",
      "/api/dashboard": "http://localhost:4000",
      "/api/months": "http://localhost:4000",
    },
  },
});
