import Countdown from './Countdown.js';

export function createCountdown({ targetTime, syncUrl, onTick, onEnd }) {
  const countdown = new Countdown({
    targetTime,
    syncUrl,
    onTick,
    onEnd,
  });

  countdown.init();
  return countdown;
}