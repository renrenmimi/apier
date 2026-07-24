// 轻量语法高亮器 —— 零依赖,支持 js / json / graphql / bash / http 五种语言。
// 思路:一个主正则扫全文(注释 | 字符串 | 数字 | 标识符 | 运算符),
// 标识符再按「关键字 / 大写开头类型 / 后面跟 ( 的函数」分类;
// http 是行结构(起始行 / Header / 空行 / 正文),单独按行解析;
// 最后统一切成「行 × token」二维数组,供 CodeBlock 渲染行号与高亮行。

export type CodeLangId = "js" | "json" | "graphql" | "bash" | "http";

export type TokType =
  | "kw" // 关键字
  | "str" // 字符串
  | "num" // 数字
  | "com" // 注释
  | "fn" // 函数调用
  | "type" // 类型名(大写开头)
  | "op" // 运算符
  | "var" // GraphQL 变量($id)/ bash 变量
  | "dir" // GraphQL 指令(@include)
  | "meth" // HTTP 方法 / curl 子命令
  | "hdr" // HTTP header 名
  | "";

export interface Tok {
  t: TokType;
  s: string;
}

const KW: Partial<Record<CodeLangId, Set<string>>> = {
  js: new Set(
    "const let var function return if else for while do switch case break continue new class extends this null undefined true false import from export default try catch finally throw typeof instanceof of in async await yield delete void static get set".split(
      " ",
    ),
  ),
  json: new Set("true false null".split(" ")),
  graphql: new Set(
    "query mutation subscription fragment on type input enum interface union schema scalar directive implements extend true false null".split(
      " ",
    ),
  ),
  bash: new Set("curl echo export if then else fi for do done".split(" ")),
};

const RE: Partial<Record<CodeLangId, RegExp>> = {
  js: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:[^`\\]|\\.)*`|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(\b0x[\da-fA-F_]+\b|\b\d[\d_]*(?:\.[\d_]+)?\b)|([A-Za-z_$][\w$]*)|([+\-*/%=<>!&|^~?:]+)/g,
  json: /()("(?:[^"\\\n]|\\.)*")|(-?\b\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?\d+)?\b)|([A-Za-z_][\w]*)|([{}[\]:,])/g,
  graphql:
    /(#[^\n]*)|("""[\s\S]*?"""|"(?:[^"\\\n]|\\.)*")|(-?\b\d[\d_]*(?:\.[\d_]+)?\b)|([$@]?[A-Za-z_][\w]*)|([!(){}\[\]:=|&…,]+)/g,
  bash: /(#[^\n]*)|("(?:[^"\\]|\\.)*"|'[^']*')|(\b\d[\d.]*\b)|(--?[A-Za-z][\w-]*|[$][A-Za-z_]\w*|[A-Za-z_][\w./:-]*)|([|><&\\;=]+)/g,
};

/** 标识符后是否紧跟 "("(允许空格)→ 视作函数名 */
function isCall(code: string, end: number): boolean {
  let i = end;
  while (i < code.length && code[i] === " ") i++;
  return code[i] === "(";
}

const HTTP_METHODS = new Set([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
]);

/** HTTP 报文:按行分类 —— 起始行(方法/状态)、Header 行、JSON 正文行 */
function highlightHttp(code: string): Tok[][] {
  const lines = code.split("\n");
  let inBody = false;
  return lines.map((line): Tok[] => {
    if (!inBody && line.trim() === "") {
      inBody = true;
      return [];
    }
    if (inBody) {
      // 正文大多是 JSON,借用 json 高亮
      return highlightGeneric(line, "json")[0] ?? [];
    }
    // 请求起始行:GET /users/42 HTTP/1.1
    const m = line.match(/^([A-Z]+)( +)(\S+)( +HTTP\/[\d.]+)?$/);
    if (m && HTTP_METHODS.has(m[1])) {
      const toks: Tok[] = [
        { t: "meth", s: m[1] },
        { t: "", s: m[2] },
        { t: "str", s: m[3] },
      ];
      if (m[4]) toks.push({ t: "com", s: m[4] });
      return toks;
    }
    // 响应起始行:HTTP/1.1 200 OK
    const s = line.match(/^(HTTP\/[\d.]+)( +)(\d{3})( .*)?$/);
    if (s) {
      const toks: Tok[] = [
        { t: "com", s: s[1] },
        { t: "", s: s[2] },
        { t: "num", s: s[3] },
      ];
      if (s[4]) toks.push({ t: "kw", s: s[4] });
      return toks;
    }
    // Header 行:Content-Type: application/json
    const h = line.match(/^([A-Za-z-]+)(: ?)(.*)$/);
    if (h) {
      return [
        { t: "hdr", s: h[1] },
        { t: "op", s: h[2] },
        { t: "str", s: h[3] },
      ];
    }
    return [{ t: "", s: line }];
  });
}

function classifyIdent(
  lang: CodeLangId,
  ident: string,
  code: string,
  end: number,
): Tok {
  if (lang === "graphql") {
    if (ident.startsWith("$")) return { t: "var", s: ident };
    if (ident.startsWith("@")) return { t: "dir", s: ident };
    if (KW[lang]?.has(ident)) return { t: "kw", s: ident };
    if (/^[A-Z]/.test(ident)) return { t: "type", s: ident };
    if (isCall(code, end)) return { t: "fn", s: ident };
    return { t: "", s: ident };
  }
  if (lang === "bash") {
    if (ident.startsWith("-")) return { t: "dir", s: ident };
    if (ident.startsWith("$")) return { t: "var", s: ident };
    if (KW[lang]?.has(ident)) return { t: "kw", s: ident };
    if (HTTP_METHODS.has(ident)) return { t: "meth", s: ident };
    return { t: "", s: ident };
  }
  if (KW[lang]?.has(ident)) return { t: "kw", s: ident };
  if (/^[A-Z]/.test(ident)) return { t: "type", s: ident };
  if (isCall(code, end)) return { t: "fn", s: ident };
  return { t: "", s: ident };
}

function highlightGeneric(code: string, lang: CodeLangId): Tok[][] {
  const re = new RegExp(RE[lang]!.source, "g");
  const toks: Tok[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(code))) {
    if (m.index > last) toks.push({ t: "", s: code.slice(last, m.index) });
    const [full, com, str, num, ident, op] = m;
    if (com) toks.push({ t: "com", s: com });
    else if (str) toks.push({ t: "str", s: str });
    else if (num) toks.push({ t: "num", s: num });
    else if (ident)
      toks.push(classifyIdent(lang, ident, code, m.index + ident.length));
    else if (op) toks.push({ t: "op", s: op });
    else toks.push({ t: "", s: full });
    last = m.index + full.length;
  }
  if (last < code.length) toks.push({ t: "", s: code.slice(last) });

  // 按换行切行(token 内部可能含 \n,比如多行注释/模板字符串)
  const lines: Tok[][] = [[]];
  for (const tok of toks) {
    const parts = tok.s.split("\n");
    parts.forEach((p, i) => {
      if (i > 0) lines.push([]);
      if (p) lines[lines.length - 1].push({ t: tok.t, s: p });
    });
  }
  return lines;
}

/** 把整段代码高亮成「行 × token」二维数组 */
export function highlight(code: string, lang: CodeLangId): Tok[][] {
  if (lang === "http") return highlightHttp(code);
  return highlightGeneric(code, lang);
}
