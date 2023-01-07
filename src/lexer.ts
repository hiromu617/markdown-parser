import { Token } from "./models/token";

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
  return text.match(STRONG_ELM_REGXP);
};

const matchWithListRegxp = (text: string) => {
  return text.match(LIST_REGEXP);
};

export {
  analize,
  genTextElement,
  genStrongElement,
  matchWithStrongRegxp,
  matchWithListRegxp,
};
