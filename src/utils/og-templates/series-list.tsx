import satori, { type SatoriOptions } from "satori";
import { SITE } from "@/config";
import loadOGImageFonts from "../loadLocalFont";

async function generateOgImageForSeriesList() {
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
          boxSizing: "border-box",
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
          // 뒤 카드(absolute)보다 위에 그려지도록 위치 지정 요소로 만든다
          position: "relative",
          boxSizing: "border-box",
          width: "88%",
          height: "80%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            margin: "20px",
            width: "90%",
            height: "90%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "90%",
              maxHeight: "90%",
              overflow: "hidden",
              textAlign: "center",
            }}
          >
            {/* satori 0.33의 <p> 기본 여백(부모 글자 크기 16px 기준 1em)을 그대로 고정한다 */}
            <p style={{ fontSize: 72, fontWeight: "bold", margin: "16px 0" }}>
              Series
            </p>
            <p style={{ fontSize: 28, color: "#666", margin: "12px 0 16px 0" }}>
              시리즈로 묶인 연재 글 모음입니다.
            </p>
          </div>
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
              {SITE.title}
            </span>
          </div>
        </div>
      </div>
    </div>,
    satoriOptions
  );
}

export default generateOgImageForSeriesList;
