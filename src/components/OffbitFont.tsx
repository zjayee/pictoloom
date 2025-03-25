import { Devvit } from "@devvit/public-api";
import Glyphs from "../data/glyphs.json" assert { type: "json" };

type SupportedGlyphs = keyof typeof Glyphs;

interface PixelTextProps {
  children: string | string[];
  scale?: number;
  color?: string;
}

export function OffbitFont(props: PixelTextProps): JSX.Element {
  const { children, scale = 1 } = props;
  const line = children[0].split("");
  const gap = 1;
  const spaceWidth = 6;

  let totalWidth = 0;

  const images = line.map((character, index) => {
    if (character === " ") {
      totalWidth += spaceWidth + gap;
      return (
        <spacer
          key={index.toString()}
          width={`${(spaceWidth + gap) * scale}px`}
        />
      );
    }

    const glyphMeta = Glyphs[character as SupportedGlyphs];
    if (!glyphMeta) return null;

    const image = (
      <image
        key={index.toString()}
        url={glyphMeta.path}
        imageWidth={`${glyphMeta.width * scale}px`}
        imageHeight={`${glyphMeta.height * scale}px`}
        description={`Glyph: ${character}`}
      />
    );

    totalWidth += glyphMeta.width + gap;
    return image;
  });

  return <hstack alignment="center middle">{images}</hstack>;
}
