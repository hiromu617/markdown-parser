import { Token } from "./models/token";
import { exists } from "./utils/assert";

const STRONG_ELM_REGXP = /\*\*(.*?)\*\*/;
const LIST_REGEXP = /^( *)([-|\*|\+] (.+))$/m;

/**
 * 1行ごとの文字列の配列を返す
 * ただし、listは一つの要素にまとめられる
 */
const analize = (markdown: string) => {
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

const genTextElement = (id: number, text: string, parent: Token): Token => {
  return {
    id,
    elmType: "text",
    content: text,
    parent,
  };
};

const genStrongElement = (id: number, text: string, parent: Token): Token => {
  return {
    id,
    elmType: "strong",
    content: "",
    parent,
  };
};

const matchWithStrongRegxp = (text: string) => {
  const match = text.match(STRONG_ELM_REGXP);
  const isMatch = !!match;
  const index = match?.index;
  const matchString = exists(match) ? match[0] : undefined;
  const inner = exists(match) ? match[1] : undefined;
  return { isMatch, index, matchString, inner };
};

const matchWithListRegxp = (text: string) => {
  const match = text.match(LIST_REGEXP);
  const isMatch = !!match;
  const restString = exists(match) ? match[3] : undefined;
  return { isMatch, restString };
};

export {
  analize,
  genTextElement,
  genStrongElement,
  matchWithStrongRegxp,
  matchWithListRegxp,
};
