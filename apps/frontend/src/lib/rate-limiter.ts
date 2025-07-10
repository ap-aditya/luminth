import { headers } from 'next/headers';
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

export async function applyRateLimit() {
  if (!ratelimit) {
    console.warn('Rate limiting is not configured. Skipping check.');
    return;
  }

  const headersObj = await headers();
  const ip = headersObj.get('x-forwarded-for') ?? '127.0.0.1';

  try {
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Rate limit exceeded')
    ) {
      throw error;
    }
    console.error('Could not connect to Redis for rate limiting:', error);
  }
}
