import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookiesStore = await cookies();
    cookiesStore.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: -1,
      path: '/',
      sameSite: 'lax',
    });

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Session logout error:', error);
    return NextResponse.json(
      { error: 'Failed to clear session.' },
      { status: 500 },
    );
  }
}
