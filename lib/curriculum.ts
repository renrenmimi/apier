// 课程注册表 —— 全站唯一的章节清单。
// 侧栏、命令面板、章节页脚(上一章/下一章)、进度系统都从这里取数据。
// 新增章节:在 CHAPTERS 里插入一条,并保证 app/<id>/page.tsx 存在,
// 且 globals.css 的 [data-ch=…] 色相注册表里有对应条目。

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
  title: string;
  /** 英文副标 —— hero 眉题与侧栏小字 */
  en: string;
  /** 一句话本质 */
  essence: string;
  /** oklch 色相角,决定整章主题色(与 globals.css 注册表一致) */
  hue: number;
  /** 阵营:序章与地基 core / REST 蓝方 / GraphQL 粉方 / 终章对决 */
  camp: "core" | "rest" | "graphql" | "verdict";
  /** 难度 1–5 */
  level: 1 | 2 | 3 | 4 | 5;
  /** 命令面板搜索关键词 */
  tags: string[];
}

export const CHAPTERS: Chapter[] = [
  {
    id: "home",
    href: "/",
    num: "00",
    title: "序章 · API 是什么",
    en: "What Is an API",
    essence: "你写的每一个网页,背后都有一场「点菜与上菜」。",
    hue: 210,
    camp: "core",
    level: 1,
    tags: ["API", "客户端", "服务器", "JSON", "client", "server"],
  },
  {
    id: "http",
    href: "/http",
    num: "01",
    title: "HTTP:API 的母语",
    en: "HTTP Fundamentals",
    essence: "URL、方法、状态码、Header —— 一封写给服务器的信,每个部分都有讲究。",
    hue: 250,
    camp: "core",
    level: 1,
    tags: ["HTTP", "GET", "POST", "状态码", "status code", "header", "URL"],
  },
  {
    id: "first-call",
    href: "/first-call",
    num: "02",
    title: "第一次调用 API",
    en: "fetch() in Action",
    essence: "十行 JavaScript,把真实世界的数据拿到你的网页里。",
    hue: 150,
    camp: "core",
    level: 1,
    tags: ["fetch", "async", "await", "JSON", "Promise", "DevTools"],
  },
  {
    id: "rest",
    href: "/rest",
    num: "03",
    title: "REST 的思想",
    en: "REST as an Architecture",
    essence: "REST 不是技术,是一套让 Web 能长到今天这么大的约法六章。",
    hue: 196,
    camp: "rest",
    level: 2,
    tags: ["REST", "资源", "resource", "无状态", "stateless", "Fielding", "HATEOAS"],
  },
  {
    id: "rest-design",
    href: "/rest-design",
    num: "04",
    title: "RESTful 设计实战",
    en: "RESTful API Design",
    essence: "从零设计一套博客 API:URL 怎么起名,状态码怎么选,错误怎么报。",
    hue: 230,
    camp: "rest",
    level: 2,
    tags: ["URL 设计", "CRUD", "endpoint", "404", "RFC 9457", "错误处理"],
  },
  {
    id: "rest-advanced",
    href: "/rest-advanced",
    num: "05",
    title: "REST 进阶模式",
    en: "Pagination, Caching & More",
    essence: "分页、过滤、版本、缓存、幂等 —— 真实 API 与玩具 API 的分水岭。",
    hue: 280,
    camp: "rest",
    level: 3,
    tags: ["分页", "pagination", "cursor", "ETag", "缓存", "版本", "OpenAPI", "幂等"],
  },
  {
    id: "auth",
    href: "/auth",
    num: "06",
    title: "认证与安全",
    en: "API Keys, JWT & OAuth",
    essence: "服务器凭什么相信「你是你」?从 API Key 到 OAuth 的信任阶梯。",
    hue: 350,
    camp: "rest",
    level: 3,
    tags: ["JWT", "OAuth", "API Key", "CORS", "认证", "token", "安全"],
  },
  {
    id: "graphql",
    href: "/graphql",
    num: "07",
    title: "GraphQL 初见",
    en: "Why GraphQL Exists",
    essence: "要什么、给什么、不多不少 —— 一种向服务器「点菜」的新语法。",
    hue: 330,
    camp: "graphql",
    level: 2,
    tags: ["GraphQL", "over-fetching", "under-fetching", "query", "端点", "endpoint"],
  },
  {
    id: "schema",
    href: "/schema",
    num: "08",
    title: "Schema 与类型系统",
    en: "SDL & Types",
    essence: "一纸契约写清楚:服务器有什么数据,长什么样,谁也别猜。",
    hue: 300,
    camp: "graphql",
    level: 3,
    tags: ["SDL", "type", "scalar", "interface", "union", "enum", "schema", "introspection"],
  },
  {
    id: "operations",
    href: "/operations",
    num: "09",
    title: "查询、变更与订阅",
    en: "The Three Operations",
    essence: "读、写、听 —— GraphQL 只有三种动作,却能表达一切交互。",
    hue: 262,
    camp: "graphql",
    level: 3,
    tags: ["query", "mutation", "subscription", "变量", "fragment", "指令", "分页"],
  },
  {
    id: "backstage",
    href: "/backstage",
    num: "10",
    title: "GraphQL 后台与性能",
    en: "Resolvers, N+1 & Caching",
    essence: "拉开幕布:每个字段背后都有一个函数在跑,跑不好就是 N+1。",
    hue: 22,
    camp: "graphql",
    level: 4,
    tags: ["resolver", "N+1", "DataLoader", "缓存", "性能", "深度限制"],
  },
  {
    id: "showdown",
    href: "/showdown",
    num: "✦",
    title: "终章 · 对决与选型",
    en: "REST vs GraphQL",
    essence: "没有银弹,只有取舍 —— 看完这一章,你能替团队做这个决定。",
    hue: 55,
    camp: "verdict",
    level: 4,
    tags: ["选型", "对比", "REST vs GraphQL", "GitHub", "Shopify", "决策"],
  },
];

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
