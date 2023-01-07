import { parse } from "./parser";
import { generate } from "./generator";
import { analize } from "./lexer";

const convertToHTMLString = (markdown: string) => {
  const mdArray = analize(markdown);
  console.log(mdArray)
  const asts = mdArray.map((md) => parse(md));
  const htmlString = generate(asts);
  return htmlString;
};

const string = `
normal text

- list1
- list2
- list3

normal

- aaa
- bbb
`

console.log(convertToHTMLString(string))
