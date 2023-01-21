import { Token, InlineElmType, ElmType, BlockElmType } from "./models/token";

const STRONG_ELM_REGXP = /\*\*(.*?)\*\*/;
const ITALIC_ELM_REGXP = /__(.*?)__/;
const STRIKE_ELM_REGXP = /~~(.*?)~~/;
const CODESPAN_ELM_REGXP = /`(.*?)`/;
const ANCHOR_ELM_REGXP = /\[(.*?)\]\((.*?)\)/;
const IMAGE_ELM_REGXP = /!\[(.*?)\]\((.*?)\)/;
const LIST_REGEXP = /^( *)([-|\*|\+] (.+))$/m;
const QUOTE_REGEXP = /^(> (.+))$/m;
const H1_REGEXP = /^(# (.+))$/m;
const H2_REGEXP = /^(## (.+))$/m;
const H3_REGEXP = /^(### (.+))$/m;
const H4_REGEXP = /^(#### (.+))$/m;

/**
 * 1行ごとの文字列の配列を返す
 * ただし、list, quoteは一つの要素にまとめられる
 */
export const analize = (markdown: string) => {
  const rawMdArray: ReadonlyArray<string> = markdown.split(/\r\n|\r|\n/);
  const temp = _analizeListAndQuote(rawMdArray);
  const temp2 = _analizeCodeBlock(temp);
  const mdArray = _analizeText(temp2);
  return mdArray;
};

const _analizeCodeBlock = (mdArray: ReadonlyArray<string>): string[] => {
  let state: "code_state" | "other_state" = "other_state";

  const lists: string[] = [];
  const newMdArray: Array<string> = [];

  mdArray.forEach((md) => {
    const isCodeBlock = md === "```";

    if (state === "other_state" && isCodeBlock) {
      state = "code_state";
      return;
    }

    if (state === "code_state" && !isCodeBlock) {
      lists.push(md);
      return;
    }

    if (state === "code_state" && isCodeBlock) {
      state = "other_state"
      newMdArray.push(`\`\`\`${lists.join("\n")}\`\`\``);
      lists.length = 0;
      return;
    }

    newMdArray.push(md);
  });

  return newMdArray;
};

const _analizeText = (mdArray: ReadonlyArray<string>): string[] => {
  if (mdArray.length === 1) return mdArray as string[];
  let state: "paragraph_state" | "other_state" = "other_state";

  const lists: string[] = [];
  const newMdArray: Array<string> = [];

  mdArray.forEach((md) => {
    const isListMatch = isMatchWithListRegxp(md);
    const isQuoteMatch = isMatchWithQuoteRegxp(md);
    const isCode = isCodeBlock(md);

    const isEmpty = md.length === 0;
    const isNormalText =
      getBlockElmType(md) === "p" &&
      !isListMatch &&
      !isQuoteMatch &&
      !isCode &&
      !isEmpty;

    if (isNormalText) {
      state = "paragraph_state";
      lists.push(md);
      return;
    }

    if (!isNormalText && state === "paragraph_state") {
      newMdArray.push(lists.join("<br/>"));
      state = "other_state";
      lists.length = 0;

      newMdArray.push(md);
      return;
    }

    newMdArray.push(md);
  });

  if (lists.length !== 0) {
    newMdArray.push(lists.join("\n"));
  }

  return newMdArray;
};

const _analizeListAndQuote = (mdArray: ReadonlyArray<string>): string[] => {
  let state: "neutral_state" | "list_state" | "quote_state" = "neutral_state";

  const lists: string[] = [];
  const newMdArray: Array<string> = [];

  mdArray.forEach((md) => {
    const isListMatch = isMatchWithListRegxp(md);
    const isQuoteMatch = isMatchWithQuoteRegxp(md);

    if (!isListMatch && !isQuoteMatch) {
      if (state !== "neutral_state") {
        state = "neutral_state";
        newMdArray.push(lists.join("\n"));
        lists.length = 0;

        newMdArray.push(md);
        return;
      }
      newMdArray.push(md);
      return;
    }

    if (isListMatch) {
      if (state === "quote_state") {
        state = "list_state";
        newMdArray.push(lists.join("\n"));
        lists.length = 0;
        lists.push(md);
        return;
      }
      state = "list_state";
      lists.push(md);
    }

    if (isQuoteMatch) {
      if (state === "list_state") {
        state = "quote_state";
        newMdArray.push(lists.join("\n"));
        lists.length = 0;
        lists.push(md);
        return;
      }
      state = "quote_state";
      lists.push(md);
    }
  });

  if (lists.length !== 0) {
    newMdArray.push(lists.join("\n"));
  }

  return newMdArray;
};

let id = 0;

export const genToken = (
  args:
    | {
        type: Exclude<
          ElmType,
          "root" | "text" | "anchor" | "image"
        >;
        parent: Token;
      }
    | { type: "root" }
    | { type: "text"; content: string; parent: Token }
    | { type: "anchor" | "image"; content: string; parent: Token; url: string }
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
    case "text":
      return {
        id,
        elmType: "text",
        content: args.content,
        parent: args.parent,
      };
    case "anchor":
      return {
        id,
        elmType: "anchor",
        content: args.content,
        parent: args.parent,
        url: args.url,
      };
    case "image":
      return {
        id,
        elmType: "image",
        content: args.content,
        parent: args.parent,
        url: args.url,
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
    case "codespan":
      matchResult = text.match(CODESPAN_ELM_REGXP) ?? undefined;
      break;
    case "anchor":
      matchResult = text.match(ANCHOR_ELM_REGXP) ?? undefined;
      break;
    case "image":
      matchResult = text.match(IMAGE_ELM_REGXP) ?? undefined;
      break;
    default:
      const _: never = type;
  }

  const index = matchResult?.index;
  const matchString = matchResult?.[0];
  const inner = matchResult?.[1];
  if (type === "anchor" || type === "image") {
    const url = matchResult?.[2];
    return { index, matchString, inner, url };
  }
  return { index, matchString, inner };
};

export const getHeadingElmMatchResult = (
  type: Exclude<BlockElmType, "p">,
  text: string
) => {
  let matchResult: RegExpMatchArray | undefined;
  switch (type) {
    case "h1":
      matchResult = text.match(H1_REGEXP) ?? undefined;
      break;
    case "h2":
      matchResult = text.match(H2_REGEXP) ?? undefined;
      break;
    case "h3":
      matchResult = text.match(H3_REGEXP) ?? undefined;
      break;
    case "h4":
      matchResult = text.match(H4_REGEXP) ?? undefined;
      break;
    default:
      const _: never = type;
  }

  const restString = matchResult?.[2];
  return { restString };
};

export const getListElmMatchResult = (text: string) => {
  const match = text.match(LIST_REGEXP);
  const restString = match?.[3];
  return { restString };
};

export const getQuoteElmMatchResult = (text: string) => {
  const match = text.match(QUOTE_REGEXP);
  const restString = match?.[2];
  return { restString };
};

export const isMatchWithListRegxp = (text: string): boolean => {
  return !!text.match(LIST_REGEXP);
};

export const isMatchWithQuoteRegxp = (text: string): boolean => {
  return !!text.match(QUOTE_REGEXP);
};

export const isCodeBlock = (text: string): boolean => {
  return text.slice(0, 3) === "```";
};

export const getBlockElmType = (text: string): BlockElmType => {
  if (!!text.match(H1_REGEXP)) return "h1";
  if (!!text.match(H2_REGEXP)) return "h2";
  if (!!text.match(H3_REGEXP)) return "h3";
  if (!!text.match(H4_REGEXP)) return "h4";
  return "p";
};

export const detectFirstInlineElement = (
  text: string
): InlineElmType | "none" => {
  const italicMatchResult = text.match(ITALIC_ELM_REGXP);
  const strongMatchResult = text.match(STRONG_ELM_REGXP);
  const strikeMatchResult = text.match(STRIKE_ELM_REGXP);
  const anchorMatchResult = text.match(ANCHOR_ELM_REGXP);
  const imageMatchResult = text.match(IMAGE_ELM_REGXP);
  const codespanMatchResult = text.match(CODESPAN_ELM_REGXP);

  if (
    !italicMatchResult &&
    !strongMatchResult &&
    !strikeMatchResult &&
    !anchorMatchResult &&
    !imageMatchResult &&
    !codespanMatchResult
  )
    return "none";

  const italicIndex = italicMatchResult?.index ?? Infinity;
  const strongIndex = strongMatchResult?.index ?? Infinity;
  const strikeIndex = strikeMatchResult?.index ?? Infinity;
  const anchorIndex = anchorMatchResult?.index ?? Infinity;
  const imageIndex = imageMatchResult?.index ?? Infinity;
  const codespanIndex = codespanMatchResult?.index ?? Infinity;

  const minIndex = Math.min(
    italicIndex,
    strongIndex,
    strikeIndex,
    anchorIndex,
    imageIndex,
    codespanIndex
  );

  if (minIndex === italicIndex) return "italic";
  if (minIndex === strongIndex) return "strong";
  if (minIndex === strikeIndex) return "strike";
  if (minIndex === anchorIndex) return "anchor";
  if (minIndex === imageIndex) return "image";
  if (minIndex === codespanIndex) return "codespan";

  return "none";
};
