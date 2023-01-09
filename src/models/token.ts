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
  | "anchor";

export type InlineElmType = Extract<
  ElmType,
  "strong" | "italic" | "strike" | "anchor"
>;
export type BlockElmType = Extract<ElmType, "h1" | "h2" | "h3" | "h4">;

export type Token = GeneralToken | MergedToken | AnchorToken;
type GeneralToken = {
  id: number;
  parent: Token;
  elmType: Exclude<ElmType, "anchor">;
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
  elmType: "anchor";
  content: string;
  url: string;
};
