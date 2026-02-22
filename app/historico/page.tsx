"use client";

import { UiShell } from "@/components/ui-shell";
import { HistoryFeature } from "@/components/features/history/history-feature";

export default function HistoryPage() {
    return (
        <UiShell>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Histórico de Conversões</h1>
                    <p className="text-muted-foreground">
                        Confira as imagens processadas recentemente pelo seu navegador.
                    </p>
                </div>

                <HistoryFeature />
            </div>
        </UiShell>
    );
}
