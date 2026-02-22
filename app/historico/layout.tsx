import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Histórico de Conversões",
    description: "Confira as imagens processadas recentemente pelo seu navegador. Dados armazenados apenas localmente.",
    alternates: { canonical: "/historico" },
};

export default function HistoricoLayout({ children }: { children: React.ReactNode }) {
    return children;
}
