"use client";

import { UiShell } from "@/components/ui-shell";
import dynamic from "next/dynamic";

// Dynamically import the editor feature to prevent SSR issues with Fabric.js
const EditorFeature = dynamic(
    () => import("@/components/features/editor/editor-feature").then((mod) => mod.EditorFeature),
    { ssr: false, loading: () => <div className="animate-pulse h-[600px] w-full bg-muted rounded-xl" /> }
);

export default function EditorPage() {
    return (
        <UiShell>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Editor de Imagens</h1>
                    <p className="text-muted-foreground">
                        Ajuste recortes, brilho, contraste e aplique filtros na sua imagem. 100% privado.
                    </p>
                </div>

                <EditorFeature />
            </div>
        </UiShell>
    );
}
