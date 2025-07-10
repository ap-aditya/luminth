'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import admin from 'firebase-admin';
import { applyRateLimit } from '@/lib/rate-limiter';
export async function createCanvas() {
  await applyRateLimit();

  const sessionCookie = (await cookies()).get('session')?.value;
  if (!sessionCookie) throw new Error('Authentication required');
  await admin.auth().verifySessionCookie(sessionCookie, true);

  const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1';

  const response = await fetch(`${process.env.FASTAPI_BASE_URL}/api/v1/canvases/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionCookie}`,
      'x-internal-api-secret': process.env.INTERNAL_API_SECRET || '',
      'x-forwarded-for': ip, 
    },
  });

  if (!response.ok) {

    throw new Error('Failed to create canvas.');
  }

  const { canvas_id } = await response.json();
  revalidatePath('/history');
  redirect(`/canvases/${canvas_id}`);
}


export async function createPrompt() {
  await applyRateLimit();
  const sessionCookie = (await cookies()).get('session')?.value;
  if (!sessionCookie) throw new Error('Authentication required');

  await admin.auth().verifySessionCookie(sessionCookie, true);

  const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1';

  const response = await fetch(`${process.env.FASTAPI_BASE_URL}/api/v1/prompts/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionCookie}`,
      'x-internal-api-secret': process.env.INTERNAL_API_SECRET || '',
      'x-forwarded-for': ip, 
    },
  });

  if (!response.ok) {
    throw new Error('Failed to create prompt.');
  }

  const { prompt_id } = await response.json();
  
  revalidatePath('/history');
  redirect(`/prompts/${prompt_id}`);
}
