import { createCustomButton } from "../components/CustomButton.js";
import { postWebViewMessage, CountdownManager } from "../utils.js";

class ChainDrawingPreviewApp {
  constructor() {
    this.countdownEl = document.getElementById("countdown");
    this.countdown = new CountdownManager(this.countdownEl);

    addEventListener("message", this.#onMessage);
    addEventListener("load", () => {
      postWebViewMessage({ type: "getCountdownDuration" });
      postWebViewMessage({ type: "getReferenceDrawings" });
      this.addCustomButton();
    });
  }

  async addCustomButton() {
    const container = document.getElementById("custom-button-container");
    if (!container) return;

    const button = await createCustomButton({
      text: "DRAW IT!",
      iconSrc: "../public/icons/pencil.svg",
      onClick: () => {
        window.location.href = "../canvas/Canvas.html";
      },
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

    if (message.type === "countdownData") {
      this.countdown.start(message.data.duration);
    }

    if (message.type === "referenceDrawingsData") {
      this.updatePreview(message.data?.drawings?.[0]);
    }
  };

  updatePreview(drawing) {
    if (!drawing) return;

    // Update caption text
    const captionEl = document.getElementById("caption-text");
    if (captionEl) {
      captionEl.textContent = `${drawing.user} drew this based off a mystery word!`;
    }

    // Update image blob
    const imgEl = document.getElementById("drawing");
    if (imgEl && drawing.blobUrl) {
      imgEl.src = drawing.blobUrl;
    }
  }
}

new ChainDrawingPreviewApp();
