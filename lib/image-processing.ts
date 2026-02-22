"use client";

import JSZip from "jszip";

// --- Types ---
export type ConversionFormat = "webp" | "jpeg" | "png" | "svg" | "ico" | "avif";
export type ResizeOption = "original" | "custom";

export interface ConversionOptions {
    format: ConversionFormat;
    quality: number; // 0 to 1
    resizeOption: ResizeOption;
    customWidth?: number;
    customHeight?: number;
    // Format specific
    webpLossless?: boolean;
    webpAlpha?: boolean;
    jpegProgressive?: boolean;
    pngAlpha?: boolean;
    svgPrecision?: number;
    svgOptimize?: boolean;
    icoSizes?: number[];
    icoTransparent?: boolean;
    icoAllFormats?: boolean; // JSZip build
}

export interface ConvertedImageData {
    blob: Blob;
    type: string;
    width: number;
    height: number;
    name: string;
    isFaviconPackage?: boolean;
}

// --- Utils ---
function getMimeType(format: ConversionFormat): string {
    switch (format) {
        case "webp": return "image/webp";
        case "jpeg": return "image/jpeg";
        case "png": return "image/png";
        case "svg": return "image/svg+xml";
        case "ico": return "image/x-icon";
        case "avif": return "image/avif";
        default: return "image/png";
    }
}

// --- Main Conversion entry ---
export async function convertImageFile(
    file: File,
    originalName: string,
    options: ConversionOptions
): Promise<ConvertedImageData> {
    const imgUrl = URL.createObjectURL(file);

    try {
        const img = new Image();
        const imageLoaded = new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("Failed to load image for conversion"));
            img.src = imgUrl;
        });

        await imageLoaded;

        let width = img.width;
        let height = img.height;

        if (options.resizeOption === "custom" && options.customWidth && options.customHeight) {
            width = options.customWidth;
            height = options.customHeight;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not get 2D context");

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        let result: ConvertedImageData;

        switch (options.format) {
            case "webp":
                result = await convertToWebP(canvas, options, originalName);
                break;
            case "jpeg":
                result = await convertToJPEG(canvas, options, originalName);
                break;
            case "png":
                result = await convertToPNG(canvas, options, originalName);
                break;
            case "svg":
                result = await convertToSVG(canvas, options, originalName);
                break;
            case "ico":
                if (options.icoAllFormats) {
                    result = await createAllFaviconFormats(canvas, options, originalName);
                } else {
                    result = await convertToICO(canvas, options, originalName);
                }
                break;
            case "avif":
                result = await convertToAVIF(canvas, options, originalName);
                break;
            default:
                throw new Error(`Format ${options.format} not supported`);
        }

        return result;
    } finally {
        URL.revokeObjectURL(imgUrl);
    }
}

// --- Specific Converters ---
async function convertToWebP(canvas: HTMLCanvasElement, options: ConversionOptions, originalName: string): Promise<ConvertedImageData> {
    return new Promise((resolve, reject) => {
        const quality = options.webpLossless ? 1 : options.quality;
        canvas.toBlob((blob) => {
            if (!blob) return reject(new Error("WebP conversion failed"));
            resolve({
                blob,
                type: "image/webp",
                width: canvas.width,
                height: canvas.height,
                name: generateFileName(originalName, "webp")
            });
        }, "image/webp", quality);
    });
}

async function convertToAVIF(canvas: HTMLCanvasElement, options: ConversionOptions, originalName: string): Promise<ConvertedImageData> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) return reject(new Error("AVIF conversion failed (verifique se seu navegador suporta a exportação AVIF)"));
            resolve({
                blob,
                type: "image/avif",
                width: canvas.width,
                height: canvas.height,
                name: generateFileName(originalName, "avif")
            });
        }, "image/avif", options.quality);
    });
}

async function convertToJPEG(canvas: HTMLCanvasElement, options: ConversionOptions, originalName: string): Promise<ConvertedImageData> {
    return new Promise((resolve, reject) => {
        const jpegCanvas = document.createElement("canvas");
        jpegCanvas.width = canvas.width;
        jpegCanvas.height = canvas.height;
        const ctx = jpegCanvas.getContext("2d")!;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, jpegCanvas.width, jpegCanvas.height);
        ctx.drawImage(canvas, 0, 0);

        jpegCanvas.toBlob((blob) => {
            if (!blob) return reject(new Error("JPEG conversion failed"));
            resolve({
                blob,
                type: "image/jpeg",
                width: canvas.width,
                height: canvas.height,
                name: generateFileName(originalName, "jpg")
            });
        }, "image/jpeg", options.quality);
    });
}

async function convertToPNG(canvas: HTMLCanvasElement, options: ConversionOptions, originalName: string): Promise<ConvertedImageData> {
    return new Promise((resolve, reject) => {
        let pngCanvas = canvas;
        if (options.pngAlpha === false) {
            pngCanvas = document.createElement("canvas");
            pngCanvas.width = canvas.width;
            pngCanvas.height = canvas.height;
            const ctx = pngCanvas.getContext("2d")!;
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, pngCanvas.width, pngCanvas.height);
            ctx.drawImage(canvas, 0, 0);
        }

        pngCanvas.toBlob((blob) => {
            if (!blob) return reject(new Error("PNG conversion failed"));
            resolve({
                blob,
                type: "image/png",
                width: canvas.width,
                height: canvas.height,
                name: generateFileName(originalName, "png")
            });
        }, "image/png");
    });
}

async function convertToSVG(canvas: HTMLCanvasElement, options: ConversionOptions, originalName: string): Promise<ConvertedImageData> {
    // Simplest conversion: embed image as DataURL in SVG
    const dataUrl = canvas.toDataURL("image/png");
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${canvas.width} ${canvas.height}" width="${canvas.width}" height="${canvas.height}">
    <image width="${canvas.width}" height="${canvas.height}" xlink:href="${dataUrl}"/>
  </svg>`;

    const blob = new Blob([svgString], { type: "image/svg+xml" });
    return {
        blob,
        type: "image/svg+xml",
        width: canvas.width,
        height: canvas.height,
        name: generateFileName(originalName, "svg")
    };
}

async function convertToICO(canvas: HTMLCanvasElement, options: ConversionOptions, originalName: string): Promise<ConvertedImageData> {
    const sizes = options.icoSizes && options.icoSizes.length > 0 ? options.icoSizes : [16, 32, 48];

    const pngPromises = sizes.map((size) => {
        const iconCanvas = document.createElement("canvas");
        iconCanvas.width = size;
        iconCanvas.height = size;
        const ctx = iconCanvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(canvas, 0, 0, size, size);

        return new Promise<ArrayBuffer>((resolve, reject) => {
            iconCanvas.toBlob((blob) => {
                if (!blob) return reject(new Error("Failed to create PNG for ICO"));
                blob.arrayBuffer().then(resolve).catch(reject);
            }, "image/png");
        });
    });

    const pngBuffers = await Promise.all(pngPromises);

    // ICO file construction
    const header = new Uint8Array(6);
    header[0] = 0; header[1] = 0; header[2] = 1; header[3] = 0;
    header[4] = sizes.length; header[5] = 0;

    const directory = new Uint8Array(16 * sizes.length);
    let imageDataOffset = 6 + 16 * sizes.length;

    for (let i = 0; i < sizes.length; i++) {
        const size = sizes[i];
        const data = new Uint8Array(pngBuffers[i]);

        directory[i * 16] = size === 256 ? 0 : size;
        directory[i * 16 + 1] = size === 256 ? 0 : size;
        directory[i * 16 + 2] = 0; directory[i * 16 + 3] = 0;
        directory[i * 16 + 4] = 1; directory[i * 16 + 5] = 0;
        directory[i * 16 + 6] = 32; directory[i * 16 + 7] = 0;

        directory[i * 16 + 8] = data.length & 0xff;
        directory[i * 16 + 9] = (data.length >> 8) & 0xff;
        directory[i * 16 + 10] = (data.length >> 16) & 0xff;
        directory[i * 16 + 11] = (data.length >> 24) & 0xff;

        directory[i * 16 + 12] = imageDataOffset & 0xff;
        directory[i * 16 + 13] = (imageDataOffset >> 8) & 0xff;
        directory[i * 16 + 14] = (imageDataOffset >> 16) & 0xff;
        directory[i * 16 + 15] = (imageDataOffset >> 24) & 0xff;

        imageDataOffset += data.length;
    }

    const totalLength = 6 + 16 * sizes.length + pngBuffers.reduce((sum, b) => sum + b.byteLength, 0);
    const icoBuffer = new Uint8Array(totalLength);
    icoBuffer.set(header, 0);
    icoBuffer.set(directory, 6);

    let currentOffset = 6 + 16 * sizes.length;
    for (let i = 0; i < pngBuffers.length; i++) {
        const data = new Uint8Array(pngBuffers[i]);
        icoBuffer.set(data, currentOffset);
        currentOffset += data.length;
    }

    const blob = new Blob([icoBuffer], { type: "image/x-icon" });
    return {
        blob,
        type: "image/x-icon",
        width: canvas.width,
        height: canvas.height,
        name: generateFileName(originalName, "ico")
    };
}

async function createAllFaviconFormats(canvas: HTMLCanvasElement, options: ConversionOptions, originalName: string): Promise<ConvertedImageData> {
    const faviconSizes = [
        { name: 'favicon-16x16.png', size: 16 },
        { name: 'favicon-32x32.png', size: 32 },
        { name: 'android-chrome-192x192.png', size: 192 },
        { name: 'android-chrome-512x512.png', size: 512 },
        { name: 'apple-touch-icon.png', size: 180 }
    ];

    const zip = new JSZip();
    const faviconFolder = zip.folder("favicon")!;

    // Generate PNGs
    for (const favicon of faviconSizes) {
        const iconCanvas = document.createElement("canvas");
        iconCanvas.width = favicon.size;
        iconCanvas.height = favicon.size;
        const ctx = iconCanvas.getContext("2d")!;
        if (!options.icoTransparent) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, favicon.size, favicon.size);
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(canvas, 0, 0, favicon.size, favicon.size);

        const pngBlob = await new Promise<Blob>((resolve, reject) => {
            iconCanvas.toBlob((b) => b ? resolve(b) : reject(), "image/png");
        });
        faviconFolder.file(favicon.name, pngBlob);
    }

    // Generate ICO
    const icoResult = await convertToICO(canvas, options, originalName);
    faviconFolder.file("favicon.ico", icoResult.blob);

    // Generate Web Manifest
    const webManifest = {
        name: "Meu Site",
        short_name: "Site",
        icons: [
            { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
            { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
        ],
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone"
    };
    const manifestBlob = new Blob([JSON.stringify(webManifest, null, 2)], { type: "application/json" });
    faviconFolder.file("site.webmanifest", manifestBlob);

    const zipBlob = await zip.generateAsync({ type: "blob" });
    return {
        blob: zipBlob,
        type: "application/zip",
        width: canvas.width,
        height: canvas.height,
        name: `${originalName.split(".")[0]}-favicon-package.zip`,
        isFaviconPackage: true
    };
}

function generateFileName(originalName: string, format: string) {
    const baseName = originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
    return `${baseName}.${format}`;
}
