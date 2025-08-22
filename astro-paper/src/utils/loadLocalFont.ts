import fs from "fs";
import path from "path";
import type { Font } from "satori";

async function loadPretendardFonts(): Promise<Font[]> {
  const regularFontPath = path.join(process.cwd(), "src/assets/fonts/Pretendard-Regular.otf");
  const boldFontPath = path.join(process.cwd(), "src/assets/fonts/Pretendard-Bold.otf");
  
  try {
    const regularBuffer = fs.readFileSync(regularFontPath);
    const boldBuffer = fs.readFileSync(boldFontPath);
    
    const regularArrayBuffer = regularBuffer.buffer.slice(
      regularBuffer.byteOffset,
      regularBuffer.byteOffset + regularBuffer.byteLength
    );
    
    const boldArrayBuffer = boldBuffer.buffer.slice(
      boldBuffer.byteOffset,
      boldBuffer.byteOffset + boldBuffer.byteLength
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
    ];

    return fonts;
  } catch {
    throw new Error("Pretendard OTF font files not found");
  }
}

export default loadPretendardFonts;