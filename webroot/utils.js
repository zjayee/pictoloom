/**
 * Sends a message to the Devvit app.
 * @param {WebViewMessage} msg
 */
export function postWebViewMessage(msg) {
  parent.postMessage(msg, "*");
}

export function formatTime(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export class CountdownManager {
  /**
   * @param {HTMLElement} displayEl The DOM element to render time to
   */
  constructor(displayEl) {
    this.displayEl = displayEl;
    this.remaining = 0;
    this.interval = null;
  }

  /**
   * Start the countdown
   * @param {number} seconds
   */
  start(seconds) {
    this.remaining = seconds;
    this.update();

    this.interval = setInterval(() => {
      this.remaining--;
      this.update();
      if (this.remaining <= 0) {
        clearInterval(this.interval);
      }
    }, 1000);
  }

  update() {
    if (this.displayEl) {
      this.displayEl.textContent = formatTime(this.remaining);
    }
  }
}
