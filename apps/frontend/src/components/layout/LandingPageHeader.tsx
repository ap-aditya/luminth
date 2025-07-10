import Link from 'next/link';

const Header = () => {
  const navLinks = (
    <>
      <Link
        href="/auth/signin"
        className="mt-2 block w-full rounded-xl bg-cyan-500 px-4 py-2 text-center font-semibold text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-colors duration-300 hover:bg-cyan-600 sm:mt-0 sm:w-auto"
      >
        Sign In
      </Link>
    </>
  );

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-950/30">
      <div className="container mx-auto px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-cyan-500"
            >
              <path
                d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 7L12 12L22 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 22V12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Luminth
            </span>
          </Link>
          <nav className="items-center space-x-2 md:flex">{navLinks}</nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
