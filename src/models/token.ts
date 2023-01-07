type ElmType = "root" | "text" | "strong" | "ul" | "li";

export type Token = {
  id: number;
  parent: Token;
  elmType: ElmType;
  content: string;
};
