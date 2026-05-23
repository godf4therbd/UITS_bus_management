import { describe, it, expect } from 'vitest';
import { PREBUILT_MESSAGES } from '../constants/notifications';

describe('PREBUILT_MESSAGES', () => {
  it('exports an array', () => {
    expect(Array.isArray(PREBUILT_MESSAGES)).toBe(true);
  });

  it('has at least one message', () => {
    expect(PREBUILT_MESSAGES.length).toBeGreaterThan(0);
  });

  it('contains no empty strings', () => {
    expect(PREBUILT_MESSAGES.every(m => m.trim().length > 0)).toBe(true);
  });

  it('contains only unique messages', () => {
    const unique = new Set(PREBUILT_MESSAGES);
    expect(unique.size).toBe(PREBUILT_MESSAGES.length);
  });
});
