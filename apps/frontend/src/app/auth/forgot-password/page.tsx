'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useFirebaseAuth';
const getFriendlyFirebaseError = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'The email address format is not valid.';
    case 'auth/user-not-found':
      return '';
    default:
      return 'An unexpected error occurred. Please try again later.';
  }
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    if (!email) {
      setError('Please enter your email address.');
      setIsSubmitting(false);
      return;
    }

    const { success, error: authError } = await sendPasswordReset(email);
    setIsSubmitting(false);

    if (success) {
      setSuccessMessage(
        'If an account exists for this email, a password reset link has been sent. Please check your inbox.',
      );
    } else if (authError) {
      const friendlyMessage = getFriendlyFirebaseError((authError as any).code);
      if (friendlyMessage) {
        setError(friendlyMessage);
      } else {
        setSuccessMessage(
          'If an account exists for this email, a password reset link has been sent. Please check your inbox.',
        );
      }
    }
  };

  return (
    <>
      <h1 className="text-3xl font-extrabold mb-2 text-gray-800 dark:text-white">
        Forgot Password?
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        No problem. Enter your email below and we'll send you a link to reset
        it.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg p-3 mb-4 flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4" />
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/20  text-green-900 dark:text-green-500 text-sm rounded-lg p-3 mb-4 flex items-center">
            <CheckCircle className="mr-2 h-4 w-4" />
            {successMessage}
          </div>
        )}

        <div className="mb-6">
          <label
            htmlFor="email"
            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
          >
            Email
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail
                className={`h-5 w-5 ${error ? 'text-red-500' : 'text-gray-400'}`}
              />
            </span>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`pl-10 pr-4 py-3 w-full bg-gray-100 dark:bg-slate-800 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-gray-800 dark:text-gray-200 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-slate-700 focus:ring-cyan-500'}`}
              placeholder="you@example.com"
              suppressHydrationWarning={true}
            />
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white bg-cyan-500 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:bg-cyan-600 disabled:opacity-50"
            suppressHydrationWarning={true}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-pink-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            <span className="relative">
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </span>
          </button>
        </div>
      </form>
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
