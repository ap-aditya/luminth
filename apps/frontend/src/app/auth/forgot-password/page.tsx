import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import Link from 'next/link';
import { Suspense } from 'react';

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-3xl font-extrabold mb-2 text-gray-800 dark:text-white">
        Forgot Password?
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        No problem. Enter your email below and we'll send you a link to reset
        it.
      </p>
      <Suspense
        fallback={
          <div className="h-48 w-full animate-pulse bg-gray-200 dark:bg-slate-800 rounded-lg" />
        }
      >
        <ForgotPasswordForm />
      </Suspense>

      <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-8">
        Remembered your password?{' '}
        <Link
          href="/auth/signin"
          className="font-semibold text-cyan-800 hover:text-cyan-700 dark:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
        >
          Log In
        </Link>
      </p>
    </>
  );
}
