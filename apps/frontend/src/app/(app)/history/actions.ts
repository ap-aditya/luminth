'use server';

import { cookies, headers } from 'next/headers';
import admin from 'firebase-admin';
import { applyRateLimit } from '@/lib/rate-limiter';
import { revalidatePath } from 'next/cache';

export async function getHistory(page: number = 1, size: number = 20) {
  try {
    await applyRateLimit();

    const sessionCookie = (await cookies()).get('session')?.value;
    if (!sessionCookie) {
      throw new Error('Authentication required.');
    }

    await admin.auth().verifySessionCookie(sessionCookie, true);
    const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1';
    const url = new URL(`${process.env.FASTAPI_BASE_URL}/api/v1/history`);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('size', size.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionCookie}`,
        'x-internal-api-secret': process.env.INTERNAL_API_SECRET || '',
        'x-forwarded-for': ip,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch history.');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteHistoryItem(
  itemType: 'canvas' | 'prompt',
  itemId: string,
) {
  try {
    await applyRateLimit();

    const sessionCookie = (await cookies()).get('session')?.value;
    if (!sessionCookie) {
      throw new Error('Authentication required.');
    }

    await admin.auth().verifySessionCookie(sessionCookie, true);
    const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1';

    const response = await fetch(
      itemType == 'canvas'
        ? `${process.env.FASTAPI_BASE_URL}/api/v1/canvases/${itemId}`
        : `${process.env.FASTAPI_BASE_URL}/api/v1/prompts/${itemId}`,
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
      throw new Error(errorData.detail || 'Failed to delete item.');
    }

    revalidatePath('/history');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
