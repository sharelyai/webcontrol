import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            "babel-plugin-styled-components",
            {
              namespace: "sharelyai-webcontroller",
            },
          ],
        ],
      },
    }),
    cssInjectedByJsPlugin(),
  ],
  resolve: {
    conditions: ["development", "browser"],
  },
  envDir: path.resolve(__dirname, "../../"),
  server: {
    port: 5174,
    cors: true,
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: "assets/sharelyai.[extname]",
        chunkFileNames: "assets/sharelyai.js",
        entryFileNames: "assets/sharelyai.js",
      },
    },
  },
});
