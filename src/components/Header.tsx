import Link from 'next/link';
import Image from 'next/image';
import { Map, Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="glass-panel sticky top-0 z-50 border-b border-gray-200/30 dark:border-white/5 transition-all">
      {/* Decorative top gradient matching logo colors (Teal to Orange) */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#114b5f] via-[#d38c28] to-[#f59e0b]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-between h-20 items-center" aria-label="Navegación principal">
          <Link href="/" className="flex items-center gap-1 group" aria-label="InfoEdu CV - Inicio">
            <div className="relative w-28 h-28 flex-shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center -ml-4">
              <Image src="/logo.svg" alt="InfoEdu Logo" fill className="object-contain scale-[1.75] translate-y-3" priority />
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">
              InfoEdu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#114b5f] via-[#d38c28] to-[#e59829] dark:from-primary-400 dark:to-amber-400">Comunitat Valenciana</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex space-x-4 items-center">
              <Link href="/" className="group flex items-center gap-2 px-5 py-2 rounded-full text-white font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 via-[#d38c28] to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all duration-300 border border-amber-400/30">
                <Search className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
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
