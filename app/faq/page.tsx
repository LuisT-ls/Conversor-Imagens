import { UiShell } from "@/components/ui-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FAQPage() {
    const faqs = [
        {
            question: "O ImageStudio é realmente 100% privado?",
            answer: "Sim! Todo o processamento de imagens (conversão, edição e compressão) é realizado diretamente no seu navegador, utilizando a memória e processamento local do seu dispositivo. Nenhuma imagem é enviada para nossos servidores."
        },
        {
            question: "Quais formatos de imagem são suportados?",
            answer: "Suportamos os formatos mais comuns de imagem, incluindo JPEG, PNG, WebP, GIF, BMP, TIFF, SVG e ICO."
        },
        {
            question: "Existe limite de tamanho para as imagens?",
            answer: "Devido ao processamento ocorrer no navegador, estabelecemos um limite recomendado de 50MB por imagem para evitar travamentos, especialmente em dispositivos móveis ou com pouca memória RAM."
        },
        {
            question: "A conversão em lote suporta quantos arquivos?",
            answer: "Você pode converter dezenas de imagens simultaneamente. No entanto, para melhor desempenho, recomendamos lotes de até 50 imagens por vez."
        },
        {
            question: "Meus dispositivos móveis (smartphone/tablet) são suportados?",
            answer: "Sim, o ImageStudio é totalmente responsivo e funciona em dispositivos móveis. Apenas atente-se ao tamanho das imagens, pois smartphones geralmente possuem menos memória para processamento em lote."
        },
        {
            question: "Como funciona a geração de Favicons?",
            answer: "Nossa ferramenta de Favicons gera automaticamente múltiplos tamanhos (16x16, 32x32, 192x192, 512x512, apple-touch-icon.png) e um arquivo webmanifest a partir de uma única imagem, empacotando tudo em um arquivo ZIP prático para download."
        },
        {
            question: "É grátis mesmo?",
            answer: "Sim! O ImageStudio é um projeto open-source e totalmente gratuito, sem anúncios agressivos, marcas d'água ou assinaturas ocultas."
        }
    ];

    return (
        <UiShell>
            <div className="max-w-4xl mx-auto py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-4">Perguntas Frequentes (FAQ)</h1>
                    <p className="text-xl text-muted-foreground">Tudo o que você precisa saber sobre o ImageStudio.</p>
                </div>

                <div className="grid gap-6">
                    {faqs.map((faq, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <CardTitle className="text-lg">{faq.question}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-12 text-center p-8 bg-muted/50 rounded-xl border">
                    <h3 className="text-lg font-semibold mb-2">Ainda tem dúvidas?</h3>
                    <p className="text-muted-foreground mb-4">Caso tenha encontrado um bug ou tenha outras dúvidas técnicas.</p>
                    <a href="#" className="font-semibold text-primary hover:underline">Entre em contato suporte@imagestudio.com</a>
                </div>
            </div>
        </UiShell>
    );
}
