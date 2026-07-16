export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStore>();

export function rateLimit(ip: string, config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }) {
  const now = Date.now();
  const record = store.get(ip);

  if (!record) {
    store.set(ip, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { allowed: true, retryAfter: 0 };
  }

  if (now > record.resetTime) {
    store.set(ip, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { allowed: true, retryAfter: 0 };
  }

  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  record.count += 1;
  return { allowed: true, retryAfter: 0 };
}
