import {
  matchWithStrongRegxp,
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

export const parse = (markdownRow: string) => {
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
