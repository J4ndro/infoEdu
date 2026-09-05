import { Center } from '@/types';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { ChevronLeft, MapPin, Phone, Globe, Building, BookOpen, GraduationCap } from 'lucide-react';
import MapWrapper from '@/components/MapWrapper';
import { getCenters } from '@/lib/api';

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

  // Utils for rendering badges
  const getNaturalezaBadge = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'PÚBLICO': return 'bg-primary-50 text-primary-700 border-primary-200 ring-1 ring-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800/50';
      case 'PRIVADO': return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50';
      case 'CONCERTADO': return 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/50';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getLevelColor = (nivel: string) => {
    const n = nivel.toUpperCase();
    if (n.includes('BACHILLERATO')) return 'bg-purple-600 text-white border-purple-600 shadow-sm';
    if (n.includes('FP')) return 'bg-rose-600 text-white border-rose-600 shadow-sm';
    if (n.includes('ESO') || n.includes('SECUNDARIA')) return 'bg-blue-600 text-white border-blue-600 shadow-sm';
    if (n.includes('PRIMARIA')) return 'bg-amber-500 text-white border-amber-500 shadow-sm';
    if (n.includes('INFANTIL')) return 'bg-emerald-500 text-white border-emerald-500 shadow-sm';
    return 'bg-primary-600 text-white border-primary-600';
  };

  const getLevelBackground = (nivel: string) => {
    const n = nivel.toUpperCase();
    if (n.includes('BACHILLERATO')) return 'bg-purple-50 border-purple-100 dark:bg-purple-900/10 dark:border-purple-800/30';
    if (n.includes('FP')) return 'bg-rose-50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-800/30';
    if (n.includes('ESO') || n.includes('SECUNDARIA')) return 'bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800/30';
    if (n.includes('PRIMARIA')) return 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800/30';
    if (n.includes('INFANTIL')) return 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800/30';
    return 'bg-primary-50 border-primary-100 dark:bg-primary-900/10 dark:border-primary-800/30';
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": center.name,
    "description": `${center.type} en ${center.municipality}`,
    "image": "https://info-edu-cv.vercel.app/logo.png",
    "logo": "https://info-edu-cv.vercel.app/logo.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": center.address,
      "addressLocality": center.municipality,
      "postalCode": center.zipCode,
      "addressRegion": center.province.split('/')[0],
      "addressCountry": "ES"
    },
    "telephone": center.phone || undefined,
    "url": center.url || undefined,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": center.lat,
      "longitude": center.lng
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-8 transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-700 dark:text-gray-400 dark:hover:text-primary-400 font-bold mb-8 transition-colors text-sm uppercase tracking-wide cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al buscador
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Info */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header Card */}
            <div className="glass-panel rounded-2xl p-6 md:p-8 relative">
              {/* Decorative Top Gradient matching logo */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#114b5f] via-[#d38c28] to-[#f59e0b] rounded-t-2xl"></div>

              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 min-w-0 pt-2">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border ${getNaturalezaBadge(center.type)}`}>
                      {center.type || 'Sin especificar'}
                    </span>
                    <span className="text-sm font-mono text-gray-400 dark:text-gray-500">
                      CÓDIGO: {center.id}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 leading-tight tracking-tight">
                    {center.name}
                  </h1>
                </div>
              </div>
            </div>

            {/* Mobile Map Fallback */}
            <div className="lg:hidden">
              <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="p-4">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Ubicación del centro</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{center.address}, {center.municipality}</p>
                  
                  <div className="flex gap-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${center.name}, ${center.address}, ${center.municipality}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-[#d38c28] to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold transition-all shadow-md shadow-amber-500/25 hover:-translate-y-0.5 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4" />
                      Abrir en Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Address */}
              <div className="glass-card p-4 sm:p-5 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/10 rounded-lg shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-gray-450 dark:text-gray-500 uppercase tracking-wider mb-1">Dirección</h4>
                    <p className="font-bold text-gray-800 dark:text-gray-200 leading-snug text-sm">{center.address}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{center.zipCode}, {center.municipality}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{center.province}</p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              {center.phone && (
                <a href={`tel:${center.phone}`} className="glass-card p-4 sm:p-5 rounded-xl block cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/20 dark:border-amber-500/10 rounded-lg shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-450 dark:text-gray-500 uppercase tracking-wider mb-1">Teléfono</h4>
                      <p className="font-bold text-gray-800 dark:text-gray-200">{center.phone}</p>
                    </div>
                  </div>
                </a>
              )}

              {/* Console Web */}
              {center.url && (
                <a href={center.url} target="_blank" rel="noreferrer" className="glass-card p-4 sm:p-5 rounded-xl block sm:col-span-2 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/10 rounded-lg shrink-0">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-gray-450 dark:text-gray-500 uppercase tracking-wider mb-1">Ficha en Conselleria</h4>
                      <p className="font-bold text-primary-600 dark:text-primary-400 truncate text-sm">Ver portal oficial</p>
                    </div>
                  </div>
                </a>
              )}
            </div>

            {/* Educational Offer */}
            {center.levels && center.levels.length > 0 && (
              <div className="glass-panel rounded-2xl p-5 sm:p-8">
                <div className="mb-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      <div className="p-2 bg-primary-600 text-white rounded-lg shrink-0 shadow-md">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      Oferta Educativa
                    </h3>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/10 rounded-full shrink-0 border border-primary-500/20 dark:border-primary-500/10">
                      <GraduationCap className="w-4 h-4 text-primary-700 dark:text-primary-300" />
                      <span className="text-sm font-bold text-primary-700 dark:text-primary-300">{center.levels.length} niveles</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 ml-12 mb-3">
                    Niveles formativos disponibles en este centro educativo.
                  </p>
                </div>

                <div className="space-y-4">
                  {center.levels.map(level => (
                    <div key={level} className={`rounded-xl border overflow-hidden ${getLevelBackground(level)}`}>
                      <div className="w-full flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getLevelColor(level)}`}>
                            {level === 'FP' ? 'Formación Profesional' : level}
                          </span>
                        </div>
                      </div>
                      
                      {/* Render FP Cycles if available */}
                      {level === 'FP' && center.fpCycles && center.fpCycles.length > 0 && (
                        <div className="px-5 pb-5 pt-2">
                          <div className="space-y-5">
                            {Array.from(new Set(center.fpCycles.map(c => c.family))).map(family => (
                              <div key={family} className="bg-white/40 dark:bg-slate-900/20 rounded-xl p-4 shadow-sm border border-slate-200/20 dark:border-white/5">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-sm flex items-center gap-2 border-b border-slate-200/30 dark:border-white/5 pb-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></div>
                                  {family}
                                </h4>
                                <ul className="space-y-2">
                                  {center.fpCycles?.filter(c => c.family === family).map(cycle => (
                                    <li key={`${cycle.grade}-${cycle.name}`} className="flex items-start gap-2 text-sm">
                                      <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 uppercase tracking-wide border border-rose-200 dark:border-rose-800/50 mt-0.5">
                                        {cycle.grade}
                                      </span>
                                      <span className="text-gray-700 dark:text-gray-300 font-medium leading-snug">
                                        {cycle.name}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Render Bachillerato info */}
                      {level === 'Bachillerato' && (
                        <div className="px-5 pb-5 pt-2">
                          <div className="bg-white/40 dark:bg-slate-900/20 rounded-xl p-4 shadow-sm border border-slate-200/20 dark:border-white/5">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm flex items-center gap-2 border-b border-slate-200/30 dark:border-white/5 pb-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></div>
                              Modalidades
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 italic">
                              Consulta directamente con el centro qué modalidades oferta este curso académico:
                            </p>
                            <ul className="space-y-2">
                              <li className="flex items-center gap-2 text-sm">
                                <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500 shrink-0"></div>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">Ciencias y Tecnología</span>
                              </li>
                              <li className="flex items-center gap-2 text-sm">
                                <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500 shrink-0"></div>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">Humanidades y Ciencias Sociales</span>
                              </li>
                              <li className="flex items-center gap-2 text-sm">
                                <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500 shrink-0"></div>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">Artes / General</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Fallback if FP is listed but no details available */}
                      {level === 'FP' && (!center.fpCycles || center.fpCycles.length === 0) && (
                        <div className="px-5 pb-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic">No hay detalles de ciclos formativos disponibles para este centro.</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Map (Desktop only) */}
          <div className="hidden lg:block lg:col-span-5 relative">
            <div className="sticky top-8 space-y-4">
              <div className="glass-panel rounded-2xl overflow-hidden h-[700px] relative z-0">
                <MapWrapper centers={[center]} />
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white/80 dark:from-[#060814]/80 to-transparent pointer-events-none"></div>
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <div className="flex items-center justify-between p-3 rounded-xl glass-card">
                    <div className="flex items-center gap-2 pl-2">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">Ubicación</p>
                    </div>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${center.name}, ${center.address}, ${center.municipality}`)}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-[#d38c28] to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white transition-all text-xs font-bold shadow-md shadow-amber-500/20 hover:-translate-y-0.5 cursor-pointer">
                        Abrir en Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
