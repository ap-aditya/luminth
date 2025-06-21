'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useFirebaseAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SignUpInput, signUpSchema, PASSWORD_POLICY } from '../../utils/validationSchemas';
import { ZodError } from 'zod';

export default function SignUpPage() {
  const [formData, setFormData] = useState<SignUpInput>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [firebaseError, setFirebaseError] = useState<string>('');
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { signUpWithEmail, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && user.emailVerified) {
      router.replace('/dashboard');
    } else if (!loading && user && !user.emailVerified) {
      setEmailSent(true); 
    }
  }, [user, loading, router]);

  if (loading) {
    return <p>Loading authentication state...</p>;
  }

  if (user && user.emailVerified) {
    return <p>Redirecting to dashboard...</p>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'password') {
      const feedback = validatePasswordCriteria(value);
      setPasswordFeedback(feedback);
      const newErrors = { ...errors };
      delete newErrors.password;
      delete newErrors.confirmPassword;
      setErrors(newErrors);
    }

    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }

    setFirebaseError('');
  };

  const validatePasswordCriteria = (pwd: string): string[] => {
    const feedback: string[] = [];
    if (pwd.length < PASSWORD_POLICY.minLength) {
      feedback.push(`- Must be at least ${PASSWORD_POLICY.minLength} characters long.`);
    }
    if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(pwd)) {
      feedback.push('- Must contain at least one uppercase letter.');
    }
    if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(pwd)) {
      feedback.push('- Must contain at least one lowercase letter.');
    }
    if (PASSWORD_POLICY.requireNumeric && !/[0-9]/.test(pwd)) {
      feedback.push('- Must contain at least one number.');
    }
    if (PASSWORD_POLICY.requireNonAlphanumeric && !/[^a-zA-Z0-9]/.test(pwd)) {
      feedback.push('- Must contain at least one special character (e.g., !@#$%^&*).');
    }
    return feedback;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setFirebaseError('');
    setIsSubmitting(true);

    try {
      signUpSchema.parse(formData);
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((issue) => {
          if (issue.path && issue.path.length > 0) {
            fieldErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setFirebaseError('An unexpected validation error occurred.');
      }
      setIsSubmitting(false);
      return;
    }

    const { success, error: authError } = await signUpWithEmail(
      formData.email,
      formData.password
    );

    if (success) {
      setEmailSent(true);
    } else {
      setIsSubmitting(false);
      if (authError) {
        switch (authError.cause) {
          case 'auth/email-already-in-use':
            setErrors(prev => ({ ...prev, email: 'The email address is already in use by another account.' }));
            break;
          case 'auth/weak-password':
            setErrors(prev => ({ ...prev, password: 'Password is too weak. Please choose a stronger password.' }));
            setPasswordFeedback(validatePasswordCriteria(formData.password));
            break;
          case 'auth/invalid-email':
            setErrors(prev => ({ ...prev, email: 'Invalid email address format.' }));
            break;
          default:
            setFirebaseError(authError.message || 'An unexpected error occurred during sign up.');
        }
      } else {
        setFirebaseError('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign Up</h1>

        {emailSent ? (
          <div className="text-center text-green-600 mb-4">
            <p className="font-bold">Verification Email Sent!</p>
            <p>Please check your inbox (and spam folder) to verify your email address.</p>
            <p className="text-sm text-gray-500 mt-2">You might need to log in again after verification.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="text-red-500 text-xs italic mt-1">{errors.email}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-1 leading-tight focus:outline-none focus:shadow-outline ${errors.password ? 'border-red-500' : ''}`}
              />
              {errors.password && <p className="text-red-500 text-xs italic mt-1">{errors.password}</p>}
              {passwordFeedback.length > 0 && (
                <ul className="text-gray-600 text-xs mt-2 list-disc pl-5">
                  {passwordFeedback.map((msg, index) => (
                    <li key={index}>{msg}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm Password:</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.confirmPassword ? 'border-red-500' : ''}`}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs italic mt-1">{errors.confirmPassword}</p>}
            </div>
            {firebaseError && <p className="text-red-500 text-center text-sm mb-4">{firebaseError}</p>}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              >
                {isSubmitting ? 'Signing Up...' : 'Sign Up'}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-gray-600 text-sm mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-500 hover:text-blue-800">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}