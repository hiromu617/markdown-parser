import { Option } from "./models/option";
import { Token } from "./models/token";
import { assertExists } from "./utils/assert";

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

const _createMergedContent = (
  currentToken: Token,
  parentToken: Token,
  option?: Option
) => {
  let content = "";
  switch (parentToken.elmType) {
    case "li":
      content = `<li>${currentToken.content}</li>`;
      break;
    case "ul":
      content = `<ul>${currentToken.content}</ul>`;
      break;
    case "quote":
      content = `<blockquote>${currentToken.content}</blockquote>`;
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
    case "codespan":
      content = `<code>${currentToken.content}</code>`;
      break;
    case "codeblock":
      content = `<pre><code>${currentToken.content}</code></pre>`;
      break;
    case "anchor":
      content = `<a href="${parentToken.url}">${currentToken.content}</a>`;
      break;
    case "customAnchor":
      assertExists(option?.customRenderUrl);
      content = option.customRenderUrl(parentToken.url);
      break;
    case "image":
      content = `<img alt="${parentToken.content}" src="${parentToken.url}"/>`;
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
    case "p":
      content = `<p>${currentToken.content}</p>`;
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

export const generate = (asts: Token[][], option?: Option) => {
  const htmlStrings = asts.map((lineTokens) => {
    let rearrangedAst: Array<Token> = lineTokens.reverse();
    // ???????????????????????????Root?????????????????????????????????????????????
    while (!isAllElmParentRoot(rearrangedAst)) {
      let index = 0;
      while (index < rearrangedAst.length) {
        if (rearrangedAst[index].parent?.elmType === "root") {
          // Root????????????????????????????????????????????????
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
          content: _createMergedContent(currentToken, parentToken, option),
          parent: parentToken.parent,
        };
        rearrangedAst.splice(parentIndex, 1, mergedToken);
        // parent?????????????????????
        // ?????????2??????????????????????????????????????????????????????
        // 1????????????????????????1???????????????????????????index??????????????????????????????????????????????????????index++?????????
      }
    }
    return _generateHTMLString(rearrangedAst);
  });
  return htmlStrings.join("");
};
