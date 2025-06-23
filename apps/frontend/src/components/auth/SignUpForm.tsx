'use client';

import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
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
const PasswordInstructions = dynamic(
  () => import('@/components/auth/PasswordInstructions'),
  { ssr: false },
);
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

type FormState = {
  formData: SignUpInput;
  errors: Record<string, string>;
  firebaseError: string;
  isSubmitting: boolean;
};

type FormAction =
  | { type: 'SET_FIELD'; field: keyof SignUpInput; value: string }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_FAILURE'; error: string; field?: 'email' | 'password' };

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_FIELD':
      const newErrors = { ...state.errors };
      delete newErrors[action.field];
      return {
        ...state,
        formData: { ...state.formData, [action.field]: action.value },
        errors: newErrors,
        firebaseError: '',
      };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors, isSubmitting: false };
    case 'SUBMIT_START':
      return { ...state, isSubmitting: true, errors: {}, firebaseError: '' };
    case 'SUBMIT_SUCCESS':
      return { ...state, isSubmitting: false };
    case 'SUBMIT_FAILURE':
      const fieldErrors = action.field
        ? { ...state.errors, [action.field]: action.error }
        : state.errors;
      return {
        ...state,
        isSubmitting: false,
        firebaseError: action.field ? '' : action.error,
        errors: fieldErrors,
      };
    default:
      return state;
  }
};

const initialState: FormState = {
  formData: { email: '', password: '', confirmPassword: '' },
  errors: {},
  firebaseError: '',
  isSubmitting: false,
};

export default function SignUpForm() {
  const { user, loading, signUpWithEmail } = useAuth();
  const router = useRouter();
  const [emailSent, setEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [state, dispatch] = useReducer(formReducer, initialState);
  const { formData, errors, firebaseError, isSubmitting } = state;
  const { passwordMessage, validatePassword } = usePasswordValidation();

  useEffect(() => {
    if (!loading && user?.emailVerified) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch({ type: 'SET_FIELD', field: name as keyof SignUpInput, value });
    if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      dispatch({ type: 'SUBMIT_START' });

      const validationResult = signUpSchema.safeParse(formData);
      if (!validationResult.success) {
        const fieldErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((issue) => {
          if (issue.path[0])
            fieldErrors[issue.path[0] as string] = issue.message;
        });
        dispatch({ type: 'SET_ERRORS', errors: fieldErrors });
        return;
      }

      const { success, error: authError } = await signUpWithEmail(
        formData.email,
        formData.password,
      );

      if (success) {
        dispatch({ type: 'SUBMIT_SUCCESS' });
        setEmailSent(true);
      } else if (authError) {
        const friendlyError = getFriendlyFirebaseError(
          (authError as FirebaseError).code || 'unknown-error',
        );
        dispatch({
          type: 'SUBMIT_FAILURE',
          error: friendlyError.message,
          field: friendlyError.field,
        });
      }
    },
    [formData, signUpWithEmail, router],
  ); // Dependencies for useCallback

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <p className="text-gray-800 dark:text-gray-200">Loading session...</p>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="text-center flex flex-col items-center justify-center h-full">
        <div className="w-16 h-16 bg-green-500/20 dark:bg-green-200/20 text-green-800 dark:text-green-500 rounded-full flex items-center justify-center mb-6">
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
    );
  }

  return (
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
          <p className="text-red-500 text-xs italic mt-2">{errors.email}</p>
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
          <p className="text-red-500 text-xs italic mt-2">{errors.password}</p>
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
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
          <span className="relative">
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </span>
        </button>
      </div>
    </form>
  );
}
