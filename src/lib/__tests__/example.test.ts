import { describe, it, expect } from 'vitest';

describe('Basic Test Suite', () => {
  it('should pass basic assertion', () => {
    expect(true).toBe(true);
  });

  it('should perform simple math', () => {
    expect(2 + 2).toBe(4);
  });
});
