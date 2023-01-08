import {
  matchWithStrongRegxp,
  matchWithItalicRegxp,
  matchWithListRegxp,
  isMatchWithListRegxp,
  genStrongElement,
  genItalicElement,
  genTextElement,
  genRootElement,
  genUlElement,
  genLiElement,
  detectFirstInlineElement,
} from "./lexer";
import { Token } from "./models/token";
import { assertExists } from "./utils/assert";

const rootToken = genRootElement();

/**
 * マークダウンの１行からASTを生成する
 */
export const parse = (markdownRow: string) => {
  const isListMatch = isMatchWithListRegxp(markdownRow);
  if (isListMatch) {
    return _tokenizeList(markdownRow);
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
      const onlyText = genTextElement(processingText, parent);
      processingText = "";
      tokens.push(onlyText);
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

const processInlineElm = (
  processingText: string,
  parent: Token,
  tokens: Token[],
  firstInlineElmType: ReturnType<typeof detectFirstInlineElement>
) => {
  let matchResult: ReturnType<typeof matchWithItalicRegxp>;
  if (firstInlineElmType === "italic") {
    matchResult = matchWithItalicRegxp(processingText);
  } else if (firstInlineElmType === "strong") {
    matchResult = matchWithStrongRegxp(processingText);
  } else {
    throw Error();
  }

  assertExists(matchResult.index);
  assertExists(matchResult.matchString);
  assertExists(matchResult.inner);

  const { index, matchString, inner } = matchResult;

  // Text + Tokenの時, TEXTを取り除く
  // ex) "aaa**bb**cc" -> TEXT Token + "**bb**cc" にする
  if (index > 0) {
    const text = processingText.substring(0, index);
    const textElm = genTextElement(text, parent);
    tokens.push(textElm);
    processingText = processingText.replace(text, "");
  }

  let elm: Token;
  if (firstInlineElmType === "italic") {
    elm = genItalicElement(parent);
  } else if (firstInlineElmType === "strong") {
    elm = genStrongElement(parent);
  } else {
    throw Error();
  }

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
  const rootUlToken = genUlElement(rootToken);
  const tokens: Token[] = [rootUlToken];

  listString
    .split(/\r\n|\r|\n/)
    .filter(Boolean)
    .forEach((l) => {
      const { restString } = matchWithListRegxp(l);
      assertExists(restString);

      const listToken = genLiElement(rootUlToken);
      tokens.push(listToken);
      const listText: Token[] = _tokenizeText(restString, listToken);
      tokens.push(...listText);
    });
  return tokens;
};
