import {
  getInlineElmMatchResult,
  getHeadingElmMatchResult,
  getListElmMatchResult,
  getQuoteElmMatchResult,
  isMatchWithListRegxp,
  isMatchWithQuoteRegxp,
  isCodeBlock,
  isUrl,
  getBlockElmType,
  genToken,
  detectFirstInlineElement,
} from "./lexer";
import { Token, InlineElmType, BlockElmType } from "./models/token";
import { Option } from "./models/option";
import { assertExists } from "./utils/assert";

const rootToken = genToken({ type: "root" });

/**
 * マークダウンの１行からASTを生成する
 */
export const parse = (markdownRow: string, option?: Option) => {
  const isListMatch = isMatchWithListRegxp(markdownRow);
  const isQuoteMatch = isMatchWithQuoteRegxp(markdownRow);
  const isCodeBlockMatch = isCodeBlock(markdownRow);
  const blockElmType = getBlockElmType(markdownRow);

  if (isListMatch) {
    return _tokenizeList(markdownRow);
  }
  if (isQuoteMatch) {
    return _tokenizeQuote(markdownRow);
  }
  if (isCodeBlockMatch) {
    return _tokenizeCodeBlock(markdownRow);
  }
  return _tokenizeBlock(markdownRow, blockElmType, option?.customRenderUrl);
};

/**
 * テキストのAST生成
 * 再帰的にテキスト内のインライン要素をToken化してTokenの配列を返す
 */
const _tokenizeText = (
  textElement: string,
  initialRoot: Token = rootToken
): Token[] => {
  const tokens: Token[] = [];

  return _tokenize(textElement, initialRoot, tokens);
};

/**
 * _tokenizeTextの本体
 */
const _tokenize = (
  originalText: string,
  initialParent: Token,
  tokens: Token[]
): Token[] => {
  let processingText = originalText;
  let parent = initialParent;

  while (processingText.length !== 0) {
    const firstInlineElmType = detectFirstInlineElement(processingText);
    const isOnlyText = firstInlineElmType === "none";

    if (isOnlyText) {
      const textToken = genToken({
        type: "text",
        content: processingText,
        parent,
      });
      processingText = "";
      tokens.push(textToken);
      break;
    }

    const { newProcessingText, newTokens } = processInlineElm(
      processingText,
      parent,
      tokens,
      firstInlineElmType
    );

    processingText = newProcessingText;
    tokens = newTokens;
    parent = initialParent;
  }
  return tokens;
};

/**
 * インライン要素を含むprocessingTextをToken化する
 */
const processInlineElm = (
  processingText: string,
  parent: Token,
  tokens: Token[],
  inlineElmType: InlineElmType
) => {
  const matchResult = getInlineElmMatchResult(inlineElmType, processingText);

  assertExists(matchResult.index);
  assertExists(matchResult.matchString);
  assertExists(matchResult.inner);

  const { index, matchString, inner, url } = matchResult;

  // Text + Tokenの時, TEXTを取り除く
  // ex) "aaa**bb**cc" -> TEXT Token + "**bb**cc" にする
  if (index > 0) {
    const content = processingText.substring(0, index);
    const textElm = genToken({ type: "text", content, parent });
    tokens.push(textElm);
    processingText = processingText.replace(content, "");
  }

  const elm = (() => {
    if (inlineElmType === "anchor" || inlineElmType === "image") {
      assertExists(url);
      return genToken({ type: inlineElmType, parent, url, content: inner });
    }
    return genToken({ type: inlineElmType, parent });
  })();

  parent = elm;
  processingText = processingText.replace(matchString, "");
  tokens.push(elm);

  _tokenize(inner, parent, tokens);

  return {
    newProcessingText: processingText,
    newTokens: tokens,
  };
};

/**
 * 行頭がlistの時、Tokenの配列を返す
 */
const _tokenizeList = (listString: string): Token[] => {
  const rootUlToken = genToken({ type: "ul", parent: rootToken });
  const tokens: Token[] = [rootUlToken];

  listString
    .split(/\r\n|\r|\n/)
    .filter(Boolean)
    .forEach((l) => {
      const { restString } = getListElmMatchResult(l);
      assertExists(restString);

      const listToken = genToken({ type: "li", parent: rootUlToken });
      tokens.push(listToken);
      const listText: Token[] = _tokenizeText(restString, listToken);
      tokens.push(...listText);
    });
  return tokens;
};

const _tokenizeQuote = (quoteString: string): Token[] => {
  const quoteToken = genToken({ type: "quote", parent: rootToken });
  const tokens: Token[] = [quoteToken];

  quoteString
    .replace(/\r\n|\r|\n/g, "<br/>\n")
    .split(/\r\n|\r|\n/)
    .filter(Boolean)
    .forEach((l, i) => {
      const { restString } = getQuoteElmMatchResult(l);
      assertExists(restString);

      const restStringTokens = _tokenizeText(restString, quoteToken);
      tokens.push(...restStringTokens);
    });

  return tokens;
};

/**
 * 行頭がブロック要素の時、Tokenの配列を返す
 */
const _tokenizeBlock = (
  markdownRow: string,
  blockElmType: BlockElmType,
  customRenderUrl?: Option["customRenderUrl"]
): Token[] => {
  const tokens: Token[] = [rootToken];
  if (blockElmType === "p") {
    if (isUrl(markdownRow) && customRenderUrl) {
      const anchorToken = genToken({
        type: "customAnchor",
        parent: rootToken,
        content: markdownRow,
        url: markdownRow,
      });
      tokens.push(anchorToken);
      return tokens;
    }

    const paragraphToken = genToken({ type: blockElmType, parent: rootToken });
    tokens.push(paragraphToken);
    const paragraphText: Token[] = _tokenizeText(markdownRow, paragraphToken);
    tokens.push(...paragraphText);
    return tokens;
  }

  const { restString } = getHeadingElmMatchResult(blockElmType, markdownRow);
  assertExists(restString);

  const blockToken = genToken({ type: blockElmType, parent: rootToken });
  tokens.push(blockToken);

  const textToken = genToken({
    type: "text",
    parent: blockToken,
    content: restString,
  });
  tokens.push(textToken);

  return tokens;
};

const _tokenizeCodeBlock = (markdownRow: string): Token[] => {
  const tokens: Token[] = [rootToken];
  const content = markdownRow.slice(0, -3).slice(3);

  const codeblockToken = genToken({
    type: "codeblock",
    parent: rootToken,
  });
  tokens.push(codeblockToken);

  const code = genToken({
    type: "text",
    parent: codeblockToken,
    content,
  });
  tokens.push(code);

  return tokens;
};
