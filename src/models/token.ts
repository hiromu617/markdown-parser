type ElmType = "root" | "text" | "strong" | "ul" | "li" | "italic";

export type Token = {
  id: number;
  parent: Token;
  elmType: ElmType;
  content: string;
};
