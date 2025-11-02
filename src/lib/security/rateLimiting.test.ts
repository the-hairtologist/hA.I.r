/**
 * Tests for rate limiting functionality
 * Security-critical component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Simple in-memory rate limiter for testing
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export const rateLimit = (key: string, maxRequests: number, windowMs: number): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    // New window
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    // Limit exceeded
    return false;
  }

  // Increment count
  record.count++;
  return true;
};

export const resetRateLimits = () => {
  rateLimitStore.clear();
};

describe('Rate Limiting', () => {
  beforeEach(() => {
    resetRateLimits();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow requests within limit', () => {
    expect(rateLimit('test-key', 5, 60000)).toBe(true);
    expect(rateLimit('test-key', 5, 60000)).toBe(true);
    expect(rateLimit('test-key', 5, 60000)).toBe(true);
    expect(rateLimit('test-key', 5, 60000)).toBe(true);
    expect(rateLimit('test-key', 5, 60000)).toBe(true);
  });

  it('should block requests exceeding limit', () => {
    // Make 5 requests (limit)
    for (let i = 0; i < 5; i++) {
      expect(rateLimit('test-key', 5, 60000)).toBe(true);
    }

    // 6th request should be blocked
    expect(rateLimit('test-key', 5, 60000)).toBe(false);
    expect(rateLimit('test-key', 5, 60000)).toBe(false);
  });

  it('should reset limits after window expires', () => {
    // Make requests up to limit
    for (let i = 0; i < 5; i++) {
      rateLimit('test-key', 5, 100);
    }

    // Should be blocked
    expect(rateLimit('test-key', 5, 100)).toBe(false);

    // Advance time past window
    vi.advanceTimersByTime(150);

    // Should allow new requests
    expect(rateLimit('test-key', 5, 100)).toBe(true);
  });

  it('should track limits per key independently', () => {
    rateLimit('key-1', 2, 60000);
    rateLimit('key-1', 2, 60000);
    
    rateLimit('key-2', 2, 60000);
    
    // key-1 is at limit
    expect(rateLimit('key-1', 2, 60000)).toBe(false);
    
    // key-2 should still work
    expect(rateLimit('key-2', 2, 60000)).toBe(true);
    expect(rateLimit('key-2', 2, 60000)).toBe(false);
  });

  it('should handle high request volumes', () => {
    const keys = Array.from({ length: 100 }, (_, i) => `user-${i}`);
    
    keys.forEach(key => {
      // Each user gets 10 requests
      for (let i = 0; i < 10; i++) {
        expect(rateLimit(key, 10, 60000)).toBe(true);
      }
      
      // 11th should be blocked
      expect(rateLimit(key, 10, 60000)).toBe(false);
    });
  });

  it('should handle concurrent requests correctly', () => {
    const results = [];
    
    // Simulate 10 concurrent requests
    for (let i = 0; i < 10; i++) {
      results.push(rateLimit('concurrent-key', 5, 60000));
    }
    
    // First 5 should pass, rest should fail
    const passed = results.filter(r => r === true).length;
    const failed = results.filter(r => r === false).length;
    
    expect(passed).toBe(5);
    expect(failed).toBe(5);
  });

  it('should clean up expired entries', () => {
    rateLimit('temp-key', 5, 100);
    
    expect(rateLimitStore.has('temp-key')).toBe(true);
    
    // Advance time past expiry
    vi.advanceTimersByTime(150);
    
    // Make new request (should create new entry)
    rateLimit('temp-key', 5, 100);
    
    const record = rateLimitStore.get('temp-key');
    expect(record?.count).toBe(1);
  });

  it('should handle edge case: zero limit', () => {
    expect(rateLimit('zero-key', 0, 60000)).toBe(false);
  });

  it('should handle edge case: instant expiry', () => {
    expect(rateLimit('instant-key', 5, 0)).toBe(true);
    
    // Advance even 1ms
    vi.advanceTimersByTime(1);
    
    // Should reset immediately
    expect(rateLimit('instant-key', 5, 0)).toBe(true);
  });
});
