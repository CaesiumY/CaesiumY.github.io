/**
 * 마크다운 본문에서 코드 영역을 잠시 자리표시자로 바꿔 두는 유틸.
 *
 * 본문을 정규식으로 재작성하는 변환(예: 상대 이미지 경로를 절대 URL로 바꾸기)이
 * 코드 블록 안의 "보여주기용" 마크다운까지 건드리면, 독자가 따라 할 수 없는
 * 예제가 만들어진다. 변환 전에 mask로 코드 영역을 빼내고, 변환 후 restore로
 * 되돌린다.
 *
 * 외부 의존성이 없는 순수 함수다.
 */

// 자리표시자 경계. 사용자 예약 영역(U+E000) 문자라 마크다운 본문에 등장하지
// 않고, 대괄호나 슬래시가 없어서 링크 재작성 정규식에 걸리지도 않는다.
const MARK = "\uE000";

// 정규식 리터럴로 둔다. new RegExp에 이 문자를 그대로 넣으면 엔진이 리터럴로
// 취급하지 않아 매칭이 안 된다(U+E000과 NUL 모두 실측 확인).
const PLACEHOLDER = /\uE000(\d+)\uE000/g;

const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})/;

// 여는 펜스와 같은 문자로, 같거나 더 길게 이루어진 줄만 닫는 것으로 본다
// (CommonMark). 문자 클래스로 감싸면 백틱과 물결표를 이스케이프할 필요가 없다.
//
// 줄 끝 캐리지 리턴을 반드시 허용해야 한다. contents/의 마크다운은 CRLF라서
// 줄바꿈으로 쪼개면 각 줄 끝에 캐리지 리턴이 남는데, 이걸 빠뜨리면 닫는 펜스를
// 하나도 인식하지 못해 문서 전체가 코드로 보호된다(실제로 그렇게 깨졌다).
const fenceCloses = (line: string, char: string, length: number) =>
  new RegExp(`^ {0,3}[${char}]{${length},}[ \t\r]*$`).test(line);

// 인라인 코드 스팬. 같은 개수의 백틱으로 한 줄 안에서 닫히는 최단 구간을 잡는다.
const INLINE_CODE = /(`+)[^\n]*?\1/g;

export interface MaskedMarkdown {
  masked: string;
  restore: (text: string) => string;
}

export const maskCodeRegions = (body: string): MaskedMarkdown => {
  const stash: string[] = [];
  const keep = (text: string) => `${MARK}${stash.push(text) - 1}${MARK}`;

  // 펜스 블록은 줄 단위로 스캔한다. 정규식 하나로 처리하면 닫히지 않은 펜스를
  // 놓치는데, CommonMark에서 닫히지 않은 펜스는 파일 끝까지가 코드다.
  const out: string[] = [];
  let open: { char: string; length: number; buffer: string[] } | null = null;

  for (const line of body.split("\n")) {
    if (!open) {
      const match = FENCE_OPEN.exec(line);
      if (match) {
        open = { char: match[1][0], length: match[1].length, buffer: [line] };
      } else {
        out.push(line);
      }
      continue;
    }
    open.buffer.push(line);
    if (fenceCloses(line, open.char, open.length)) {
      out.push(keep(open.buffer.join("\n")));
      open = null;
    }
  }
  if (open) out.push(keep(open.buffer.join("\n")));

  return {
    masked: out.join("\n").replace(INLINE_CODE, keep),
    restore: text =>
      text.replace(PLACEHOLDER, (whole, index: string) => {
        const original = stash[Number(index)];
        return original === undefined ? whole : original;
      }),
  };
};
