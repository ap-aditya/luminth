import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: '@upstash/ratelimit',
});

export const config = {
  matcher: '/api/:path*',
};

export default async function middleware(request: NextRequest) {
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
        }
      );
    }
  } catch (error) {
    console.error("Could not connect to Redis for rate limiting:", error);
  }

  return NextResponse.next();
}
