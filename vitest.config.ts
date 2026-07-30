import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    /**
      * @nsmr/pixelart-react is `"type": "module"` but imports internally without a file
      * extension (`from './Icon'`). Node's ESM resolver rejects that, Vite's does not —
      * so keep it inlined, otherwise every component using icons is untestable.
      * Can go once the package fixes its ESM bundle.
      */
    server: { deps: { inline: ["@nsmr/pixelart-react"] } },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
