# CLAUDE.md — APIer · 把 API 讲透

新会话先读完这份文件再动手。

## 这是什么

**APIer(把 API 讲透)**:面向零基础学习者的交互式 API 课程网站,
**DataData / AlgoAlgo(../DataData、../AooRithm)的姊妹篇**,
同一套外壳与设计语言。承诺:**学完这一套课,RESTful API 和 GraphQL 就真的会了 ——
不是「听说过」,是能上手调、能自己设计、能替团队做选型。**

目标受众下限:**刚学会 HTML/CSS/JavaScript、从没调过 API 的新手**。因此:
- 每个结论必须给「为什么」,不许只给结论;
- 比喻先行,再上术语;术语第一次出现时中文+英文双写(如「端点(endpoint)」);
- 假设读者不知道什么是「服务器」「请求」——序章从零讲起;
- 代码示例一律 JavaScript(fetch / async-await),这是读者唯一会的语言。

**语言:全站双语(英文默认 / 中文可切)**,底座在 `lib/i18n.tsx`:
`Loc<T>` = `T | { en, zh }`,`useL()` 解析 props,`<T en zh />` 在 JSX 里内联切换。
面向读者的文字一律成对写(含测验纠错、动画旁白、检查器预设说明)。
代码注释与提交信息用中文;报文、SDL、命令等「线上跑的字节」两种语言完全一致。

## 文案风格(重要,全站贯穿)

**基调:教科书 / 技术文档式的清晰陈述。通俗 ≠ 口语化。**
面向零基础讲得明白是目标,但语气必须专业、正式、简洁。

- **禁止**:网络用语与流行梗(「香」「翻车」「离谱」「拉满」「能打」「一把梭」
  「性能刺客」「退坑」「甩锅」「正确姿势」「上车」「补一刀」)、
  卖萌语气词(「啦」「呀」「嘛」「~」)、插科打诨式自问自答(「你猜怎么着」
  「好问题」「说白了」「其实吧」)、拿读者开玩笑(「你会哭」「用户怕是要报警」)、
  过度戏剧化的比喻(「成人礼」「验尸」「补刀」);
- **同样禁止** AI 腔:「值得注意的是」「综上所述」「让我们深入探讨」「赋能」;
- **保留并鼓励**:面向零基础的通俗解释、恰当的生活类比
  (餐厅点菜、寄信、取餐码…)—— 类比本身是好东西,问题只出在表达轻佻;
- 每章开头用一个生活比喻立住直觉,后文反复回扣;比喻要讲得平实。
- 术语第一次出现时中文+英文双写(如「端点(endpoint)」),之后可只用惯用形;
- 别怕句子短。短句有力 —— 但短句要是陈述句,不是段子。

## 课程结构(12 页,由易到难)

`lib/curriculum.ts` 是唯一的章节注册表(路由/编号/标题/色相/阵营/标签)。

- **地基三章(core,蓝青色系)**:序章(/)API 是什么 → 01 /http HTTP 母语
  (方法/状态码/Header/报文)→ 02 /first-call 第一次调用(fetch/async/DevTools)
- **REST 四章(rest,蓝方)**:03 /rest REST 思想(六大约束/资源观/成熟度模型)→
  04 /rest-design 设计实战(URL 命名/CRUD 映射/错误格式,贯穿「博客 API」案例)→
  05 /rest-advanced 进阶(分页/过滤/版本/缓存/幂等/OpenAPI)→
  06 /auth 认证与安全(API Key/JWT/OAuth/CORS,REST 与 GraphQL 通用,承上启下)
- **GraphQL 四章(graphql,粉紫方)**:07 /graphql 初见(over/under-fetching 的痛 →
  一个端点一种查询语言)→ 08 /schema 类型系统(SDL/标量/接口/联合/introspection)→
  09 /operations 三种操作(Query/Mutation/Subscription/变量/片段/分页)→
  10 /backstage 后台与性能(resolver/N+1/DataLoader/缓存/安全)
- **终章(verdict,金色)**:✦ /showdown 对决与选型(全维度对比/决策树/
  真实公司案例/混合架构/总测验)

叙事主线:REST 是蓝方,GraphQL 是粉方,终章对决 —— 但结论是「没有银弹,只有取舍」。
贯穿案例:一套「博客 / 社交动态」数据(用户-文章-评论),REST 章用它设计端点,
GraphQL 章用同一套数据写 schema,终章用它做对比 —— 全书一个世界观。

## 技术栈与命令

- Next.js 15(App Router)+ React 19 + TypeScript,**纯 CSS 无 Tailwind**。
- **本机默认 Node 16 跑不动**,一切命令加:
  `export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"`
- 构建验证:`npm run build`;并行写章节时**不要各自跑 build**(.next 冲突),
  用 `npx tsc --noEmit --incremental false` 做类型检查。
- 预览:`.claude/launch.json` 已配置(autoPort,基准端口 3300)。

## 文件布局与所有权

```
app/globals.css        全站设计系统(含 13 节 APIer 原语)—— 章节作者【禁止改】
app/layout.tsx         外壳(sidebar/toolbar/cmdk/aurora)—— 禁止改
lib/kit.tsx lib/code.tsx lib/quiz.tsx lib/labs.tsx lib/stepper.tsx
lib/highlight.tsx lib/progress.tsx lib/curriculum.ts lib/i18n.tsx
lib/inspector.tsx                                      共享库 —— 禁止改
lib/mock/db.ts lib/mock/http.ts lib/mock/graphql.ts    本地 Mock API 内核
app/api/**/route.ts                                    Mock API 路由
app/<ch>/page.tsx      章节主页面("use client",数据+组合)
app/<ch>/viz.tsx       本章专属可视化组件
app/<ch>/chapter.css   本章专属样式(page.tsx 里【必须】import "./chapter.css",
                       漏了会导致整章样式静默失效 —— DataData 踩过的坑;
                       所有类名带本章前缀,如 http 章用 ht-,防止跨章冲突)
lib/<ch>-data.tsx      本章动手任务 LABS + 测验 QUIZ 数据
```

每章配色由 `<main className="page" data-ch="<章节id>">` 自动生效
(色相注册在 globals.css 的 `[data-ch=…]` 段,已全部就位,勿动)。

## 数据文件约定

- `lib/<ch>-data.tsx` 直接导出常量:`export const LABS: Lab[] = […]`、
  `export const QUIZ: QuizItem[] = […]`(顶部 `"use client";`,可 import CodeBlock)。
- 术语不翻译:API、REST、GraphQL、endpoint、query 这些保持英文;
  中文正文里第一次出现时「中文(English)」双写。

## 组件契约(共享库 API,按此使用)

### lib/kit.tsx
- `<Hero ch="http" title={<>…<span className="grad">…</span></>} essence={…} chips={[{id,n,label},…]} />`
- `<Section id="anatomy" index="03" title desc badge>{children}</Section>`(自带滚动淡入)
- `<Callout tone="idea|warn|deep|story|win" title>{<p>…</p>}</Callout>`
- `<Method m="GET" />` HTTP 方法徽章;`<Status code={404} text="Not Found" />` 状态码徽章
- `<KeyPoints points={[…]} />`、`<ChapterFooter ch="http" />`、`<Reveal delay={120}>`

### lib/code.tsx + lib/highlight.tsx
- `<CodeBlock lang="js|json|graphql|bash|http" code={string} title? hl?={[行号]} note?={ReactNode} />`
  http 语言能高亮请求/响应报文(起始行/Header/JSON 正文)。
- `<CodePair left={<CodeBlock…/>} right={<CodeBlock…/>} />` 双窗对照(REST vs GraphQL 招牌排版)。

### lib/stepper.tsx(逐帧慢放)
- `useStepper(total)` + `<StepControls stepper={s} step={s.step} total={n} />`
- `<FlowStepper title frames={[{stage: ReactNode, msg: ReactNode},…]} />`
  舞台里用 globals.css 的 `.flow / .flow-node(.lit)/ .flow-mid / .flow-line / .flow-packet(.back)`。
- 自由形态动画自建组件,复用 `.viz/.viz-stage/.viz-msg/.viz-ctl` 样式。

### lib/quiz.tsx
- `<Quiz ch="http" items={QuizItem[]} />`;题型 choice/multi/fill(结构同 DataData)。
  **禁止通用文案**(「答案不正确」不合格),每个错误选项要有针对性纠错。

### lib/labs.tsx(动手任务,代替 LeetCode 题单)
- `<LabSet ch="http" items={Lab[]} />`
- `Lab = { id(稳定别改), title, d:"easy|medium|hard", tags, task(去哪做/做什么), hint, solution }`
- 任务要真的可做:浏览器 Console 里 fetch 公开 API、在线 GraphQL playground 等。
  推荐练手 API(免注册,2026-07 实测):JSONPlaceholder、PokeAPI、DummyJSON、
  Open-Meteo、Rick and Morty(REST+GraphQL 双供)、Countries GraphQL(countries.trevorblades.com)。

### lib/progress.tsx
- 全站进度 context:`toggleLab(pid)`、`reportQuiz(ch, right, total)`、
  `chapterState(ch)`。localStorage 键统一 `apier-*` 前缀。

## 本地 Mock API 与请求检查器(课程的实验台)

**目的:让每个 HTTP 概念都能亲手验证,不依赖第三方服务、永远不撞 CORS、断网可用。**

- 数据:全书贯穿的「博客」世界(User/Post/Comment),`lib/mock/db.ts` 固定种子生成,
  50 篇文章 / 10 个用户,内存存储,写操作真的生效;`POST /api/reset` 一键还原。
- `GET /api` 是自文档索引 —— 列出所有端点、认证方式和教学开关。
- REST 端点兑现了课程教的全部语义:201+Location、204、PUT 整体替换(字段会真的消失)、
  PATCH 合并、ETag/If-None-Match→304、Idempotency-Key 去重、429+Retry-After、
  401(带 WWW-Authenticate)/403、RFC 9457 problem+json、Link 分页头。
- `POST /api/graphql` 是零依赖手写执行器(`lib/mock/graphql.ts`),与 REST 共用同一份数据,
  支持变量/别名/片段/@include/@skip/内省;`extensions.dbCalls` 会报出「数据库查询次数」,
  加 `?dataloader=1` 当场从 11 掉到 2 —— 第 10 章的 N+1 因此可以做实验而不只是看动画。
- 教学开关:`?delay=800` 放慢服务器耗时;token 见 `lib/mock/http.ts`
  (`apier-demo-token` 可写、`apier-readonly-token` 只读→403)。

### `<Inspector />`(lib/inspector.tsx)
- `<Inspector presets={[…]} defaultPath defaultMethod title />`,打的是同源 `/api/*`。
- 展示:状态码徽章、耗时分解(总计 / 服务器 / 网络)、响应体积、响应头、
  你设置的请求头、等价 curl 命令 —— DevTools Network 面板的教学版。
- `InspectorPreset = { id, label, method, path, body?, headers?, note? }`,
  `note` 说明「这次要让学习者看到什么」,双语。
- 已接入:01 §06(方法/状态码/头)、04 §03(PUT vs PATCH 字段蒸发)、
  05 §04(ETag→304)、06 §01(401 vs 403)、10 §04(N+1 计数器)。
- **响应头的值只能是 ASCII** —— `lib/mock/http.ts` 已在出口统一兜底,
  但写 `X-Teaching-Note` 时仍建议只用英文(中文破折号曾导致 500)。

## 章节页节奏(每章同一个骨架)

直觉比喻(hero + 开场故事)→ 概念拆解(交互可视化/逐帧动画)→
真代码(CodeBlock,能跑的 fetch/query)→ 常见误区(Callout warn)→
动手任务(LabSet)→ 通关测验(Quiz,6–10 题)→ 要点卡(KeyPoints)→ ChapterFooter。

## 内容事实基准(写作时对齐;详版调研报告见下方「调研报告」)

- HTTP 语义现行标准 RFC 9110/9111(2022);REST 出自 Roy Fielding 2000 年博士论文
  第五章;六大约束:客户端-服务器、无状态、可缓存、统一接口(含 HATEOAS 子约束)、
  分层系统、按需代码(唯一可选)。REST 是架构风格不是协议/标准。
- GraphQL:Facebook 2012 内部开发(重写移动端 News Feed 时),2015 开源,现由
  GraphQL Foundation 维护;**规范最新正式版 September 2025 Edition**(别写成 2021)。
- PUT 整体替换且幂等、PATCH 部分修改且不承诺幂等;401 是「没带/带错凭证」、
  403 是「认识你但不许进」;fetch 对 4xx/5xx 不 reject,必须查 res.ok。
- 错误格式推荐 RFC 9457 Problem Details(取代 RFC 7807)。
- GraphQL 默认单端点 POST /graphql、传统上恒 200;HTTP 缓存失效是真实代价,
  讲透而不是回避(解法:规范化客户端缓存、persisted queries + GET)。
- 练手 API(2026-07 实测可用、免注册):JSONPlaceholder、PokeAPI、DummyJSON、
  Open-Meteo、GitHub REST(匿名 60 次/时)、Rick and Morty(REST+GraphQL 双供)、
  Countries GraphQL(countries.trevorblades.com)。
  **REST Countries 已需注册 key,GitHub GraphQL 必须带 token —— 别当免费练手推荐。**
- 生态数据:Postman 2025 报告 REST 93% / GraphQL 33%;Apollo Server 现行 v5;
  OpenAPI 3.2(2025-09);OAuth 2.1 仍是草案但「授权码 + PKCE」已是当代默认。
- 终章案例:GitHub REST 与 GraphQL 并行双轨(GraphQL 要认证);Shopify GraphQL-first
  (2024-10 REST Admin API 转 legacy,2025-04 起新公共 App 仅 GraphQL);
  也要讲「退潮论」的另一面(Bessey 2024《Why I'm over GraphQL》:安全面、
  字段级授权、N+1、可观测性)。结论:没有替代关系,只有取舍。

## 调研报告

`docs/research-report.md` 存有完整调研报告(带来源 URL 与版本号速查卡),
写章节前先翻对应小节;与本文件冲突时以调研报告为准。
