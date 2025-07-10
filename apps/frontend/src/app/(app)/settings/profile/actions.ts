'use server';

import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import admin from 'firebase-admin';
import { applyRateLimit } from '@/lib/rate-limiter';
import { User } from '@/types';

interface UserUpdatePayload {
  name?: string;
  avatar?: string;
  dob?: string | null;
}

export async function updateUserProfile(payload: UserUpdatePayload) {
  try {
    await applyRateLimit();

    const sessionCookie = (await cookies()).get('session')?.value;
    if (!sessionCookie) {
      throw new Error('Authentication required. Please sign in again.');
    }

    await admin.auth().verifySessionCookie(sessionCookie, true);
    const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1';

    const response = await fetch(
      `${process.env.FASTAPI_BASE_URL}/api/v1/users/me`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionCookie}`,
          'x-internal-api-secret': process.env.INTERNAL_API_SECRET || '',
          'x-forwarded-for': ip,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update profile.');
    }

    revalidatePath('/', 'layout');

    const updatedUser: User = await response.json();
    return { success: true, user: updatedUser };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteUserAccount() {
  try {
    await applyRateLimit();

    const sessionCookie = (await cookies()).get('session')?.value;
    if (!sessionCookie) {
      throw new Error('Authentication required.');
    }

    await admin.auth().verifySessionCookie(sessionCookie, true);
    const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1';

    const response = await fetch(
      `${process.env.FASTAPI_BASE_URL}/api/v1/users/me`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${sessionCookie}`,
          'x-internal-api-secret': process.env.INTERNAL_API_SECRET || '',
          'x-forwarded-for': ip,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete account.');
    }

    (await cookies()).set('session', '', { maxAge: -1 });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
