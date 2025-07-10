import Header from '@/components/layout/LandingPageHeader';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import EditorPreviewSection from '@/components/sections/EditorPreviewSection';

export default function App() {
  return (
    <div className="bg-white dark:bg-slate-950">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <EditorPreviewSection />
      </main>
      <Footer />
    </div>
  );
}
