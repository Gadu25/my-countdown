import Countdown from './Countdown.js';

export function createCountdown({ targetTime, syncUrl, selector }) {
  const el = document.querySelector(selector);
  const countdown = new Countdown({
    targetTime,
    syncUrl,
    onTick: ({ days, hours, minutes, seconds }) => {
      el.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    },
    onEnd: () => (el.textContent = 'Time’s up!')
  });

  countdown.init();
  return countdown;
}
