import { UiShell } from "@/components/ui-shell";
import { ConversorFeature } from "@/components/features/conversor/conversor-feature";

export default function ConversorPage() {
    return (
        <UiShell>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Conversor de Formatos</h1>
                    <p className="text-muted-foreground">
                        Converta imagens individuais ou em lote. Todo o processamento é feito localmente no seu dispositivo.
                    </p>
                </div>

                <ConversorFeature />
            </div>
        </UiShell>
    );
}
