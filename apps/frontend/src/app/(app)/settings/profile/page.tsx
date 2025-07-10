import React from 'react';
import { cookies, headers } from 'next/headers';
import admin from 'firebase-admin';
import { initializeFirebaseAdmin } from '@/firebase/adminConfig';
import { User } from '@/types';
import ProfileForm from '@/components/settings/ProfileForm';
import { AlertTriangle } from 'lucide-react';

initializeFirebaseAdmin();

async function getUserData(): Promise<User | null> {
  const sessionCookie = (await cookies()).get('session')?.value;
  if (!sessionCookie) return null;

  try {
    await admin.auth().verifySessionCookie(sessionCookie, true);
    const fastapiUrl = `${process.env.FASTAPI_BASE_URL}/api/v1/users/me`;
    const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1';

    const response = await fetch(fastapiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sessionCookie}`,
        'x-internal-api-secret': process.env.INTERNAL_API_SECRET || '',
        'x-forwarded-for': ip,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch user data:', response.statusText);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

export default async function ProfilePage() {
  const user = await getUserData();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Could Not Load Profile</h2>
        <p className="text-gray-600 dark:text-gray-400">
          There was an error fetching your profile data. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
        Profile Settings
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Manage your account details and preferences.
      </p>
      <ProfileForm user={user} />
    </div>
  );
}
