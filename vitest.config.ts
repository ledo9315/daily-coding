import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    /**
     * @nsmr/pixelart-react ist `"type": "module"`, importiert intern aber ohne
     * Dateiendung (`from './Icon'`). Node's ESM-Resolver lehnt das ab, Vites
     * nicht — inline lassen, sonst ist jede Komponente mit Icons untestbar.
     * Kann entfallen, wenn das Paket sein ESM-Bundle korrigiert.
     */
    server: { deps: { inline: ["@nsmr/pixelart-react"] } },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
