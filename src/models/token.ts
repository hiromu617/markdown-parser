export type ElmType = "root" | "text" | "strong" | "ul" | "li" | "italic";

export type InlineElmType = Extract<ElmType, "strong" | "italic">;

export type Token = {
  id: number;
  parent: Token;
  elmType: ElmType;
  content: string;
};
