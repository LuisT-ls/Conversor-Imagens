<p align="center">
  <img src="public/images/logo.png" alt="ImageStudio Logo" width="80" height="80" />
</p>

<h1 align="center">ImageStudio</h1>

<p align="center">
  <strong>Ferramentas profissionais de imagem — 100% gratuitas, privadas e offline.</strong>
</p>

<p align="center">
  <a href="https://conversor-imagens.vercel.app">🌐 Acessar Online</a> ·
  <a href="#funcionalidades">✨ Funcionalidades</a> ·
  <a href="#tecnologias">🛠️ Tecnologias</a> ·
  <a href="#começando">🚀 Começando</a> ·
  <a href="#licença">📄 Licença</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PWA-Offline-5A0FC8?logo=pwa&logoColor=white" alt="PWA" />
  <img src="https://img.shields.io/badge/Licença-MIT-green" alt="MIT License" />
</p>

---

## Sobre o Projeto

O **ImageStudio** é uma aplicação web progressiva (PWA) completa para **conversão**, **edição** e **compressão** de imagens — inteiramente processada no navegador do usuário. Nenhuma imagem é enviada para servidores. Todo o processamento ocorre via APIs nativas do browser (Canvas, Web Workers) e bibliotecas client-side.

### Por que usar o ImageStudio?

- 🔒 **Privacidade absoluta** — Seus arquivos nunca saem do seu dispositivo
- ⚡ **Performance local** — Sem latência de upload/download
- 📱 **PWA instalável** — Funciona offline no celular e desktop
- 🆓 **100% gratuito** — Sem marcas d'água, sem assinaturas, sem anúncios invasivos
- 🌐 **Open source** — Código aberto sob licença MIT

---

## Funcionalidades

### 🔄 Conversor de Formatos
- Conversão para **WebP**, **PNG**, **JPEG**, **SVG** e **ICO/Favicon**
- Geração de **pacotes completos de Favicons** (múltiplos tamanhos + `manifest.json` + ZIP)
- Auto-redimensionamento com controle de qualidade
- Preservação de canal alpha (transparência)
- **Processamento em lote** — converta dezenas de imagens simultaneamente

### 🎨 Editor Avançado
- Motor gráfico baseado em **Fabric.js**
- Ajustes de **brilho**, **contraste** e **saturação**
- **Crop** (recorte), **rotação** (90°) e **flip** (espelhamento)
- Filtros visuais (Normal, Preto & Branco, Sépia, Vintage)
- Inserção de texto e logos
- Download em alta qualidade do canvas editado

### 📉 Compressor Inteligente
- Compressão com **controle percentual de qualidade**
- **Tamanho-alvo (Target Size)** — defina o tamanho máximo desejado (ex: 500KB) e o algoritmo otimiza automaticamente
- Comparação visual **antes/depois** lado a lado
- Remoção de metadados EXIF
- Suporte a múltiplos formatos de saída (WebP, JPEG, PNG)

### 📊 Histórico Local
- Registro automático de conversões realizadas
- Dados armazenados exclusivamente no **LocalStorage** do navegador
- Exportação e limpeza do histórico

---

## Tecnologias

| Categoria | Tecnologia | Versão |
|---|---|---|
| **Framework** | [Next.js](https://nextjs.org) (App Router) | 16.1.6 |
| **Linguagem** | [TypeScript](https://typescriptlang.org) | 5.x |
| **UI Library** | [React](https://react.dev) | 19.2.3 |
| **Estilização** | [Tailwind CSS](https://tailwindcss.com) | 4.x |
| **Componentes** | [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://radix-ui.com) | — |
| **Ícones** | [Lucide React](https://lucide.dev) | 0.575+ |
| **Editor de Imagem** | [Fabric.js](http://fabricjs.com) | 7.2.0 |
| **Compactação ZIP** | [JSZip](https://stuk.github.io/jszip/) | 3.10.1 |
| **Download** | [FileSaver.js](https://github.com/eligrey/FileSaver.js) | 2.0.5 |
| **PWA** | [@ducanh2912/next-pwa](https://github.com/AuCherub/next-pwa) | 10.2.9 |
| **Tema** | [next-themes](https://github.com/pacocoursey/next-themes) | 0.4.6 |
| **Notificações** | [Sonner](https://sonner.emilkowal.dev) | 2.0.7 |
| **Deploy** | [Vercel](https://vercel.com) | — |

---

## Arquitetura do Projeto

```
├── app/                        # Rotas do Next.js (App Router)
│   ├── layout.tsx              # Layout raiz (metadata, SEO, providers)
│   ├── page.tsx                # Página inicial (landing page)
│   ├── conversor/page.tsx      # Rota /conversor
│   ├── compressor/page.tsx     # Rota /compressor
│   ├── editor/                 # Rota /editor (client-side com Fabric.js)
│   │   ├── layout.tsx          # Metadata SEO do editor
│   │   └── page.tsx            # Componente da página
│   ├── historico/              # Rota /historico (client-side)
│   │   ├── layout.tsx          # Metadata SEO do histórico
│   │   └── page.tsx            # Componente da página
│   ├── faq/page.tsx            # Rota /faq
│   ├── documentacao/page.tsx   # Rota /documentacao
│   ├── privacidade/page.tsx    # Rota /privacidade
│   ├── robots.ts               # Geração dinâmica do robots.txt
│   ├── sitemap.ts              # Geração dinâmica do sitemap.xml
│   ├── manifest.ts             # Geração dinâmica do manifest.webmanifest
│   └── globals.css             # Estilos globais (Tailwind)
│
├── components/                 # Componentes React
│   ├── features/               # Módulos de funcionalidade
│   │   ├── conversor/          # Lógica do conversor de formatos
│   │   ├── compressor/         # Lógica do compressor
│   │   ├── editor/             # Editor com Fabric.js
│   │   └── history/            # Gerenciamento do histórico
│   ├── ui/                     # Componentes shadcn/ui (Button, Card, Dialog, etc.)
│   ├── ui-shell.tsx            # Shell da aplicação (header, sidebar, navegação)
│   ├── theme-provider.tsx      # Provider de tema claro/escuro
│   └── json-ld.tsx             # Schema estruturado JSON-LD (SEO)
│
├── hooks/                      # React Hooks customizados
│   ├── use-history.ts          # Hook para gerenciar histórico de conversões
│   └── use-image-processor.ts  # Hook para processamento de imagens
│
├── lib/                        # Utilitários e lógica de negócio
│   ├── image-processing.ts     # Motor principal de processamento de imagens
│   ├── image-utils.ts          # Utilitários auxiliares de imagem
│   └── utils.ts                # Utilitários gerais (cn, etc.)
│
├── public/                     # Arquivos estáticos
│   └── images/                 # Todas as imagens do projeto
│       ├── logo.png            # Logo do ImageStudio
│       ├── og-image.png        # Imagem Open Graph (1200×630)
│       ├── imagem-preview.jpg  # Preview para compartilhamento
│       └── favicons/           # Ícones do app
│           ├── apple-touch-icon.png
│           ├── icon-192x192.png
│           ├── icon-512x512.png
│           ├── favicon-16x16.png
│           └── favicon-32x32.png
│
├── next.config.ts              # Configuração do Next.js + PWA
├── tsconfig.json               # Configuração do TypeScript
├── postcss.config.mjs          # Configuração do PostCSS
├── eslint.config.mjs           # Configuração do ESLint
└── package.json                # Dependências e scripts
```

---

## SEO & Performance

O projeto utiliza uma estratégia avançada de SEO, incluindo:

| Recurso | Implementação |
|---|---|
| **Metadata dinâmica** | `title`, `description`, `keywords` por página via `export const metadata` |
| **Open Graph** | Tags OG com `locale: pt_BR`, imagem de preview e tipo `website` |
| **Twitter Cards** | `summary_large_image` com título e descrição otimizados |
| **Canonical URLs** | `<link rel="canonical">` em todas as 8 rotas |
| **Hreflang** | `pt-BR` + `x-default` em todas as páginas |
| **Schema JSON-LD** | `WebApplication` com AggregateRating, Offers, featureList |
| **FAQ Schema** | `FAQPage` com 5 perguntas para rich snippets expandidos |
| **Sitemap dinâmico** | Gerado em `/sitemap.xml` via `app/sitemap.ts` |
| **Robots.txt** | Gerado em `/robots.txt` via `app/robots.ts` |
| **PWA Manifest** | Gerado em `/manifest.webmanifest` via `app/manifest.ts` |
| **SSG (Static)** | Todas as páginas pré-renderizadas como conteúdo estático |

---

## Começando

### Pré-requisitos

- **Node.js** 18+ (recomendado: 20 LTS)
- **npm** 9+ (ou yarn/pnpm/bun)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/LuisT-ls/Conversor-Imagens.git
cd Conversor-Imagens

# Instale as dependências
npm install
```

### Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador. As alterações em código são refletidas automaticamente via Turbopack (HMR).

### Build de Produção

```bash
# Gera o build otimizado
npm run build

# Inicia o servidor de produção
npm start
```

### Linting

```bash
npm run lint
```

---

## Deploy

O projeto está configurado para deploy contínuo na **Vercel**.

Cada push na branch `main` dispara automaticamente um novo deploy em produção.

| Ambiente | URL |
|---|---|
| **Produção** | [conversor-imagens.vercel.app](https://conversor-imagens.vercel.app) |

Para fazer seu próprio deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/LuisT-ls/Conversor-Imagens)

---

## Privacidade

O ImageStudio foi projetado com **privacidade como prioridade máxima**:

- ✅ **Zero servidores de processamento** — toda edição, conversão e compressão ocorre no navegador
- ✅ **Nenhum upload de imagens** — seus arquivos jamais trafegam pela rede
- ✅ **Sem rastreio sensível** — apenas cookies estritamente necessários (preferência de tema)
- ✅ **Histórico local** — armazenado no LocalStorage do navegador, invisível para o servidor
- ✅ **Funciona offline** — após instalação como PWA, não requer conexão com a internet

---

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

1. Faça um **fork** do projeto
2. Crie sua **branch** de feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça o **commit** das suas alterações (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Faça o **push** para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um **Pull Request**

---

## Licença

Distribuído sob a licença **MIT**. Veja [LICENSE](LICENSE) para mais informações.

---

## Autor

Feito com ❤️ por **[Luís Teixeira](https://github.com/LuisT-ls)**

---

<p align="center">
  <a href="https://conversor-imagens.vercel.app">
    <img src="https://img.shields.io/badge/Acessar_ImageStudio-000?style=for-the-badge&logo=vercel&logoColor=white" alt="Acessar ImageStudio" />
  </a>
</p>
