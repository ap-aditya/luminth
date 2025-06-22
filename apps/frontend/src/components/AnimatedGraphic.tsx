import React, { FC } from 'react';
const AnimatedGraphic: FC<{ className?: string }> = ({ className = "" }) => (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 800 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor: '#06b6d4'}} />
                    <stop offset="50%" style={{stopColor: '#ec4899'}} />
                    <stop offset="100%" style={{stopColor: '#f59e0b'}} />
                </linearGradient>
            </defs>
            <path fill="none" stroke="url(#glowGradient)" strokeWidth="2" className="animate-lissajous" />
            <path fill="none" stroke="url(#glowGradient)" strokeWidth="1" strokeOpacity="0.6" className="animate-lissajous-2" />
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
            .animate-lissajous { animation: lissajous-path 15s linear infinite; filter: drop-shadow(0 0 5px #06b6d4) drop-shadow(0 0 10px #ec4899); }
            .animate-lissajous-2 { animation: lissajous-path-2 20s linear infinite reverse; filter: drop-shadow(0 0 3px #f59e0b) drop-shadow(0 0 8px #06b6d4); }
        `}</style>
    </div>
);
export default AnimatedGraphic;