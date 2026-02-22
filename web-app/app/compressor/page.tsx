import { UiShell } from "@/components/ui-shell";
import { CompressorFeature } from "@/components/features/compressor/compressor-feature";

export default function CompressorPage() {
    return (
        <UiShell>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Compressor de Imagens</h1>
                    <p className="text-muted-foreground">
                        Reduza o tamanho das suas imagens antes de publicá-las ou enviá-las. 100% no navegador.
                    </p>
                </div>

                <CompressorFeature />
            </div>
        </UiShell>
    );
}
