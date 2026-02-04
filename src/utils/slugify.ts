import { kebabCase } from "es-toolkit";

export const slugifyStr = (str: string) => kebabCase(str);

export const slugifyAll = (arr: string[]) => arr.map(str => slugifyStr(str));
