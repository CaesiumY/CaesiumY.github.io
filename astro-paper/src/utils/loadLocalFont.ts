import fs from "fs";
import path from "path";
import type { Font } from "satori";

async function loadOGImageFonts(): Promise<Font[]> {
  const regularFontPath = path.join(
    process.cwd(),
    "src/assets/fonts/Pretendard-Regular.otf"
  );
  const boldFontPath = path.join(
    process.cwd(),
    "src/assets/fonts/Pretendard-Bold.otf"
  );
  const emojiFontPath = path.join(
    process.cwd(),
    "src/assets/fonts/NotoEmoji-Regular.ttf"
  );

  try {
    const regularBuffer = fs.readFileSync(regularFontPath);
    const boldBuffer = fs.readFileSync(boldFontPath);
    const emojiBuffer = fs.readFileSync(emojiFontPath);

    const regularArrayBuffer = regularBuffer.buffer.slice(
      regularBuffer.byteOffset,
      regularBuffer.byteOffset + regularBuffer.byteLength
    );

    const boldArrayBuffer = boldBuffer.buffer.slice(
      boldBuffer.byteOffset,
      boldBuffer.byteOffset + boldBuffer.byteLength
    );

    const emojiArrayBuffer = emojiBuffer.buffer.slice(
      emojiBuffer.byteOffset,
      emojiBuffer.byteOffset + emojiBuffer.byteLength
    );

    const fonts: Font[] = [
      {
        name: "Pretendard",
        data: regularArrayBuffer as ArrayBuffer,
        weight: 400 as const,
        style: "normal" as const,
      },
      {
        name: "Pretendard",
        data: boldArrayBuffer as ArrayBuffer,
        weight: 700 as const,
        style: "normal" as const,
      },
      {
        name: "Noto Emoji",
        data: emojiArrayBuffer as ArrayBuffer,
        weight: 400 as const,
        style: "normal" as const,
      },
    ];

    return fonts;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Font loading error:", error);
    throw new Error("Font files not found");
  }
}

export default loadOGImageFonts;
