import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import admin from 'firebase-admin';
import { initializeFirebaseAdmin } from '@/firebase/adminConfig';
initializeFirebaseAdmin();

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required.' },
        { status: 400 },
      );
    }

    const expiresIn = 60 * 60 * 24 * 14 * 1000;

    const sessionCookie = await admin
      .auth()
      .createSessionCookie(idToken, { expiresIn });

    const cookiesStore = await cookies();
    cookiesStore.set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      path: '/',
      sameSite: 'lax',
    });

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Session login error:', error);
    return NextResponse.json(
      { error: 'Failed to create session.' },
      { status: 401 },
    );
  }
}
