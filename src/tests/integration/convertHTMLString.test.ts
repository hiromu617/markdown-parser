import { convertToHTMLString } from "../..";
import { describe, expect, test } from "@jest/globals";

describe("convertToHTMLString", () => {
  describe("text", () => {
    test("textがp要素として出力される", () => {
      const string = "text";
      const expected = "<p>text</p>";
      expect(convertToHTMLString(string)).toBe(expected);
    });

    test("inline要素を含むtextが正しく出力される", () => {
      const string = "text**aaa**aaa";
      const expected = "<p>text<strong>aaa</strong>aaa</p>";
      expect(convertToHTMLString(string)).toBe(expected);
    });

    test("inline要素を含むtextが正しく出力される", () => {
      const string = "text**aaa**";
      const expected = "<p>text<strong>aaa</strong></p>";
      expect(convertToHTMLString(string)).toBe(expected);
    });

    test("複数行のtextがp要素として出力される", () => {
      const string = `
text1
text2
text3
`;
      const expected = "<p>text1<br/>text2<br/>text3</p>";
      expect(convertToHTMLString(string)).toBe(expected);
    });

    test("複数行のtextがp要素として出力される", () => {
      const string = `
text1
text2
text3

text4
`;
      const expected = "<p>text1<br/>text2<br/>text3</p><p>text4</p>";
      expect(convertToHTMLString(string)).toBe(expected);
    });

    test("textとheading要素が正しく出力される", () => {
      const string = `
text1
# heading
`;
      const expected = "<p>text1</p><h1>heading</h1>";
      expect(convertToHTMLString(string)).toBe(expected);
    });

    test("textとheading要素が正しく出力される", () => {
      const string = `
# heading
text1
`;
      const expected = "<h1>heading</h1><p>text1</p>";
      expect(convertToHTMLString(string)).toBe(expected);
    });

    test("textとlist要素が正しく出力される", () => {
      const string = `
text1
- list
`;
      const expected = "<p>text1</p><ul><li>list</li></ul>";
      expect(convertToHTMLString(string)).toBe(expected);
    });

    test("textとlist要素が正しく出力される", () => {
      const string = `
- list
text1
`;
      const expected = "<ul><li>list</li></ul><p>text1</p>";
      expect(convertToHTMLString(string)).toBe(expected);
    });
  });

  describe("strong", () => {
    // strong
    test("**text**がstrong要素として出力される", () => {
      const string = "**text**";
      const expected = "<p><strong>text</strong></p>";
      expect(convertToHTMLString(string)).toBe(expected);
    });
  });

  describe("italic", () => {
    test("__text__がi要素として出力される", () => {
      const string = "__text__";
      const expected = "<p><i>text</i></p>";
      expect(convertToHTMLString(string)).toBe(expected);
    });
    test("__aaa__bbb**ccc**が正しく出力される", () => {
      const string = "__aaa__bbb**ccc**";
      const expected = "<p><i>aaa</i>bbb<strong>ccc</strong></p>";
      expect(convertToHTMLString(string)).toBe(expected);
    });
    test("**aaa**bbb__ccc__が正しく出力される", () => {
      const string = "**aaa**bbb__ccc__";
      const expected = "<p><strong>aaa</strong>bbb<i>ccc</i></p>";
      expect(convertToHTMLString(string)).toBe(expected);
    });
    test("__aaa__bbb__ccc__が正しく出力される", () => {
      const string = "__aaa__bbb__ccc__";
      const expected = "<p><i>aaa</i>bbb<i>ccc</i></p>";
      expect(convertToHTMLString(string)).toBe(expected);
    });
  });

  describe("strike", () => {
    test("~~text~~がstrike要素として出力される", () => {
      const string = "~~text~~";
      const expected = "<p><strike>text</strike></p>";
      expect(convertToHTMLString(string)).toBe(expected);
    });
  });

  describe("codespan", () => {
    test("`code`がcode要素として出力される", () => {
      const string = "`code`";
      const expected = "<p><code>code</code></p>";
      expect(convertToHTMLString(string)).toBe(expected);
    });
  });

  describe("codeblock", () => {
    test("```\ncode\n```がcode要素として出力される", () => {
      const string = "```\ncode\n```";
      const expected = "<pre><code>code</code></pre>";
      expect(convertToHTMLString(string)).toBe(expected);
    });
    test("```\ncode\ncode2\n```がcode要素として出力される", () => {
      const string = "```\ncode\ncode2\n```";
      const expected = "<pre><code>code\ncode2</code></pre>";
      expect(convertToHTMLString(string)).toBe(expected);
    });

    test("aaa\n```\ncode\ncode2\n```がcode要素として出力される", () => {
      const string = "aaa\n```\ncode\ncode2\n```";
      const expected = "<p>aaa</p><pre><code>code\ncode2</code></pre>";
      expect(convertToHTMLString(string)).toBe(expected);
    });

    test("```\ncode\ncode2\n```\nbbbがcode要素として出力される", () => {
      const string = "```\ncode\ncode2\n```\nbbb";
      const expected = "<pre><code>code\ncode2</code></pre><p>bbb</p>";
      expect(convertToHTMLString(string)).toBe(expected);
    });
  });

  describe("anchor", () => {
    test("[text](url)がa要素として出力される", () => {
      const string = "[text](url)";
      const expected = `<p><a href="url">text</a></p>`;
      expect(convertToHTMLString(string)).toBe(expected);
    });
    test("[**text**](url)が正しく出力される", () => {
      const string = "[**text**](url)";
      const expected = `<p><a href="url"><strong>text</strong></a></p>`;
      expect(convertToHTMLString(string)).toBe(expected);
    });
    test("aaa[text](url)bbbがa要素として出力される", () => {
      const string = "aaa[text](url)bbb";
      const expected = `<p>aaa<a href="url">text</a>bbb</p>`;
      expect(convertToHTMLString(string)).toBe(expected);
    });
  });

  describe("img", () => {
    test("![alt](src)がimg要素として出力される", () => {
      const string = "![alt](src)";
      const expected = `<p><img alt="alt" src="src"/></p>`;
      expect(convertToHTMLString(string)).toBe(expected);
    });
    test("![alt](src)[text](url)が正しく出力される", () => {
      const string = "![alt](src)[text](url)";
      const expected = `<p><img alt="alt" src="src"/><a href="url">text</a></p>`;
      expect(convertToHTMLString(string)).toBe(expected);
    });
    test("[text](url)![alt](src)が正しく出力される", () => {
      const string = "[text](url)![alt](src)";
      const expected = `<p><a href="url">text</a><img alt="alt" src="src"/></p>`;
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
    test("- list1がlist要素として出力される", () => {
      const string = `
- list1
`;
      const expected = "<ul><li>list1</li></ul>";
      expect(convertToHTMLString(string)).toBe(expected);
    });
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

  describe("quote", () => {
    test("> aaaが正しく出力される", () => {
      const string = `> aaa`;
      const expected = "<blockquote>aaa</blockquote>";
      expect(convertToHTMLString(string)).toBe(expected);
    });

    test("> **aaa**が正しく出力される", () => {
      const string = `> **aaa**`;
      const expected = "<blockquote><strong>aaa</strong></blockquote>";
      expect(convertToHTMLString(string)).toBe(expected);
    });

    test("> aaa\n> bbb\n> cccが正しく出力される", () => {
      const string = `> aaa\n> bbb\n> ccc`;
      const expected = "<blockquote>aaabbbccc</blockquote>";
      expect(convertToHTMLString(string)).toBe(expected);
    });

    test("> aaa\n- bbbが正しく出力される", () => {
      const string = `> aaa\n- bbb`;
      const expected = "<blockquote>aaa</blockquote><ul><li>bbb</li></ul>";
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
        "<p>normal text</p><ul><li>list1</li><li>list2</li><li>list3</li></ul><p>normal</p><h1>heading</h1><ul><li><strong>aaa</strong></li><li>bbb</li></ul>";
      expect(convertToHTMLString(string)).toBe(expected);
    });
  });
});
