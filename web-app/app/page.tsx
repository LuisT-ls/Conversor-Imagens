import { UiShell } from "@/components/ui-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ImageIcon, SlidersHorizontal, Minimize, ArrowRight, ShieldCheck, Zap, Scissors } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <UiShell>
      <div className="flex flex-col gap-10 pb-10">

        {/* Header Section */}
        <section className="flex flex-col gap-4 text-center items-center pt-8 pb-4">
          <div className="flex items-center justify-center bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <ShieldCheck className="w-4 h-4 mr-2" />
            100% Privado & Client-side
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Seu Estúdio de Imagens <span className="text-primary">Definitivo</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mt-4">
            Converta, edite e comprima suas imagens diretamente no navegador. Rápido, seguro e sem enviar nenhum dado para a nuvem.
          </p>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card: Conversor */}
          <Card className="flex flex-col transition-all hover:shadow-lg hover:border-blue-500/50 group bg-gradient-to-br from-background to-blue-500/5">
            <CardHeader>
              <div className="mb-4 w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 align-top group-hover:scale-110 transition-transform">
                <ImageIcon className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Conversor de Formatos</CardTitle>
              <CardDescription className="text-sm">
                Transforme imagens em WebP, PNG, JPEG, SVG ou gere pacotes completos de Favicons (ICO/PNG/Manifest).
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li className="flex items-center gap-2"><ArrowRight className="h-4 w-4 text-blue-500" /> Preservação de Transparência</li>
                <li className="flex items-center gap-2"><ArrowRight className="h-4 w-4 text-blue-500" /> Auto-redimensionamento</li>
                <li className="flex items-center gap-2"><ArrowRight className="h-4 w-4 text-blue-500" /> Processamento em Lote</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/conversor">Acessar Conversor</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Card: Editor */}
          <Card className="flex flex-col transition-all hover:shadow-lg hover:border-purple-500/50 group bg-gradient-to-br from-background to-purple-500/5">
            <CardHeader>
              <div className="mb-4 w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 align-top group-hover:scale-110 transition-transform">
                <SlidersHorizontal className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Editor Avançado</CardTitle>
              <CardDescription className="text-sm">
                Ajuste brilho, contraste, aplique filtros profissionais e faça marcações utilizando uma engine de Canvas poderosa.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li className="flex items-center gap-2"><Scissors className="h-4 w-4 text-purple-500" /> Crop, Rotação e Flip</li>
                <li className="flex items-center gap-2"><ArrowRight className="h-4 w-4 text-purple-500" /> Filtros do Instagram</li>
                <li className="flex items-center gap-2"><ArrowRight className="h-4 w-4 text-purple-500" /> Inserção de Texto e Logos</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                <Link href="/editor">Acessar Editor</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Card: Compressor */}
          <Card className="flex flex-col transition-all hover:shadow-lg hover:border-orange-500/50 group bg-gradient-to-br from-background to-orange-500/5">
            <CardHeader>
              <div className="mb-4 w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 align-top group-hover:scale-110 transition-transform">
                <Minimize className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Compressor Web</CardTitle>
              <CardDescription className="text-sm">
                Reduza o peso dos arquivos drasticamente para uso em websites e apps, mantendo a melhor qualidade visual possível.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-orange-500" /> Otimização por Algoritmo</li>
                <li className="flex items-center gap-2"><ArrowRight className="h-4 w-4 text-orange-500" /> Remoção de EXIF</li>
                <li className="flex items-center gap-2"><ArrowRight className="h-4 w-4 text-orange-500" /> Visualização Antes/Depois</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                <Link href="/compressor">Acessar Compressor</Link>
              </Button>
            </CardFooter>
          </Card>
        </section>

      </div>
    </UiShell>
  );
}
