import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
      prefix: '@upstash/ratelimit',
    })
  : null;

const publicPaths = [
  '/',
  '/LissajousCurves.mp4',
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/action'
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api')) {
    if (ratelimit) {
      const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
      try {
        const { success, limit, reset, remaining } = await ratelimit.limit(ip);

        if (!success) {
          const resetDate = new Date(reset).toUTCString();
          return new NextResponse(
            'You are being rate-limited. Please try again later.',
            {
              status: 429,
              headers: {
                'X-RateLimit-Limit': limit.toString(),
                'X-RateLimit-Remaining': remaining.toString(),
                'X-RateLimit-Reset': reset.toString(),
                'Retry-After': resetDate,
              },
            },
          );
        }
      } catch (error) {
        console.error('Could not connect to Redis for rate limiting:', error);
      }
    }
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('session');
  const isPublicPath = publicPaths.some(
    (path) =>
      pathname.startsWith(path) &&
      (pathname.length === path.length || pathname[path.length] === '/'),
  );
  if (sessionCookie && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!sessionCookie && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/signin';
    url.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
