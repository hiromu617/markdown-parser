import { parse } from "./parser";
import { generate } from "./generator";

const convertToHTMLString = (markdown: string) => {
  const mdArray = markdown.split(/\r\n|\r|\n/);
  const asts = mdArray.map((md) => parse(md));
  const htmlString = generate(asts);
  return htmlString;
};
console.log(convertToHTMLString("* list1"));
