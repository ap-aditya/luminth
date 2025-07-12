'use client';
import React, { FC } from 'react';
import Editor from '@monaco-editor/react';
const EditorPreviewSection: FC = () => {
  const mockCode = `from manim import *

class LissajousCurves(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-1.5, 1.5, 1],
            y_range=[-1.5, 1.5, 1],
            x_length=5,
            y_length=5,
            axis_config={"include_tip": True, "stroke_width": 2},
        )
        
        a_values = [1, 2, 3]
        b_values = [1, 2, 3]
        delta_values = [0, PI/2, PI]

        curves = []
        for a in a_values:
            for b in b_values:
                for delta in delta_values:
                    func = lambda t: np.array([np.sin(a*t + delta), np.cos(b*t), 0])
                    curve = ParametricFunction(func, t_range=[0, 2*PI], color=YELLOW)
                    curves.append(curve)

        for curve in curves:
            self.play(Create(axes), Create(curve))
            self.wait(1)
            self.play(FadeOut(curve))
`;
  return (
    <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-700">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Visualize Code Instantly
        </h2>
        <div className="bg-white dark:bg-slate-900/70 rounded-xl border border-gray-200 dark:border-slate-800 shadow-2xl shadow-gray-500/10 dark:shadow-cyan-500/10 overflow-hidden">
          <div className="p-2 bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={mockCode}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 15,
              }}
            />
            <div className="p-4 flex items-center justify-center min-h-[300px] border-t md:border-t-0 md:border-l border-gray-200 dark:border-slate-800">
                <video
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                >
                   <source src="/LissajousCurves.mp4" type="video/mp4" />
                </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default EditorPreviewSection;
