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
    })
  })

  describe("list", () => {
    // list
    test(" - list1\n - list2\n - list3がlist要素として出力される", () => {
      const string = `
- list1
- list2
- list3
`
      const expected = "<ul><li>list1</li><li>list2</li><li>list3</li></ul>";
      expect(convertToHTMLString(string)).toBe(expected);
    });
  });

  test("複雑なマークダウンの時、正しくHTMLが生成される", () => {
    const string = `
normal text

- list1
- list2
- list3

normal

- **aaa**
- bbb
`;
    const expected =
      "normal text<ul><li>list1</li><li>list2</li><li>list3</li></ul>normal<ul><li><strong>aaa</strong></li><li>bbb</li></ul>";
    expect(convertToHTMLString(string)).toBe(expected);
  });
});
