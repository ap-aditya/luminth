'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { authenticatedAction } from '@/lib/safe-action';

export async function createCanvas() {
  await authenticatedAction(async ({ sessionCookie, ip }) => {
    const response = await fetch(
      `${process.env.FASTAPI_BASE_URL}/api/v1/canvases/`,
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
      throw new Error('Failed to create canvas.');
    }

    const { canvas_id } = await response.json();
    revalidatePath('/history');
    redirect(`/canvases/${canvas_id}`);
  });
}

export async function createPrompt() {
  await authenticatedAction(async ({ sessionCookie, ip }) => {
    const response = await fetch(
      `${process.env.FASTAPI_BASE_URL}/api/v1/prompts/`,
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
      throw new Error('Failed to create prompt.');
    }

    const { prompt_id } = await response.json();
    revalidatePath('/history');
    redirect(`/prompts/${prompt_id}`);
  });
}
