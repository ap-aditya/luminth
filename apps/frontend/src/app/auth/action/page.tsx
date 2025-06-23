'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { passwordSchema } from '@/utils/validationSchemas';
import {
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { usePasswordValidation } from '@/hooks/usePasswordValidation';

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function ResetPasswordForm({
  actionCode,
  onPasswordReset,
}: {
  actionCode: string;
  onPasswordReset: () => void;
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { confirmResetPassword } = useAuth();

  const { passwordMessage, validatePassword } = usePasswordValidation();

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setNewPassword(password);
    validatePassword(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = passwordSchema.safeParse(newPassword);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const { success } = await confirmResetPassword(actionCode, newPassword);

    if (success) {
      onPasswordReset();
    } else {
      setError(
        'Failed to reset password. The link may have expired or already been used.',
      );
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg p-3 mb-4 flex items-center">
          <AlertTriangle className="mr-2 h-4 w-4" />
          {error}
        </div>
      )}
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
          New Password
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock className="h-5 w-5 text-gray-400" />
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={handleNewPasswordChange}
            required
            className="pl-10 pr-10 py-3 w-full bg-gray-100 dark:bg-slate-800 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-slate-700 focus:ring-cyan-500"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
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
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
          Confirm New Password
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock className="h-5 w-5 text-gray-400" />
          </span>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="pl-10 pr-10 py-3 w-full bg-gray-100 dark:bg-slate-800 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-slate-700 focus:ring-cyan-500"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative w-full inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white bg-cyan-500 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-cyan-500/50"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-pink-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
          <span className="relative">
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </span>
        </button>
      </div>
    </form>
  );
}

function AuthActionHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const actionCode = searchParams.get('oobCode');
  const { confirmEmailVerification, verifyResetCode } = useAuth();

  const [status, setStatus] = useState<
    | 'loading'
    | 'invalid'
    | 'valid_password_reset'
    | 'success_password_reset'
    | 'success_email_verified'
  >('loading');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (!actionCode) {
      setStatus('invalid');
      return;
    }

    if (mode === 'resetPassword') {
      verifyResetCode(actionCode).then((result) => {
        if (result.success && result.email) {
          setUserEmail(result.email);
          setStatus('valid_password_reset');
        } else {
          setStatus('invalid');
        }
      });
    } else if (mode === 'verifyEmail') {
      confirmEmailVerification(actionCode).then((result) => {
        if (result.success) {
          setStatus('success_email_verified');
        } else {
          setStatus('invalid');
        }
      });
    } else {
      setStatus('invalid');
    }
  }, [actionCode, mode, confirmEmailVerification, verifyResetCode]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (
      status === 'success_password_reset' ||
      status === 'success_email_verified'
    ) {
      timer = setTimeout(() => {
        router.replace('/auth/signin');
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [status, router]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        );
      case 'invalid':
        return (
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Invalid Link
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              This link is invalid or has expired. Please try the action again.
            </p>
            <Link
              href="/auth/signin"
              className="text-cyan-800 dark:text-cyan-500 hover:underline mt-4 inline-block"
            >
              Go to Login
            </Link>
          </div>
        );
      case 'success_password_reset':
        return (
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Password Reset Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting to login page...
            </p>
          </div>
        );
      case 'success_email_verified':
        return (
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Email Verified Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Thank you for verifying your email. Redirecting to login page...
            </p>
          </div>
        );
      case 'valid_password_reset':
        return (
          <>
            <h1 className="text-3xl font-extrabold mb-2 text-gray-800 dark:text-white">
              Reset Your Password
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Create a new password for{' '}
              <strong className="text-cyan-800 dark:text-cyan-500">
                {userEmail}
              </strong>
              .
            </p>
            <ResetPasswordForm
              actionCode={actionCode!}
              onPasswordReset={() => setStatus('success_password_reset')}
            />
          </>
        );
    }
  };
  return renderContent();
}

export default function ActionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-gray-50 dark:bg-slate-900 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      }
    >
      <AuthActionHandler />
    </Suspense>
  );
}
