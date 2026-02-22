import type { Metadata } from "next";
import { UiShell } from "@/components/ui-shell";

export const metadata: Metadata = {
    title: "Documentação Oficial",
    description: "Aprenda a usar todas as ferramentas do ImageStudio: conversor, editor e compressor de imagens.",
    alternates: {
        canonical: "/documentacao",
        languages: { "pt-BR": "/documentacao", "x-default": "/documentacao" },
    },
};

export default function DocumentacaoPage() {
    return (
        <UiShell>
            <div className="max-w-4xl mx-auto py-8 prose prose-slate dark:prose-invert">
                <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-foreground">Documentação Oficial</h1>
                <p className="text-xl text-muted-foreground mb-8">Aprenda como utilizar todas as ferramentas do ImageStudio.</p>

                <div className="space-y-12 text-foreground">
                    {/* Conversor Section */}
                    <section>
                        <h2 className="text-2xl font-bold border-b pb-2 mb-4">1. Conversor de Formatos</h2>
                        <p className="mb-4">O Conversor permite transformar imagens de um formato para outro sem a necessidade de enviar o arquivo pela internet.</p>
                        <h3 className="text-xl font-semibold mb-2">Formatos Suportados</h3>
                        <ul className="list-disc pl-5 space-y-2 mb-4">
                            <li><strong>WebP:</strong> Recomendado para a internet. Oferece alta qualidade com tamanhos de arquivo extremamente reduzidos.</li>
                            <li><strong>JPEG/JPG:</strong> Ideal para fotografias complexas. Não suporta fundos transparentes.</li>
                            <li><strong>PNG:</strong> Excelente para gráficos simples, logotipos e quando a preservação de transparência é exigida.</li>
                            <li><strong>ICO / Favicons:</strong> Permite criar pacotes prontos (.ico, ícones de maçã, manifestos) para serem usados em sites.</li>
                            <li><strong>SVG:</strong> O sistema realiza uma conversão básica para vetor incorporando uma dataURL otimizada.</li>
                        </ul>
                        <h3 className="text-xl font-semibold mb-2">Processamento em Lote</h3>
                        <p>Arraste múltiplos arquivos para a zona tracejada. Você poderá definir regras globais (como WebP para todos) e redimensionar todos simultaneamente, clicando posteriormente em "Baixar todos".</p>
                    </section>

                    {/* Editor Section */}
                    <section>
                        <h2 className="text-2xl font-bold border-b pb-2 mb-4">2. Editor de Imagens</h2>
                        <p className="mb-4">Nossa suíte de edição baseada na biblioteca Fabric.js.</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Controles Básicos:</strong> Controle preciso sobre nível de Brilho, Contraste e Saturação da imagem selecionada.</li>
                            <li><strong>Transformações:</strong> Girar a imagem em incrementos de 90 graus e espelhar ela horizontalmente em um clique.</li>
                            <li><strong>Download do Canvas:</strong> Após concluir a arte, você pode clicar em "Salvar Imagem" para baixar uma versão em altíssima qualidade contendo todos os filtros visuais combinados.</li>
                        </ul>
                    </section>

                    {/* Compressor Section */}
                    <section>
                        <h2 className="text-2xl font-bold border-b pb-2 mb-4">3. Compressor (Redutor de Tamanho)</h2>
                        <p className="mb-4">Se você tem fotos muito grandes e precisa inseri-las em sites ou sistemas governamentais, o compressor é a ferramenta correta.</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Qualidade Variável:</strong> Determine um percentual de qualidade (ex: 70%). Imagens JPEG e WebP sentem a alteração significativamente sem perdas agressivas na nitidez.</li>
                            <li><strong>Tamanho Alvo (Target Size):</strong> Essa ferramenta exclusiva permite digitar "500KB". O algorítmo local testará rapidamente configurações ocultas para lhe entregar a imagem com qualidade máxima que ainda não ultrapasse 500KB.</li>
                            <li><strong>Comparação em Tempo Real:</strong> Um painel lado a lado comprova a mudança de cor, as possíveis perdas visuais e o tamanho em bytes exato da diferença percorrida.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold border-b pb-2 mb-4">4. Dicas de Uso & Privacidade</h2>
                        <p>Por ser uma ferramenta 100% Client-Side, <strong>nunca feche ou recarregue a aba do navegador</strong> enquanto o processamento estiver ocorrendo. Operações complexas como converter 100 imagens de alta definição podem levar alguns minutos do seu processador.</p>
                    </section>
                </div>
            </div>
        </UiShell>
    );
}
