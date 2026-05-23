import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock import.meta.env before importing logger
vi.stubGlobal('import', { meta: { env: { DEV: false } } });

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('logger.error always calls console.error', async () => {
    const { logger } = await import('../utils/logger');
    logger.error('test error');
    expect(console.error).toHaveBeenCalledWith('test error');
  });
});
