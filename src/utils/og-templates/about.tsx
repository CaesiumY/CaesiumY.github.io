import satori, { type SatoriOptions } from "satori";
import { SITE } from "@/config";
import loadOGImageFonts from "../loadLocalFont";

async function generateOgImageForAbout() {
  const satoriOptions: SatoriOptions = {
    width: 1200,
    height: 630,
    embedFont: true,
    fonts: await loadOGImageFonts(),
  };

  return satori(
    <div
      style={{
        background: "#fefbfb",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        wordBreak: "keep-all",
        fontFamily: "Pretendard, Noto Emoji",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-1px",
          right: "-1px",
          border: "4px solid #000",
          background: "#ecebeb",
          opacity: "0.9",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "center",
          margin: "2.5rem",
          width: "88%",
          height: "80%",
        }}
      />
      <div
        style={{
          border: "4px solid #000",
          background: "#fefbfb",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "center",
          margin: "2rem",
          width: "88%",
          height: "80%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "flex-start",
            margin: "20px",
            width: "90%",
            height: "90%",
          }}
        >
          {/* 이름 섹션 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              marginTop: "24px",
            }}
          >
            <p
              style={{
                fontSize: 72,
                fontWeight: "bold",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {SITE.author}
            </p>
            <p
              style={{
                fontSize: 32,
                color: "#666",
                margin: "12px 0 0 0",
              }}
            >
              {SITE.authorEn}
            </p>
          </div>

          {/* 직함 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <p
              style={{
                fontSize: 32,
                textAlign: "left",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              AI로 생산성을 혁신하고 지식을 연결하는
            </p>
            <p
              style={{
                fontSize: 32,
                textAlign: "left",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              프론트엔드 엔지니어
            </p>
          </div>

          {/* 도메인 */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
              marginBottom: "8px",
              fontSize: 28,
            }}
          >
            <span style={{ overflow: "hidden", fontWeight: "bold" }}>
              {new URL(SITE.website).hostname}
            </span>
          </div>
        </div>
      </div>
    </div>,
    satoriOptions
  );
}

export default generateOgImageForAbout;
