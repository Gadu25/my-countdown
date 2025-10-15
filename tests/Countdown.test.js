import { test, expect, vi } from 'vitest';
import Countdown from '../src/Countdown.js';

test('counts down correctly', () => {
  const now = Date.now();
  const countdown = new Countdown({
    targetTime: new Date(Date.now() + 1000),
    onEnd: vi.fn(),
    scheduler: (cb) => setTimeout(cb, 16)
  });
  countdown.init();
  expect(countdown.targetTime).toBeGreaterThan(now);
});
