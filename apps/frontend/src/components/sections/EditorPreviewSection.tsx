import React, { FC } from 'react';
import CodeBlock from '../CodeBlock';
import AnimatedGraphic from '../AnimatedGraphic';
const EditorPreviewSection: FC = () => {
    const mockCode = `from manim import *

class ThreeDParametricCurve(ThreeDScene):
    def construct(self):
        # Set up camera perspective
        self.set_camera_orientation(
            phi=75 * DEGREES, 
            theta=30 * DEGREES
        )
        # Define the parametric curve
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
        <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-700">
            <div className="container mx-auto px-4 sm:px-6">
                <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">Visualize Code Instantly</h2>
                <div className="bg-white dark:bg-slate-900/70 rounded-xl border border-gray-200 dark:border-slate-800 shadow-2xl shadow-gray-500/10 dark:shadow-cyan-500/10 overflow-hidden">
                    <div className="p-2 bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="bg-gray-50 dark:bg-slate-900 h-full">
                           <CodeBlock code={mockCode} />
                        </div>
                        <div className="bg-grid-pattern-light dark:bg-grid-pattern-dark p-4 flex items-center justify-center min-h-[300px] border-t md:border-t-0 md:border-l border-gray-200 dark:border-slate-800">
                           <AnimatedGraphic className="w-48 h-48" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default EditorPreviewSection;