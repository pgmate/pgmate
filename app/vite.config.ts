import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        chunkFileNames: (chunk) => {
          const modulePath = chunk.facadeModuleId ? chunk.facadeModuleId : "";

          // Use plain string manipulation to extract folder name before '/index.ts' or '/index.tsx'
          const folderMatch = modulePath.split("/").slice(-2, -1)[0]; // Get the second last part of the path

          if (modulePath.includes("/index.") && folderMatch) {
            return `${folderMatch}.[hash].js`; // Name chunk based on folder
          }

          // Default naming pattern for other chunks
          return "[name].[hash].js";
        },
      },
    },
  },
});
