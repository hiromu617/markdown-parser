import { Token } from "./models/token";

const isAllElmParentRoot = (tokens: Array<Token>) => {
  return tokens.map((t) => t.parent?.elmType).every((val) => val === "root");
};

// ???
const _getInsertPosition = (content: string) => {
  let state = 0;
  const closeTagParentheses = ["<", ">"];
  let position = 0;
  content.split("").some((c, i) => {
    if (state === 1 && c === closeTagParentheses[state]) {
      position = i;
      return true;
    } else if (state === 0 && c === closeTagParentheses[state]) {
      state++;
    }
  });

  return position + 1;
};

const _createMergedContent = (currentToken: Token, parentToken: Token) => {
  let content = "";
  switch (parentToken.elmType) {
    case "li":
      content = `<li>${currentToken.content}</li>`;
      break;
    case "ul":
      content = `<ul>${currentToken.content}</ul>`;
      break;
    case "strong":
      content = `<strong>${currentToken.content}</strong>`;
      break;
    case "italic":
      content = `<i>${currentToken.content}</i>`;
      break;
    case "strike":
      content = `<strike>${currentToken.content}</strike>`;
      break;
    case "h1":
      content = `<h1>${currentToken.content}</h1>`;
      break;
    case "h2":
      content = `<h2>${currentToken.content}</h2>`;
      break;
    case "h3":
      content = `<h3>${currentToken.content}</h3>`;
      break;
    case "h4":
      content = `<h4>${currentToken.content}</h4>`;
      break;
    case "merged":
      const position = _getInsertPosition(parentToken.content);

      content = `${parentToken.content.slice(0, position)}${
        currentToken.content
      }${parentToken.content.slice(position)}`;
    case "root":
      break;
    case "text":
      break;
    default:
      const _: never = parentToken;
      throw new Error();
  }
  return content;
};

const _generateHTMLString = (tokens: Array<Token>) => {
  return tokens
    .map((t) => t.content)
    .reverse()
    .join("");
};

export const generate = (asts: Token[][]) => {
  const htmlStrings = asts.map((lineTokens) => {
    let rearrangedAst: Array<Token> = lineTokens.reverse();
    // すべてのトークンがRootの下に付くまでマージを繰り返す
    while (!isAllElmParentRoot(rearrangedAst)) {
      let index = 0;
      while (index < rearrangedAst.length) {
        if (rearrangedAst[index].parent?.elmType === "root") {
          // Rootにあるトークンの場合何もしない。
          index++;
          continue;
        }

        const currentToken = rearrangedAst[index];

        rearrangedAst = rearrangedAst.filter((_, t) => t !== index); // Remove current token
        const parentIndex = rearrangedAst.findIndex(
          (t) => t.id === currentToken.parent.id
        );
        const parentToken = rearrangedAst[parentIndex];
        if (!parentToken) break;

        const mergedToken: Token = {
          id: parentToken.id,
          elmType: "merged",
          content: _createMergedContent(currentToken, parentToken),
          parent: parentToken.parent,
        };
        rearrangedAst.splice(parentIndex, 1, mergedToken);
        // parentとマージする。
        // つまり2つ変更する。子は削除。親は置き換え。
        // 1つ親と合成したら1つ要素を消す。のでindexは変わらず。なのでマージしない時のみindex++する。
      }
    }
    return _generateHTMLString(rearrangedAst);
  });
  return htmlStrings.join("");
};
