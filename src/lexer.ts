import { Token } from "./models/token";

const TEXT = "text";
const STRONG = "strong";

const STRONG_ELM_REGXP = /\*\*(.*?)\*\*/;
const LIST_REGEXP = /^( *)([-|\*|\+] (.+))$/m;

const genTextElement = (id: number, text: string, parent: Token): Token => {
  return {
    id,
    elmType: TEXT,
    content: text,
    parent,
  };
};

const genStrongElement = (id: number, text: string, parent: Token): Token => {
  return {
    id,
    elmType: STRONG,
    content: "",
    parent,
  };
};

const matchWithStrongRegxp = (text: string) => {
  return text.match(STRONG_ELM_REGXP);
};

const matchWithListRegxp = (text: string) => {
  return text.match(LIST_REGEXP);
};

export {
  genTextElement,
  genStrongElement,
  matchWithStrongRegxp,
  matchWithListRegxp,
};
