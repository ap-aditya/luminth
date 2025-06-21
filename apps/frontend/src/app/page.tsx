import React, { useState, useEffect } from 'react';
import { Code, Edit, Play, ArrowRight, Sun, Moon } from 'lucide-react';


const IconWrapper = ({ children }) => (
  <div className="bg-gray-200 dark:bg-gray-800/50 p-3 rounded-lg mb-4 border border-gray-300 dark:border-gray-700">
    {children}
  </div>
);


const Header = ({ setPage, theme, setTheme }) => {
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/30 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800/50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cyan-500">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          <span className="text-xl font-bold text-gray-900 dark:text-white">Manim Studio</span>
        </div>
        <nav className="flex items-center space-x-4">
          <button onClick={() => setPage('login')} className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-white transition-colors duration-300">
            Login
          </button>
          <button onClick={() => setPage('signup')} className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            Sign Up
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </nav>
      </div>
    </header>
  );
};


const AnimatedGraphic = ({ className = "" }) => {
    return (
        <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
            <svg viewBox="0 0 800 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{stopColor: '#06b6d4'}} />
                        <stop offset="50%" style={{stopColor: '#ec4899'}} />
                        <stop offset="100%" style={{stopColor: '#f59e0b'}} />
                    </linearGradient>
                </defs>
                <path
                    fill="none"
                    stroke="url(#glowGradient)"
                    strokeWidth="2"
                    className="animate-lissajous"
                />
                 <path
                    fill="none"
                    stroke="url(#glowGradient)"
                    strokeWidth="1"
                    strokeOpacity="0.6"
                    className="animate-lissajous-2"
                />
            </svg>
            <style>{`
                @keyframes lissajous-path {
                    0% { d: path("M 400 200 C 600 200, 600 0, 400 0 S 200 0, 200 200 S 200 400, 400 400 S 600 400, 600 200"); }
                    25% { d: path("M 400 200 C 600 300, 500 0, 400 0 S 300 0, 200 100 S 200 300, 400 300 S 500 400, 600 100"); }
                    50% { d: path("M 400 200 C 500 100, 700 100, 700 200 S 500 300, 400 300 S 300 300, 100 200 S 100 100, 300 100"); }
                    75% { d: path("M 400 200 C 200 100, 300 400, 400 400 S 500 400, 600 300 S 600 100, 400 100 S 300 0, 200 300"); }
                    100% { d: path("M 400 200 C 600 200, 600 0, 400 0 S 200 0, 200 200 S 200 400, 400 400 S 600 400, 600 200"); }
                }
                 @keyframes lissajous-path-2 {
                    0% { d: path("M 400 200 C 500 100, 700 100, 700 200 S 500 300, 400 300 S 300 300, 100 200 S 100 100, 300 100"); }
                    25% { d: path("M 400 200 C 300 200, 300 0, 500 100 S 100 100, 200 300 S 300 400, 400 400 S 500 300, 400 200"); }
                    50% { d: path("M 400 200 C 600 200, 600 0, 400 0 S 200 0, 200 200 S 200 400, 400 400 S 600 400, 600 200"); }
                    75% { d: path("M 400 200 C 500 300, 300 400, 400 400 S 500 400, 700 100 S 600 0, 400 0 S 100 0, 200 200"); }
                    100% { d: path("M 400 200 C 500 100, 700 100, 700 200 S 500 300, 400 300 S 300 300, 100 200 S 100 100, 300 100"); }
                }
                .animate-lissajous {
                    animation: lissajous-path 15s linear infinite;
                    filter: drop-shadow(0 0 5px #06b6d4) drop-shadow(0 0 10px #ec4899);
                }
                .animate-lissajous-2 {
                    animation: lissajous-path-2 20s linear infinite reverse;
                     filter: drop-shadow(0 0 3px #f59e0b) drop-shadow(0 0 8px #06b6d4);
                }
            `}</style>
        </div>
    );
};

const HeroSection = () => {
  return (
    <section className="relative pt-48 pb-20 md:pb-32 text-center bg-gray-50 dark:bg-black overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-40 dark:opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-transparent to-gray-50 dark:from-black dark:via-transparent dark:to-black"></div>
      <div className="container mx-auto px-6 relative z-10">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500 dark:from-gray-200 dark:to-gray-500">
          Manim Generator and Renderer
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          Create stunning mathematical animations directly in your browser. From simple equations to complex scenes, bring math to life with the power of Manim.
        </p>
        <button className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white bg-cyan-500 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:bg-cyan-600 shadow-[0_0_25px_rgba(6,182,212,0.5)]">
            <span className="absolute inset-0 bg-gradient-to-r from-pink-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            <span className="relative flex items-center">
                Get Started for Free <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
        </button>
        <div className="max-w-4xl mx-auto h-[300px] md:h-[400px] mt-12">
            <AnimatedGraphic />
        </div>
      </div>
    </section>
  );
};


const FeaturesSection = () => {
  const features = [
    {
      icon: <Code size={28} className="text-cyan-500" />,
      title: "AI-Powered Generation",
      description: "Describe the animation you want in plain English, and let our AI generate the initial Manim code for you.",
    },
    {
      icon: <Edit size={28} className="text-pink-500" />,
      title: "Powerful Code Editor",
      description: "A full-featured code editor with syntax highlighting, autocompletion, and real-time error checking to refine your creations.",
    },
    {
      icon: <Play size={28} className="text-yellow-500" />,
      title: "Instant Cloud Rendering",
      description: "No need for a local setup. Render your animations on our powerful cloud servers and get results in seconds.",
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-black text-gray-900 dark:text-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">An All-in-One Platform for Mathematical Visualization</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-100 dark:bg-gray-900/50 p-8 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-cyan-500/50 hover:bg-white dark:hover:bg-gray-900 transition-all duration-300 transform hover:-translate-y-2">
              <IconWrapper>{feature.icon}</IconWrapper>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


const EditorPreviewSection = () => {
    const mockCode = `from manim import *

class ThreeDParametricCurve(ThreeDScene):
    def construct(self):
        self.set_camera_orientation(
            phi=75 * DEGREES, 
            theta=30 * DEGREES
        )
        curve = ParametricFunction(
            lambda u: np.array([
                1.2 * np.cos(u),
                1.2 * np.sin(u),
                u / 4
            ]),
            t_range=np.array([-PI, PI, 0.1]),
            color=BLUE
        )
        self.play(Create(curve), run_time=3)
        self.wait()
`;
    return (
        <section className="py-20 bg-gray-50 dark:bg-black">
            <div className="container mx-auto px-6">
                 <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">Visualize Code Instantly</h2>
                 <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl shadow-gray-500/10 dark:shadow-cyan-500/10 overflow-hidden">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-0">
                        <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900/80">
                            <pre className="text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap font-mono">
                                <code>{mockCode}</code>
                            </pre>
                        </div>
                        <div className="bg-grid-pattern-light dark:bg-grid-pattern-dark p-4 flex items-center justify-center min-h-[300px]">
                           <AnimatedGraphic className="w-48 h-48" />
                        </div>
                    </div>
                 </div>
            </div>
        </section>
    );
};


// --- Footer Component ---
const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400">
      <div className="container mx-auto px-6 py-8 text-center">
        <p>&copy; {new Date().getFullYear()} Manim Studio. All rights reserved.</p>
        <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};


// --- Mock Page Components for Routing ---
const MockPage = ({ title, message, setPage }) => (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white flex flex-col items-center justify-center p-6 transition-colors duration-300">
        <div className="text-center bg-white dark:bg-gray-900 p-10 rounded-lg border border-gray-200 dark:border-gray-800 shadow-2xl shadow-cyan-500/10">
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
            <button
                onClick={() => setPage('home')}
                className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-300"
            >
                Back to Home
            </button>
        </div>
    </div>
);


const LoginPage = ({ setPage }) => ( <MockPage title="Login" message="You have been routed to the Login page." setPage={setPage} /> );
const SignupPage = ({ setPage }) => ( <MockPage title="Sign Up" message="You have been routed to the Sign Up page." setPage={setPage} /> );


// --- Landing Page Layout ---
const LandingPage = ({ setPage, theme, setTheme }) => {
    return (
      <div className="bg-white dark:bg-black font-sans">
        <Header setPage={setPage} theme={theme} setTheme={setTheme} />
        <main>
          <HeroSection />
          <FeaturesSection />
          <EditorPreviewSection />
        </main>
        <Footer />
      </div>
    );
};

// --- Main App Component ---
export default function App() {
  const [page, setPage] = useState('home');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    document.body.style.backgroundColor = theme === 'dark' ? '#000' : '#f9fafb';
    
    // Add Google Font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Add CSS for font-family
    const style = document.createElement('style');
    style.innerHTML = `
      .font-sans { font-family: 'Inter', sans-serif; }
      .bg-grid-pattern-light {
        background-image:
          linear-gradient(rgba(0, 0, 0, 0.07) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 0, 0, 0.07) 1px, transparent 1px);
        background-size: 2rem 2rem;
      }
       .bg-grid-pattern-dark {
        background-image:
          linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
        background-size: 2rem 2rem;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
    }
  }, [theme]);
  
  const renderPage = () => {
    switch (page) {
      case 'login':
        return <LoginPage setPage={setPage} />;
      case 'signup':
        return <SignupPage setPage={setPage} />;
      default:
        return <LandingPage setPage={setPage} theme={theme} setTheme={setTheme} />;
    }
  };

  return (
    <div className="font-sans">
      {renderPage()}
    </div>
  );
}
