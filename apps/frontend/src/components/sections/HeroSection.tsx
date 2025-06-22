import React, { FC } from 'react';
import AnimatedGraphic from '@/components/AnimatedGraphic';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
const HeroSection: FC = () => (
    <section className="relative pt-40 md:pt-48 pb-20 md:pb-32 text-center bg-gray-50 dark:bg-gray-700 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-40 dark:opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-transparent to-gray-50 dark:from-slate-950/0 dark:via-transparent dark:to-slate-950"></div>
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500 dark:from-gray-200 dark:to-gray-500">
          Manim Editor , Generator and Renderer
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          Create stunning mathematical animations directly in your browser. From simple equations to complex scenes, bring math to life with the power of Manim.
        </p>
      <Link href="/signup">
        <button className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white bg-cyan-500 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:bg-cyan-600 shadow-[0_0_25px_rgba(6,182,212,0.5)]">
          <span className="absolute inset-0 bg-gradient-to-r from-pink-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
          <span className="relative flex items-center">
            Get Started for Free <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </button>
      </Link>
        <div className="max-w-4xl mx-auto h-[250px] sm:h-[300px] md:h-[400px] mt-12">
          <AnimatedGraphic />
        </div>
      </div>
    </section>
);
export default HeroSection;