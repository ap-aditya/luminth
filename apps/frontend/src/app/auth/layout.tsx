import React from 'react';
import AbstractGraphics from '@/components/graphics/AbstractGraphics';
import Header from '@/components/layout/LandingPageHeader'
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="min-h-screen w-full bg-gray-600 text-gray-800 dark:text-gray-200 font-sans">
        <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-transparent to-gray-50 dark:from-slate-950/0 dark:via-transparent dark:to-slate-950"></div>
        <main className="relative z-10 flex flex-col md:flex-row items-stretch justify-center min-h-screen p-4">
          <div className="w-full max-w-7xl md:grid md:grid-cols-2 rounded-xl shadow-2xl shadow-cyan-500/10 dark:shadow-pink-500/10 overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white/10 dark:border-slate-800/50">
            <AbstractGraphics />

            <div className="w-full p-8 sm:p-12 flex flex-col justify-center">
              {children}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
