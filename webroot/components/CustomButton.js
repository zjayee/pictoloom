let templateLoaded = false;

/**
 * @param {{ text: string, iconSrc: string, onClick?: () => void }} param0
 */
export async function createCustomButton({ text, iconSrc, onClick }) {
  if (!templateLoaded) {
    await injectTemplate();
    templateLoaded = true;
  }

  const template = document.getElementById("custom-button-template");
  if (!template) {
    console.error("CustomButton template still not found after injection.");
    return null;
  }

  const node = template.content.cloneNode(true);

  const root = node.querySelector(".custom-button");
  const icon = node.querySelector(".custom-button__icon");
  const label = node.querySelector(".custom-button__text");

  icon.src = iconSrc;
  icon.alt = text;
  label.textContent = text;

  if (root && typeof onClick === "function") {
    root.addEventListener("click", onClick);
    root.style.cursor = "pointer";
  }

  return node;
}

async function injectTemplate() {
  try {
    const res = await fetch("../components/CustomButton.html");
    const html = await res.text();
    const tempDoc = document.createElement("div");
    tempDoc.innerHTML = html;

    const template = tempDoc.querySelector("template");
    if (template) {
      document.body.appendChild(template);
    } else {
      console.error("No <template> found in CustomButton.html");
    }
  } catch (err) {
    console.error("Failed to load CustomButton template:", err);
  }
}
