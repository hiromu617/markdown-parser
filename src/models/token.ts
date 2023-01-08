export type ElmType =
  | "root"
  | "text"
  | "strong"
  | "ul"
  | "li"
  | "italic"
  | "strike"
  | "h1"
  | "h2"
  | "h3"
  | "h4";

export type InlineElmType = Extract<ElmType, "strong" | "italic" | "strike">;
export type BlockElmType = Extract<ElmType, "h1" | "h2" | "h3" | "h4">;

export type Token = {
  id: number;
  parent: Token;
  elmType: ElmType;
  content: string;
};
