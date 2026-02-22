import { toast } from "sonner";

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function calculateCompression(originalSize: number, convertedSize: number): string {
    if (originalSize === 0) return "0%";
    const percentage = ((1 - convertedSize / originalSize) * 100).toFixed(1);
    if (Number(percentage) < 0) {
        return `+${Math.abs(Number(percentage))}%`;
    }
    return `-${percentage}%`;
}

/**
 * Utiliza a API nativa Web Share se disponível para compartilhar blobs com outras aplicações.
 */
export async function shareFile(file: File | Blob, fileName: string, fallbackUrl?: string) {
    if (navigator.share) {
        // If it's a blob without name, wrap it in a File
        const fileObj = file instanceof File ? file : new File([file], fileName, { type: file.type });

        try {
            await navigator.share({
                title: "Compartilhar Imagem",
                text: "Confira esta imagem gerada no ImageStudio",
                files: [fileObj],
            });
            toast.success("Compatilhado com sucesso!");
            return true;
        } catch (error: any) {
            if (error.name !== "AbortError") {
                console.error("Erro ao compartilhar", error);
                toast.error("Erro ao tentar compartilhar. O arquivo pode ser muito grande.");
            }
            return false;
        }
    } else if (fallbackUrl) {
        // Copy URL to clipboard
        try {
            await navigator.clipboard.writeText(fallbackUrl);
            toast.success("Link copiado para a área de transferência!");
            return true;
        } catch (e) {
            toast.error("Não foi possível copiar o link.");
            return false;
        }
    } else {
        toast.warning("Seu navegador não suporta compartilhamento direto.", {
            description: "Por favor, faça o download da imagem manualmente."
        });
        return false;
    }
}

/**
 * Lê um arquivo retornando sua representação em Base64 (DataURL).
 */
export function readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                resolve(e.target.result as string);
            } else {
                reject(new Error("Falha ao ler o arquivo."));
            }
        };
        reader.onerror = () => reject(new Error("Erro ao carregar o arquivo."));
        reader.readAsDataURL(file);
    });
}

/**
 * Lê um arquivo retornando um objeto Image nativo.
 */
export function readAsImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Falha ao carregar a imagem."));
        img.src = url;
    });
}

/**
 * Realiza o download nativo de um Arquivo ou Blob sem necessitar do FileSaver.js.
 */
export function downloadFile(blob: Blob | File, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}
