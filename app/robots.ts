import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/onboarding/', '/api/', '/auth/'],
      },
    ],
    sitemap: 'https://vanguard-blond-delta.vercel.app/sitemap.xml',
  };
}
