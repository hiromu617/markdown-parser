import {
  isMatchWithStrongRegxp,
  matchWithStrongRegxp,
  isMatchWithItalicRegxp,
  matchWithItalicRegxp,
  matchWithListRegxp,
  isMatchWithListRegxp,
  genStrongElement,
  genItalicElement,
  genTextElement,
} from "./lexer";
import { Token } from "./models/token";
import { assertExists } from "./utils/assert";

const rootToken: Token = {
  id: 0,
  elmType: "root",
  content: "",
  parent: {} as Token,
};

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
  initialId: number = 0,
  initialRoot: Token = rootToken
): Token[] => {
  const tokens: Token[] = [];
  let parent: Token = initialRoot;

  let id = initialId;

  const _tokenize = (originalText: string, p: Token) => {
    let processingText = originalText;
    parent = p;

    while (processingText.length !== 0) {
      const isStrongMatch = isMatchWithStrongRegxp(processingText);
      const isItalicMatch = isMatchWithItalicRegxp(processingText);

      const isOnlyText = !isStrongMatch && !isItalicMatch;

      if (isOnlyText) {
        id += 1;
        const onlyText = genTextElement(id, processingText, parent);
        processingText = "";
        tokens.push(onlyText);
        return;
      }

      const {
        index: italicIndex,
        matchString: italicMatchString,
        inner: italicInner,
      } = matchWithItalicRegxp(processingText);
      const {
        index: strongIndex,
        matchString: strongMatchString,
        inner: strongInner,
      } = matchWithStrongRegxp(processingText);

      if (isItalicMatch && (italicIndex ?? 9999) < (strongIndex ?? 9999)) {
        assertExists(italicIndex);
        assertExists(italicMatchString);
        assertExists(italicInner);

        if (italicIndex > 0) {
          const text = processingText.substring(0, italicIndex);
          id += 1;
          const textElm = genTextElement(id, text, parent);
          tokens.push(textElm);
          processingText = processingText.replace(text, ""); // 処理中のテキストからトークンにしたテキストを削除する
        }

        id += 1;
        const elm = genItalicElement(id, "", parent);

        parent = elm;
        tokens.push(elm);

        processingText = processingText.replace(italicMatchString, "");

        _tokenize(italicInner, parent);
        parent = p;
      }

      if (isStrongMatch && (strongIndex ?? 9999) < (italicIndex ?? 9999)) {
        assertExists(strongIndex);
        assertExists(strongMatchString);
        assertExists(strongInner);
        // Text + Tokenの時, TEXTを取り除く
        // ex) "aaa**bb**cc" -> TEXT Token + "**bb**cc" にする
        if (strongIndex > 0) {
          const text = processingText.substring(0, strongIndex);
          id += 1;
          const textElm = genTextElement(id, text, parent);
          tokens.push(textElm);
          processingText = processingText.replace(text, ""); // 処理中のテキストからトークンにしたテキストを削除する
        }

        id += 1;
        const elm = genStrongElement(id, "", parent);

        parent = elm;
        tokens.push(elm);

        processingText = processingText.replace(strongMatchString, "");

        _tokenize(strongInner, parent);
        parent = p;
      }
    }
  };
  _tokenize(textElement, parent);
  return tokens;
};

/**
 * 行頭がlistの時、Tokenの配列を返す
 */
const _tokenizeList = (listString: string): Token[] => {
  let id = 1;
  const rootUlToken: Token = {
    id,
    elmType: "ul",
    content: "",
    parent: rootToken,
  };
  let parent = rootUlToken;
  const tokens: Token[] = [rootUlToken];

  listString
    .split(/\r\n|\r|\n/)
    .filter(Boolean)
    .forEach((l) => {
      const { restString } = matchWithListRegxp(l);
      assertExists(restString);

      id += 1;
      const listToken: Token = {
        id,
        elmType: "li",
        content: "",
        parent,
      };
      tokens.push(listToken);
      const listText: Token[] = _tokenizeText(restString, id, listToken);
      id += listText.length;
      tokens.push(...listText);
    });
  return tokens;
};
