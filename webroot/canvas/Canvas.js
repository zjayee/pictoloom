import { createCustomButton } from "../components/CustomButton.js";
import { postWebViewMessage, CountdownManager } from "../utils.js";

class CanvasPageApp {
  constructor() {
    this.countdownEl = document.getElementById("countdown");
    this.countdown = new CountdownManager(this.countdownEl);
    this.canvas = document.getElementById("drawing-canvas");
    this.ctx = this.canvas.getContext("2d");

    this.isDrawing = false;
    this.selectedColor = "#000000";

    this.setupColorPicker();
    this.setupDrawing();
    this.initCountdown();
    this.addDoneButton();
  }

  initCountdown() {
    addEventListener("message", (ev) => {
      if (ev.data.type !== "devvit-message") return;
      const { message } = ev.data.data;
      if (message.type === "countdownData") {
        this.countdown.start(message.data.duration);
      }
    });

    postWebViewMessage({ type: "getCountdownDuration" });
  }

  setupColorPicker() {
    const colors = [
      "#000000",
      "#FF5C5C",
      "#FFA600",
      "#FFD93D",
      "#6BCB77",
      "#4D96FF",
      "#9D4EDD",
    ];
    const picker = document.getElementById("color-picker");

    if (!picker) {
      console.warn("Color picker element not found.");
      return;
    }

    let firstColorEl = null;

    colors.forEach((color, index) => {
      const el = document.createElement("div");
      el.className = "canvas-page__color";
      el.style.backgroundColor = color;

      el.addEventListener("click", () => {
        this.selectedColor = color;
        document
          .querySelectorAll(".canvas-page__color")
          .forEach((c) => c.classList.remove("canvas-page__color--active"));
        el.classList.add("canvas-page__color--active");
      });

      picker.appendChild(el);
      if (index === 0) firstColorEl = el;
    });

    if (firstColorEl) {
      firstColorEl.classList.add("canvas-page__color--active");
      this.selectedColor = colors[0];
    }
  }

  setupDrawing() {
    const c = this.canvas;
    const ctx = this.ctx;

    const getPos = (e) => {
      const rect = c.getBoundingClientRect();
      if (e.touches) e = e.touches[0];
      return {
        x: (e.clientX - rect.left) * (c.width / rect.width),
        y: (e.clientY - rect.top) * (c.height / rect.height),
      };
    };

    const start = (e) => {
      this.isDrawing = true;
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const draw = (e) => {
      if (!this.isDrawing) return;
      const { x, y } = getPos(e);
      ctx.lineTo(x, y);
      ctx.strokeStyle = this.selectedColor;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.stroke();
    };

    const end = () => {
      this.isDrawing = false;
      ctx.closePath();
    };

    c.addEventListener("mousedown", start);
    c.addEventListener("mousemove", draw);
    c.addEventListener("mouseup", end);
    c.addEventListener("mouseout", end);

    c.addEventListener("touchstart", start);
    c.addEventListener("touchmove", draw);
    c.addEventListener("touchend", end);
  }

  async addDoneButton() {
    const container = document.getElementById("custom-button-container");

    const button = await createCustomButton({
      text: "DONE",
      iconSrc: "../public/icons/star.svg",
      onClick: () => this.submitDrawing(),
    });

    container.appendChild(button);
  }

  submitDrawing() {
    this.canvas.toBlob((blob) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;

        postWebViewMessage({
          type: "drawingSubmitted",
          data: { blobUrl: base64 },
        });

        if (window.devvit?.webview?.unmount) {
          window.devvit.webview.unmount();
        }
      };
      reader.readAsDataURL(blob);
    });
  }
}

new CanvasPageApp();
