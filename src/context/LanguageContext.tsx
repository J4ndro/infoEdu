'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Language, Translations, translations } from '@/lib/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Sync HTML lang attribute
  const updateHtmlLang = (lang: Language) => {
    if (typeof document !== 'undefined') {
      const htmlLangMap: Record<Language, string> = {
        es: 'es',
        va: 'ca-ES',
        en: 'en'
      };
      document.documentElement.lang = htmlLangMap[lang] || 'es';
    }
  };

  // Set language handler
  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    updateHtmlLang(newLang);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('infoedu_lang', newLang);
        // Set cookie for SSR/middleware if needed
        document.cookie = `NEXT_LOCALE=${newLang};path=/;max-age=31536000;SameSite=Lax`;
      } catch (e) {
        console.error('Failed to persist language preference', e);
      }

      // Update URL query param ?lang= if present or if different from default
      const currentParams = new URLSearchParams(window.location.search);
      if (newLang === 'es') {
        currentParams.delete('lang');
      } else {
        currentParams.set('lang', newLang);
      }
      const qs = currentParams.toString();
      const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
      window.history.replaceState(null, '', newUrl);
    }
  }, []);

  // Initialization: check URL query param, then localStorage, then cookie, then navigator
  useEffect(() => {
    setMounted(true);

    const urlLang = searchParams.get('lang') as Language;
    if (urlLang && (urlLang === 'es' || urlLang === 'va' || urlLang === 'en')) {
      setLanguageState(urlLang);
      updateHtmlLang(urlLang);
      return;
    }

    try {
      const savedLang = localStorage.getItem('infoedu_lang') as Language;
      if (savedLang && (savedLang === 'es' || savedLang === 'va' || savedLang === 'en')) {
        setLanguageState(savedLang);
        updateHtmlLang(savedLang);
        return;
      }
    } catch {
      // localStorage may fail in private mode
    }

    // Check navigator language
    if (typeof navigator !== 'undefined') {
      const navLang = navigator.language?.toLowerCase() || '';
      if (navLang.startsWith('ca') || navLang.startsWith('val')) {
        setLanguageState('va');
        updateHtmlLang('va');
        return;
      } else if (navLang.startsWith('en')) {
        setLanguageState('en');
        updateHtmlLang('en');
        return;
      }
    }

    updateHtmlLang('es');
  }, [searchParams]);

  const value = {
    language,
    setLanguage,
    t: translations[language] || translations.es
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      language: 'es' as Language,
      setLanguage: () => {},
      t: translations.es
    };
  }
  return context;
}
