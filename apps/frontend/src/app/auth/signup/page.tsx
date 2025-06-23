import SignUpForm from '@/components/auth/SignUpForm';
import Link from 'next/link';
import { Suspense } from 'react';

export default function SignUpPage() {
  return (
    <>
      <h1 className="text-3xl font-extrabold mb-2 text-gray-800 dark:text-white">
        Create Account
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Let's get you started!
      </p>
      <Suspense
        fallback={
          <div className="h-96 w-full animate-pulse bg-gray-200 dark:bg-slate-800 rounded-lg" />
        }
      >
        <SignUpForm />
      </Suspense>

      <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-8">
        Already have an account?{' '}
        <Link
          href="/auth/signin"
          className="font-semibold text-cyan-800 hover:text-cyan-700 dark:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
        >
          Sign In
        </Link>
      </p>
    </>
  );
}
