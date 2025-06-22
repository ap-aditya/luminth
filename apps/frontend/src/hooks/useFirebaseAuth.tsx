'use client';

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  reload,
  User,
  Auth,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../firebase/config';

// Define a specific union type for our errors for better type safety.
type AuthError = FirebaseError | Error;

// Define the shape of our context.
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUpWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: AuthError }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: AuthError }>;
  signUserOut: () => Promise<{ success: boolean; error?: AuthError }>;
}

// Create the context with safe default values.
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUpWithEmail: async () => ({ success: false, error: new Error('Auth not initialized') }),
  signInWithEmail: async () => ({ success: false, error: new Error('Auth not initialized') }),
  signUserOut: async () => ({ success: false, error: new Error('Auth not initialized') }),
});

// Create the Provider component.
export function AuthProvider({ children }: { children: ReactNode }) {
  const firebaseAuth = useProvideFirebaseAuth(auth);
  return <AuthContext.Provider value={firebaseAuth}>{children}</AuthContext.Provider>;
}

// Create the consumer hook.
export const useAuth = () => useContext(AuthContext);

// This is the core logic for the authentication hook.
function useProvideFirebaseAuth(firebaseAuth: Auth): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (authUser) => {
      // Set the user object from Firebase. The UI can then check user.emailVerified.
      setUser(authUser);
      setLoading(false);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [firebaseAuth]);

  const signUpWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await sendEmailVerification(userCredential.user);
      // Sign out to force a clean login after verification.
      await signOut(firebaseAuth);
      return { success: true };
    } catch (error) {
      console.error('Error signing up:', error);
      if (error instanceof FirebaseError) {
        return { success: false, error };
      }
      return { success: false, error: new Error('An unexpected error occurred during sign up.') };
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      // Reload user to get the latest emailVerified status.
      await reload(userCredential.user);
      
      // We check against the reloaded user from auth.currentUser
      if (auth.currentUser?.emailVerified) {
        return { success: true };
      } else {
        await signOut(firebaseAuth);
        return { success: false, error: new Error('Please verify your email before logging in.') };
      }
    } catch (error) {
      console.error('Error signing in:', error);
      if (error instanceof FirebaseError) {
        return { success: false, error };
      }
      return { success: false, error: new Error('An unexpected error occurred during sign in.') };
    } finally {
      setLoading(false);
    }
  };

  const signUserOut = async () => {
    setLoading(true);
    try {
      await signOut(firebaseAuth);
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      if (error instanceof FirebaseError) {
        return { success: false, error };
      }
      return { success: false, error: new Error('An unexpected error occurred during sign out.') };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    signUpWithEmail,
    signInWithEmail,
    signUserOut,
  };
}