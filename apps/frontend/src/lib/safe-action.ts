import { cookies, headers } from 'next/headers';
import admin from 'firebase-admin';
import { applyRateLimit } from '@/lib/rate-limiter';

interface AuthContext {
  sessionCookie: string;
  ip: string;
  uid: string;
}

export async function authenticatedAction<T>(
  action: (authContext: AuthContext) => Promise<T>,
) {
  try {
    await applyRateLimit();
    const sessionCookie = (await cookies()).get('session')?.value;
    if (!sessionCookie) {
      throw new Error('Authentication required. Please sign in.');
    }
    const decodedToken = await admin
      .auth()
      .verifySessionCookie(sessionCookie, true);
    const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1';
    const result = await action({ sessionCookie, ip, uid: decodedToken.uid });
    return { success: true, data: result };
  } catch (error: any) {
    if (error.digest?.includes('NEXT_REDIRECT')) {
      throw error;
    }
    return { success: false, error: error.message };
  }
}
