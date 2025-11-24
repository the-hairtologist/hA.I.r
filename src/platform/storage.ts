import { Preferences } from '@capacitor/preferences';
import { Platform } from './detector';

/**
 * Unified storage API that works on both web and mobile
 * Web: localStorage
 * Mobile: @capacitor/preferences (uses Keychain on iOS, SharedPreferences on Android)
 */
export const Storage = {
  /**
   * Set a value in storage
   * @param key Storage key
   * @param value Value to store (will be stringified if object)
   */
  async set(key: string, value: string): Promise<void> {
    if (Platform.isMobile) {
      await Preferences.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  },

  /**
   * Get a value from storage
   * @param key Storage key
   * @returns Value or null if not found
   */
  async get(key: string): Promise<string | null> {
    if (Platform.isMobile) {
      const { value } = await Preferences.get({ key });
      return value;
    } else {
      return localStorage.getItem(key);
    }
  },

  /**
   * Remove a value from storage
   * @param key Storage key
   */
  async remove(key: string): Promise<void> {
    if (Platform.isMobile) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  },

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    if (Platform.isMobile) {
      await Preferences.clear();
    } else {
      localStorage.clear();
    }
  },

  /**
   * Get all keys in storage
   */
  async keys(): Promise<string[]> {
    if (Platform.isMobile) {
      const { keys } = await Preferences.keys();
      return keys;
    } else {
      return Object.keys(localStorage);
    }
  },

  /**
   * Set a JSON value in storage
   * @param key Storage key
   * @param value Object to store
   */
  async setJSON<T>(key: string, value: T): Promise<void> {
    await this.set(key, JSON.stringify(value));
  },

  /**
   * Get a JSON value from storage
   * @param key Storage key
   * @returns Parsed object or null if not found
   */
  async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },
};
