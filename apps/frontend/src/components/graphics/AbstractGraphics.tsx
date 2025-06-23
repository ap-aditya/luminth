import React, { FC } from 'react';
const AbstractGraphics: FC = () => (
  <div className="hidden md:flex relative items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-8">
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 200 200"
        className="absolute w-4/5 h-4/5 text-cyan-400/30 dark:text-cyan-300/20 animate-spin-slow"
      >
        <circle
          cx="100"
          cy="100"
          r="80"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />
        <ellipse
          cx="100"
          cy="100"
          rx="80"
          ry="40"
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
        />
        <ellipse
          cx="100"
          cy="100"
          rx="80"
          ry="40"
          transform="rotate(60 100 100)"
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
        />
        <ellipse
          cx="100"
          cy="100"
          rx="80"
          ry="40"
          transform="rotate(120 100 100)"
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
        />
      </svg>
      <div className="absolute w-32 h-32 bg-cyan-500/30 dark:bg-cyan-400/20 rounded-full blur-2xl"></div>
      <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-pink-500/80 rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-6 h-6 bg-yellow-400/80 rounded-full animate-pulse delay-500"></div>
      <div className="text-center relative z-10 text-white p-8 bg-black/10 backdrop-blur-sm rounded-xl">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-pink-400">
          Luminth
        </h2>
        <p className="mt-2 text-gray-300/80 dark:text-gray-400/80 text-sm max-w-xs">
          Join our community and bring your mathematical creations to life.
        </p>
      </div>
    </div>
  </div>
);

export default AbstractGraphics;
