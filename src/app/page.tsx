import Directory from '@/components/Directory';
import FAQ from '@/components/FAQ';
import { getCenters } from '@/lib/api';
import { Suspense } from 'react';

export const revalidate = 86400; // Revalidate every 24 hours

export default async function Home() {
  const centers = await getCenters();

  // Optimizar el payload enviado al cliente para reducir el tamaño del DOM y el HTML
  const optimizedCenters = centers.map(c => ({
    id: c.id,
    name: c.name,
    type: c.type,
    address: c.address,
    zipCode: c.zipCode,
    municipality: c.municipality,
    province: c.province,
    lat: c.lat,
    lng: c.lng,
    levels: c.levels,
    url: c.url,
    hasCustomUrl: c.hasCustomUrl,
    gvaUrl: c.gvaUrl,
    fpCycles: c.fpCycles?.map(fp => ({
      family: fp.family,
      grade: fp.grade,
      name: fp.name
    }))
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "InfoEdu CV",
    "alternateName": [
      "Info Edu CV",
      "infoeducv",
      "info-edu-cv",
      "InfoEdu Comunitat Valenciana",
      "InfoEdu Valencian Community"
    ],
    "url": "https://info-edu-cv.vercel.app",
    "inLanguage": ["es", "ca", "en"],
    "description": "Buscador de colegios, institutos y centros de FP de la Comunitat Valenciana. Cercador de centres educatius. Search schools in the Valencian Community.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://info-edu-cv.vercel.app/?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="sr-only">Buscador de Centros Educativos y FP de la Comunitat Valenciana | Cercador de Centres Educatius | InfoEdu CV</h1>
      <Suspense fallback={<div className="flex items-center justify-center h-[calc(100vh-80px)] font-bold text-gray-500">Cargando directorio...</div>}>
        <Directory initialCenters={optimizedCenters} />
      </Suspense>
      <FAQ />
    </>
  );
}
