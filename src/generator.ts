import { Token } from "./models/token";
import { MergedToken } from "./models/merged_token";

const _generateHTMLString = (tokens: Array<Token | MergedToken>) => {
  return tokens
    .map((t) => t.content)
    .reverse()
    .join("");
};

const generate = (asts: Token[][]) => {
  const htmlStrings = asts.map((lineTokens) => {
    const rearrangedAst: Array<Token | MergedToken> = lineTokens.reverse();
    return _generateHTMLString(rearrangedAst);
  });

  return htmlStrings.join("");
};

export { generate };
