import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" makes the build path-agnostic, so it works on GitHub Pages
// (username.github.io/pace-habits/) or any static host without changes.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: { target: "es2019" }
});
