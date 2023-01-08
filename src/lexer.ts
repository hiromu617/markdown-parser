import { Token } from "./models/token";
import { exists, assertExists } from "./utils/assert";

const STRONG_ELM_REGXP = /\*\*(.*?)\*\*/;
const ITALIC_ELM_REGXP = /__(.*?)__/;
const LIST_REGEXP = /^( *)([-|\*|\+] (.+))$/m;

/**
 * 1行ごとの文字列の配列を返す
 * ただし、listは一つの要素にまとめられる
 */
export const analize = (markdown: string) => {
  let state: "neutral_state" | "list_state" = "neutral_state";

  let lists = "";

  const rawMdArray: ReadonlyArray<string> = markdown.split(/\r\n|\r|\n/);
  const mdArray: Array<string> = [];

  rawMdArray.forEach((md, index) => {
    const isListMatch = !!md.match(LIST_REGEXP);
    if (state === "neutral_state" && isListMatch) {
      state = "list_state";
      lists += `${md}\n`;
      return;
    }
    if (state === "list_state" && isListMatch) {
      // 最後の行がリストだった場合
      if (index === rawMdArray.length - 1) {
        lists += `${md}`;
        mdArray.push(lists);
        return;
      }
      lists += `${md}\n`;
      return;
    }
    if (state === "neutral_state" && !isListMatch) mdArray.push(md);
    if (state === "list_state" && !isListMatch) {
      state = "neutral_state";
      mdArray.push(lists);
      lists = ""; // 複数のリストがあった場合のためリスト変数をリセットする
      return;
    }
  });

  return mdArray;
};

export const genTextElement = (
  id: number,
  text: string,
  parent: Token
): Token => {
  return {
    id,
    elmType: "text",
    content: text,
    parent,
  };
};

export const genStrongElement = (
  id: number,
  text: string,
  parent: Token
): Token => {
  return {
    id,
    elmType: "strong",
    content: "",
    parent,
  };
};

export const genItalicElement = (
  id: number,
  text: string,
  parent: Token
): Token => {
  return {
    id,
    elmType: "italic",
    content: "",
    parent,
  };
};

export const matchWithStrongRegxp = (text: string) => {
  const match = text.match(STRONG_ELM_REGXP);
  assertExists(match);
  assertExists(match.index);
  const index = match.index;
  const matchString = match[0];
  const inner = match[1];
  return { index, matchString, inner };
};

export const isMatchWithStrongRegxp = (text: string): boolean => {
  return !!text.match(STRONG_ELM_REGXP);
};

export const matchWithItalicRegxp = (text: string) => {
  const match = text.match(ITALIC_ELM_REGXP);
  assertExists(match);
  assertExists(match.index);
  const index = match.index;
  const matchString = match[0];
  const inner = match[1];
  return { index, matchString, inner };
};

export const isMatchWithItalicRegxp = (text: string): boolean => {
  return !!text.match(ITALIC_ELM_REGXP);
};

export const matchWithListRegxp = (text: string) => {
  const match = text.match(LIST_REGEXP);
  assertExists(match);
  const restString = match[3];
  return { restString };
};

export const isMatchWithListRegxp = (text: string): boolean => {
  return !!text.match(LIST_REGEXP);
};
