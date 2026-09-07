'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Language } from '@/lib/i18n/translations';
import { Globe, ChevronDown, Check } from 'lucide-react';

const FlagSpain = () => (
  <svg className="w-4 h-4 rounded-full object-cover shrink-0 shadow-xs" viewBox="0 0 640 480">
    <path fill="#c60b1e" d="M0 0h640v480H0z"/>
    <path fill="#ffc400" d="M0 120h640v240H0z"/>
  </svg>
);

const FlagValencia = () => (
  <svg className="w-4 h-4 rounded-full object-cover shrink-0 shadow-xs" viewBox="0 0 640 480">
    <path fill="#ffc400" d="M0 0h640v480H0z"/>
    <path fill="#c60b1e" d="M0 53.3h640v53.4H0zm0 106.7h640v53.3H0zm0 106.7h640v53.3H0zm0 106.6h640v53.4H0z"/>
    <path fill="#0033a0" d="M0 0h140v480H0z"/>
    <path fill="#ffc400" d="M45 40h50v400H45z" opacity="0.3"/>
  </svg>
);

const FlagUK = () => (
  <svg className="w-4 h-4 rounded-full object-cover shrink-0 shadow-xs" viewBox="0 0 640 480">
    <path fill="#012169" d="M0 0h640v480H0z"/>
    <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"/>
    <path fill="#C8102E" d="m424 288 216 159v33h-44L366 309l58-21zM640 0v10L455 150l-45-33L595 0h45zm-400 329L0 478v-10l185-139 55 0zm-55-179L0 2v31l172 127 13-10z"/>
    <path fill="#FFF" d="M260 0h120v480H260zM0 180h640v120H0z"/>
    <path fill="#C8102E" d="M284 0h72v480H284zM0 204h640v72H0z"/>
  </svg>
);

const languages: { code: Language; label: string; short: string; flag: React.FC }[] = [
  { code: 'es', label: 'Castellano', short: 'ES', flag: FlagSpain },
  { code: 'va', label: 'Valencià', short: 'VA', flag: FlagValencia },
  { code: 'en', label: 'English', short: 'EN', flag: FlagUK },
];

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 transition-all duration-200 shadow-xs hover:-translate-y-0.5 cursor-pointer text-xs font-bold"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t.nav.selectLanguage}
        title={t.nav.selectLanguage}
      >
        <currentLang.flag />
        <span className="tracking-wide uppercase">{currentLang.short}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={t.nav.selectLanguage}
          className="absolute right-0 mt-2 w-44 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 p-1.5 shadow-xl shadow-slate-900/10 dark:shadow-black/40 z-50 animate-fade-in-up"
        >
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-200/40 dark:border-white/5 mb-1">
            {t.nav.language}
          </div>
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            const Flag = lang.flag;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-extrabold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Flag />
                  <span>{lang.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
