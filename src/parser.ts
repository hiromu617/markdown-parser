import {
  matchWithStrongRegxp,
  matchWithListRegxp,
  genStrongElement,
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
  const { isMatch } = matchWithListRegxp(markdownRow);
  if (isMatch) {
    return _tokenizeList(markdownRow);
  }
  return _tokenizeText(markdownRow);
};

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
      const {
        isMatch: isStrongMatch,
        index,
        matchString,
        inner,
      } = matchWithStrongRegxp(processingText);

      // Textのみの時
      if (!isStrongMatch) {
        id += 1;
        const onlyText = genTextElement(id, processingText, parent);
        processingText = "";
        tokens.push(onlyText);
        return;
      }

      if (isStrongMatch) {
        assertExists(index);
        assertExists(matchString);
        assertExists(inner);
        // Text + Tokenの時, TEXTを取り除く
        // ex) "aaa**bb**cc" -> TEXT Token + "**bb**cc" にする
        if (index > 0) {
          const text = processingText.substring(0, index);
          id += 1;
          const textElm = genTextElement(id, text, parent);
          tokens.push(textElm);
          processingText = processingText.replace(text, ""); // 処理中のテキストからトークンにしたテキストを削除する
        }

        id += 1;
        const elm = genStrongElement(id, "", parent);

        parent = elm;
        tokens.push(elm);

        processingText = processingText.replace(matchString, "");

        _tokenize(inner, parent);
        parent = p;
      }
    }
  };
  _tokenize(textElement, parent);
  return tokens;
};

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
