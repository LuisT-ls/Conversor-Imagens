"use client";

import * as React from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
    onFilesSelected: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    label?: string;
    subtext?: string;
    icon?: React.ReactNode;
}

export function FileUploader({
    onFilesSelected,
    accept = "image/png, image/jpeg, image/webp",
    multiple = false,
    label = "Arraste sua imagem aqui",
    subtext = "JPG, PNG, WEBP suportados",
    icon = <UploadCloud className="h-8 w-8 text-muted-foreground" />,
}: FileUploaderProps) {
    const [isDragging, setIsDragging] = React.useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesSelected(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(Array.from(e.target.files));
        }
        e.target.value = ""; // Reset value for onChange
    };

    return (
        <div
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors min-h-[400px] flex flex-col items-center justify-center ${isDragging ? "border-primary bg-primary/5" : "border-border bg-muted/20"
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-semibold">{label}</h3>
            <p className="text-sm text-muted-foreground mb-4">{subtext}</p>
            <Button asChild onClick={() => document.getElementById("file-uploader-comp")?.click()}>
                <span>
                    Selecionar Arquivos
                    <input
                        id="file-uploader-comp"
                        type="file"
                        multiple={multiple}
                        className="hidden"
                        accept={accept}
                        onChange={handleFileInput}
                    />
                </span>
            </Button>
        </div>
    );
}
