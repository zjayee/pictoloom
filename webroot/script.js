import { routePage } from "./router.js";

/**
 * Sends a message to the Devvit app.
 * @param {WebViewMessage} msg
 */
function postWebViewMessage(msg) {
  parent.postMessage({ type: "devvit-message", data: { message: msg } }, "*");
}

// Listen for the Devvit app to send page + props
window.addEventListener("message", (ev) => {
  if (ev.data?.type !== "devvit-message") return;
  const message = ev.data.data?.message;

  if (message?.type === "initialData") {
    const { page, props } = message.data;
    routePage(page, props);
  }
});

window.addEventListener("load", () => {
  postWebViewMessage({ type: "webViewReady" });
});
