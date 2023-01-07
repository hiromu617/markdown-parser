import { parse } from "./parser";

const convertToHTMLString = (markdown: string) => {
  const mdArray = markdown.split(/\r\n|\r|\n/);
  const asts = mdArray.map((md) => parse(md));
  return asts;
};
console.log(convertToHTMLString("normal**bold**"));
