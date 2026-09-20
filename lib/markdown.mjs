import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { toString } from "mdast-util-to-string";

export function markdownPreview(markdown, length = 20) {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown || "");
  const text = tree.children.filter(node => node.type !== "html" && node.type !== "definition")
    .map(node => toString(node, { includeHtml: false })).join(" ").replace(/\s+/g, " ").trim();
  const characters = Array.from(new Intl.Segmenter("ja", { granularity: "grapheme" }).segment(text), part => part.segment);
  return characters.slice(0, length).join("") + (characters.length > length ? "…" : "");
}
