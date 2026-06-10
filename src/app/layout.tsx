import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1d4ed8" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "InfoEdu CV | Mejores Colegios e Institutos de la Comunitat Valenciana",
    template: "%s | Guía de Centros InfoEdu CV"
  },
  description: "Buscador oficial de colegios públicos, concertados y privados en Valencia, Alicante y Castellón. Encuentra toda la oferta de FP, Institutos y centros educativos de la GVA con mapa interactivo.",
  keywords: [
    "info edu cv",
    "infoeducv",
    "info edu",
    "colegios valencia",
    "institutos alicante",
    "fp castellon",
    "formación profesional comunitat valenciana",
    "centros educativos gva",
    "educación infantil",
    "bachillerato valencia",
    "colegios comunidad valenciana",
    "institutos comunidad valenciana"
  ],
  authors: [{ name: "InfoEdu CV" }],
  metadataBase: new URL('https://info-edu-cv.vercel.app'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "InfoEdu CV | Encuentra el mejor centro educativo en la Comunitat Valenciana",
    description: "Guía oficial y mapa de todos los colegios, institutos y centros de FP de la GVA. Elige el mejor futuro para tus hijos.",
    siteName: "InfoEdu CV",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'InfoEdu CV | Buscador de Centros Educativos de la Comunitat Valenciana',
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InfoEdu CV | Guía de Centros Educativos de la Comunitat Valenciana",
    description: "Buscador de colegios e institutos de la GVA. Filtros por provincia, nivel y titularidad con localización exacta.",
    creator: "@infoeducv",
    images: ['/logo.png'],
  },
  icons: {
    icon: '/icon.ico',
    apple: '/logo.svg',
  },
  verification: {
    google: 'eYUDCfEfbBEt0co6I_miaE3oSNsAHNzLz3sDzmCvuWY',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 dark:bg-[#060814] text-slate-900 dark:text-slate-100 flex flex-col min-h-screen transition-colors relative overflow-x-hidden`}>
        {/* Ambient background glow elements for Glassmorphism */}
        <div className="fixed top-[-5%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-purple-500/10 dark:bg-purple-600/15 blur-[120px] pointer-events-none z-0" />
        <div className="fixed top-[20%] right-[-10%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full bg-blue-500/10 dark:bg-blue-600/10 blur-[110px] pointer-events-none z-0" />
        <div className="fixed bottom-[20%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-emerald-500/5 dark:bg-emerald-600/5 blur-[130px] pointer-events-none z-0" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] max-w-[450px] max-h-[450px] rounded-full bg-pink-500/10 dark:bg-pink-600/10 blur-[100px] pointer-events-none z-0" />

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="relative z-10 flex flex-col min-h-screen w-full">
            <Header />
            <main className="flex-grow flex flex-col relative z-10">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
