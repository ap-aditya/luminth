'use client';

import React, { useReducer, useCallback } from 'react';
import { Mail, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { FirebaseError } from 'firebase/app';

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

type FormState = {
  email: string;
  error: string;
  successMessage: string;
  isSubmitting: boolean;
};

type FormAction =
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS'; payload: string }
  | { type: 'SUBMIT_FAILURE'; payload: string };

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_EMAIL':
      return { ...state, email: action.payload, error: '', successMessage: '' };
    case 'SUBMIT_START':
      return { ...state, isSubmitting: true, error: '', successMessage: '' };
    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        isSubmitting: false,
        successMessage: action.payload,
        email: '',
      };
    case 'SUBMIT_FAILURE':
      return { ...state, isSubmitting: false, error: action.payload };
    default:
      return state;
  }
};

const initialState: FormState = {
  email: '',
  error: '',
  successMessage: '',
  isSubmitting: false,
};

export default function ForgotPasswordForm() {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const { email, error, successMessage, isSubmitting } = state;
  const { sendPasswordReset } = useAuth();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      dispatch({ type: 'SUBMIT_START' });

      if (!email.trim()) {
        dispatch({
          type: 'SUBMIT_FAILURE',
          payload: 'Please enter your email address.',
        });
        return;
      }

      const { success, error: authError } = await sendPasswordReset(email);
      const genericSuccessMessage =
        'If an account exists for this email, a password reset link has been sent. Please check your inbox.';

      if (success) {
        dispatch({ type: 'SUBMIT_SUCCESS', payload: genericSuccessMessage });
      } else if (authError) {
        const friendlyMessage = getFriendlyFirebaseError(
          (authError as FirebaseError).code,
        );
        if (friendlyMessage) {
          dispatch({ type: 'SUBMIT_FAILURE', payload: friendlyMessage });
        } else {
          dispatch({ type: 'SUBMIT_SUCCESS', payload: genericSuccessMessage });
        }
      }
    },
    [email, sendPasswordReset],
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg p-3 mb-4 flex items-center">
          <AlertTriangle className="mr-2 h-4 w-4" />
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-900 dark:text-green-500 text-sm rounded-lg p-3 mb-4 flex items-center">
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
            onChange={(e) =>
              dispatch({ type: 'SET_EMAIL', payload: e.target.value })
            }
            required
            className={`pl-10 pr-4 py-3 w-full bg-gray-100 dark:bg-slate-800 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-gray-800 dark:text-gray-200 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-slate-700 focus:ring-cyan-500'}`}
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="mt-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative w-full inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white bg-cyan-500 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:bg-cyan-600 disabled:opacity-50"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-pink-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
          <span className="relative">
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </span>
        </button>
      </div>
    </form>
  );
}
