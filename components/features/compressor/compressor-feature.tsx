"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import { Download, UploadCloud, ImageIcon, Settings, Scale, ArrowRight, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useHistory } from "@/hooks/use-history";
import { formatFileSize, calculateCompression } from "@/lib/image-utils";
import { ConversionFormat } from "@/lib/image-processing";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription, CardHeader, CardFooter } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface CompressorState {
    originalFile: File | null;
    originalUrl: string;
    originalWidth: number;
    originalHeight: number;

    compressedBlob: Blob | null;
    compressedUrl: string;
}

export function CompressorFeature() {
    const { addEntry } = useHistory();
    const [isDragging, setIsDragging] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);

    const [state, setState] = useState<CompressorState>({
        originalFile: null,
        originalUrl: "",
        originalWidth: 0,
        originalHeight: 0,
        compressedBlob: null,
        compressedUrl: "",
    });

    // Settings
    const [quality, setQuality] = useState([70]);
    const [targetSizeKB, setTargetSizeKB] = useState("");
    const [keepFormat, setKeepFormat] = useState(true);
    const [outputFormat, setOutputFormat] = useState<ConversionFormat>("webp");

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const loadFile = (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Por favor, selecione um arquivo de imagem válido.");
            return;
        }

        if (state.originalUrl) URL.revokeObjectURL(state.originalUrl);
        if (state.compressedUrl) URL.revokeObjectURL(state.compressedUrl);

        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            setState({
                originalFile: file,
                originalUrl: url,
                originalWidth: img.width,
                originalHeight: img.height,
                compressedBlob: null,
                compressedUrl: "",
            });
        };
        img.src = url;
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            loadFile(e.dataTransfer.files[0]);
        }
    }, [state.originalUrl, state.compressedUrl]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            loadFile(e.target.files[0]);
        }
    };

    const getMimeType = (f: string) => {
        switch (f) {
            case "jpeg": case "jpg": return "image/jpeg";
            case "webp": return "image/webp";
            case "png": return "image/png";
            case "avif": return "image/avif";
            default: return "image/jpeg";
        }
    };

    const doCompress = async () => {
        if (!state.originalFile) return;
        setIsCompressing(true);
        toast.info("Iniciando compressão...");

        try {
            const format = keepFormat
                ? state.originalFile.type.split('/')[1] === "jpeg" ? "jpeg" : state.originalFile.type.split('/')[1]
                : outputFormat;

            const mimeType = getMimeType(format);

            const canvas = document.createElement("canvas");
            canvas.width = state.originalWidth;
            canvas.height = state.originalHeight;
            const ctx = canvas.getContext("2d");

            const img = new Image();
            await new Promise<void>((resolve) => {
                img.onload = () => resolve();
                img.src = state.originalUrl;
            });

            // Draw white bg for formats that don't support alpha if keeping PNG -> JPEG
            if (mimeType === "image/jpeg" || mimeType === "image/webp") {
                if (ctx) {
                    ctx.fillStyle = "#FFFFFF";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            }
            ctx?.drawImage(img, 0, 0);

            const targetBytes = targetSizeKB ? parseFloat(targetSizeKB) * 1024 : null;
            let finalBlob: Blob | null = null;

            if (targetBytes) {
                // Binary search for target size
                let min = 0.01;
                let max = 1.0;
                let current = 0.7;
                let bestBlob: Blob | null = null;

                for (let i = 0; i < 10; i++) {
                    const blob = await new Promise<Blob | null>((resolve) => {
                        canvas.toBlob(b => resolve(b), mimeType, current);
                    });

                    if (!blob) break;

                    if (blob.size <= targetBytes) {
                        bestBlob = blob;
                        min = current;
                        current = (min + max) / 2;
                    } else {
                        max = current;
                        current = (min + max) / 2;
                    }
                    if (max - min < 0.02) break;
                }
                finalBlob = bestBlob || await new Promise<Blob | null>((resolve) => canvas.toBlob(b => resolve(b), mimeType, 0.1));
            } else {
                finalBlob = await new Promise<Blob | null>((resolve) => {
                    canvas.toBlob(b => resolve(b), mimeType, quality[0] / 100);
                });
            }

            if (!finalBlob) throw new Error("A compressão falhou.");

            const newUrl = URL.createObjectURL(finalBlob);
            if (state.compressedUrl) URL.revokeObjectURL(state.compressedUrl);

            setState(prev => ({
                ...prev,
                compressedBlob: finalBlob,
                compressedUrl: newUrl,
            }));

            // Generate filename correctly
            const ext = finalBlob.type.split("/")[1];
            const baseName = state.originalFile.name.substring(0, state.originalFile.name.lastIndexOf('.')) || state.originalFile.name;
            const convertedName = `${baseName}_comprimido.${ext}`;

            addEntry({
                originalName: state.originalFile.name,
                originalType: state.originalFile.type,
                originalSize: state.originalFile.size,
                originalWidth: state.originalWidth,
                originalHeight: state.originalHeight,
                convertedName,
                convertedType: finalBlob.type,
                convertedSize: finalBlob.size,
                convertedWidth: state.originalWidth,
                convertedHeight: state.originalHeight,
                convertedBlob: finalBlob,
            });

            toast.success("Imagem comprimida com sucesso!");
        } catch (e: any) {
            toast.error(e.message || "Erro durante a compressão.");
        } finally {
            setIsCompressing(false);
        }
    };

    const handleDownload = () => {
        if (state.compressedBlob && state.originalFile) {
            const ext = state.compressedBlob.type.split("/")[1];
            const baseName = state.originalFile.name.substring(0, state.originalFile.name.lastIndexOf('.')) || state.originalFile.name;
            saveAs(state.compressedBlob, `${baseName}_comprimido.${ext}`);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">

                {/* Dropzone or Results */}
                {!state.originalFile ? (
                    <label
                        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 min-h-[400px] flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden ${isDragging
                            ? "border-primary bg-primary/10 scale-[1.01] shadow-lg shadow-primary/10"
                            : "border-slate-300/60 bg-white/40 hover:border-primary/50 hover:bg-white/60 active:scale-[0.99] dark:border-border dark:bg-muted/20"
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            id="compressor-upload"
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept="image/png, image/jpeg, image/webp, image/avif"
                            onChange={handleFileInput}
                        />
                        <div className={`h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6 transition-transform duration-300 ${isDragging ? "scale-110 bg-primary/20" : "group-hover:scale-110"}`}>
                            <UploadCloud className={`h-10 w-10 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight">Arraste a imagem para comprimir</h3>
                        <p className="text-sm text-foreground/60 mb-8 max-w-[280px]">Otimização inteligente para JPG, PNG, WEBP e AVIF</p>
                        <span className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all group-hover:bg-primary/90 active:scale-95">
                            Selecionar Imagem
                        </span>
                        <p className="mt-4 text-xs text-muted-foreground/60">Mais de 1 arquivo? Use o Conversor</p>
                    </label>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-card p-4 rounded-xl border">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                                    <ImageIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-medium truncate max-w-[200px] md:max-w-xs">{state.originalFile.name}</h3>
                                    <p className="text-sm text-muted-foreground">{formatFileSize(state.originalFile.size)} • {state.originalWidth}x{state.originalHeight}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setState({ originalFile: null, originalUrl: "", originalWidth: 0, originalHeight: 0, compressedBlob: null, compressedUrl: "" })}>
                                Trocar Imagem
                            </Button>
                        </div>

                        {/* Comparison view */}
                        {state.compressedBlob && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader className="p-4 pb-2">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">Original</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="bg-muted rounded-lg overflow-hidden flex items-center justify-center h-48 mb-3">
                                            <img src={state.originalUrl} className="max-h-full max-w-full object-contain" alt="Original" />
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Tamanho:</span>
                                                <span className="font-medium">{formatFileSize(state.originalFile!.size)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Formato:</span>
                                                <span className="font-medium uppercase">{state.originalFile!.type.split('/')[1]}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-primary/50 bg-primary/5">
                                    <CardHeader className="p-4 pb-2">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">Comprimida</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="bg-background rounded-lg overflow-hidden flex items-center justify-center h-48 mb-3 border border-primary/20">
                                            <img src={state.compressedUrl} className="max-h-full max-w-full object-contain" alt="Compressed" />
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Tamanho:</span>
                                                <span className="font-medium text-green-600">{formatFileSize(state.compressedBlob.size)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Redução:</span>
                                                <span className="font-bold text-green-600">
                                                    {calculateCompression(state.originalFile!.size, state.compressedBlob.size)}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0">
                                        <Button className="w-full" onClick={handleDownload}><Download className="h-4 w-4 mr-2" /> Baixar Imagem</Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-6">
                <Card className="sticky top-24">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5" /> Nível de Compressão</CardTitle>
                        <CardDescription>Ajuste os parâmetros de compressão com precisão.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-sm font-medium">
                                <input type="checkbox" className="h-4 w-4 rounded accent-primary" checked={keepFormat} onChange={e => setKeepFormat(e.target.checked)} />
                                Manter formato original
                            </label>

                            {!keepFormat && (
                                <div className="space-y-2 relative">
                                    <label className="text-sm text-muted-foreground">Converter para:</label>
                                    <div className="relative">
                                        <select
                                            className="flex appearance-none h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            value={outputFormat}
                                            onChange={e => setOutputFormat(e.target.value as ConversionFormat)}
                                        >
                                            <option value="webp">WebP (Melhor Compressão)</option>
                                            <option value="avif">AVIF (Nova Geração)</option>
                                            <option value="jpeg">JPEG</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <hr />

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm font-medium">
                                <label>Qualidade</label>
                                <span>{quality[0]}%</span>
                            </div>
                            <Slider
                                value={quality}
                                onValueChange={setQuality}
                                max={100}
                                min={1}
                                step={1}
                                disabled={targetSizeKB !== ""}
                            />
                            <p className="text-xs text-muted-foreground">
                                Qualidades menores resultam em tamanhos menores, mas com perda visível de detalhes.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-muted-foreground block text-center">OU</label>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tamanho Alvo (KB)</label>
                                <input
                                    type="number"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Ex: 500 para 500KB"
                                    value={targetSizeKB}
                                    onChange={e => setTargetSizeKB(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    O sistema tentará atingir este tamanho automaticamente.
                                </p>
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="bg-muted/30 pt-4 rounded-b-xl border-t">
                        <Button
                            className="w-full font-semibold"
                            size="lg"
                            onClick={doCompress}
                            disabled={isCompressing || !state.originalFile}
                        >
                            {isCompressing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Comprimindo...
                                </>
                            ) : "Comprimir Agora"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
