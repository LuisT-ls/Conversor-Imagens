"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Download, Trash2, History, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { saveAs } from "file-saver";

import { useHistory, HistoryEntry } from "@/hooks/use-history";
import { formatFileSize, calculateCompression } from "@/lib/image-utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function HistoryFeature() {
    const { history, isLoaded, removeEntry, clearHistory } = useHistory();

    const handleDownload = (entry: HistoryEntry) => {
        if (entry.convertedBlob) {
            saveAs(entry.convertedBlob, entry.convertedName);
            toast.success("Download iniciado!");
        } else {
            toast.error("O arquivo original n\u00e3o est\u00e1 mais na mem\u00f3ria desta sess\u00e3o.", {
                description: "Como n\u00e3o armazenamos os arquivos nos servidores, \u00e9 necess\u00e1rio converter novamente ap\u00f3s atualizar a p\u00e1gina."
            });
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-[400px] flex items-center justify-center bg-muted/20 border rounded-xl animate-pulse">
                <p className="text-muted-foreground">Carregando hist\u00f3rico...</p>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="border border-dashed rounded-xl p-16 text-center bg-muted/20 flex flex-col items-center justify-center">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <History className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Nenhum hist\u00f3rico encontrado</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-2">
                    As suas convers\u00f5es e edi\u00e7\u00f5es recentes ir\u00e3o aparecer aqui.
                    N\u00f3s garantimos privacidade pr\u00e9-recodificando os detalhes e os Blobs salvados apenas na sua sess\u00e3o local atual.
                </p>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-xl">Últimas Atividades</CardTitle>
                    <CardDescription>Visualizando {history.length} registro(s) local(is).</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                    if (confirm("Deseja realmente apagar todo o hist\u00f3rico?")) {
                        clearHistory();
                        toast.success("Hist\u00f3rico limpo.");
                    }
                }}>
                    Limpar Tudo
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {history.map((entry) => {
                        const isAvailable = !!entry.convertedBlob;
                        const dateFormatted = format(new Date(entry.date), "dd/MM/yyyy HH:mm");

                        return (
                            <div key={entry.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/30 border rounded-xl gap-6 hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                    <div className="h-12 w-12 bg-background rounded-lg border flex items-center justify-center shrink-0">
                                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <p className="font-semibold text-sm truncate flex items-center gap-2">
                                            {entry.originalName}
                                            {isAvailable ? (
                                                <span className="inline-flex h-2 w-2 rounded-full bg-green-500 shrink-0" title="Disponível na memória" />
                                            ) : (
                                                <span className="inline-flex h-2 w-2 rounded-full bg-yellow-500 shrink-0" title="Sessão expirada" />
                                            )}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground whitespace-nowrap">
                                            <span>{dateFormatted}</span>
                                            <span className="hidden sm:inline opacity-50">•</span>
                                            <span className="uppercase">{entry.originalType.replace("image/", "")}</span>
                                            <span className="opacity-50">→</span>
                                            <span className="uppercase font-medium text-foreground">{entry.convertedType.replace("image/", "")}</span>
                                            {entry.originalWidth && entry.convertedWidth && (
                                                <>
                                                    <span className="hidden sm:inline opacity-50">•</span>
                                                    <span>{entry.originalWidth}x{entry.originalHeight}</span>
                                                    {entry.originalWidth !== entry.convertedWidth || entry.originalHeight !== entry.convertedHeight ? (
                                                        <>
                                                            <span className="opacity-50">→</span>
                                                            <span className="font-medium text-foreground">{entry.convertedWidth}x{entry.convertedHeight}</span>
                                                        </>
                                                    ) : null}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6 shrink-0">
                                    <div className="flex flex-col items-end text-sm">
                                        <span className="text-muted-foreground line-through opacity-70">
                                            {formatFileSize(entry.originalSize)}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-green-600">
                                                {formatFileSize(entry.convertedSize)}
                                            </span>
                                            <span className="text-xs bg-green-500/10 text-green-700 font-medium px-1.5 py-0.5 rounded">
                                                {calculateCompression(entry.originalSize, entry.convertedSize)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            onClick={() => handleDownload(entry)}
                                            disabled={!isAvailable}
                                            title={isAvailable ? "Baixar novamente" : "N\u00e3o dispon\u00edvel nesta sess\u00e3o"}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => removeEntry(entry.id)}>
                                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
