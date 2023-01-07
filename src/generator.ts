import { Token } from "./models/token";
import { MergedToken } from "./models/merged_token";

const isAllElmParentRoot = (tokens: Array<Token | MergedToken>) => {
  return tokens.every((t) => t.elmType === "root");
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

const _createMergedContent = (
  currentToken: Token | MergedToken,
  parentToken: Token | MergedToken
) => {
  let content = "";
  switch (parentToken.elmType) {
    case "strong":
      content = `<strong>${currentToken.content}</strong>`;
      break;
    case "merged":
      const position = _getInsertPosition(parentToken.content);

      content = `${parentToken.content.slice(0, position)}${
        currentToken.content
      }${parentToken.content.slice(position)}`;
  }
  return content;
};

const _generateHTMLString = (tokens: Array<Token | MergedToken>) => {
  return tokens
    .map((t) => t.content)
    .reverse()
    .join("");
};

const generate = (asts: Token[][]) => {
  const htmlStrings = asts.map((lineTokens) => {
    let rearrangedAst: Array<Token | MergedToken> = lineTokens.reverse();
    while (!isAllElmParentRoot(rearrangedAst)) {
      let index = 0;
      const currentToken = rearrangedAst[index];
      while (index < rearrangedAst.length) {
        if (currentToken.parent.elmType === "root") {
          index++;
        } else {
          rearrangedAst = rearrangedAst.filter((_, t) => t !== index); // Remove current token
          const parentIndex = rearrangedAst.findIndex(
            (t) => t.id === currentToken.parent.id
          );
          const parentToken = rearrangedAst[parentIndex];

          const mergedToken: MergedToken = {
            id: parentToken.id,
            elmType: "merged",
            content: _createMergedContent(currentToken, parentToken),
            parent: parentToken.parent,
          };

          rearrangedAst.splice(parentIndex, 1, mergedToken);
        }
      }
    }
    return _generateHTMLString(rearrangedAst);
  });

  return htmlStrings.join("");
};

export { generate };
