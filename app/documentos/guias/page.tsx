import type { Metadata } from "next";
import guias from "./data";
import GuiasIndexClient from "./GuiasIndexClient";

// Public index — see [id]/page.tsx and proxy.ts for the same reasoning.
// No auth() check here; never add gated-feature data to this route.
export const metadata: Metadata = {
  metadataBase: new URL("https://immigrei.app"),
  title: "Guias de Integração nos EUA | immigrei",
  description:
    "SSN, carteira de motorista, crédito, plano de saúde, ITIN e abertura de empresa — guias práticos em português para os primeiros passos depois do visto.",
  alternates: { canonical: "/documentos/guias" },
};

export default function GuiasIndexPage() {
  return <GuiasIndexClient guias={guias} />;
}
