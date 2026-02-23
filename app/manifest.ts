import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'ImageStudio | Conversor de Imagens',
        short_name: 'ImageStudio',
        description: 'Converta, comprima e edite suas imagens de forma rápida e segura. Ferramenta gratuita, 100% offline e com total foco na privacidade dos dados.',
        start_url: '/',
        display: 'standalone',
        background_color: '#09090b',
        theme_color: '#09090b',
        orientation: 'portrait-primary',
        icons: [
            {
                src: '/images/favicon/favicon-16x16.png',
                sizes: '16x16',
                type: 'image/png',
            },
            {
                src: '/images/favicon/favicon-32x32.png',
                sizes: '32x32',
                type: 'image/png',
            },
            {
                src: '/images/favicon/apple-touch-icon.png',
                sizes: '180x180',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/images/favicon/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/images/favicon/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
        ],
    };
}
