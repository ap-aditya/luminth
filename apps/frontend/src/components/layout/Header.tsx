// app/components/Header.tsx (or similar path)
"use client";

import Link from 'next/link';
import { useState } from 'react';
// Assuming you're using lucide-react for icons. If not, replace with your icon library.
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Reusable navigation links, now styled directly on the Link component
  const navLinks = (
    <>
      <Link
        href="/login"
        onClick={() => setIsMenuOpen(false)}
        className="block rounded-md px-3 py-2 text-gray-600 transition-colors duration-300 hover:bg-gray-100 hover:text-cyan-500 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white sm:inline-block"
      >
        Login
      </Link>
      <Link
        href="/signup"
        onClick={() => setIsMenuOpen(false)}
        className="mt-2 block w-full rounded-lg bg-cyan-500 px-4 py-2 text-center font-semibold text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-colors duration-300 hover:bg-cyan-600 sm:mt-0 sm:w-auto"
      >
        Sign Up
      </Link>
    </>
  );

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-950/30">
      <div className="container mx-auto px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-cyan-500"
            >
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Luminth
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-2 md:flex">
            {navLinks}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-md p-2 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-slate-700"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div id="mobile-menu" className="mt-4 md:hidden">
            <nav className="flex flex-col space-y-2 rounded-lg border border-gray-200 bg-gray-50/95 p-4 dark:border-slate-800 dark:bg-slate-900/95">
              {navLinks}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;