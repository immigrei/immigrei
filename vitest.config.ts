import path from "node:path";
import { defineConfig } from "vitest/config";

// Espelha o alias "@/*" do tsconfig para os testes que importam módulos
// do app (ex.: app/painel/strategy.test.ts).
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname) },
  },
  test: {
    // lib/supabase.ts chama createClient() no escopo do módulo — qualquer
    // teste que importe (mesmo transitivamente) algo que toque nesse arquivo
    // quebra sem essas vars. Valores fake, só para o processo de teste: nunca
    // batem numa rede real (nenhum teste faz chamada de verdade ao Supabase).
    env: {
      NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    },
  },
});
