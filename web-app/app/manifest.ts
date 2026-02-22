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
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
        ],
    };
}
