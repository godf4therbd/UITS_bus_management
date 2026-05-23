import { describe, it, expect } from 'vitest';

// Phone validation — same regex as StudentRegistration
const isValidPhone = (phone: string) =>
  /^(\+8801|01)[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, ''));

// Email validation — same regex as Login
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

describe('phone validation', () => {
  it('accepts valid 01X number', () => {
    expect(isValidPhone('01711111111')).toBe(true);
  });

  it('accepts valid +880 prefix', () => {
    expect(isValidPhone('+8801711111111')).toBe(true);
  });

  it('accepts number with spaces/dashes', () => {
    expect(isValidPhone('017-111-11111')).toBe(true);
  });

  it('rejects too-short number', () => {
    expect(isValidPhone('0171111')).toBe(false);
  });

  it('rejects number starting with 010', () => {
    expect(isValidPhone('01011111111')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidPhone('')).toBe(false);
  });
});

describe('email validation', () => {
  it('accepts valid email', () => {
    expect(isValidEmail('student@uits.edu')).toBe(true);
  });

  it('accepts standard email formats', () => {
    expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true);
  });

  it('rejects email without @', () => {
    expect(isValidEmail('notanemail')).toBe(false);
  });

  it('rejects email without domain', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('rejects email with spaces', () => {
    expect(isValidEmail('user @domain.com')).toBe(false);
  });
});
