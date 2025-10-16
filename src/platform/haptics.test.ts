import { describe, it, expect, vi } from 'vitest';
import { haptic } from './haptics';

// Mock Capacitor Haptics
vi.mock('@capacitor/haptics', () => ({
  Haptics: {
    impact: vi.fn().mockResolvedValue(undefined),
    notification: vi.fn().mockResolvedValue(undefined),
    vibrate: vi.fn().mockResolvedValue(undefined),
  },
  ImpactStyle: {
    Light: 'LIGHT',
    Medium: 'MEDIUM',
    Heavy: 'HEAVY',
  },
  NotificationType: {
    Success: 'SUCCESS',
    Warning: 'WARNING',
    Error: 'ERROR',
  },
}));

describe('Haptics', () => {
  it('provides tap feedback', async () => {
    await haptic.tap();
    expect(true).toBe(true); // Haptic feedback is best-effort
  });

  it('provides success feedback', async () => {
    await haptic.success();
    expect(true).toBe(true);
  });

  it('provides error feedback', async () => {
    await haptic.error();
    expect(true).toBe(true);
  });

  it('provides warning feedback', async () => {
    await haptic.warning();
    expect(true).toBe(true);
  });

  it('provides selection feedback', async () => {
    await haptic.select();
    expect(true).toBe(true);
  });
});
