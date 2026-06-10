'use client';

import Link from 'next/link';
import { Heart, ExternalLink, Code, Sparkles } from 'lucide-react';

const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function Footer() {
  const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-white/60 dark:bg-slate-950/40 backdrop-blur-md border-t border-slate-200/30 dark:border-white/5 transition-all duration-300">
      {/* Subtle top ambient glowing line in dark mode */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Column 1: InfoEdu CV Description (Propósito) */}
          <div className="md:col-span-5 flex flex-col space-y-4">
            <Link
              href="/"
              onClick={scrollToTop}
              className="flex items-center gap-2 group w-fit"
              aria-label="InfoEdu CV - Subir al inicio"
            >
              <div className="p-2 rounded-xl bg-primary-500/10 dark:bg-primary-400/10 border border-primary-500/20 dark:border-primary-400/20 group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400 animate-pulse" />
              </div>
              <span className="font-extrabold text-xl text-gray-900 dark:text-white tracking-tight">
                InfoEdu <span className="text-primary-600 dark:text-primary-400">CV</span>
              </span>
            </Link>

            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-md">
              Una plataforma independiente y de alto rendimiento diseñada para facilitar la búsqueda interactiva, visual e inteligente de colegios, institutos y ciclos formativos de Formación Profesional en la Comunitat Valenciana. Accede a datos oficiales de forma fluida y ágil.
            </p>
          </div>

          {/* Column 2: Open Source and GitHub */}
          <div className="md:col-span-4 flex flex-col space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-wider uppercase flex items-center gap-2">
              <Code className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              Código Abierto (Open Source)
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              InfoEdu CV es un proyecto 100% de código abierto. Creemos firmemente en el software libre para mejorar el acceso a los servicios públicos de educación. Todo el desarrollo y los datos son transparentes.
            </p>
            <div className="pt-2">
              <a
                href="https://github.com/J4ndro/infoEdu"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-gray-850 dark:hover:bg-gray-800 text-white font-bold text-sm rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 border border-transparent dark:border-gray-800 group"
              >
                <GithubIcon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                <span>Ver en GitHub</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>


          {/* Column 3: Quick Links & Attribution */}
          <div className="md:col-span-3 flex flex-col space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-wider uppercase">
              Enlaces Útiles
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/"
                  onClick={scrollToTop}
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200"
                >
                  Buscar Centros
                </Link>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200"
                  onClick={(e) => {
                    const el = document.getElementById('faq');
                    if (el) {
                      e.preventDefault();
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  Preguntas Frecuentes
                </a>
              </li>
              <li>
                <a
                  href="https://dadesobertes.gva.es/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200 group"
                >
                  <span>GVA Dades Obertes</span>
                  <ExternalLink className="w-3 h-3 text-gray-400 group-hover:translate-x-0.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Separator */}
        <hr className="my-10 border-gray-200 dark:border-gray-900" />

        {/* Footer Bottom: Copyright & Attribution */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-gray-500 dark:text-gray-500">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1">
            <span>© {new Date().getFullYear()} InfoEdu CV. Creado con</span>
            <Heart className="w-3.5 h-3.5 text-red-500 animate-heartbeat fill-red-500 inline-block mx-0.5" />
            <span>por</span>
            <a
              href="https://portfolio-alehinarejos.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gray-700 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors underline decoration-gray-300 dark:decoration-gray-700 underline-offset-2"
            >
              Alehinarejos
            </a>
            <span className="mx-1">•</span>
            <span>Licencia MIT.</span>
          </div>

          <div className="text-center sm:text-right max-w-md">
            <span>Este portal no tiene vinculación oficial con la Generalitat Valenciana. Los datos expuestos provienen de portales de datos abiertos de la GVA.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
