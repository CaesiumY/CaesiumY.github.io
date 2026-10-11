import { test, expect, type Page } from "@playwright/test";
import { TEST_POST_URL } from "./fixtures/test-posts";

/**
 * OG 이미지가 실제로 어떻게 그려지는지 픽셀로 검사한다.
 *
 * og-image.spec.ts는 메타 태그와 응답 형식만 보므로, satori가 레이아웃 기본값을
 * 바꿔 그림이 깨져도 통과한다. satori 0.33 → 0.47(#218)에서 실제로 40장이 모두
 * 깨졌는데 CI는 초록이었다. 여기서는 그때 깨진 세 가지를 직접 잡는다.
 *
 * - 뒤 카드(absolute)가 앞 카드 위에 그려짐 → 앞 카드 안쪽 점의 색
 * - boxSizing 기본값이 content-box로 바뀜 → 앞 카드 테두리 위치
 * - <p> 기본 여백 1em의 기준이 바뀜 → 글자 줄의 세로 위치
 *
 * 템플릿 5개는 카드 구조가 같다(src/utils/og-templates/*.tsx). 기대값은 1200×630
 * 기준 픽셀 좌표이고, 텍스트 위치는 안티에일리어싱과 1px 반올림을 감안해 오차를 둔다.
 */

interface OgMetrics {
  width: number;
  height: number;
  /** 앞 카드 안쪽, 뒤 카드와 겹치고 글자가 없는 점의 RGB */
  frontCardFill: [number, number, number];
  /** y=300 가로줄에서 왼쪽부터 처음 나오는 테두리(어두운 픽셀)의 x */
  frontCardLeftBorderX: number;
  /** x=90 세로줄(뒤 카드보다 왼쪽)에서 위부터 처음 나오는 테두리의 y */
  frontCardTopBorderY: number;
  /** 카드 안쪽 글자 영역에서 글자가 있는 가로 띠들 [시작 y, 끝 y] */
  textBands: [number, number][];
}

async function measureOgImage(page: Page, path: string): Promise<OgMetrics> {
  // 같은 오리진 문서에서 PNG를 받아 canvas로 픽셀을 읽는다
  await page.goto("/robots.txt");
  return page.evaluate(async ogPath => {
    const res = await fetch(ogPath);
    if (!res.ok) throw new Error(`${ogPath} → ${res.status}`);
    const bitmap = await createImageBitmap(await res.blob());
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0);
    const { data, width, height } = ctx.getImageData(
      0,
      0,
      bitmap.width,
      bitmap.height
    );
    const grey = (x: number, y: number) => {
      const i = (y * width + x) * 4;
      return (data[i] + data[i + 1] + data[i + 2]) / 3;
    };
    const rgb = (x: number, y: number): [number, number, number] => {
      const i = (y * width + x) * 4;
      return [data[i], data[i + 1], data[i + 2]];
    };

    // 테두리는 #000이고 그 바깥은 배경 #fefbfb, 뒤 카드 #ecebeb라서 80 미만이면 테두리다
    let frontCardLeftBorderX = -1;
    for (let x = 0; x < width; x++) {
      if (grey(x, 300) < 80) {
        frontCardLeftBorderX = x;
        break;
      }
    }
    let frontCardTopBorderY = -1;
    for (let y = 0; y < height; y++) {
      if (grey(90, y) < 80) {
        frontCardTopBorderY = y;
        break;
      }
    }

    // 글자 영역: 내용 div(x 128~1072)의 안쪽, 카드 테두리를 피해 y 70~560.
    // 200 미만을 글자로 본다. 검은 글자와 회색 부제목(#666)은 걸리고 앞 카드 배경
    // #fefbfb는 걸리지 않는다. 템플릿 색을 바꾸면 이 기준도 다시 볼 것
    const textBands: [number, number][] = [];
    let start = -1;
    for (let y = 70; y < 560; y++) {
      let hasText = false;
      for (let x = 128; x < 1072; x++) {
        if (grey(x, y) < 200) {
          hasText = true;
          break;
        }
      }
      if (hasText && start < 0) start = y;
      if (!hasText && start >= 0) {
        textBands.push([start, y - 1]);
        start = -1;
      }
    }

    return {
      width,
      height,
      frontCardFill: rgb(1100, 300),
      frontCardLeftBorderX,
      frontCardTopBorderY,
      textBands,
    };
  }, path);
}

/** 앞 카드 배경 #fefbfb. 뒤 카드(#ecebeb, opacity 0.9)가 덮으면 236 근처로 떨어진다 */
function expectFrontCardOnTop(m: OgMetrics) {
  for (const channel of m.frontCardFill) {
    expect(channel, "앞 카드 안쪽이 뒤 카드 색으로 덮였다").toBeGreaterThan(
      248
    );
  }
}

function expectCardGeometry(m: OgMetrics) {
  expect([m.width, m.height]).toEqual([1200, 630]);
  // margin 2rem(32px) + width 88%를 border-box로 계산한 값: (1200 - 1056) / 2 = 72
  expect(m.frontCardLeftBorderX).toBe(72);
  // (630 - 504) / 2 = 63
  expect(m.frontCardTopBorderY).toBe(63);
}

/** 기대값과 ±3px 이내인지 본다 (안티에일리어싱과 1px 반올림 여유) */
function expectNear(actual: number, expected: number, message: string) {
  expect(Math.abs(actual - expected), `${message}: ${actual}`).toBeLessThan(4);
}

test.describe("OG 이미지 - 렌더링 레이아웃 회귀", () => {
  test("사이트 기본 OG: 앞 카드가 위에 있고 카드 위치가 고정돼야 함", async ({
    page,
  }) => {
    const m = await measureOgImage(page, "/og.png");

    expectFrontCardOnTop(m);
    expectCardGeometry(m);
    // 가운데 정렬된 블로그 제목 한 줄 + 하단 도메인
    expect(m.textBands).toHaveLength(2);
    expectNear(m.textBands[0][0], 260, "제목 위쪽 y");
    expectNear(m.textBands[1][0], 498, "하단 도메인 위쪽 y");
  });

  test("시리즈 목록 OG: 제목과 부제목 사이 간격이 유지돼야 함", async ({
    page,
  }) => {
    const m = await measureOgImage(page, "/series/og.png");

    expectFrontCardOnTop(m);
    expectCardGeometry(m);
    // <p> 여백이 글자 크기 기준으로 커지면 두 줄 사이가 벌어지고 묶음 전체가 이동한다
    expect(m.textBands).toHaveLength(3);
    expectNear(m.textBands[0][0], 229, "제목 위쪽 y");
    expectNear(m.textBands[1][0], 333, "부제목 위쪽 y");
    expectNear(m.textBands[2][0], 498, "하단 블로그명 위쪽 y");
  });

  test("포스트 OG: 제목이 카드 위쪽에서 시작하고 하단 블로그명이 보여야 함", async ({
    page,
  }) => {
    const m = await measureOgImage(page, `${TEST_POST_URL}/og.png`);

    expectFrontCardOnTop(m);
    expectCardGeometry(m);
    // 제목 첫 줄 위쪽 y는 글자 모양에 따라 2~3px 달라지므로 범위로 본다.
    // 내용 div top 87 + <p> 여백 16px + 줄 높이 안의 여유 = 약 115.
    // 여백이 72px(글자 크기 기준 1em)로 커지면 160 이상으로 밀린다.
    // 제목 줄과 하단 블로그명, 최소 두 줄이 있어야 한다 (폰트 로딩 실패 등으로 비면
    // 아래 인덱스 접근에서 TypeError 대신 이 단언으로 실패한다)
    expect(
      m.textBands.length,
      `글자 줄 수: ${JSON.stringify(m.textBands)}`
    ).toBeGreaterThan(1);
    const titleTop = m.textBands[0][0];
    expect(titleTop, `제목 위쪽 y: ${titleTop}`).toBeGreaterThanOrEqual(105);
    expect(titleTop, `제목 위쪽 y: ${titleTop}`).toBeLessThanOrEqual(127);
    const footer = m.textBands[m.textBands.length - 1];
    expectNear(footer[0], 498, "하단 블로그명 위쪽 y");
  });
});
