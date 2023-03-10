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
  | "h4"
  | "p"
  | "anchor"
  | "image"
  | "codespan"
  | "codeblock"
  | "quote"
  | "customAnchor";

export type InlineElmType = Extract<
  ElmType,
  "strong" | "italic" | "strike" | "anchor" | "image" | "codespan"
>;
export type BlockElmType = Extract<ElmType, "h1" | "h2" | "h3" | "h4" | "p">;

export type Token = GeneralToken | MergedToken | AnchorToken;
type GeneralToken = {
  id: number;
  parent: Token;
  elmType: Exclude<ElmType, "anchor" | "image" | "customAnchor">;
  content: string;
};

type MergedToken = {
  id: number;
  elmType: "merged";
  content: string;
  parent: Token | MergedToken;
};

type AnchorToken = {
  id: number;
  parent: Token;
  elmType: "anchor" | "image" | "customAnchor";
  content: string;
  url: string;
};
