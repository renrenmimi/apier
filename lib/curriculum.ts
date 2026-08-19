// 课程注册表 —— 全站唯一的章节清单。
// 侧栏、命令面板、章节页脚(上一章/下一章)、进度系统都从这里取数据。
// 新增章节:在 CHAPTERS 里插入一条,并保证 app/<id>/page.tsx 存在,
// 且 globals.css 的 [data-ch=…] 色相注册表里有对应条目。
//
// 文案字段(title / en / essence / tags)是 Loc<…> 双语对;
// 这是一个纯数据模块(没有 "use client"),由消费方用 useL() 解析语言。

import type { Loc } from "@/lib/i18n";

export type ChapterId =
  | "home"
  | "http"
  | "first-call"
  | "rest"
  | "rest-design"
  | "rest-advanced"
  | "auth"
  | "graphql"
  | "schema"
  | "operations"
  | "backstage"
  | "showdown";

export interface Chapter {
  id: ChapterId;
  href: string;
  /** 章节编号展示:00–10,终章用 ✦ */
  num: string;
  title: Loc<string>;
  /** 副标 —— hero 眉题与侧栏小字(中文界面下显示英文名,英文界面下显示内容提要) */
  en: Loc<string>;
  /** 一句话本质 */
  essence: Loc<string>;
  /** oklch 色相角,决定整章主题色(与 globals.css 注册表一致) */
  hue: number;
  /** 阵营:序章与地基 core / REST 蓝方 / GraphQL 粉方 / 终章对决 */
  camp: "core" | "rest" | "graphql" | "verdict";
  /** 难度 1–5 */
  level: 1 | 2 | 3 | 4 | 5;
  /** 命令面板搜索关键词 */
  tags: Loc<string[]>;
}

export const CHAPTERS: Chapter[] = [
  {
    id: "home",
    href: "/",
    num: "00",
    title: { en: "Prologue: what an API is", zh: "序章 · API 是什么" },
    en: { en: "Client, server, JSON", zh: "What Is an API" },
    essence: {
      en: "Your web page cannot read another company's database directly. It asks an API, and the API answers.",
      zh: "你写的每一个网页,背后都有一场「点菜与上菜」。",
    },
    hue: 210,
    camp: "core",
    level: 1,
    tags: {
      en: ["API", "client", "server", "JSON", "request", "response"],
      zh: ["API", "客户端", "服务器", "JSON", "client", "server"],
    },
  },
  {
    id: "http",
    href: "/http",
    num: "01",
    title: { en: "HTTP fundamentals", zh: "HTTP:API 的母语" },
    en: { en: "Methods, status codes, headers", zh: "HTTP Fundamentals" },
    essence: {
      en: "A URL, a method, a status code, and a set of headers. Every request and response is built from these parts.",
      zh: "URL、方法、状态码、Header —— 一封写给服务器的信,每个部分都有讲究。",
    },
    hue: 250,
    camp: "core",
    level: 1,
    tags: {
      en: ["HTTP", "GET", "POST", "status code", "header", "URL", "idempotent"],
      zh: ["HTTP", "GET", "POST", "状态码", "status code", "header", "URL"],
    },
  },
  {
    id: "first-call",
    href: "/first-call",
    num: "02",
    title: { en: "Your first API call", zh: "第一次调用 API" },
    en: { en: "fetch, async/await, DevTools", zh: "fetch() in Action" },
    essence: {
      en: "Ten lines of JavaScript bring real data from a public server into your page.",
      zh: "十行 JavaScript,把真实世界的数据拿到你的网页里。",
    },
    hue: 150,
    camp: "core",
    level: 1,
    tags: {
      en: ["fetch", "async", "await", "JSON", "Promise", "DevTools"],
      zh: ["fetch", "async", "await", "JSON", "Promise", "DevTools"],
    },
  },
  {
    id: "rest",
    href: "/rest",
    num: "03",
    title: { en: "The ideas behind REST", zh: "REST 的思想" },
    en: { en: "Six constraints, resources", zh: "REST as an Architecture" },
    essence: {
      en: "REST is not a technology. It is a set of six constraints that let the web grow to its current size.",
      zh: "REST 不是技术,是一套让 Web 能长到今天这么大的约法六章。",
    },
    hue: 196,
    camp: "rest",
    level: 2,
    tags: {
      en: ["REST", "resource", "stateless", "Fielding", "HATEOAS", "cacheable"],
      zh: ["REST", "资源", "resource", "无状态", "stateless", "Fielding", "HATEOAS"],
    },
  },
  {
    id: "rest-design",
    href: "/rest-design",
    num: "04",
    title: { en: "RESTful API design", zh: "RESTful 设计实战" },
    en: { en: "URLs, CRUD, error format", zh: "RESTful API Design" },
    essence: {
      en: "Design a blog API from scratch: how to name URLs, which status code to return, and how to report errors.",
      zh: "从零设计一套博客 API:URL 怎么起名,状态码怎么选,错误怎么报。",
    },
    hue: 230,
    camp: "rest",
    level: 2,
    tags: {
      en: ["URL design", "CRUD", "endpoint", "404", "RFC 9457", "error handling"],
      zh: ["URL 设计", "CRUD", "endpoint", "404", "RFC 9457", "错误处理"],
    },
  },
  {
    id: "rest-advanced",
    href: "/rest-advanced",
    num: "05",
    title: { en: "REST in production", zh: "REST 进阶模式" },
    en: { en: "Pagination, caching, versioning", zh: "Pagination, Caching & More" },
    essence: {
      en: "Pagination, filtering, versioning, caching, and idempotency separate a real API from a toy one.",
      zh: "分页、过滤、版本、缓存、幂等 —— 真实 API 与玩具 API 的分水岭。",
    },
    hue: 280,
    camp: "rest",
    level: 3,
    tags: {
      en: ["pagination", "cursor", "ETag", "cache", "versioning", "OpenAPI", "idempotency"],
      zh: ["分页", "pagination", "cursor", "ETag", "缓存", "版本", "OpenAPI", "幂等"],
    },
  },
  {
    id: "auth",
    href: "/auth",
    num: "06",
    title: { en: "Authentication and security", zh: "认证与安全" },
    en: { en: "API keys, JWT, OAuth 2.0, CORS", zh: "API Keys, JWT & OAuth" },
    essence: {
      en: "Two separate questions: who are you, and what are you allowed to do?",
      zh: "服务器凭什么相信「你是你」?从 API Key 到 OAuth 的信任阶梯。",
    },
    hue: 350,
    camp: "rest",
    level: 3,
    tags: {
      en: ["JWT", "OAuth", "API key", "CORS", "authentication", "authorization", "token", "HTTPS"],
      zh: ["JWT", "OAuth", "API Key", "CORS", "认证", "授权", "token", "安全"],
    },
  },
  {
    id: "graphql",
    href: "/graphql",
    num: "07",
    title: { en: "Meeting GraphQL", zh: "GraphQL 初见" },
    en: { en: "One endpoint, one query language", zh: "Why GraphQL Exists" },
    essence: {
      en: "The client states exactly which fields it needs, and the server returns those fields and nothing more.",
      zh: "要什么、给什么、不多不少 —— 一种向服务器「点菜」的新语法。",
    },
    hue: 330,
    camp: "graphql",
    level: 2,
    tags: {
      en: ["GraphQL", "over-fetching", "under-fetching", "query", "endpoint", "GraphiQL"],
      zh: ["GraphQL", "over-fetching", "under-fetching", "query", "端点", "endpoint"],
    },
  },
  {
    id: "schema",
    href: "/schema",
    num: "08",
    title: { en: "Schema and type system", zh: "Schema 与类型系统" },
    en: { en: "SDL, scalars, interfaces, unions", zh: "SDL & Types" },
    essence: {
      en: "The schema is a written contract: what data the server has, and what shape that data comes in.",
      zh: "一纸契约写清楚:服务器有什么数据,长什么样,谁也别猜。",
    },
    hue: 300,
    camp: "graphql",
    level: 3,
    tags: {
      en: ["SDL", "type", "scalar", "interface", "union", "enum", "schema", "introspection"],
      zh: ["SDL", "type", "scalar", "interface", "union", "enum", "schema", "introspection"],
    },
  },
  {
    id: "operations",
    href: "/operations",
    num: "09",
    title: { en: "The three operations", zh: "查询、变更与订阅" },
    en: { en: "Query, mutation, subscription", zh: "The Three Operations" },
    essence: {
      en: "Read, write, and subscribe. GraphQL has only three operation types, and together they cover every interaction.",
      zh: "读、写、听 —— GraphQL 只有三种动作,却能表达一切交互。",
    },
    hue: 262,
    camp: "graphql",
    level: 3,
    tags: {
      en: ["query", "mutation", "subscription", "variables", "fragment", "directive", "pagination"],
      zh: ["query", "mutation", "subscription", "变量", "fragment", "指令", "分页"],
    },
  },
  {
    id: "backstage",
    href: "/backstage",
    num: "10",
    title: { en: "Servers and performance", zh: "GraphQL 后台与性能" },
    en: { en: "Resolvers, N+1, DataLoader", zh: "Resolvers, N+1 & Caching" },
    essence: {
      en: "Every field in a query is produced by a function on the server. Written carelessly, those functions cause the N+1 problem.",
      zh: "拉开幕布:每个字段背后都有一个函数在跑,跑不好就是 N+1。",
    },
    hue: 22,
    camp: "graphql",
    level: 4,
    tags: {
      en: ["resolver", "N+1", "DataLoader", "cache", "performance", "depth limit"],
      zh: ["resolver", "N+1", "DataLoader", "缓存", "性能", "深度限制"],
    },
  },
  {
    id: "showdown",
    href: "/showdown",
    num: "✦",
    title: { en: "Finale: REST vs GraphQL", zh: "终章 · 对决与选型" },
    en: { en: "Comparison and decision guide", zh: "REST vs GraphQL" },
    essence: {
      en: "There is no single best choice, only trade-offs. This chapter helps you make the decision for your team.",
      zh: "没有银弹,只有取舍 —— 看完这一章,你能替团队做这个决定。",
    },
    hue: 55,
    camp: "verdict",
    level: 4,
    tags: {
      en: ["comparison", "REST vs GraphQL", "GitHub", "Shopify", "decision", "trade-offs"],
      zh: ["选型", "对比", "REST vs GraphQL", "GitHub", "Shopify", "决策"],
    },
  },
];

/** 把一个 Loc 值的所有语言展开 —— 命令面板按两种语言一起搜。 */
function bothLangs<V>(v: Loc<V>): V[] {
  return v && typeof v === "object" && !Array.isArray(v) && "en" in v && "zh" in v
    ? [(v as { en: V; zh: V }).en, (v as { en: V; zh: V }).zh]
    : [v as V];
}

/** 命令面板搜索用:一章的全部文本(两种语言)拼成一个小写串。 */
export function searchText(c: Chapter): string {
  return [
    ...bothLangs(c.title),
    ...bothLangs(c.en),
    c.num,
    ...bothLangs(c.tags).flat(),
  ]
    .join(" ")
    .toLowerCase();
}

export function chapterByPath(path: string): Chapter {
  if (path === "/") return CHAPTERS[0];
  const hit = CHAPTERS.find(
    (c) => c.href !== "/" && (path === c.href || path.startsWith(c.href + "/")),
  );
  return hit ?? CHAPTERS[0];
}

export function prevNext(id: ChapterId): { prev?: Chapter; next?: Chapter } {
  const i = CHAPTERS.findIndex((c) => c.id === id);
  return {
    prev: i > 0 ? CHAPTERS[i - 1] : undefined,
    next: i >= 0 && i < CHAPTERS.length - 1 ? CHAPTERS[i + 1] : undefined,
  };
}
