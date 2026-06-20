import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Split the heavy 3D stack into its own chunk so the rest of the
        // app stays small and the hero can be lazy-loaded.
        manualChunks: {
          three: ["three", "@react-three/fiber", "@react-three/drei"],
          motion: ["framer-motion"],
        },
      },
    },
  },
});
