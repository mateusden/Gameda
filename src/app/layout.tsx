import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import Header from "@/components/layout/header";

import { Asimovian } from "next/font/google";

const asimovian = Asimovian({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-logo",
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
    <html lang="pt-BR" className={asimovian.variable}>
      <body className="min-h-screen flex flex-col selection:bg-[#66836A] selection:text-white">
        <Suspense
          fallback={
            <div className="h-28 md:h-20 border-b border-[#D8D1C3] bg-[#E9E3D5]" />
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
