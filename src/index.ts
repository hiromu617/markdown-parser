import { parse } from "./parser";
import { generate } from "./generator";
import { analize } from "./lexer";
import { Option } from "./models/option";

export const convertToHTMLString = (markdown: string, option?: Option) => {
  const mdArray = analize(markdown);
  const asts = mdArray.map((md) => parse(md, option));
  const htmlString = generate(asts, option);
  return htmlString;
};
