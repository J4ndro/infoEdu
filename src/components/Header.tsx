import Link from 'next/link';
import Image from 'next/image';
import { Map, Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="glass-panel sticky top-0 z-50 border-b border-gray-200/30 dark:border-white/5 transition-all">
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary-600 via-primary-400 to-primary-200"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-between h-20 items-center" aria-label="Navegación principal">
          <Link href="/" className="flex items-center gap-1 group" aria-label="InfoEdu CV - Inicio">
            <div className="relative w-28 h-28 flex-shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center -ml-4">
              <Image src="/logo.svg" alt="InfoEdu Logo" fill className="object-contain scale-[1.75] translate-y-3" priority />
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">
              InfoEdu <span className="text-primary-600 dark:text-primary-400">Comunitat Valenciana</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex space-x-4 items-center">
              <Link href="/" className="group flex items-center gap-2 px-5 py-2 rounded-full text-primary-700 dark:text-primary-300 font-bold text-xs uppercase tracking-wider border border-gray-200/50 dark:border-white/10 bg-white/30 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                Buscar Centros
              </Link>
            </div>
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
