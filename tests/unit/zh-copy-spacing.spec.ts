import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

// JSX trims each line of a text block and joins the lines with one space, so a
// line break inside Chinese copy renders as a stray space ("的。 这是"); a space
// written after full-width punctuation shows up the same way. The site's
// convention keeps a space between Chinese and Latin letters or digits
// ("第 3 章"), after an expression such as O(1), around "——" and around math
// operators, and nowhere else. This scans every TSX file for the rest (the same
// rule as DataData's test/unit/zh-copy-spacing.test.ts).

const HAN = /[㐀-鿿豈-﫿]/u;
const FW = /[　-〿＀-￯]/u; // CJK and full-width punctuation
const ZH = /[㐀-鿿豈-﫿　-〿＀-￯]/u;
const PUNCT = /[、-〃〈-】〔-〟！-／：-？［-｀｛-･]/u;
const K = ts.SyntaxKind;

/** An ellipsis that closes Chinese text, not one inside a spaced math sequence. */
function closesChinese(raw: string, i: number) {
  let j = i;
  while (j > 0 && raw[j - 1] === "…") j--;
  return j > 0 && ZH.test(raw[j - 1]);
}

/** Whether the line break between raw[i] and the next text should not be a space. */
function breakIsStray(raw: string, i: number, a: string, b: string) {
  if (FW.test(a) && b !== "—") return true;
  if (a === "…" && closesChinese(raw, i) && b !== "—") return true;
  if (FW.test(b) && a !== "—") return true;
  if (HAN.test(a) && (HAN.test(b) || b === "(" || b === "“")) return true;
  if (/[,:;?!]/.test(a) && HAN.test(b)) return true;
  if (a === ")" && HAN.test(b)) {
    const open = raw.lastIndexOf("(", i);
    return open > 0 && ZH.test(raw[open - 1]);
  }
  return false;
}

/** What JSX renders for a text node. */
function rendered(raw: string) {
  if (!raw.includes("\n")) return raw;
  return raw
    .split("\n")
    .map((l, i, all) => (i === 0 ? l.trimEnd() : i === all.length - 1 ? l.trimStart() : l.trim()))
    .filter((l) => l.length)
    .join(" ");
}

function edge(node: ts.Node, sf: ts.SourceFile, last: boolean): string | null | undefined {
  if (node.kind === K.JsxText) {
    const t = rendered(node.getFullText(sf));
    return t.length ? t[last ? t.length - 1 : 0] : null;
  }
  if (ts.isJsxExpression(node)) {
    const e = node.expression;
    if (e && (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)))
      return e.text.length ? e.text[last ? e.text.length - 1 : 0] : null;
    return undefined;
  }
  if (ts.isJsxElement(node) || ts.isJsxFragment(node)) {
    const kids = node.children.filter((c) => !(c.kind === K.JsxText && rendered(c.getFullText(sf)) === ""));
    return kids.length ? edge(last ? kids[kids.length - 1] : kids[0], sf, last) : null;
  }
  return undefined;
}

function strays(file: string): string[] {
  const text = readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found: string[] = [];
  const at = (pos: number, what: string) =>
    found.push(`${file}:${sf.getLineAndCharacterOfPosition(pos).line + 1} ${what}`);

  const scanText = (start: number, raw: string) => {
    for (const m of raw.matchAll(/(\S)([ \t]*\n[ \t\n]*)(\S)/g)) {
      if (breakIsStray(raw, m.index!, m[1], m[3])) at(start + m.index!, `line break ${m[1]}⏎${m[3]}`);
    }
    for (const m of raw.matchAll(/(\S)( +)(\S)/g)) {
      const a = m[1];
      const b = m[3];
      const stray = (PUNCT.test(a) || (a === "…" && closesChinese(raw, m.index!))) && ZH.test(b) && b !== "—";
      if (stray) at(start + m.index!, `space ${a} ${b}`);
    }
  };

  const visit = (node: ts.Node) => {
    if (node.kind === K.JsxText) scanText(node.pos, node.getFullText(sf));
    else if (ts.isStringLiteral(node) && node.parent?.kind === K.JsxAttribute) scanText(node.getStart(sf), node.getText(sf));
    if (ts.isJsxElement(node) || ts.isJsxFragment(node)) {
      const kids = node.children.filter((c) => !(c.kind === K.JsxText && rendered(c.getFullText(sf)) === ""));
      kids.forEach((c, i) => {
        const prev = kids[i - 1];
        const next = kids[i + 1];
        if (!prev) return;
        const a = edge(prev, sf, true);
        if (!a || !PUNCT.test(a)) return;
        if (ts.isJsxExpression(c) && c.expression && ts.isStringLiteral(c.expression) && /^ +$/.test(c.expression.text) && next) {
          const b = edge(next, sf, false);
          if (b && ZH.test(b)) at(c.getStart(sf), `{" "} after ${a}`);
        }
        if (ts.isJsxElement(c) && c.children[0]?.kind === K.JsxText) {
          const m = /^( +)(\S)/.exec(c.children[0].getFullText(sf));
          if (m && ZH.test(m[2])) at(c.children[0].pos, `space opening <${c.openingElement.tagName.getText(sf)}> after ${a}`);
        }
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
}

function tsxFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? tsxFiles(join(dir, e.name)) : e.name.endsWith(".tsx") ? [join(dir, e.name)] : [],
  );
}

test("Chinese copy has no line break or space that renders as a stray space", () => {
  const files = [...tsxFiles("app"), ...tsxFiles("lib")];
  expect(files.length).toBeGreaterThan(30);
  expect(files.flatMap(strays)).toEqual([]);
});
