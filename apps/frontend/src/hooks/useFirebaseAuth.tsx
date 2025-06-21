'use client';

import { useState, useEffect, useContext, createContext } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification, 
  reload, 
  User,
} from 'firebase/auth';
import { auth } from '../firebase/config'; 

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUpWithEmail: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: Error }>;
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: Error }>;
  signUserOut: () => Promise<{ success: boolean; error?: Error }>;
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
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const firebaseAuth = useProvideFirebaseAuth();
  return (
    <AuthContext.Provider value={firebaseAuth}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

function useProvideFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        await reload(authUser);
        const updatedUser = auth.currentUser;
        if (updatedUser && updatedUser.emailVerified) {
          setUser(updatedUser);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const newUser = userCredential.user;
      await sendEmailVerification(newUser);
      setUser(null);
      return { success: true };
    } catch (error: any) {
      console.error('Error signing up:', error);
      setLoading(false);
      return { success: false, error: error as Error };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const signedInUser = userCredential.user;
      if (signedInUser && signedInUser.emailVerified) {
        setUser(signedInUser);
        return { success: true };
      } else {
        await signOut(auth);
        setLoading(false);
        return { success: false, error: new Error('Please verify your email address before logging in.') };
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      setLoading(false);
      return { success: false, error: error as Error };
    }
  };

  const signUserOut = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
      return { success: true };
    } catch (error: any) {
      console.error('Error signing out:', error);
      setLoading(false);
      return { success: false, error: error as Error };
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