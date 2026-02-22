const BASE_URL = "https://conversor-imagens.vercel.app";

const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ImageStudio",
    url: BASE_URL,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web, Windows, macOS, Android, iOS",
    browserRequirements:
        "Requires JavaScript. Works in Chrome, Firefox, Safari, Edge",
    softwareVersion: "2.0.0",
    inLanguage: "pt-BR",
    description:
        "Ferramenta 100% gratuita, privada e client-side para conversão, compressão e edição offline de dezenas de formatos de imagem como WebP, AVIF, JPEG e SVG no seu navegador.",
    featureList: [
        "Conversor de formatos (WebP, PNG, JPEG, SVG, ICO/Favicon)",
        "Editor avançado com filtros, crop, rotação e ajustes de brilho/contraste",
        "Compressor inteligente com tamanho-alvo e comparação visual",
        "Processamento em lote de múltiplas imagens",
        "100% privado — processamento local no navegador",
        "Funciona offline como PWA",
        "Sem upload de dados para servidores externos",
    ],
    screenshot: `${BASE_URL}/image_converter_logo.svg`,
    offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock",
    },
    aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        bestRating: "5",
        worstRating: "1",
        ratingCount: "127",
    },
    author: {
        "@type": "Person",
        name: "Luis Tei",
    },
    publisher: {
        "@type": "Organization",
        name: "ImageStudio",
        url: BASE_URL,
    },
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        {
            "@type": "Question",
            name: "O ImageStudio é realmente gratuito?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Sim! O ImageStudio é 100% gratuito, sem anúncios agressivos, marcas d'água ou assinaturas ocultas. É um projeto open-source.",
            },
        },
        {
            "@type": "Question",
            name: "Minhas fotos são enviadas para a nuvem?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Não. Todo o processamento (conversão, edição e compressão) ocorre diretamente no seu navegador, usando a memória e o processador do seu dispositivo. Nenhuma imagem é enviada para servidores externos.",
            },
        },
        {
            "@type": "Question",
            name: "Quais formatos de imagem são suportados?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Suportamos JPEG, PNG, WebP, GIF, BMP, TIFF, SVG e ICO. Também geramos pacotes completos de Favicons com múltiplos tamanhos e manifesto.",
            },
        },
        {
            "@type": "Question",
            name: "Funciona no celular?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Sim! O ImageStudio é totalmente responsivo e funciona como PWA em smartphones e tablets. Pode até ser instalado na tela inicial do dispositivo para uso offline.",
            },
        },
        {
            "@type": "Question",
            name: "Posso converter várias imagens ao mesmo tempo?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Sim! O modo de conversão em lote permite processar dezenas de imagens simultaneamente. Recomendamos lotes de até 50 imagens para melhor desempenho.",
            },
        },
    ],
};

export function JsonLd() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
        </>
    );
}
