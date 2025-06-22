'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ZodError } from 'zod';
import { Mail, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { FirebaseError } from 'firebase/app';

import { useAuth } from '@/hooks/useFirebaseAuth';
import {
  SignUpInput,
  signUpSchema,
  PASSWORD_POLICY,
} from '@/utils/validationSchemas';

import AbstractGraphics from '@/components/graphics/AbstractGraphics';
import {
  PasswordCriteriaIndicator,
  PasswordCriterion,
} from '@/components/auth/PasswordCriteriaIndicator';

const getFriendlyFirebaseError = (
  errorCode: string,
): { message: string; field?: 'email' | 'password' } => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return {
        message: 'This email address is already in use by another account.',
        field: 'email',
      };
    case 'auth/weak-password':
      return {
        message: 'Password is too weak. Please choose a stronger password.',
        field: 'password',
      };
    case 'auth/invalid-email':
      return {
        message: 'The email address format is not valid.',
        field: 'email',
      };
    case 'auth/operation-not-allowed':
      return { message: 'Email/password accounts are not enabled.' };
    case 'auth/network-request-failed':
      return {
        message:
          'A network error occurred. Please check your connection and try again.',
      };
    default:
      return {
        message: 'An unexpected error occurred. Please try again later.',
      };
  }
};

export default function SignUpPage() {
  const [formData, setFormData] = useState<SignUpInput>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [firebaseError, setFirebaseError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const { signUpWithEmail, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.emailVerified) {
        router.replace('/dashboard');
      } else if (!emailSent) {
        setEmailSent(true);
      }
    }
  }, [user, loading, router, emailSent]);

  const passwordCriteriaList = useMemo(
    () => [
      {
        text: `At least ${PASSWORD_POLICY.minLength} characters`,
        validator: (pwd: string) => pwd.length >= PASSWORD_POLICY.minLength,
      },
      {
        text: 'An uppercase letter (A-Z)',
        validator: (pwd: string) =>
          !PASSWORD_POLICY.requireUppercase || /[A-Z]/.test(pwd),
      },
      {
        text: 'A lowercase letter (a-z)',
        validator: (pwd: string) =>
          !PASSWORD_POLICY.requireLowercase || /[a-z]/.test(pwd),
      },
      {
        text: 'A number (0-9)',
        validator: (pwd: string) =>
          !PASSWORD_POLICY.requireNumeric || /[0-9]/.test(pwd),
      },
      {
        text: 'A special character (e.g., !@#$)',
        validator: (pwd: string) =>
          !PASSWORD_POLICY.requireNonAlphanumeric || /[^a-zA-Z0-9]/.test(pwd),
      },
    ],
    [],
  );

  const passwordCriteriaStatus: PasswordCriterion[] = useMemo(() => {
    if (!passwordTouched) return [];
    return passwordCriteriaList.map((criterion) => ({
      text: criterion.text,
      status: criterion.validator(formData.password) ? 'met' : 'unmet',
    }));
  }, [formData.password, passwordTouched, passwordCriteriaList]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'password' && !passwordTouched) setPasswordTouched(true);
    if (errors[name])
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    setFirebaseError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setFirebaseError('');
    setIsSubmitting(true);
    if (!passwordTouched) setPasswordTouched(true);

    const validationResult = signUpSchema.safeParse(formData);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    const { success, error: authError } = await signUpWithEmail(
      formData.email,
      formData.password,
    );
    setIsSubmitting(false);

    if (success) {
      setEmailSent(true);
    } else if (authError) {
      if (authError instanceof FirebaseError) {
        const { message, field } = getFriendlyFirebaseError(authError.code);
        if (field) setErrors((prev) => ({ ...prev, [field]: message }));
        else setFirebaseError(message);
      } else {
        setFirebaseError(authError.message);
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

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-gray-200 font-sans">
      <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-40 dark:opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-transparent to-gray-50 dark:from-slate-950/0 dark:via-transparent dark:to-slate-950"></div>

      <main className="relative z-10 flex flex-col md:flex-row items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-5xl md:grid md:grid-cols-2 rounded-xl shadow-2xl shadow-cyan-500/10 dark:shadow-pink-500/10 overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white/10 dark:border-slate-800/50">
          <div className="hidden md:flex relative items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-8">
            <AbstractGraphics />
          </div>
          <div className="w-full p-8 sm:p-12">
            {emailSent ? (
              <div className="text-center flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6">
                  <Mail size={32} />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  Verification Email Sent!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Please check your inbox at <strong>{formData.email}</strong>{' '}
                  to continue.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                  You may need to log in again after verification.
                </p>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-extrabold mb-2 text-gray-800 dark:text-white">
                  Create Account
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Let's get you started!
                </p>
                <form onSubmit={handleSubmit} noValidate>
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
                      <p className="text-red-500 text-xs italic mt-2">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="password"
                      className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                    >
                      Password
                    </label>
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
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    {errors.password && !passwordTouched && (
                      <p className="text-red-500 text-xs italic mt-2">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Lock
                          className={`h-5 w-5 ${errors.confirmPassword ? 'text-red-500' : 'text-gray-400'}`}
                        />
                      </span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className={`pl-10 pr-10 py-3 w-full bg-gray-100 dark:bg-slate-800 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-gray-800 dark:text-gray-200 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-slate-700 focus:ring-cyan-500'}`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    <PasswordCriteriaIndicator
                      criteria={passwordCriteriaStatus}
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs italic mt-2">
                        {errors.confirmPassword}
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
                        {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                      </span>
                    </button>
                  </div>
                </form>
                <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-8">
                  Already have an account?{' '}
                  <Link
                    href="/signin"
                    className="font-semibold text-cyan-500 hover:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
                  >
                    Log In
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
