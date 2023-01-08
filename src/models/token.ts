export type ElmType =
  | "root"
  | "text"
  | "strong"
  | "ul"
  | "li"
  | "italic"
  | "strike";

export type InlineElmType = Extract<ElmType, "strong" | "italic" | "strike">;

export type Token = {
  id: number;
  parent: Token;
  elmType: ElmType;
  content: string;
};
