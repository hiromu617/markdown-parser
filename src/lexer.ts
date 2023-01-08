import { Token, InlineElmType, ElmType } from "./models/token";
import { assertExists } from "./utils/assert";

const STRONG_ELM_REGXP = /\*\*(.*?)\*\*/;
const ITALIC_ELM_REGXP = /__(.*?)__/;
const STRIKE_ELM_REGXP = /~~(.*?)~~/;
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

let id = 0;

export const genToken = (
  args:
    | {
        type: Exclude<ElmType, "root" | "text">;
        parent: Token;
      }
    | { type: "root" }
    | { type: "text"; content: string; parent: Token }
): Token => {
  id += 1;
  switch (args.type) {
    case "root":
      return {
        id: 0,
        elmType: "root",
        content: "",
        parent: {} as Token,
      };
    case "text":
      return {
        id,
        elmType: "text",
        content: args.content,
        parent: args.parent,
      };
    default:
      return {
        id,
        elmType: args.type,
        content: "",
        parent: args.parent,
      };
  }
};

export const getInlineElmMatchResult = (type: InlineElmType, text: string) => {
  let matchResult: RegExpMatchArray | undefined;
  switch (type) {
    case "strong":
      matchResult = text.match(STRONG_ELM_REGXP) ?? undefined;
      break;
    case "italic":
      matchResult = text.match(ITALIC_ELM_REGXP) ?? undefined;
      break;
    case "strike":
      matchResult = text.match(STRIKE_ELM_REGXP) ?? undefined;
      break;
    default:
      const _: never = type;
  }

  const index = matchResult?.index;
  const matchString = matchResult?.[0];
  const inner = matchResult?.[1];
  return { index, matchString, inner };
};

export const matchWithListRegxp = (text: string) => {
  const match = text.match(LIST_REGEXP);
  const restString = match?.[3];
  return { restString };
};

export const isMatchWithListRegxp = (text: string): boolean => {
  return !!text.match(LIST_REGEXP);
};

export const detectFirstInlineElement = (
  text: string
): InlineElmType | "none" => {
  const italicMatchResult = text.match(ITALIC_ELM_REGXP);
  const strongMatchResult = text.match(STRONG_ELM_REGXP);
  const strikeMatchResult = text.match(STRIKE_ELM_REGXP);

  if (!italicMatchResult && !strongMatchResult && !strikeMatchResult)
    return "none";

  const italicIndex = italicMatchResult?.index ?? Infinity;
  const strongIndex = strongMatchResult?.index ?? Infinity;
  const strikeIndex = strikeMatchResult?.index ?? Infinity;

  const minIndex = Math.min(italicIndex, strongIndex, strikeIndex);

  if (minIndex === italicIndex) return "italic";
  if (minIndex === strongIndex) return "strong";
  if (minIndex === strikeIndex) return "strike";

  return "none";
};
