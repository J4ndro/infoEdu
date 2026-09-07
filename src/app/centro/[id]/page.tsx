import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getCenters } from '@/lib/api';
import CentroDetail from '@/components/CentroDetail';

export const revalidate = 86400; // Revalidate every 24 hours

export async function generateStaticParams() {
  const centers = await getCenters();
  return centers.map((center) => ({
    id: center.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const centers = await getCenters();
  const center = centers.find((c) => c.id === id);

  if (!center) {
    return {
      title: 'Centro no encontrado | InfoEdu CV',
      robots: { index: false, follow: false },
    };
  }

  const nivelesStr = center.levels && center.levels.length > 0 ? `Oferta educativa: ${center.levels.join(', ')}.` : '';
  const fpStr = center.fpCycles && center.fpCycles.length > 0 ? ` Formación Profesional: ${center.fpCycles.length} ciclos disponibles.` : '';
  const description = `${center.type} ubicado en ${center.municipality} (${center.province.split('/')[0]}). ${nivelesStr}${fpStr} Consulta dirección, teléfono y más detalles en InfoEdu CV.`;

  return {
    title: `${center.name} en ${center.municipality} | InfoEdu CV`,
    description: description,
    keywords: [
      center.name,
      `colegio ${center.name}`,
      `instituto ${center.name}`,
      `colegios en ${center.municipality}`,
      `institutos en ${center.municipality}`,
      `info edu cv ${center.name}`,
      center.type,
      "educación GVA",
      center.province.split('/')[0],
      ...(center.levels || [])
    ],
    openGraph: {
      title: `${center.name} - Centro Educativo en ${center.municipality}`,
      description: description,
      type: "website",
      locale: "es_ES",
      alternateLocale: ["ca_ES", "en_US"],
      images: [
        {
          url: '/logo.png',
          width: 1200,
          height: 630,
          alt: `${center.name} - InfoEdu CV`,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${center.name} - InfoEdu CV`,
      description: description,
      images: ['/logo.png'],
    },
    alternates: {
      canonical: `/centro/${id}`,
      languages: {
        'es': `/centro/${id}`,
        'ca-ES': `/centro/${id}?lang=va`,
        'en': `/centro/${id}?lang=en`,
        'x-default': `/centro/${id}`,
      },
    }
  };
}

export default async function CentroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const centers = await getCenters();
  const center = centers.find((c) => c.id === id);

  if (!center) {
    notFound();
  }

  return <CentroDetail center={center} />;
}
