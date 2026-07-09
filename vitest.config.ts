import path from "node:path";
import { defineConfig } from "vitest/config";

// Espelha o alias "@/*" do tsconfig para os testes que importam módulos
// do app (ex.: app/painel/strategy.test.ts).
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname) },
  },
});
