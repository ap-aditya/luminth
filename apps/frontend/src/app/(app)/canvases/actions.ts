'use server';

import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import admin from 'firebase-admin';
import { applyRateLimit } from '@/lib/rate-limiter';

export async function updateCanvas(
  canvasId: string,
  title: string,
  code: string,
) {
  try {
    await applyRateLimit();

    const sessionCookie = (await cookies()).get('session')?.value;
    if (!sessionCookie) throw new Error('Authentication required');

    await admin.auth().verifySessionCookie(sessionCookie, true);
    const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1';

    const response = await fetch(
      `${process.env.FASTAPI_BASE_URL}/api/v1/canvases/${canvasId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionCookie}`,
          'x-internal-api-secret': process.env.INTERNAL_API_SECRET || '',
          'x-forwarded-for': ip,
        },
        body: JSON.stringify({ title, code }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to save canvas.');
    }

    revalidatePath(`/canvases/${canvasId}`);
    return { success: true, message: 'Saved' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function renderCanvas(canvasId: string) {
  try {
    await applyRateLimit();

    const sessionCookie = (await cookies()).get('session')?.value;
    if (!sessionCookie) throw new Error('Authentication required');

    await admin.auth().verifySessionCookie(sessionCookie, true);
    const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1';

    const response = await fetch(
      `${process.env.FASTAPI_BASE_URL}/api/v1/canvases/render/${canvasId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionCookie}`,
          'x-internal-api-secret': process.env.INTERNAL_API_SECRET || '',
          'x-forwarded-for': ip,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to submit render job.');
    }
    const result = await response.json();
    return { success: true, message: result.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
