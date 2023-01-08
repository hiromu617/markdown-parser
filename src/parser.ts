import {
  getInlineElmMatchResult,
  getBlockElmMatchResult,
  matchWithListRegxp,
  isMatchWithListRegxp,
  isMatchWithH1Regxp,
  genToken,
  detectFirstInlineElement,
} from "./lexer";
import { Token, InlineElmType } from "./models/token";
import { assertExists } from "./utils/assert";

const rootToken = genToken({ type: "root" });

/**
 * マークダウンの１行からASTを生成する
 */
export const parse = (markdownRow: string) => {
  const isListMatch = isMatchWithListRegxp(markdownRow);
  const isH1Match = isMatchWithH1Regxp(markdownRow);
  if (isListMatch) {
    return _tokenizeList(markdownRow);
  }
  if (isH1Match) {
    return _tokenizeBlock(markdownRow);
  }
  return _tokenizeText(markdownRow);
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

    const { newProcessingText, newParent, newTokens, inner } = processInlineElm(
      processingText,
      parent,
      tokens,
      firstInlineElmType
    );

    processingText = newProcessingText;
    parent = newParent;
    tokens = newTokens;

    _tokenize(inner, parent, tokens);
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

  const { index, matchString, inner } = matchResult;

  // Text + Tokenの時, TEXTを取り除く
  // ex) "aaa**bb**cc" -> TEXT Token + "**bb**cc" にする
  if (index > 0) {
    const content = processingText.substring(0, index);
    const textElm = genToken({ type: "text", content, parent });
    tokens.push(textElm);
    processingText = processingText.replace(content, "");
  }

  const elm = genToken({ type: inlineElmType, parent });

  parent = elm;
  processingText = processingText.replace(matchString, "");
  tokens.push(elm);

  return {
    newProcessingText: processingText,
    newParent: parent,
    newTokens: tokens,
    inner,
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
      const { restString } = matchWithListRegxp(l);
      assertExists(restString);

      const listToken = genToken({ type: "li", parent: rootUlToken });
      tokens.push(listToken);
      const listText: Token[] = _tokenizeText(restString, listToken);
      tokens.push(...listText);
    });
  return tokens;
};

/**
 * 行頭がh1の時、Tokenの配列を返す
 */
const _tokenizeBlock = (markdownRow: string): Token[] => {
  const tokens: Token[] = [rootToken];
  const { restString } = getBlockElmMatchResult("h1", markdownRow);
  assertExists(restString);

  const h1Token = genToken({ type: "h1", parent: rootToken });
  tokens.push(h1Token);

  const textToken = genToken({
    type: "text",
    parent: h1Token,
    content: restString,
  });
  tokens.push(textToken);

  return tokens;
};
