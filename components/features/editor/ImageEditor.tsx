"use client";

import * as React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import * as fabric from "fabric";
import { Download, RefreshCw, Sun, Contrast, Droplets, RotateCw, FlipHorizontal, Settings, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { FileUploader } from "@/components/ui/file-uploader";
import { readFileAsDataURL } from "@/lib/image-utils";

interface ImageEditorProps {
    onSave?: (blob: Blob) => void;
}

export default function ImageEditor({ onSave }: ImageEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);

    const [originalImage, setOriginalImage] = useState<fabric.Image | null>(null);
    const [hasImage, setHasImage] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Filter states
    const [brightness, setBrightness] = useState([0]);
    const [contrast, setContrast] = useState([0]);
    const [saturation, setSaturation] = useState([0]);

    // Setup canvas
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const containerWidth = containerRef.current.clientWidth;
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: containerWidth,
            height: 500,
            backgroundColor: "transparent",
            preserveObjectStacking: true,
            selection: true,
        });

        setFabricCanvas(canvas);

        const handleResize = () => {
            if (containerRef.current) {
                const newWidth = containerRef.current.clientWidth;
                canvas.setDimensions({ width: newWidth, height: canvas.getHeight() });
                const img = canvas.getObjects()[0] as fabric.Image;
                if (img) canvas.centerObject(img);
                canvas.renderAll();
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            canvas.dispose();
        };
    }, []);

    const loadImage = async (file: File) => {
        if (!fabricCanvas) return;

        try {
            const dataUrl = await readFileAsDataURL(file);
            fabric.Image.fromURL(dataUrl).then((img: fabric.Image) => {
                const padding = 40;
                const scaleX = (fabricCanvas.width! - padding) / img.width!;
                const scaleY = (fabricCanvas.height! - padding) / img.height!;
                const scale = Math.min(scaleX, scaleY, 1);

                img.scale(scale);

                fabricCanvas.clear();
                fabricCanvas.backgroundColor = "transparent";
                fabricCanvas.add(img);
                fabricCanvas.centerObject(img);
                fabricCanvas.setActiveObject(img);

                setOriginalImage(img);
                setHasImage(true);
                resetControls();
                toast.success("Imagem carregada!");

                fabricCanvas.renderAll();
            }).catch(() => {
                toast.error("Erro interno ao renderizar a imagem.");
            });
        } catch (e: any) {
            toast.error(e.message || "Erro ao ler a imagem.");
        }
    };

    const handleFilesSelected = useCallback((files: File[]) => {
        if (files.length > 0) {
            loadImage(files[0]);
        }
    }, [fabricCanvas]); // eslint-disable-line react-hooks/exhaustive-deps

    const resetControls = () => {
        setBrightness([0]);
        setContrast([0]);
        setSaturation([0]);
    };

    const applyFilters = (newBright = brightness[0], newCont = contrast[0], newSat = saturation[0]) => {
        if (!fabricCanvas || !hasImage) return;

        const img = fabricCanvas.getObjects()[0] as fabric.Image;
        if (!img) return;

        img.filters = [];

        if (newBright !== 0) img.filters.push(new fabric.filters.Brightness({ brightness: newBright / 200 }));
        if (newCont !== 0) img.filters.push(new fabric.filters.Contrast({ contrast: newCont / 200 }));
        if (newSat !== 0) img.filters.push(new fabric.filters.Saturation({ saturation: newSat / 100 }));

        img.applyFilters();
        fabricCanvas.renderAll();
    };

    const handleBrightnessChange = (val: number[]) => {
        setBrightness(val);
        applyFilters(val[0], contrast[0], saturation[0]);
    };

    const handleContrastChange = (val: number[]) => {
        setContrast(val);
        applyFilters(brightness[0], val[0], saturation[0]);
    };

    const handleSaturationChange = (val: number[]) => {
        setSaturation(val);
        applyFilters(brightness[0], contrast[0], val[0]);
    };

    const handleRotate = () => {
        if (!fabricCanvas) return;
        const img = fabricCanvas.getActiveObject();
        if (img) {
            img.rotate((img.angle || 0) + 90);
            fabricCanvas.renderAll();
        }
    };

    const handleFlip = () => {
        if (!fabricCanvas) return;
        const img = fabricCanvas.getActiveObject();
        if (img) {
            img.set("flipX", !img.flipX);
            fabricCanvas.renderAll();
        }
    };

    const resetEditorData = () => {
        if (!fabricCanvas || !originalImage) return;

        if (confirm("Deseja desfazer todas as edições?")) {
            fabricCanvas.clear();
            resetControls();

            originalImage.clone().then((cloned: fabric.Image) => {
                fabricCanvas.add(cloned);
                fabricCanvas.centerObject(cloned);
                fabricCanvas.setActiveObject(cloned);
                fabricCanvas.renderAll();
            });
        }
    };

    const handleExport = () => {
        if (!fabricCanvas) return;
        setIsExporting(true);
        toast.info("Processando imagem para exportação...");

        fabricCanvas.discardActiveObject();
        fabricCanvas.renderAll();

        const img = fabricCanvas.getObjects()[0] as fabric.Image;
        if (!img) {
            setIsExporting(false);
            return;
        }

        const rect = img.getBoundingRect();
        const dataURL = fabricCanvas.toDataURL({
            format: "png",
            multiplier: 2, // Export with higher quality
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
        });

        fetch(dataURL)
            .then(res => res.blob())
            .then(blob => {
                if (onSave) onSave(blob);
                setIsExporting(false);
            })
            .catch(() => {
                toast.error("Erro ao exportar a imagem.");
                setIsExporting(false);
            });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 flex flex-col gap-4">
                {/* Editor Area */}
                <div
                    ref={containerRef}
                    className="w-full bg-muted/30 border rounded-xl overflow-hidden relative min-h-[500px] flex items-center justify-center transition-colors"
                >
                    {!hasImage && (
                        <div className="absolute inset-0 z-10 p-6 flex items-center justify-center">
                            <div className="w-full max-w-md">
                                <FileUploader
                                    onFilesSelected={handleFilesSelected}
                                    label="Arraste uma imagem para o editor"
                                    icon={<ImageIcon className="h-8 w-8 text-muted-foreground" />}
                                />
                            </div>
                        </div>
                    )}
                    <canvas ref={canvasRef} className={hasImage ? "z-20" : "opacity-0 pointer-events-none absolute"} />
                </div>
            </div>

            <div className="flex flex-col gap-6">
                <Card className="sticky top-24">
                    {hasImage ? (
                        <div className="p-4 space-y-6">
                            <div>
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <Settings className="w-5 h-5" /> Ajustes
                                </h3>
                                <div className="space-y-5">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="flex items-center gap-2 text-muted-foreground"><Sun className="w-4 h-4" /> Brilho</span>
                                            <span>{brightness[0]}</span>
                                        </div>
                                        <Slider value={brightness} max={100} min={-100} step={1} onValueChange={handleBrightnessChange} />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="flex items-center gap-2 text-muted-foreground"><Contrast className="w-4 h-4" /> Contraste</span>
                                            <span>{contrast[0]}</span>
                                        </div>
                                        <Slider value={contrast} max={100} min={-100} step={1} onValueChange={handleContrastChange} />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="flex items-center gap-2 text-muted-foreground"><Droplets className="w-4 h-4" /> Saturação</span>
                                            <span>{saturation[0]}</span>
                                        </div>
                                        <Slider value={saturation} max={100} min={-100} step={1} onValueChange={handleSaturationChange} />
                                    </div>
                                </div>
                            </div>

                            <hr />

                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">Transformação</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" onClick={handleRotate}><RotateCw className="w-4 h-4 mr-2" /> 90º</Button>
                                    <Button variant="outline" size="sm" onClick={handleFlip}><FlipHorizontal className="w-4 h-4 mr-2" /> Espelhar</Button>
                                </div>
                            </div>

                            <div className="pt-2 flex flex-col gap-2">
                                <Button className="w-full font-bold" onClick={handleExport} disabled={isExporting}>
                                    {isExporting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Exportando...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4 mr-2" /> Aplicar e Exportar
                                        </>
                                    )}
                                </Button>
                                <Button variant="outline" className="w-full text-red-500 hover:text-red-600" onClick={resetEditorData}>
                                    <RefreshCw className="w-4 h-4 mr-2" /> Desfazer Tudo
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 text-center text-muted-foreground text-sm">
                            Carregue uma imagem no quadro para visualizar as ferramentas de edição.
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
