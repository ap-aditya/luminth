'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FirebaseError } from 'firebase/app';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
} from 'lucide-react';

import { useAuth } from '@/hooks/useFirebaseAuth';
import { SignUpInput, signUpSchema } from '@/utils/validationSchemas';
import { usePasswordValidation } from '@/hooks/usePasswordValidation';
import PasswordInstructions from '@/components/auth/PasswordInstructions';

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
  const { user, loading, signUpWithEmail } = useAuth();
  const router = useRouter();
  const [emailSent, setEmailSent] = useState(false);
  const [formData, setFormData] = useState<SignUpInput>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [firebaseError, setFirebaseError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { passwordMessage, validatePassword } = usePasswordValidation();

  useEffect(() => {
    if (!loading && user?.emailVerified) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'password') {
      validatePassword(value);
    }
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

  return (
    <>
      {emailSent ? (
        <div className="text-center flex flex-col items-center justify-center h-full">
          <div className="w-16 h-16 bg-green-500/20 text-green-900 rounded-full flex items-center justify-center mb-6">
            <Mail size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Verification Email Sent!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please check your inbox at <strong>{formData.email}</strong> to
            continue.
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
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-gray-700 dark:text-gray-300 text-sm font-bold"
                >
                  Password
                </label>
                <div className="relative group">
                  <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                  <PasswordInstructions />
                </div>
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
              {passwordMessage && (
                <div
                  className={`flex items-center mt-2 text-xs ${passwordMessage.isValid ? 'text-green-900 dark:text-green-500' : 'text-red-500'}`}
                >
                  {passwordMessage.isValid ? (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-1" />
                  )}
                  {passwordMessage.text}
                </div>
              )}
              {errors.password && (
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
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
              href="/auth/signin"
              className="font-semibold text-cyan-800 hover:text-cyan-700 dark:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </>
      )}
    </>
  );
}
