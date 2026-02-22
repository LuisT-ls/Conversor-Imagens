"use client";

import * as React from "react";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { useHistory } from "@/hooks/use-history";

// Dynamically import the image editor because it uses Fabric (depends on window/document)
const ImageEditor = dynamic(() => import("./ImageEditor"), {
    ssr: false,
    loading: () => <div className="animate-pulse h-[600px] w-full bg-muted rounded-xl" />
});

export function EditorFeature() {
    const { addEntry } = useHistory();

    const handleSave = async (blob: Blob) => {
        const fileName = `imagem-editada-${Date.now()}.png`;

        const url = URL.createObjectURL(blob);
        const dimensions = await new Promise<{ w: number, h: number }>((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ w: img.width, h: img.height });
            img.onerror = () => resolve({ w: 0, h: 0 });
            img.src = url;
        });

        saveAs(blob, fileName);

        // Add to history
        addEntry({
            originalName: "imagem-editada.png", // Fabric loses original name after converting
            originalType: "image/png",
            originalSize: blob.size,
            originalWidth: dimensions.w,
            originalHeight: dimensions.h,
            convertedName: fileName,
            convertedType: "image/png",
            convertedSize: blob.size,
            convertedWidth: dimensions.w,
            convertedHeight: dimensions.h,
            convertedBlob: blob,
        });

        toast.success("Imagem baixada e adicionada ao histórico!");
    };

    return (
        <div className="w-full">
            <ImageEditor onSave={handleSave} />
        </div>
    );
}
