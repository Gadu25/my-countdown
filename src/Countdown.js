export default class Countdown {
  constructor({ targetTime, syncUrl, onTick, onEnd, syncInterval = 300000, scheduler = requestAnimationFrame }) {
    if (!targetTime) throw new Error('Countdown requires a targetTime');

    this.targetTime = new Date(targetTime).getTime();
    this.syncUrl = syncUrl;
    this.onTick = onTick;
    this.onEnd = onEnd;
    this.syncInterval = syncInterval;
    this.offset = 0;
    this._running = false;
    this._schedule = scheduler;
  }

  async init() {
    if (this.syncUrl) await this.syncWithServer();
    this._running = true;
    this._update();
    if (this.syncUrl) setInterval(() => this.syncWithServer(), this.syncInterval);
  }

  async syncWithServer() {
    const res = await fetch(this.syncUrl);
    const data = await res.json();
    const serverTime = new Date(data.serverTime).getTime();
    this.offset = Date.now() - serverTime;
  }

  _update() {
    if (!this._running) return;

    const now = Date.now() - this.offset;
    const remaining = this.targetTime - now;

    if (remaining <= 0) {
      this._running = false;
      this.onTick?.(this._parseTime(0));
      this.onEnd?.();
      return;
    }

    this.onTick?.(this._parseTime(remaining));
    this._schedule(() => this._update());
  }
  
  _parseTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60
    };
  }

  stop() {
    this._running = false;
  }
}
