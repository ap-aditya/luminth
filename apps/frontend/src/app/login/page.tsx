'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useFirebaseAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoginInput, loginSchema } from '../../utils/validationSchemas';
import { ZodError } from 'zod';

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [firebaseError, setFirebaseError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signInWithEmail, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.emailVerified) {
        router.replace('/dashboard');
      } else {
        router.replace('/verify-email-pending');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <p>Loading authentication state...</p>;
  }

  if (user && user.emailVerified) {
    return <p>Redirecting to dashboard...</p>;
  }

  if (user && !user.emailVerified) {
    return <p>Redirecting to email verification status...</p>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }

    setFirebaseError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setFirebaseError('');
    setIsSubmitting(true);

    try {
      loginSchema.parse(formData);
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

    const { success, error: authError } = await signInWithEmail(
      formData.email,
      formData.password
    );

    if (success) {
    } else {
      setIsSubmitting(false);
      if (authError) {
        switch (authError.cause) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            setFirebaseError('Invalid email or password.');
            break;
          case 'auth/invalid-email':
            setErrors((prev) => ({ ...prev, email: 'Invalid email address format.' }));
            break;
          default:
            setFirebaseError(authError.message || 'An unexpected error occurred during login.');
        }
      } else {
        setFirebaseError('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email:
            </label>
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
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${errors.password ? 'border-red-500' : ''}`}
            />
            {errors.password && <p className="text-red-500 text-xs italic mt-1">{errors.password}</p>}
          </div>
          {firebaseError && <p className="text-red-500 text-center text-sm mb-4">{firebaseError}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              {isSubmitting ? 'Logging In...' : 'Log In'}
            </button>
          </div>
        </form>
        <p className="text-center text-gray-600 text-sm mt-4">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-500 hover:text-blue-800">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}