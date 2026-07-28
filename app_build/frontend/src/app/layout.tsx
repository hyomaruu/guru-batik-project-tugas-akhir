import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Guru Batik — Keindahan Batik Nusantara",
    template: "%s | Guru Batik",
  },
  description:
    "Guru Batik adalah UMKM yang melestarikan seni batik tradisional Indonesia. Temukan koleksi batik tulis, cap, dan printing berkualitas tinggi.",
  keywords: ["batik", "batik tulis", "batik cap", "UMKM", "Guru Batik", "kerajinan Indonesia"],
  openGraph: {
    title: "Guru Batik — Keindahan Batik Nusantara",
    description: "Melestarikan seni batik tradisional Indonesia.",
    type: "website",
    locale: "id_ID",
  },
};

import { Inter, Calistoga, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const calistoga = Calistoga({ weight: "400", subsets: ["latin"], variable: "--font-calistoga" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} ${calistoga.variable} ${playfair.variable} ${jetbrainsMono.variable} antialiased font-sans transition-colors duration-300 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster 
            position="top-right" 
            toastOptions={{ 
              duration: 3000,
              style: {
                background: '#1e293b',
                color: '#fff',
              }
            }} 
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
