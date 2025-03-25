import { Devvit } from "@devvit/public-api";
import Glyphs from "../data/glyphs.json" assert { type: "json" };
import Settings from "../settings.json" assert { type: "json" };
import { readFileSync } from "node:fs";
import path from "node:path";

type SupportedGlyphs = keyof typeof Glyphs;

interface PixelTextProps {
  children: string | string[];
  scale?: number;
  color?: string;
}

export function OffbitFont(props: PixelTextProps): JSX.Element {
  const { children, scale = 2, color = Settings.theme.primary } = props;
  const line = children[0].split("");
  const gap = 1;
  const height = Glyphs["A"].height; // fallback default
  let width = 0;
  let xOffset = 0;

  const characters: string[] = [];

  for (const character of line) {
    if (character === " ") {
      xOffset += 6 + gap;
      continue;
    }

    const glyphMeta = Glyphs[character as SupportedGlyphs];
    if (!glyphMeta) continue;

    const glyphPath = path.resolve("src", glyphMeta.path);
    const svgContent = readFileSync(glyphPath, "utf-8");

    // Optional: extract just the <path> from the SVG
    const cleanedPath = svgContent
      .replace(/<svg[^>]*>/, "")
      .replace(/<\/svg>/, "")
      .trim();

    characters.push(
      `<g transform="translate(${xOffset} 0)">${cleanedPath}</g>`
    );
    xOffset += glyphMeta.width + gap;
    width = xOffset;
  }

  width -= gap; // remove trailing gap

  const scaledHeight = height * scale;
  const scaledWidth = width * scale;

  return (
    <image
      imageHeight={scaledHeight}
      imageWidth={scaledWidth}
      height={scaledHeight}
      width={scaledWidth}
      description={children[0]}
      resizeMode="fill"
      url={`data:image/svg+xml,
        <svg
          width="${width}"
          height="${height}"
          viewBox="0 0 ${width} ${height}"
          xmlns="http://www.w3.org/2000/svg"
        >
          ${characters.join("")}
        </svg>
      `}
    />
  );
}
