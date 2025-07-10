'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import admin from 'firebase-admin';
import { applyRateLimit } from '@/lib/rate-limiter';

export async function generateCodeFromPrompt(
  promptId: string,
  promptText: string,
) {
  try {
    await applyRateLimit();

    const sessionCookie = (await cookies()).get('session')?.value;
    if (!sessionCookie) throw new Error('Authentication required');

    await admin.auth().verifySessionCookie(sessionCookie, true);
    const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1';

    const response = await fetch(
      `${process.env.FASTAPI_BASE_URL}/api/v1/prompts/generate/${promptId}/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionCookie}`,
          'x-internal-api-secret': process.env.INTERNAL_API_SECRET || '',
          'x-forwarded-for': ip,
        },
        body: JSON.stringify({ prompt_text: promptText }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate code.');
    }
    revalidatePath(`/prompts/${promptId}`);
    return { success: true, message: 'Code generated successfully.' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function renderPrompt(promptId: string) {
  try {
    await applyRateLimit();

    const sessionCookie = (await cookies()).get('session')?.value;
    if (!sessionCookie) throw new Error('Authentication required');

    await admin.auth().verifySessionCookie(sessionCookie, true);
    const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1';

    const response = await fetch(
      `${process.env.FASTAPI_BASE_URL}/api/v1/prompts/render/${promptId}/`,
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
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit render job.');
    }

    const result = await response.json();
    return { success: true, message: result.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCanvasFromPrompt(title: string, code: string) {
  await applyRateLimit();

  const sessionCookie = (await cookies()).get('session')?.value;
  if (!sessionCookie) throw new Error('Authentication required');

  await admin.auth().verifySessionCookie(sessionCookie, true);
  const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1';

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
      body: JSON.stringify({ title, code }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create canvas from prompt.');
  }

  const { canvas_id } = await response.json();
  revalidatePath('/history');
  redirect(`/canvases/${canvas_id}`);
}
