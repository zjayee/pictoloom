import { createCustomButton } from "../components/CustomButton.js";

class ChainDrawingPreviewApp {
  constructor() {
    this.countdownEl = /** @type {HTMLDivElement} */ (
      document.querySelector("#countdown")
    );

    this.remaining = 0;
    this.interval = null;

    addEventListener("message", this.#onMessage);

    addEventListener("load", () => {
      postWebViewMessage({ type: "webViewReady" });
      this.addCustomButton();
    });
  }

  async addCustomButton() {
    const container = document.getElementById("custom-button-container");
    if (!container) return;

    const button = await createCustomButton({
      text: "DRAW IT!",
      iconSrc: "../public/icons/pencil.svg",
    });

    if (button) {
      container.appendChild(button);
    }
  }

  /**
   * @param {MessageEvent<DevvitSystemMessage>} ev
   * @returns {void}
   */
  #onMessage = (ev) => {
    if (ev.data.type !== "devvit-message") return;
    const { message } = ev.data.data;

    if (message.type === "initialData") {
      const { duration } = message.data;
      this.startCountdown(duration);
    }
  };

  /**
   * Starts the countdown timer.
   * @param {number} seconds
   */
  startCountdown(seconds) {
    this.remaining = seconds;
    this.updateDisplay();

    this.interval = setInterval(() => {
      this.remaining--;
      this.updateDisplay();
      if (this.remaining <= 0) {
        clearInterval(this.interval);
      }
    }, 1000);
  }

  updateDisplay() {
    if (!this.countdownEl) return;

    const hours = Math.floor(this.remaining / 3600);
    const minutes = Math.floor((this.remaining % 3600) / 60);
    const seconds = this.remaining % 60;

    const h = String(hours).padStart(2, "0");
    const m = String(minutes).padStart(2, "0");
    const s = String(seconds).padStart(2, "0");

    this.countdownEl.textContent = `${h}:${m}:${s}`;
  }
}

/**
 * Sends a message to the Devvit app.
 * @param {WebViewMessage} msg
 */
function postWebViewMessage(msg) {
  parent.postMessage(msg, "*");
}

new ChainDrawingPreviewApp();
