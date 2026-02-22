import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Editor de Imagens",
    description: "Ajuste brilho, contraste, aplique filtros e faça recortes nas suas imagens. 100% privado no navegador.",
    alternates: {
        canonical: "/editor",
        languages: { "pt-BR": "/editor", "x-default": "/editor" },
    },
};

export default function EditorLayout({ children }: { children: React.ReactNode }) {
    return children;
}
