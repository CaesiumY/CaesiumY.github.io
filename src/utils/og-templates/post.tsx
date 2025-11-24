import satori, { type SatoriOptions } from "satori";
import { SITE } from "@/config";
import loadOGImageFonts from "../loadLocalFont";
import type { CollectionEntry } from "astro:content";

async function generateOgImageForPost(postData: CollectionEntry<"blog">) {
  // 타입이 보존된 변수로 재할당
  const post = postData;

  const satoriOptions: SatoriOptions = {
    width: 1200,
    height: 630,
    embedFont: true,
    fonts: await loadOGImageFonts(),
  };

  // JSX 외부에서 데이터 추출하여 타입 보존
  const title = post.data.title;

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
            margin: "20px",
            width: "90%",
            height: "90%",
          }}
        >
          <p
            style={{
              fontSize: 72,
              fontWeight: "bold",
              maxHeight: "84%",
              overflow: "hidden",
            }}
          >
            {title}
          </p>
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

export default generateOgImageForPost;
