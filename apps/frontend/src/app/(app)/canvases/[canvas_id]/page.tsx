import React from 'react';
import { cookies, headers } from 'next/headers';
import admin from 'firebase-admin';
import { initializeFirebaseAdmin } from '@/firebase/adminConfig';
import { CanvasResponse } from '@/types';
import CanvasEditor from '@/components/canvas/CanvasEditor';
import { AlertTriangle } from 'lucide-react';

initializeFirebaseAdmin();
async function getCanvasData(canvasId: string): Promise<CanvasResponse | null> {
  const sessionCookie = (await cookies()).get('session')?.value;
  if (!sessionCookie) return null;

  try {
    await admin.auth().verifySessionCookie(sessionCookie, true);
    const fastapiUrl = `${process.env.FASTAPI_BASE_URL}/api/v1/canvases/${canvasId}`;
    const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1';

    const response = await fetch(fastapiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sessionCookie}`,
        'x-internal-api-secret': process.env.INTERNAL_API_SECRET || '',
        'x-forwarded-for': ip,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch canvas data:', response.statusText);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching canvas data:', error);
    return null;
  }
}

export default async function CanvasPage({
  params,
}: {
  params: Promise<{ canvas_id: string }>;
}) {
  const { canvas_id } = await params;
  const initialData = await getCanvasData(canvas_id);
  if (!initialData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Canvas Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400">
          The canvas you are looking for does not exist or you do not have
          permission to view it.
        </p>
      </div>
    );
  }

  return <CanvasEditor initialData={initialData} />;
}
