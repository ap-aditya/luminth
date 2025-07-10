'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { authenticatedAction } from '@/lib/safe-action';
import { User } from '@/types';
interface UserUpdatePayload {
  name?: string;
  avatar?: string;
  dob?: string | null;
}

export async function updateUserProfile(payload: UserUpdatePayload) {
  return authenticatedAction(async ({ sessionCookie, ip }) => {
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
    return updatedUser;
  });
}

export async function deleteUserAccount() {
  return authenticatedAction(async ({ sessionCookie, ip }) => {
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

    return { message: 'Account deleted successfully.' };
  });
}
