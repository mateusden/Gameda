import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import Header from "@/components/layout/header";
import { Audiowide, Space_Grotesk, Ubuntu } from "next/font/google";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-audiowide",
  display: "swap",
});

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-ubuntu",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gameda",
  description: "Plataforma social voltada para videogames",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${audiowide.variable} ${ubuntu.variable} ${spaceGrotesk.variable}`}
    >
      <body className="min-h-screen flex flex-col selection:bg-[#52765B] selection:text-white">
        <Suspense
          fallback={
            <div className="h-28 md:h-20 border-b border-[#DCDAD0] bg-[#F0EEE5]" />
          }
        >
          <Header />
        </Suspense>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}