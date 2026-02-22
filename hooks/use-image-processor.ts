"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { readFileAsDataURL, readAsImage, downloadFile } from "@/lib/image-utils";
import { convertImageFile, ConversionOptions, ConvertedImageData } from "@/lib/image-processing";
import { useHistory } from "@/hooks/use-history";

export function useImageProcessor() {
    const { addEntry } = useHistory();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Valida um arquivo para garantir que seja uma imagem suportada
     */
    const validateImageFile = useCallback((file: File, maxSizeMB: number = 50): boolean => {
        if (!file.type.startsWith("image/")) {
            toast.error(`O arquivo ${file.name} não é uma imagem suportada.`);
            return false;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.error(`A imagem ${file.name} excede o limite de ${maxSizeMB}MB.`);
            return false;
        }

        return true;
    }, []);

    /**
     * Executa a conversão base de uma imagem
     */
    const convert = useCallback(async (
        file: File,
        options: ConversionOptions
    ): Promise<ConvertedImageData | null> => {
        setIsProcessing(true);
        setError(null);
        try {
            const result = await convertImageFile(file, file.name, options);

            // Adiciona no histórico
            addEntry({
                originalName: file.name,
                originalType: file.type,
                originalSize: file.size,
                convertedName: result.name,
                convertedType: result.type,
                convertedSize: result.blob.size,
                convertedBlob: result.blob,
            });

            return result;
        } catch (err: any) {
            console.error("Erro na conversão:", err);
            setError(err.message || "Falha ao converter imagem");
            toast.error("Erro durante a conversão", { description: err.message });
            return null;
        } finally {
            setIsProcessing(false);
        }
    }, [addEntry]);

    /**
     * Expõe nativos no hook para conforto
     */
    return {
        isProcessing,
        error,
        validateImageFile,
        convert,
        downloadFile,
        readFileAsDataURL,
        readAsImage,
    };
}
