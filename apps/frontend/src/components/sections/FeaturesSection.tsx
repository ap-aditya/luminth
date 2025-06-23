import React, { FC } from 'react';
import { Code, Edit, Play } from 'lucide-react';
import IconWrapper from '@/components/IconWrapper';
const FeaturesSection: FC = () => {
  const features = [
    {
      icon: <Code size={28} className="text-cyan-500" />,
      title: 'AI-Powered Generation',
      description:
        'Describe the animation you want in plain English, and let our AI generate the initial Manim code for you.',
    },
    {
      icon: <Edit size={28} className="text-pink-500" />,
      title: 'Powerful Code Editor',
      description:
        'A full-featured code editor with syntax highlighting, autocompletion, and real-time error checking to refine your creations.',
    },
    {
      icon: <Play size={28} className="text-yellow-500" />,
      title: 'Instant Cloud Rendering',
      description:
        'No need for a local setup. Render your animations on our powerful cloud servers and get results in seconds.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-slate-950 text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          An All-in-One Platform for Mathematical Visualization
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-100 dark:bg-slate-800/50 p-8 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-cyan-500/50 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 transform hover:-translate-y-2"
            >
              <IconWrapper>{feature.icon}</IconWrapper>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default FeaturesSection;
