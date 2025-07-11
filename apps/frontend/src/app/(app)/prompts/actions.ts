'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { authenticatedAction } from '@/lib/safe-action';

export async function generateCodeFromPrompt(
  promptId: string,
  promptText: string,
) {
  return authenticatedAction(async ({ sessionCookie, ip }) => {
    const response = await fetch(
      `${process.env.FASTAPI_BASE_URL}/api/v1/prompts/generate/${promptId}`,
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
    return { message: 'Code generated successfully.' };
  });
}

export async function renderPrompt(promptId: string) {
  return authenticatedAction(async ({ sessionCookie, ip }) => {
    const response = await fetch(
      `${process.env.FASTAPI_BASE_URL}/api/v1/prompts/render/${promptId}`,
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
    return { message: result.message };
  });
}

export async function createCanvasFromPrompt(title: string, code: string) {
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
  });
}
