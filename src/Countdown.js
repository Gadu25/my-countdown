export default class Countdown {
  constructor({
    targetTime,
    syncUrl,
    onTick,
    onEnd,
    syncInterval = 300_000,
    scheduler,
  }) {
    if (!targetTime) throw new Error('Countdown requires a targetTime');

    this.targetTime = new Date(targetTime).getTime();
    this.syncUrl = syncUrl;
    this.onTick = onTick;
    this.onEnd = onEnd;
    this.syncInterval = syncInterval;
    this.offset = 0;

    this._running = false;
    this._rafId = null;
    this._intervalId = null;

    // Wrap scheduler safely for browser or SSR
    if (typeof scheduler === 'function') {
      this._schedule = (fn) => scheduler(fn);
    } else if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      this._schedule = (fn) => window.requestAnimationFrame(fn);
    } else {
      this._schedule = (fn) => setTimeout(fn, 1000 / 60);
    }
  }

  async init() {
    if (this.syncUrl) await this.syncWithServer();

    this._running = true;
    this._tick();

    if (this.syncUrl) {
      this._intervalId = setInterval(() => this.syncWithServer(), this.syncInterval);
    }
  }

  async syncWithServer() {
    try {
      const res = await fetch(this.syncUrl);
      const data = await res.json();
      const serverTime = new Date(data.serverTime).getTime();
      if (!isNaN(serverTime)) this.offset = Date.now() - serverTime;
    } catch (err) {
      console.warn('Countdown: failed to sync with server', err);
    }
  }

  _tick() {
    if (!this._running) return;

    const now = Date.now() - this.offset;
    const remaining = Math.max(0, this.targetTime - now);

    this.onTick?.(this._parseTime(remaining));

    if (remaining <= 0) {
      this._running = false;
      this.onEnd?.();
      return;
    }

    // Schedule the next tick
    this._rafId = this._schedule(() => this._tick());
  }

  _parseTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };
  }

  stop() {
    this._running = false;
    if (this._rafId && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this._rafId);
    }
    if (this._intervalId) clearInterval(this._intervalId);
  }
}
