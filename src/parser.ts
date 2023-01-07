import {
  matchWithStrongRegxp,
  matchWithListRegxp,
  genStrongElement,
  genTextElement,
} from "./lexer";
import { Token } from "./models/token";

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
  if (matchWithListRegxp(markdownRow)) {
    return _tokenizeList(markdownRow);
  }
  return _tokenizeText(markdownRow);
};

const _tokenizeText = (
  textElement: string,
  initialId: number = 0,
  initialRoot: Token = rootToken
): Token[] => {
  let elements: Token[] = [];
  let parent: Token = initialRoot;

  let id = initialId;

  const _tokenize = (originalText: string, p: Token) => {
    let processingText = originalText;
    parent = p;

    while (processingText.length !== 0) {
      const matchArray = matchWithStrongRegxp(processingText);

      // Textのみの時
      if (!matchArray) {
        id += 1;
        const onlyText = genTextElement(id, processingText, parent);
        processingText = "";
        elements.push(onlyText);
      } else {
        // Text + Tokenの時, TEXTを取り除く
        // ex) "aaa**bb**cc" -> TEXT Token + "**bb**cc" にする
        if (Number(matchArray.index) > 0) {
          const text = processingText.substring(0, Number(matchArray.index));
          id += 1;
          const textElm = genTextElement(id, text, parent);
          elements.push(textElm);
          processingText = processingText.replace(text, ""); // 処理中のテキストからトークンにしたテキストを削除する
        }

        id += 1;
        const elm = genStrongElement(id, "", parent);

        parent = elm;
        elements.push(elm);

        processingText = processingText.replace(matchArray[0], "");

        _tokenize(matchArray[1], parent);
        parent = p;
      }
    }
  };
  _tokenize(textElement, parent);
  return elements;
};

const _tokenizeList = (listString: string) => {
  const UL = "ul";
  const LIST = "li";

  let id = 1;
  const rootUlToken: Token = {
    id,
    elmType: UL,
    content: "",
    parent: rootToken,
  };
  let parent = rootUlToken;
  let tokens: Token[] = [rootUlToken];
  listString
    .split(/\r\n|\r|\n/)
    .filter(Boolean)
    .forEach((l) => {
      const match = matchWithListRegxp(l) as RegExpMatchArray;

      id += 1;
      const listToken: Token = {
        id,
        elmType: LIST,
        content: "", // Indent level
        parent,
      };
      tokens.push(listToken);
      const listText: Token[] = _tokenizeText(match[3], id, listToken);
      id += listText.length;
      tokens.push(...listText);
    });
  return tokens;
};
