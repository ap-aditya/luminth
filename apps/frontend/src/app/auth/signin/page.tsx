'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FirebaseError } from 'firebase/app';
import { Mail, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { LoginInput, loginSchema } from '@/utils/validationSchemas';

const getFriendlyFirebaseError = (
  errorCode: string,
): { message: string; field?: 'email' | 'password' } => {
  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return { message: 'Invalid email or password. Please try again.' };
    case 'auth/invalid-email':
      return {
        message: 'The email address format is not valid.',
        field: 'email',
      };
    case 'auth/too-many-requests':
      return {
        message:
          'Access to this account has been temporarily disabled due to too many failed attempts. Please try again later.',
      };
    default:
      return {
        message: 'An unexpected error occurred. Please try again later.',
      };
  }
};

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [firebaseError, setFirebaseError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signInWithEmail, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    setFirebaseError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setFirebaseError('');
    setIsSubmitting(true);

    const validationResult = loginSchema.safeParse(formData);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    const { success, error: authError } = await signInWithEmail(
      formData.email,
      formData.password,
    );
    setIsSubmitting(false);

    if (!success && authError) {
      if (authError instanceof FirebaseError) {
        const { message, field } = getFriendlyFirebaseError(authError.code);
        if (field) {
          setErrors((prev) => ({ ...prev, [field]: message }));
        } else {
          setFirebaseError(message);
        }
      } else {
        setFirebaseError((authError as Error).message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-slate-900">
        <p className="text-gray-800 dark:text-gray-200">Loading...</p>
      </div>
    );
  }
  if (user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-slate-900">
        <p className="text-gray-800 dark:text-gray-200">Redirecting...</p>
      </div>
    );
  }

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
      <div className="flex-grow flex items-center">
        <form onSubmit={handleSubmit} noValidate className="w-full mt-8">
          {firebaseError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg p-3 mb-4 flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4" />
              {firebaseError}
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            >
              Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail
                  className={`h-5 w-5 ${errors.email ? 'text-red-500' : 'text-gray-400'}`}
                />
              </span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={`pl-10 pr-4 py-3 w-full bg-gray-100 dark:bg-slate-800 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-gray-800 dark:text-gray-200 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-slate-700 focus:ring-cyan-500'}`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs italic mt-2">{errors.email}</p>
            )}
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-gray-700 dark:text-gray-300 text-sm font-bold"
              >
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-semibold text-cyan-800 hover:text-cyan-700 dark:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock
                  className={`h-5 w-5 ${errors.password ? 'text-red-500' : 'text-gray-400'}`}
                />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className={`pl-10 pr-10 py-3 w-full bg-gray-100 dark:bg-slate-800 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-gray-800 dark:text-gray-200 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-slate-700 focus:ring-cyan-500'}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs italic mt-2">
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white bg-cyan-500 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-cyan-500/50"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-pink-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              <span className="relative">
                {isSubmitting ? 'Logging In...' : 'Log In'}
              </span>
            </button>
          </div>
        </form>
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
