import SignInForm from '@/components/auth/SignInForm';
import Link from 'next/link';
import { Suspense } from 'react';

export default function SignInPage() {
  return (
    <>
      <div>
        <h1 className="text-3xl font-extrabold mb-2 text-gray-800 dark:text-white">
          Welcome Back
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Log in to continue to your dashboard.
        </p>
      </div>

      <div className="flex-grow flex items-center w-full mt-8">
        <Suspense
          fallback={
            <div className="h-80 w-full animate-pulse bg-gray-200 dark:bg-slate-800 rounded-lg" />
          }
        >
          <SignInForm />
        </Suspense>
      </div>

      <div>
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-8">
          Don't have an account?{' '}
          <Link
            href="/auth/signup"
            className="font-semibold text-cyan-800 hover:text-cyan-700 dark:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </>
  );
}
