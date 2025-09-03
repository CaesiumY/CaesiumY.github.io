/**
 * Custom Shiki transformer that adds file name labels to code blocks.
 *
 * This transformer looks for the `file="filename"` meta attribute in code blocks
 * and creates a styled label showing the filename. It supports two different
 * styling options and can optionally hide the green dot indicator.
 */

// 외부 의존성을 추가하지 않기 위해 최소 HAST 타입을 정의합니다.
type HastText = {
  type: "text";
  value: string;
};

type HastProperties = Record<string, unknown> & {
  style?: string;
};

type HastElement = {
  type: "element";
  tagName: string;
  properties: HastProperties;
  children: Array<HastElement | HastText>;
};

// Shiki 컨텍스트에서 필요한 최소 형태만 정의합니다.
type MinimalShikiTransformerContext = {
  options: { meta?: { __raw?: string } };
  addClassToHast: (node: HastElement, className: string) => void;
};

export type FileNameTransformerOptions = {
  style?: "v1" | "v2";
  hideDot?: boolean;
};

export const transformerFileName = ({
  style = "v2",
  hideDot = false,
}: FileNameTransformerOptions = {}) =>
  ({
    pre(this: MinimalShikiTransformerContext, node: HastElement) {
      const el = node;
      const fileNameOffset = style === "v1" ? "0.75rem" : "-0.75rem";
      el.properties.style =
        (el.properties.style ?? "") + `--file-name-offset: ${fileNameOffset};`;

      const raw = this.options.meta?.__raw?.split(" ");
      if (!raw) return;

      const metaMap = new Map<string, string>();
      for (const item of raw) {
        const [key, value] = item.split("=");
        if (!key || !value) continue;
        metaMap.set(key, value.replace(/["'`]/g, ""));
      }

      const file = metaMap.get("file");
      if (!file) return;

      this.addClassToHast(
        el,
        `mt-8 ${style === "v1" ? "rounded-tl-none" : ""}`
      );

      el.children.push({
        type: "element",
        tagName: "span",
        properties: {
          class: [
            "absolute py-1 text-foreground text-xs font-medium leading-4",
            hideDot
              ? "px-2"
              : "pl-4 pr-2 before:inline-block before:size-1 before:bg-green-500 before:rounded-full before:absolute before:top-[45%] before:left-2",
            style === "v1"
              ? "left-0 -top-6 rounded-t-md border border-b-0 bg-muted/50"
              : "left-2 top-(--file-name-offset) border rounded-md bg-background",
          ],
        },
        children: [
          {
            type: "text",
            value: file,
          },
        ],
      });
    },
  }) as unknown as { pre: (this: unknown, node: unknown) => void };
