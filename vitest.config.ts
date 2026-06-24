import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: { environment: "node" },
  resolve: {
    // Mirror the tsconfig "@/*" -> project root alias for test imports.
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
});
