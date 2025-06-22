import { FC } from 'react';
const Footer: FC = () => (
  <footer className="bg-gray-100 dark:bg-slate-950/50 border-t border-gray-200 dark:border-slate-800 text-gray-500 dark:text-gray-400">
    <div className="container mx-auto px-4 sm:px-6 py-8 text-center">
      <p>
        &copy; {new Date().getFullYear()} Luminth. All rights reserved.
      </p>
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 mt-4">
        <a
          href="#"
          className="hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Terms of Service
        </a>
        <a
          href="#"
          className="hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Privacy Policy
        </a>
      </div>
    </div>
  </footer>
);
export default Footer;
