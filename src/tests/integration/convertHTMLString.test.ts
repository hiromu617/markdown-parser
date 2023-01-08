import { convertToHTMLString } from "../..";
import { describe, expect, test } from "@jest/globals";

describe("convertToHTMLString", () => {
  describe("strong", () => {
    // strong
    test("**text**がstrong要素として出力される", () => {
      const string = "**text**";
      const expected = "<strong>text</strong>";
      expect(convertToHTMLString(string)).toBe(expected);
    });

    test("text1**text2**が正しく変換される", () => {
      const string = "text1**text2**";
      const expected = "text1<strong>text2</strong>";
      expect(convertToHTMLString(string)).toBe(expected);
    });
  });

  describe("italic", () => {
    test("__text__がi要素として出力される", () => {
      const string = "__text__";
      const expected = "<i>text</i>";
      expect(convertToHTMLString(string)).toBe(expected);
    });
    test("__aaa__bbb**ccc**が正しく出力される", () => {
      const string = "__aaa__bbb**ccc**";
      const expected = "<i>aaa</i>bbb<strong>ccc</strong>";
      expect(convertToHTMLString(string)).toBe(expected);
    });
    test("**aaa**bbb__ccc__が正しく出力される", () => {
      const string = "**aaa**bbb__ccc__";
      const expected = "<strong>aaa</strong>bbb<i>ccc</i>";
      expect(convertToHTMLString(string)).toBe(expected);
    });
    test("__aaa__bbb__ccc__が正しく出力される", () => {
      const string = "__aaa__bbb__ccc__";
      const expected = "<i>aaa</i>bbb<i>ccc</i>";
      expect(convertToHTMLString(string)).toBe(expected);
    });
  });

  describe("strike", () => {
    test("~~text~~がstrike要素として出力される", () => {
      const string = "~~text~~";
      const expected = "<strike>text</strike>";
      expect(convertToHTMLString(string)).toBe(expected);
    });
  });

  describe("heading", () => {
    test("# textがh1要素として出力される", () => {
      const string = "# text";
      const expected = "<h1>text</h1>";
      expect(convertToHTMLString(string)).toBe(expected);
    });

    test("# textがh2要素として出力される", () => {
      const string = "## text";
      const expected = "<h2>text</h2>";
      expect(convertToHTMLString(string)).toBe(expected);
    });

    test("# textがh3要素として出力される", () => {
      const string = "### text";
      const expected = "<h3>text</h3>";
      expect(convertToHTMLString(string)).toBe(expected);
    });
    test("# textがh4要素として出力される", () => {
      const string = "#### text";
      const expected = "<h4>text</h4>";
      expect(convertToHTMLString(string)).toBe(expected);
    });

    test("# text1\n## text2が正しく出力される", () => {
      const string = "# text1\n## text2";
      const expected = "<h1>text1</h1><h2>text2</h2>";
      expect(convertToHTMLString(string)).toBe(expected);
    });
  });

  describe("list", () => {
    // list
    test(" - list1\n - list2\n - list3がlist要素として出力される", () => {
      const string = `
- list1
- list2
- list3
`;
      const expected = "<ul><li>list1</li><li>list2</li><li>list3</li></ul>";
      expect(convertToHTMLString(string)).toBe(expected);
    });
  });

  describe("", () => {
    test("複雑なマークダウンの時、正しくHTMLが生成される", () => {
      const string = `
normal text

- list1
- list2
- list3

normal
# heading

- **aaa**
- bbb
  `;
      const expected =
        "normal text<ul><li>list1</li><li>list2</li><li>list3</li></ul>normal<h1>heading</h1><ul><li><strong>aaa</strong></li><li>bbb</li></ul>";
      expect(convertToHTMLString(string)).toBe(expected);
    });
  });
});
