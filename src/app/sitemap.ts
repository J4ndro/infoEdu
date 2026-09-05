import { MetadataRoute } from 'next';
import { getCenters } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://info-edu-cv.vercel.app';
  
  try {
    const centers = await getCenters();

    const centerEntries: MetadataRoute.Sitemap = centers.map((center) => ({
      url: `${baseUrl}/centro/${center.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      ...centerEntries,
    ];
  } catch (error) {
    console.error('Error al generar el sitemap:', error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}
