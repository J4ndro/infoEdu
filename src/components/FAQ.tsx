'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "¿Cómo puedo encontrar un colegio específico en la Comunitat Valenciana?",
    answer: "Puedes usar nuestro buscador avanzado en la parte superior. Solo tienes que escribir el nombre del centro, el municipio o incluso el código postal. También puedes filtrar por provincia (Valencia, Alicante o Castellón) para acotar los resultados."
  },
  {
    question: "¿Qué tipos de centros educativos aparecen en InfoEdu CV?",
    answer: "En nuestra plataforma encontrarás todos los centros registrados en la Generalitat Valenciana (GVA), incluyendo colegios públicos, concertados y privados, así como institutos de secundaria y centros integrados de Formación Profesional (CIPFP)."
  },
  {
    question: "¿Está actualizada la información de los ciclos de FP?",
    answer: "Sí, utilizamos datos abiertos de la GVA que incluyen la oferta completa de ciclos de Grado Básico, Medio y Superior. Puedes buscar por familia profesional o por el nombre del ciclo específico para ver qué centros lo imparten este curso."
  },
  {
    question: "¿Cómo puedo ver la ubicación exacta de un centro?",
    answer: "Cada centro tiene una ficha detallada con su dirección y un mapa interactivo. Además, desde el buscador principal puedes cambiar a la 'Vista de Mapa' para ver todos los centros geolocalizados en tu zona."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section id="faq" className="py-16 bg-transparent border-t border-slate-200/30 dark:border-white/5 transition-all">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider mb-4 border border-primary-500/20 dark:border-primary-500/10 shadow-sm">
            <HelpCircle className="w-4 h-4" />
            Preguntas Frecuentes
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Todo lo que necesitas saber sobre <span className="text-primary-700 dark:text-primary-500">InfoEdu CV</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="glass-card group rounded-2xl overflow-hidden cursor-pointer"
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-bold text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-primary-700 dark:text-primary-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-primary-700 dark:group-hover:text-primary-500" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-5 animate-fade-in">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
