/**
 * Unit Tests for Enhanced Analytics
 * Testing analytics event tracking
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackEvent, trackPageView, trackConversion } from '../enhancedAnalytics';

// Mock console methods to avoid noise in tests
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('enhancedAnalytics', () => {
  describe('trackEvent', () => {
    it('tracks appointment booked event', () => {
      const result = trackEvent('appointment_booked', {
        stylist_id: 'stylist-1',
        service_type: 'Hair Color',
        value: 150,
      });
      
      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        'appointment_booked',
        expect.any(Object)
      );
    });

    it('tracks formula generated event', () => {
      const result = trackEvent('formula_generated', {
        ai_model: 'gpt-5',
        confidence: 0.95,
      });
      
      expect(result).toBe(true);
    });

    it('tracks user signup event', () => {
      const result = trackEvent('user_signup', {
        method: 'email',
        role: 'stylist',
      });
      
      expect(result).toBe(true);
    });

    it('handles missing properties gracefully', () => {
      const result = trackEvent('custom_event');
      
      expect(result).toBe(true);
    });

    it('handles errors gracefully', () => {
      // Force an error by passing invalid data
      const result = trackEvent('test_event', { circular: {} } as any);
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('trackPageView', () => {
    it('tracks page view with path', () => {
      const result = trackPageView('/dashboard');
      
      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        'page_view',
        expect.objectContaining({ path: '/dashboard' })
      );
    });

    it('tracks page view with title', () => {
      const result = trackPageView('/appointments', 'Appointments');
      
      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        'page_view',
        expect.objectContaining({
          path: '/appointments',
          title: 'Appointments',
        })
      );
    });

    it('handles missing title', () => {
      const result = trackPageView('/clients');
      
      expect(result).toBe(true);
    });
  });

  describe('trackConversion', () => {
    it('tracks conversion with value', () => {
      const result = trackConversion('purchase', 199.99);
      
      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        'conversion',
        expect.objectContaining({
          conversion_type: 'purchase',
          value: 199.99,
        })
      );
    });

    it('tracks conversion without value', () => {
      const result = trackConversion('signup');
      
      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        'conversion',
        expect.objectContaining({
          conversion_type: 'signup',
        })
      );
    });

    it('tracks subscription conversion', () => {
      const result = trackConversion('subscription', 29.99);
      
      expect(result).toBe(true);
    });
  });

  describe('error handling', () => {
    it('catches and logs errors', () => {
      // Temporarily restore console.error to see the actual error
      vi.mocked(console.error).mockRestore();
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      trackEvent('test' as any, { toString: () => { throw new Error('Test error'); } });
      
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });
});
