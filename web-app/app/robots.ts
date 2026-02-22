import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: "/historico",
        },
        sitemap: "https://imagestudio.example.com/sitemap.xml",
    };
}
