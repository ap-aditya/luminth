import React from 'react';
import { cookies, headers } from 'next/headers';
import admin from 'firebase-admin';
import { initializeFirebaseAdmin } from '@/firebase/adminConfig';
import { DashboardData } from '@/types';
import ClientLayout from '@/components/layout/ClientLayout';

initializeFirebaseAdmin();

async function getLayoutData(): Promise<DashboardData | null> {
  const sessionCookie = (await cookies()).get('session')?.value;
  if (!sessionCookie) return null;

  try {
    await admin.auth().verifySessionCookie(sessionCookie, true);
    const fastapiUrl = `${process.env.FASTAPI_BASE_URL}/api/v1/dashboard/`;
    const clientIp = (await headers()).get('x-forwarded-for') ?? '127.0.0.1';

    const response = await fetch(fastapiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionCookie}`,
        'x-internal-api-secret': process.env.INTERNAL_API_SECRET || '',
        'x-forwarded-for': clientIp,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        'Failed to fetch layout data from FastAPI:',
        response.status,
        errorText,
      );
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error verifying session or fetching data:', error);
    return null;
  }
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getLayoutData();
  return <ClientLayout data={data}>{children}</ClientLayout>;
}
