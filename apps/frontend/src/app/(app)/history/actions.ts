'use server';

import { revalidatePath } from 'next/cache';
import { authenticatedAction } from '@/lib/safe-action';

export async function getHistory(page: number = 1, size: number = 20) {
  return authenticatedAction(async ({ sessionCookie, ip }) => {
    const url = new URL(`${process.env.FASTAPI_BASE_URL}/api/v1/history/`);
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
    return data;
  });
}

export async function deleteHistoryItem(
  itemType: 'canvas' | 'prompt',
  itemId: string,
) {
  return authenticatedAction(async ({ sessionCookie, ip }) => {
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
    return { message: 'Item deleted successfully.' };
  });
}
