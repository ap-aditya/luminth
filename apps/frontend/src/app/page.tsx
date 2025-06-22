'use client'
import React, { useState, useEffect, FC, ReactNode, createContext, useContext } from 'react';
import { Code, Edit, Play, ArrowRight, Sun, Moon, X, Menu } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import EditorPreviewSection from '@/components/sections/EditorPreviewSection';

export default function App(){
    return (
      <div className="bg-white dark:bg-slate-950">
        <Header/>
        <main>
          <HeroSection />
          <FeaturesSection />
          <EditorPreviewSection />
        </main>
        <Footer />
      </div>
    );
};