'use server';

import { revalidatePath } from 'next/cache';
import { authenticatedAction } from '@/lib/safe-action';

export async function updateCanvas(
  canvasId: string,
  title: string,
  code: string,
) {
  return authenticatedAction(async ({ sessionCookie, ip }) => {
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
    return { message: 'Saved' };
  });
}

export async function renderCanvas(canvasId: string) {
  return authenticatedAction(async ({ sessionCookie, ip }) => {
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
    return { message: result.message };
  });
}
