"use client";

import * as React from "react";
import { useCallback, useState } from "react";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { Download, Info, Image as ImageIcon, Settings, Trash2, ShieldCheck, CheckCircle2, ChevronDown, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { useHistory } from "@/hooks/use-history";
import { formatFileSize, shareFile } from "@/lib/image-utils";
import { convertImageFile, ConversionOptions, ConversionFormat, ResizeOption, ConvertedImageData } from "@/lib/image-processing";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

interface ProcessedFile {
    id: string;
    file: File;
    previewUrl: string;
    originalWidth: number;
    originalHeight: number;
    status: "pending" | "processing" | "completed" | "error";
    error?: string;
    result?: ConvertedImageData;
}

export function ConversorFeature() {
    const { addEntry } = useHistory();

    const [files, setFiles] = useState<ProcessedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    // Options state
    const [format, setFormat] = useState<ConversionFormat>("webp");
    const [quality, setQuality] = useState<number[]>([92]);
    const [resizeOption, setResizeOption] = useState<ResizeOption>("original");
    const [customWidth, setCustomWidth] = useState<string>("");
    const [customHeight, setCustomHeight] = useState<string>("");
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

    // Format Specific state
    const [webpLossless, setWebpLossless] = useState(false);
    const [webpAlpha, setWebpAlpha] = useState(true);
    const [jpegProgressive, setJpegProgressive] = useState(false);
    const [pngAlpha, setPngAlpha] = useState(true);
    const [pngCompression, setPngCompression] = useState("6");
    const [svgPrecision, setSvgPrecision] = useState("5");
    const [svgOptimize, setSvgOptimize] = useState(true);
    const [icoSizes, setIcoSizes] = useState<string[]>(["16", "32", "48"]);
    const [icoTransparent, setIcoTransparent] = useState(true);
    const [icoAllFormats, setIcoAllFormats] = useState(false);

    const [isProcessing, setIsProcessing] = useState(false);

    // --- Handlers ---
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await addFiles(Array.from(e.dataTransfer.files));
        }
    }, []);

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await addFiles(Array.from(e.target.files));
        }
        // reset target value so same file can be selected again
        e.target.value = "";
    };

    const addFiles = async (newFiles: File[]) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml', 'image/x-icon', 'image/gif', 'image/bmp'];

        const processingPromises = newFiles.map(async (file) => {
            if (!validTypes.includes(file.type)) {
                toast.warning(`Tipo não suportado ignorado: ${file.name}`);
                return null;
            }

            if (file.size > 50 * 1024 * 1024) {
                toast.error(`Arquivo excedeu 50MB: ${file.name}`);
                return null;
            }

            const previewUrl = URL.createObjectURL(file);

            // Get dimensions quickly
            const dimensions = await new Promise<{ w: number, h: number }>((resolve) => {
                const img = new Image();
                img.onload = () => resolve({ w: img.width, h: img.height });
                img.onerror = () => resolve({ w: 0, h: 0 });
                img.src = previewUrl;
            });

            return {
                id: Math.random().toString(36).substring(7),
                file,
                previewUrl,
                originalWidth: dimensions.w,
                originalHeight: dimensions.h,
                status: "pending" as const,
            };
        });

        const parsedFiles = (await Promise.all(processingPromises)).filter(f => f !== null) as ProcessedFile[];
        setFiles((prev) => [...prev, ...parsedFiles]);
    };

    const removeFile = (id: string) => {
        setFiles((prev) => {
            const target = prev.find(f => f.id === id);
            if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
            if (target?.result?.blob) URL.revokeObjectURL(URL.createObjectURL(target.result.blob));
            return prev.filter((f) => f.id !== id);
        });
    };

    const calculateRatioHeight = (newWidth: string, originalW: number, originalH: number) => {
        if (!newWidth || !originalW || !originalH) return "";
        return Math.round((parseInt(newWidth) * originalH) / originalW).toString();
    };

    const convertFiles = async () => {
        if (files.length === 0) return;
        setIsProcessing(true);
        toast.info("Iniciando conversão...");

        const baseOptions: ConversionOptions = {
            format,
            quality: quality[0] / 100,
            resizeOption,
            customWidth: customWidth ? parseInt(customWidth) : undefined,
            customHeight: customHeight ? parseInt(customHeight) : undefined,
            webpLossless,
            webpAlpha,
            jpegProgressive,
            pngAlpha,
            svgOptimize,
            svgPrecision: parseInt(svgPrecision),
            icoTransparent,
            icoAllFormats,
            icoSizes: icoSizes.map(s => parseInt(s)),
        };

        const newFiles = [...files];

        for (let i = 0; i < newFiles.length; i++) {
            if (newFiles[i].status === "completed") continue;

            newFiles[i].status = "processing";
            setFiles([...newFiles]);

            try {
                const result = await convertImageFile(newFiles[i].file, newFiles[i].file.name, baseOptions);
                newFiles[i].status = "completed";
                newFiles[i].result = result;

                addEntry({
                    originalName: newFiles[i].file.name,
                    originalType: newFiles[i].file.type,
                    originalSize: newFiles[i].file.size,
                    originalWidth: newFiles[i].originalWidth,
                    originalHeight: newFiles[i].originalHeight,
                    convertedName: result.name,
                    convertedType: result.type,
                    convertedSize: result.blob.size,
                    convertedWidth: result.width,
                    convertedHeight: result.height,
                    convertedBlob: result.blob, // Temporal for UI
                });
            } catch (e: any) {
                newFiles[i].status = "error";
                newFiles[i].error = e.message;
                toast.error(`Falha ao converter ${newFiles[i].file.name}`);
            }

            setFiles([...newFiles]);
        }

        setIsProcessing(false);
        toast.success("Conversão finalizada!");
    };

    const downloadFile = (fileItem: ProcessedFile) => {
        if (fileItem.result) {
            saveAs(fileItem.result.blob, fileItem.result.name);
        }
    };

    const downloadAll = async () => {
        const completed = files.filter(f => f.status === "completed" && f.result);
        if (completed.length === 0) return;

        if (completed.length === 1) {
            downloadFile(completed[0]);
            return;
        }

        // Use JSZip for multiple
        const zip = new JSZip();
        completed.forEach(f => {
            zip.file(f.result!.name, f.result!.blob);
        });

        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, "imagens_convertidas.zip");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Dropzone & List */}
            <div className="lg:col-span-2 flex flex-col gap-6">

                {/* Drop Zone */}
                <label
                    className={`flex-1 border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer group relative overflow-hidden ${isDragging
                        ? "border-primary bg-primary/10 scale-[1.01] shadow-lg shadow-primary/10"
                        : "border-slate-300/60 bg-white/40 hover:border-primary/50 hover:bg-white/60 active:scale-[0.99] dark:border-border dark:bg-muted/20"
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        id="file-upload"
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        multiple
                        accept="image/png, image/jpeg, image/webp, image/avif"
                        onChange={handleFileInput}
                    />
                    <div className={`h-16 w-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4 transition-transform duration-300 ${isDragging ? "scale-110 bg-primary/20" : "group-hover:scale-110"}`}>
                        <UploadCloud className={`h-8 w-8 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                    </div>
                    <h3 className="text-lg font-bold tracking-tight">Arraste suas imagens aqui</h3>
                    <p className="text-sm text-foreground/60 mb-6 max-w-[240px] mx-auto">Suporte para PNG, JPEG, WebP e AVIF</p>
                    <span className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all group-hover:bg-primary/90 active:scale-95">
                        Ou selecione arquivos
                    </span>
                </label>

                {/* File List */}
                {files.length > 0 && (
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">Fila de Processamento ({files.length})</h3>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setFiles([])} disabled={isProcessing}>Limpar Tudo</Button>
                                {files.some(f => f.status === "completed") && (
                                    <Button variant="secondary" size="sm" onClick={downloadAll}>Baixar Concluídos</Button>
                                )}
                            </div>
                        </div>

                        {files.map(f => (
                            <Card key={f.id} className="overflow-hidden">
                                <div className="flex items-center p-3 gap-4">
                                    <div className="h-14 w-14 rounded bg-muted bg-cover bg-center shrink-0 border" style={{ backgroundImage: `url(${f.previewUrl})` }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{f.file.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{formatFileSize(f.file.size)}</span>
                                            <span>•</span>
                                            <span>{f.originalWidth}x{f.originalHeight}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        {f.status === "pending" && <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">Pendente</span>}
                                        {f.status === "processing" && <span className="text-xs font-medium text-blue-500 bg-blue-500/10 px-2 py-1 rounded">Processando...</span>}
                                        {f.status === "error" && <span className="text-xs font-medium text-red-500 bg-red-500/10 px-2 py-1 rounded">Erro</span>}
                                        {f.status === "completed" && (
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-medium text-green-600 bg-green-500/10 px-2 py-1 rounded flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" /> Concluído
                                                </span>
                                                {f.result && <span className="text-xs mt-1 text-muted-foreground">{formatFileSize(f.result.blob.size)}</span>}
                                            </div>
                                        )}

                                        {f.status === "completed" ? (
                                            <Button variant="ghost" size="icon" onClick={() => downloadFile(f)}>
                                                <Download className="h-4 w-4 text-green-600" />
                                            </Button>
                                        ) : (
                                            <Button variant="ghost" size="icon" onClick={() => removeFile(f.id)} disabled={isProcessing}>
                                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Column: Settings */}
            <div className="flex flex-col gap-6">
                <Card className="sticky top-24">
                    <CardHeader className="pb-4">
                        <CardTitle>Configurações</CardTitle>
                        <CardDescription>Ajuste os parâmetros antes de converter</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="space-y-3 relative">
                            <label className="text-sm font-medium">Formato de Saída</label>
                            <div className="relative">
                                <select
                                    className="flex appearance-none h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={format}
                                    onChange={(e) => setFormat(e.target.value as ConversionFormat)}
                                >
                                    <option value="webp">WebP (Recomendado na web)</option>
                                    <option value="avif">AVIF (Nova Geração)</option>
                                    <option value="jpeg">JPEG (Fotografias)</option>
                                    <option value="png">PNG (Fundo Transparente)</option>
                                    <option value="ico">ICO / Favicon</option>
                                    <option value="svg">SVG (Vetorização Simples)</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                            </div>
                        </div>

                        {/* Quality Slider (for applicable formats) */}
                        {['webp', 'jpeg', 'avif'].includes(format) && !webpLossless && (
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <label className="text-sm font-medium">Qualidade</label>
                                    <span className="text-sm text-muted-foreground">{quality[0]}%</span>
                                </div>
                                <Slider
                                    value={quality}
                                    onValueChange={setQuality}
                                    max={100}
                                    step={1}
                                />
                            </div>
                        )}

                        {/* Resize block */}
                        <div className="space-y-3 border-t pt-4 relative">
                            <label className="text-sm font-medium">Redimensionamento</label>
                            <div className="relative">
                                <select
                                    className="flex appearance-none h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={resizeOption}
                                    onChange={(e) => setResizeOption(e.target.value as ResizeOption)}
                                >
                                    <option value="original">Manter Original</option>
                                    <option value="custom">Tamanho Personalizado</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                            </div>

                            {resizeOption === "custom" && (
                                <div className="flex gap-2 items-center mt-2">
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            placeholder="Largura"
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                            value={customWidth}
                                            onChange={(e) => {
                                                setCustomWidth(e.target.value);
                                                if (maintainAspectRatio && files.length > 0) {
                                                    setCustomHeight(calculateRatioHeight(e.target.value, files[0].originalWidth, files[0].originalHeight));
                                                }
                                            }}
                                        />
                                    </div>
                                    <span className="text-muted-foreground">x</span>
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            placeholder="Altura"
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                            value={customHeight}
                                            onChange={(e) => {
                                                setCustomHeight(e.target.value);
                                                if (maintainAspectRatio && files.length > 0) {
                                                    setCustomWidth(calculateRatioHeight(e.target.value, files[0].originalHeight, files[0].originalWidth));
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Format Specific Options */}
                        <div className="space-y-3 border-t pt-4">

                            {format === "webp" && (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 text-sm font-semibold text-foreground cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input type="checkbox" checked={webpLossless} onChange={e => setWebpLossless(e.target.checked)} className="h-4.5 w-4.5 rounded-md border-slate-300 accent-blue-600 transition-all focus:ring-2 focus:ring-blue-500/20" />
                                        </div>
                                        <span>Compressão sem perdas (Lossless)</span>
                                    </label>
                                    <label className="flex items-center gap-3 text-sm font-semibold text-foreground cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input type="checkbox" checked={webpAlpha} onChange={e => setWebpAlpha(e.target.checked)} className="h-4.5 w-4.5 rounded-md border-slate-300 accent-blue-600 transition-all focus:ring-2 focus:ring-blue-500/20" />
                                        </div>
                                        <span>Preservar transparência</span>
                                    </label>
                                </div>
                            )}

                            {format === "ico" && (
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2.5 text-sm font-medium text-foreground/80 cursor-pointer group">
                                        <input type="checkbox" checked={icoAllFormats} onChange={e => setIcoAllFormats(e.target.checked)} className="h-4 w-4 rounded border-input accent-primary shrink-0 transition-all focus:ring-primary/20" />
                                        <span>Criar pacote completo de Favicon (ZIP)</span>
                                    </label>
                                    {!icoAllFormats && (
                                        <div className="space-y-2">
                                            <label className="text-sm text-muted-foreground">Tamanhos ICO (Select múltiplos com Ctrl)</label>
                                            <select
                                                multiple
                                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={icoSizes}
                                                onChange={(e) => setIcoSizes(Array.from(e.target.selectedOptions, option => option.value))}
                                            >
                                                <option value="16">16x16</option>
                                                <option value="32">32x32</option>
                                                <option value="48">48x48</option>
                                                <option value="64">64x64</option>
                                                <option value="128">128x128</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>

                    </CardContent>
                    <CardFooter className="bg-muted/30 pt-4 rounded-b-xl border-t">
                        <Button
                            className="w-full font-semibold"
                            size="lg"
                            onClick={convertFiles}
                            disabled={isProcessing || files.length === 0 || files.every(f => f.status === "completed")}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processando...
                                </>
                            ) : `Converter ${files.filter(f => f.status !== "completed").length} arquivo(s)`}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
