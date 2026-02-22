import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { JsonLd } from "@/components/json-ld";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://conversor-imagens.vercel.app"),
  title: {
    template: "%s | ImageStudio",
    default: "ImageStudio | Ferramentas Gratuitas de Imagem",
  },
  description: "Converta, comprima e edite suas imagens de forma rápida e segura. Ferramenta gratuita, 100% offline e com total foco na privacidade dos dados.",
  applicationName: "ImageStudio",
  keywords: ["conversor de imagens", "webp", "avif", "privacidade offline", "image editor pwa", "compressor de imagens"],
  authors: [{ name: "ImageStudio Team" }],
  creator: "Luis",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://conversor-imagens.vercel.app",
    title: "ImageStudio | Conversor de Imagens Grátis",
    description: "Converta, comprima e edite suas imagens de forma rápida e segura. Ferramenta gratuita, 100% offline e com total foco na privacidade dos dados.",
    siteName: "ImageStudio",
  },
  twitter: {
    card: "summary_large_image",
    title: "ImageStudio | Ferramentas Gratuitas",
    description: "Converta, comprima e edite suas imagens de forma rápida e segura. Ferramenta gratuita, 100% offline e com total foco na privacidade dos dados.",
  },
  alternates: {
    canonical: "/",
    languages: {
      "pt-BR": "/",
      "x-default": "/",
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <JsonLd />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
