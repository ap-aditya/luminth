'use client';

import {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
  useCallback,
} from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
  reload,
  User,
  Auth,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../firebase/config';

type AuthError = FirebaseError | Error;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUpWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: AuthError }>;
  signInWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: AuthError }>;
  signUserOut: () => Promise<{ success: boolean; error?: AuthError }>;
  sendPasswordReset: (
    email: string,
  ) => Promise<{ success: boolean; error?: AuthError }>;
  confirmEmailVerification: (
    actionCode: string,
  ) => Promise<{ success: boolean; error?: AuthError }>;
  verifyResetCode: (
    actionCode: string,
  ) => Promise<{ success: boolean; email?: string; error?: AuthError }>;
  confirmResetPassword: (
    actionCode: string,
    newPassword: string,
  ) => Promise<{ success: boolean; error?: AuthError }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUpWithEmail: async () => ({
    success: false,
    error: new Error('Auth not initialized'),
  }),
  signInWithEmail: async () => ({
    success: false,
    error: new Error('Auth not initialized'),
  }),
  signUserOut: async () => ({
    success: false,
    error: new Error('Auth not initialized'),
  }),
  sendPasswordReset: async () => ({
    success: false,
    error: new Error('Auth not initialized'),
  }),
  confirmEmailVerification: async () => ({
    success: false,
    error: new Error('Auth not initialized'),
  }),
  verifyResetCode: async () => ({
    success: false,
    error: new Error('Auth not initialized'),
  }),
  confirmResetPassword: async () => ({
    success: false,
    error: new Error('Auth not initialized'),
  }),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const firebaseAuth = useProvideFirebaseAuth(auth);
  return (
    <AuthContext.Provider value={firebaseAuth}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

function useProvideFirebaseAuth(firebaseAuth: Auth): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [firebaseAuth]);

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          firebaseAuth,
          email,
          password,
        );
        await sendEmailVerification(userCredential.user);
        await signOut(firebaseAuth);
        return { success: true };
      } catch (error) {
        console.error('Error signing up:', error);
        if (error instanceof FirebaseError) {
          return { success: false, error };
        }
        return {
          success: false,
          error: new Error('An unexpected error occurred during sign up.'),
        };
      }
    },
    [firebaseAuth],
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        const userCredential = await signInWithEmailAndPassword(
          firebaseAuth,
          email,
          password,
        );
        await reload(userCredential.user);

        if (userCredential.user?.emailVerified) {
          return { success: true };
        } else {
          await signOut(firebaseAuth);
          return {
            success: false,
            error: new Error('Please verify your email before logging in.'),
          };
        }
      } catch (error) {
        console.error('Error signing in:', error);
        if (error instanceof FirebaseError) {
          return { success: false, error };
        }
        return {
          success: false,
          error: new Error('An unexpected error occurred during sign in.'),
        };
      }
    },
    [firebaseAuth],
  );

  const signUserOut = useCallback(async () => {
    try {
      await signOut(firebaseAuth);
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      if (error instanceof FirebaseError) {
        return { success: false, error };
      }
      return {
        success: false,
        error: new Error('An unexpected error occurred during sign out.'),
      };
    }
  }, [firebaseAuth]);

  const sendPasswordReset = useCallback(
    async (email: string) => {
      try {
        await sendPasswordResetEmail(firebaseAuth, email);
        return { success: true };
      } catch (error) {
        console.error('Error sending password reset email:', error);
        if (error instanceof FirebaseError) {
          return { success: false, error };
        }
        return {
          success: false,
          error: new Error('An unexpected error occurred.'),
        };
      }
    },
    [firebaseAuth],
  );

  const confirmEmailVerification = useCallback(
    async (actionCode: string) => {
      try {
        await applyActionCode(firebaseAuth, actionCode);

        if (firebaseAuth.currentUser) {
          await reload(firebaseAuth.currentUser);
        }
        return { success: true };
      } catch (error) {
        console.error('Error confirming email verification:', error);
        if (error instanceof FirebaseError) {
          return { success: false, error };
        }
        return {
          success: false,
          error: new Error('An unexpected error occurred.'),
        };
      }
    },
    [firebaseAuth],
  );

  const verifyResetCode = useCallback(
    async (actionCode: string) => {
      try {
        const email = await verifyPasswordResetCode(firebaseAuth, actionCode);
        return { success: true, email };
      } catch (error) {
        console.error('Error verifying password reset code:', error);
        return { success: false, error: error as AuthError };
      }
    },
    [firebaseAuth],
  );

  const confirmResetPassword = useCallback(
    async (actionCode: string, newPassword: string) => {
      try {
        await confirmPasswordReset(firebaseAuth, actionCode, newPassword);
        return { success: true };
      } catch (error) {
        console.error('Error confirming password reset:', error);
        return { success: false, error: error as AuthError };
      }
    },
    [firebaseAuth],
  );

  return {
    user,
    loading,
    signUpWithEmail,
    signInWithEmail,
    signUserOut,
    sendPasswordReset,
    confirmEmailVerification,
    verifyResetCode,
    confirmResetPassword,
  };
}
