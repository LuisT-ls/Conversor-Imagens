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
                id="file-uploader-comp"
                type="file"
                multiple={multiple}
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept={accept}
                onChange={handleFileInput}
            />
            <div className={`h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6 transition-transform duration-300 ${isDragging ? "scale-110 bg-primary/20" : "group-hover:scale-110"}`}>
                <div className={`transition-colors ${isDragging ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>
                    {icon}
                </div>
            </div>
            <h3 className="text-xl font-bold tracking-tight">{label}</h3>
            <p className="text-sm text-foreground/60 mb-8 max-w-[280px]">{subtext}</p>
            <span className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all group-hover:bg-primary/90 active:scale-95">
                Selecionar Arquivo
            </span>
        </label>
    );
}
