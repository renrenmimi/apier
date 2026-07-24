# RESTful API 与 GraphQL 双语课程 · 内容调研报告

调研日期：2026-07-20。学员画像：已会 HTML/CSS/JavaScript、能写简单网页、从未调用过 API 的零基础学习者。
本报告所有"可用性/版本号"类事实均在调研当日通过实际请求（curl/WebFetch）或官方页面验证；来源 URL 附在各节末尾。

## 先看三条会直接影响课程设计的关键发现

1. **GraphQL 规范已不再是 "October 2021"**。最新正式版是 **September 2025 Edition**（2025-09-03 发布，2025-09-08 官宣），是 2021 年 10 月以来第一个新版本；另有 2026-06-04 的 Working Draft。教材若写"最新版为 2021 年 10 月"即为过时。
2. **REST Countries 已经不再免费匿名可用**。旧的 `restcountries.com/v3.1` 于 2026 年已被关停（实测 301 重定向到弃用提示，返回 "This API version has been deprecated"），新版 v5（`https://api.restcountries.com/countries/v5/...`）**需要注册获取 API key**（`Authorization: Bearer` 头）。课程"免注册练手 API"名单必须把它移除或明确标注，替代品见第 6 节（Open-Meteo、DummyJSON 等已实测可用）。
3. **GitHub GraphQL API 必须携带 token**（实测未认证时 GraphQL 配额为 0），而 GitHub REST API 未认证可用（60 次/小时）。这本身就是绝佳的教学对比素材。

---

## 一、API 与 HTTP 基础

### 可直接入课的要点

**HTTP 报文结构**（现行标准是 RFC 9110《HTTP Semantics》，2022-06 发布，取代 RFC 7230-7235）：
- 请求 = 起始行（方法 + 路径 + 版本，如 `GET /posts/1 HTTP/1.1`）+ 头部若干行 + 空行 + 可选正文。
- 响应 = 状态行（版本 + 状态码 + 原因短语，如 `HTTP/1.1 200 OK`）+ 头部 + 空行 + 可选正文。
- 教学建议：用 `curl -v` 或浏览器 DevTools Network 面板给学员看"生肉"报文。

**常用方法的语义、安全性（safe）与幂等性（idempotent）**（RFC 9110 §9）：

| 方法 | 语义 | 安全 | 幂等 | 备注 |
|---|---|---|---|---|
| GET | 读取资源表述 | ✅ | ✅ | 不应有请求体 |
| HEAD | 同 GET 但只要头 | ✅ | ✅ | 用于探测资源是否存在/大小 |
| OPTIONS | 询问可用的通信选项 | ✅ | ✅ | CORS 预检就用它 |
| POST | 把数据交给目标资源处理（常用于"创建"） | ❌ | ❌ | 重复提交会重复创建 |
| PUT | 用请求体**整体替换**目标资源 | ❌ | ✅ | 重复执行结果一样 |
| PATCH | **部分修改**资源（RFC 5789，不在 9110 里） | ❌ | ❌（不保证） | 格式可用 JSON Patch (RFC 6902) 或 JSON Merge Patch (RFC 7396) |
| DELETE | 删除资源 | ❌ | ✅ | 幂等：删两次，资源都是"没了" |

- "安全" = 不改变服务器状态（只读）；"幂等" = 同一请求执行 1 次和 N 次的副作用相同。安全 ⊂ 幂等。
- 幂等的实际意义：网络超时后客户端/代理**可以放心重试**幂等请求；这是后面讲 Idempotency-Key 的伏笔。

**必教状态码**（RFC 9110 §15；429 出自 RFC 6585；均可配 MDN 中文页）：
- `200 OK`：成功，响应体带结果。
- `201 Created`：创建成功（POST/PUT），通常带 `Location` 头指向新资源。
- `204 No Content`：成功但无响应体（DELETE、PUT 更新常用）。
- `301 Moved Permanently`：资源永久搬家，`Location` 给新地址（实测 restcountries v3.1 现在就返回 301，可当活教材）。
- `304 Not Modified`：条件请求命中缓存——客户端带 `If-None-Match: <etag>`，资源没变就返回 304、不传响应体，省流量。
- `400 Bad Request`：请求本身有问题（语法、格式）。
- `401 Unauthorized`：**没有（有效）认证凭据**——名字叫 Unauthorized，实际意思是 Unauthenticated；必须携带 `WWW-Authenticate` 头。
- `403 Forbidden`：**身份明确但没权限**，重新登录也没用。
- `404 Not Found`：资源不存在（也常被用来隐藏 403，避免泄露资源存在性——GitHub API 就这么干）。
- `405 Method Not Allowed`：资源存在但不支持该方法，必须返回 `Allow: GET, POST...` 头。
- `409 Conflict`：与资源当前状态冲突（重复创建同名资源、版本冲突）。
- `422 Unprocessable Content`：语法没错但语义上无法处理（典型：字段校验失败；RFC 9110 已把它从 WebDAV 收编为正式状态码）。
- `429 Too Many Requests`：触发限流，配 `Retry-After` 头（RFC 6585）。
- `500 Internal Server Error`：服务器自己出错。
- `502 Bad Gateway`：网关/反向代理从上游拿到无效响应。
- `503 Service Unavailable`：临时不可用（过载/维护），可配 `Retry-After`。

**必教 Header**：
- `Content-Type`：**我发给你的正文**是什么格式（`application/json; charset=utf-8`）。
- `Accept`：**我希望你返回**什么格式（内容协商）。
- `Authorization`：认证凭据（`Bearer <token>`、`Basic <base64>`）。
- `Cache-Control`：缓存策略（RFC 9111），如 `max-age=3600`、`no-store`。
- `ETag` / `If-None-Match`：资源版本指纹 → 304 协商缓存；`If-Match` + `412` 还能做乐观并发控制。

### 来源
- RFC 9110 HTTP Semantics: https://www.rfc-editor.org/rfc/rfc9110.html
- RFC 9111 HTTP Caching: https://www.rfc-editor.org/rfc/rfc9111.html
- RFC 5789 PATCH: https://www.rfc-editor.org/rfc/rfc5789
- RFC 6585（429/431 等）: https://www.rfc-editor.org/rfc/rfc6585
- MDN HTTP 状态码（有中文版）: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
- MDN HTTP 方法/幂等性词条: https://developer.mozilla.org/en-US/docs/Glossary/Idempotent

---

## 二、REST

### 可直接入课的要点

**Roy Fielding 2000 年博士论文第五章的六大架构约束**（准确表述）：
1. **Client–Server**（客户端-服务器分离，关注点分离）
2. **Stateless**（无状态：每个请求必须自带理解该请求所需的全部信息，会话状态保存在客户端）
3. **Cache**（响应必须显式或隐式标注可否缓存）
4. **Uniform Interface**（统一接口——REST 的核心区别性约束，含 4 个子约束：① 资源标识 identification of resources；② 通过表述操纵资源 manipulation of resources through representations；③ 自描述消息 self-descriptive messages；④ **HATEOAS**，hypermedia as the engine of application state）
5. **Layered System**（分层系统：客户端不知道也不需要知道中间有多少层代理/网关）
6. **Code-on-Demand**（按需代码，**唯一可选**的约束，如下发 JS）

**核心概念三件套**：资源（resource，任何可命名的事物）；表述（representation，资源在某一时刻的某种格式快照，如一份 JSON）；URI（资源的标识符）。同一资源可有多种表述（JSON/XML/HTML），靠内容协商选择——这直接解释了"REST ≠ JSON"。

**Richardson 成熟度模型**（Leonard Richardson 提出，Martin Fowler 2010 年撰文普及）：
- Level 0：一个 URI + 一个方法（POST），HTTP 只当传输管道（"the swamp of POX"）。
- Level 1：引入资源，多个 URI，但方法仍单一。
- Level 2：正确使用 HTTP 动词 + 状态码（**绝大多数"RESTful API"停在这一层**）。
- Level 3：Hypermedia Controls（HATEOAS），响应里带可跟随的链接。
- Fowler 原话可引用：Level 3 是"the glory of REST"的前提；Fielding 本人 2008 年著名博文《REST APIs must be hypertext-driven》则断言不满足超媒体约束就不该叫 REST。

**HATEOAS 现实采用情况**（教学上要诚实）：
- 实证研究（arXiv 1902.10514 对主流 Web API 的分析）：**不到 1/5** 的 API 在响应里提供相关资源链接；HATEOAS 是 REST 约束中落地最差的一条。
- 原因：客户端与 API 多为同团队开发、紧耦合，动态发现价值低；响应膨胀、交互变"话痨"；无事实标准（HAL、JSON:API、Siren 各行其是）；框架与客户端工具支持弱。
- 现实结论可入课：业界所谓 REST API ≈ Richardson Level 2 + JSON；GitHub REST API 早年是超媒体驱动的典型，官方也承认这是它后来转向 GraphQL 的背景之一。

**URL 设计最佳实践**（综合 Microsoft / Google AIP / Zalando / Stripe / GitHub 风格）：
- 名词复数表示集合：`/users`、`/users/42`、`/users/42/orders`；不要在路径里放动词（`/getUsers` 是反模式）。
- 嵌套层级建议 ≤ 2 层（`collection/id/collection`），再深就该拆平（Microsoft 指南明确建议避免过深层级）。
- Query 参数惯例：过滤 `?status=active`；排序 `?sort=-created_at`（JSON:API 风格，`-` 表倒序）或 `?sort=created_at&order=desc`；分页 offset 型 `?page=2&per_page=20`（GitHub）/ cursor 型 `?limit=10&starting_after=obj_xxx`（Stripe，返回 `has_more`）；字段裁剪 `?fields=name,email`（JSON:API 的 sparse fieldsets）。Google AIP-158 规定 `page_token`/`next_page_token`。
- 命名细节：路径用小写连字符（Zalando 要求 kebab-case 路径 + snake_case JSON 属性）；URI 不体现存储实现（不要 `.php`）。

**版本化三策略对比**（真实大厂各占一种，教学对比极佳）：
- **URL 版本**：`https://api.example.com/v1/...`——最直观；Twilio 甚至用日期 URL `/2010-04-01/`。缺点：URI 变了，"同一资源"标识就变了，纯化论者反对。
- **自定义 Header 版本**：GitHub `X-GitHub-Api-Version: 2022-11-28`（2022 年起按日期命名版本，旧版本发布后至少支持 24 个月；实测 2026-03-10 版已发布）；Stripe `Stripe-Version: 2024-09-30.acacia`（2024 年起改为每半年一个命名大版本 acacia/basil…，月度小版本不破坏兼容）。
- **Media type 版本**：`Accept: application/vnd.github.v3+json`（GitHub 旧法，现已被日期 Header 取代——这段演变史本身值得讲）。

**错误响应格式**：**RFC 9457 Problem Details for HTTP APIs**（2023-07 发布，**取代 RFC 7807**，教材应以 9457 为准，内容向后兼容）。媒体类型 `application/problem+json`，标准字段：`type`（问题类型 URI）、`title`、`status`、`detail`、`instance`，可扩展自定义成员。已被 Zalando 等指南采纳为强制。

**幂等性设计**：`Idempotency-Key` 请求头——客户端为 POST 等非幂等请求生成唯一键，服务端据此去重，超时重试不再重复扣款。源自 Stripe/PayPal 实践；IETF 标准化进行中：`draft-ietf-httpapi-idempotency-key-header-07`（2025-10-15，Standards Track，尚未成 RFC）。Stripe 文档是最佳教学范例（键 24 小时内复用返回首次结果）。

**常见反模式清单**（可做课堂"找茬"练习）：URL 里放动词；一律返回 200、把错误塞进 body；一律用 POST；无视 Content-Type；无版本策略直接破坏性变更；把内部数据库结构原样暴露；深层嵌套 URL；大数据集用 offset 分页（深翻页性能塌陷，GraphQLConf 2025 还有专门讲"Offset Pagination Is Dead"的议题）；错误信息泄露堆栈。

### 来源
- Fielding 论文第五章: https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm
- Fielding《REST APIs must be hypertext-driven》: https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven
- Fowler《Richardson Maturity Model》: https://martinfowler.com/articles/richardsonMaturityModel.html
- HATEOAS 实证研究: https://arxiv.org/pdf/1902.10514 ；讨论文: https://www.ben-morris.com/pragmatic-rest-apis-without-hypermedia-and-hateoas/
- Microsoft REST API Guidelines: https://github.com/microsoft/api-guidelines
- Google AIP: https://google.aip.dev/
- Zalando RESTful API Guidelines: https://opensource.zalando.com/restful-api-guidelines/
- RFC 9457: https://datatracker.ietf.org/doc/rfc9457/
- Idempotency-Key 草案: https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/
- Stripe 版本策略: https://docs.stripe.com/api/versioning ；幂等键: https://docs.stripe.com/api/idempotent_requests ；分页: https://docs.stripe.com/api/pagination
- GitHub API 版本: https://docs.github.com/en/rest/about-the-rest-api/api-versions ；博文: https://github.blog/developer-skills/github/to-infinity-and-beyond-enabling-the-future-of-githubs-rest-api-with-api-versioning/
- JSON:API 规范（query 惯例参考）: https://jsonapi.org/format/

---

## 三、REST 认证与安全

### 可直接入课的要点

- **API Key**：最简单——放在 header（`X-API-Key`）或 query（不推荐，会进日志）。只标识"谁在调用"，无用户级授权，适合服务端对服务端、配额统计。
- **HTTP Basic**（RFC 7617）：`Authorization: Basic base64(user:password)`。Base64 **不是加密**，必须走 HTTPS。真实案例：Twilio 至今用 Basic（AccountSid:AuthToken）。
- **Bearer Token / JWT**：
  - Bearer 语义（RFC 6750）：谁持有（bear）令牌谁就是主人，所以泄露即失守。
  - JWT（RFC 7519）三段式 `header.payload.signature`，各段 Base64URL，点号连接；payload 是**可被任何人解码的明文**（只防篡改、不防偷看，别放敏感数据）——jwt.io 可现场演示。
  - 无状态会话：服务器不存 session，靠签名验证身份 → 天然契合 REST 的 Stateless 约束；代价是**无法单点吊销**，只能短有效期（`exp`）+ **Refresh Token 换发** 的组合。
- **OAuth 2.0**（RFC 6749）：核心是"让第三方应用在不拿到你密码的前提下获得受限访问"。四个角色：Resource Owner（用户）、Client（第三方应用）、Authorization Server（发令牌的）、Resource Server（存资源的）。重点教 **Authorization Code + PKCE**（RFC 7636：`code_verifier`/`code_challenge`，防授权码拦截）。
  - 2026 年现状：**OAuth 2.1 仍是 IETF 草案**（2026-03 时为 draft-ietf-oauth-v2-1-15，未成 RFC），但已明确方向：所有客户端强制 PKCE（仅 S256）、**删除 Implicit flow 和 Password grant**；Okta/Auth0/Microsoft Entra 等已按草案落地。教材应写"授权码 + PKCE 是当代默认，Implicit 已淘汰"。
- **CORS**（浏览器同源策略的"服务端开闸"机制，只约束浏览器，不是服务器防火墙，更不是认证）：
  - 简单请求（GET/HEAD/POST + 安全列表头 + 表单类 Content-Type）直接发，浏览器看响应里的 `Access-Control-Allow-Origin` 决定 JS 能否读到。
  - 非简单请求（如 `Content-Type: application/json`、带 `Authorization` 头、PUT/DELETE）先发 **OPTIONS 预检**，带 `Origin`/`Access-Control-Request-Method`/`-Headers`；服务器用 `Access-Control-Allow-*` 应答，`Access-Control-Max-Age` 可缓存预检结果。
  - 新手最常见报错就是 CORS——务必安排一节"读懂 CORS 报错"实验课（本地 fetch 第三方 API 复现）。
- **HTTPS 必要性**：`Authorization` 头、API key、JWT 在明文 HTTP 下等于裸奔；现代惯例 API 只提供 HTTPS + HSTS。演示：Wireshark/代理抓明文 vs TLS。
- **速率限制**：
  - 服务器返回 `429 Too Many Requests` + `Retry-After: <秒|日期>`。
  - 事实标准头：`X-RateLimit-Limit` / `X-RateLimit-Remaining` / `X-RateLimit-Reset`（GitHub 用小写 `x-ratelimit-*`，可现场 curl `https://api.github.com/rate_limit` 观察，未认证 60 次/小时）。
  - IETF 标准化进行中：`draft-ietf-httpapi-ratelimit-headers-11` 定义 `RateLimit` / `RateLimit-Policy` 头，**仍是草案**（2026 年中）。
  - 客户端礼仪：指数退避 + 抖动（exponential backoff with jitter）。

### 来源
- RFC 6749 OAuth 2.0: https://www.rfc-editor.org/rfc/rfc6749 ；RFC 7636 PKCE: https://www.rfc-editor.org/rfc/rfc7636
- OAuth 2.1 草案: https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/ ；解读: https://workos.com/blog/oauth-2-1-whats-new
- RFC 7519 JWT: https://www.rfc-editor.org/rfc/rfc7519 ；RFC 6750 Bearer: https://www.rfc-editor.org/rfc/rfc6750 ；RFC 7617 Basic: https://www.rfc-editor.org/rfc/rfc7617
- MDN CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS
- RateLimit 头草案: https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/
- GitHub REST 限流文档: https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api

---

## 四、GraphQL

### 可直接入课的要点

**诞生背景**：Facebook 2012 年为重写 iOS/Android 原生 News Feed 而在内部创建（Lee Byron、Nick Schrock、Dan Schafer），解决移动端弱网下 REST 的 **over-fetching**（拿回大量用不上的字段）与 **under-fetching/多次往返**（一屏数据要串好几个端点）问题；2015 年 React.js Conf 首次公开、同年 7 月发布规范草案与参考实现 graphql-js 并开源；2018 年 11 月移交 Linux Foundation 旗下新成立的 GraphQL Foundation。

**规范版本（已验证，重要！）**：
- 最新正式版：**September 2025 Edition**（2025-09-03 发布），这是 **October 2021 之后的第一个新版本**；spec.graphql.org 另列有 2026-06-04 的 Working Draft。
- September 2025 新增内容（官宣原文归纳）：**@oneOf Input Objects**（互斥输入，"input union"）、**Schema Coordinates**（标准化的 schema 元素定位语法，如 `User.name`）、**可执行文档上的 Descriptions**（query/mutation 也能写文档注释）、**deprecation 支持范围扩大**、**全 Unicode 语法支持**、执行/错误术语澄清。官方明确把这版定位为"为 AI 时代的 API 打基础"。
- 补充：`@specifiedBy`（自定义标量文档链接）是 October 2021 版加入的。

**SDL 类型系统**：
- 内置标量：`Int`、`Float`、`String`、`Boolean`、`ID`；可自定义标量。
- `type`（Object）、`interface`（多态、字段合同）、`union`（若干 Object 之一，无公共字段要求）、`enum`、`input`（专用于入参的对象类型）。
- 类型修饰符（wrapping types）：`[Episode]` List、`String!` Non-Null，可组合（`[String!]!`）。GraphQL 字段**默认可空**，这与多数语言直觉相反，值得单独讲。

**操作语义**：
- `query`（读，字段**可并行**解析）、`mutation`（写，**顶层字段严格串行**执行——规范规定，防止写操作互相踩踏）、`subscription`（订阅事件流，通常走 WebSocket/SSE，且根字段只能有一个）。
- 语言特性：变量（`$id: ID!`，把动态值从查询字符串里拿出来）、别名（同字段不同参数取两份）、片段 fragment / 内联片段（复用选择集；配合 interface/union 时用 `... on Type`）、指令 `@include(if:)` / `@skip(if:)`（执行期）与 `@deprecated(reason:)`（schema 端）。

**内省（introspection）**：查询 `__schema`、`__type` 即可取回整个类型系统——GraphiQL/Playground 的自动补全、文档面板全靠它。教学演示一发 `{ __schema { types { name } } }` 即可。

**Resolver 执行模型**：每个字段一个 resolver `(parent, args, context, info)`；执行是从根字段开始的树遍历，父字段结果作为子字段的 `parent` 传入；没写 resolver 的字段走默认解析（按属性名取值）。GraphQL 服务器"执行引擎 + resolver 映射"的心智模型是新手从 REST 路由思维转换的关键。

**N+1 问题与 DataLoader**：列表字段嵌套外部数据源时，`posts { author }` 会对 N 篇文章各查一次作者 = 1+N 次查询。标准解法 **DataLoader**（Facebook 开源的批处理 + 每请求缓存工具，`graphql/dataloader`）：把同一 tick 内的多次 `load(id)` 合并成一次 `batchLoadFn(ids)`。注意：客户端改个查询就可能在**零后端改动**的情况下引爆 N+1（Bessey 文章中的真实案例，可作警示教材）。

**错误处理**：响应固定形如 `{ "data": ..., "errors": [...] }`；`errors` 数组元素含 `message`、`locations`、`path`、可扩展的 `extensions`（惯例放 `code`）。**partial data**：某个非空字段炸了会向上冒泡置空，但其他字段照常返回——"部分成功"是 REST 没有的概念。传统上 HTTP 状态码恒为 200（错误在 body 里），这也是监控/调试痛点之一。

**分页惯例（Relay Cursor Connections 规范）**：`relay.dev/graphql/connections.htm`。结构：`friends(first: 10, after: $cursor) { edges { node {...} cursor } pageInfo { hasNextPage hasPreviousPage startCursor endCursor } }`；前向分页用 `first/after`，后向用 `last/before`；cursor 是不透明字符串。GitHub GraphQL API 完整遵循，可直接拿来练。

**缓存难点**（与 REST 对比是很好的一课）：
- REST：GET + URL 天然是缓存键，HTTP 缓存（浏览器、CDN、代理）免费可用。
- GraphQL：传统上单端点 + POST + 动态查询体 → HTTP 层缓存基本失效。
- 应对：① 客户端**规范化缓存**（Apollo Client 按 `__typename:id` 拆平存储、跨查询复用；urql 也有 Graphcache）；② schema 设计配合"全局对象标识"（`node(id:)`）；③ **Persisted Queries**：把查询文本换成服务端已知的 SHA-256 哈希（Apollo APQ），从而可以用 **GET** 请求 + CDN 缓存；进一步的 "trusted documents/persisted documents" 还能当安全白名单用。
- **GraphQL over HTTP 规范**（graphql-over-http，GraphQL 基金会项目）：2025-07 起持续发布 working draft，定义了 GET 传参方式、`application/graphql-response+json` 媒体类型（允许对请求级错误用非 2xx 状态码），仍是草案但已被主流实现跟进——纠正"GraphQL 只能 POST、只能 200"的教学好素材。

**安全**：
- 攻击面：任意嵌套/循环查询打爆 CPU（Bessey 实测：128 字节查询未登录烧掉 10 秒 CPU）。防御：查询**深度限制**（graphql-depth-limit）、**复杂度/成本分析**（按字段代价与列表长度估算预算）、超时、字段级授权（对象级授权很快不够用）。
- **生产环境关闭 introspection 的争论**：Apollo 官方立场是关（Apollo Server 在 `NODE_ENV=production` 时**默认关闭** introspection），OWASP GraphQL Cheat Sheet 也列为加固项；反方观点认为这只是 obscurity——查询仍可被猜测/从客户端代码提取，真正的防线是 persisted queries 白名单 + 字段授权。公开 API（如 GitHub）则开着 introspection。课程可两方观点并陈。

### 来源
- 规范版本页（已实测）: https://spec.graphql.org/ ；September 2025 版: https://spec.graphql.org/September2025/
- 官宣博文（已实测抓取全文）: https://graphql.org/blog/2025-09-08-september-edition/
- GraphQL 官方教程（schema/queries/execution/introspection/caching/pagination）: https://graphql.org/learn/
- Facebook 2015 首发博文: https://engineering.fb.com/2015/09/14/core-infra/graphql-a-data-query-language/
- GraphQL Foundation 成立: https://graphql.org/foundation/
- DataLoader: https://github.com/graphql/dataloader
- Relay Cursor Connections Spec: https://relay.dev/graphql/connections.htm
- GraphQL over HTTP 规范: https://graphql.github.io/graphql-over-http/ ；https://graphql.org/learn/serving-over-http/
- Apollo 规范化缓存: https://www.apollographql.com/docs/react/caching/overview ；APQ: https://www.apollographql.com/docs/apollo-server/performance/apq
- Apollo「为何生产环境关 introspection」: https://www.apollographql.com/blog/why-you-should-disable-graphql-introspection-in-production
- OWASP GraphQL Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/GraphQL_Cheat_Sheet.html
- Bessey《Why, after 6 years, I'm over GraphQL》: https://bessey.dev/blog/2024/05/24/why-im-over-graphql/

---

## 五、生态现状（2025–2026）

### 可直接入课的要点

**GraphQL 服务端/客户端主流工具**：
- **Apollo Server 5**：2025 年发布的现行主版本；**Apollo Server 4 已于 2026-01-26 EOL**（教材示例代码务必基于 AS5）。**Apollo Client 4** 也已发布（GraphQLConf 2025 有专题：预加载、Suspense、fragment API、data masking）。
- **GraphQL Yoga**（The Guild / graphql-hive 名下）：轻量、基于 WHATWG Fetch、任意 JS 运行时可部署，活跃维护中。
- **Relay**（Meta）：编译器驱动、fragment colocation，学习曲线最陡但最"正统"；**urql**：轻量客户端，支持 React/Vue/Svelte 等，带 Graphcache。
- **Hasura**：从 Postgres 自动生成 GraphQL；新一代产品 **Hasura DDN**（v3 引擎）支持 Postgres/MongoDB/ClickHouse/MS SQL + TS/Python/Go 连接器。
- **code-first vs schema-first**：schema-first 写 SDL 再配 resolver（Yoga/Apollo 常见）；code-first 用代码生成 schema（Pothos、Nexus、Java 的 DGS 注解模型）。TypeScript 圈 2025 年的流行组合是 Pothos + Yoga。
- 新势力（GraphQLConf 2025 发布/展示）：Airbnb 开源 **Viaduct**（其内部 GraphQL 执行框架）、The Guild 的 Rust federation router、Isograph、Houdini、Graffle（前 graphql-request）。

**Federation**：
- **Apollo Federation**：把多个子图（subgraph）组合成一张超图（supergraph），路由器做查询规划与分发——解决"多团队共建一个大 graph"的组织问题，是 GraphQL 在大企业存活的主要形态。
- 标准化动向：GraphQL 基金会 **Composite Schemas 规范**（2024-05 成立工作组，Apollo、Netflix、Hasura、The Guild、WunderGraph、ChilliCream 参与）正在把 federation 变成厂商中立标准，ChilliCream Fusion、Hive Gateway 等已在实现；目前仍是草案。

**REST 生态**：
- **OpenAPI**：3.1（2021，对齐 JSON Schema）之后，**OpenAPI 3.2.0 于 2025-09-19 发布**（层级化 tags、streaming 媒体类型、新 HTTP QUERY 方法支持、`querystring` 参数、OAuth 设备流元数据等，向后兼容 3.1）。"Swagger" 是 3.0 之前的旧名与一套工具品牌（Swagger UI/Editor）。
- **Postman**：行业标配调试工具；其《2025 State of the API》（5700+ 受访者）：**REST 使用率 93%**、GraphQL 33%、Webhooks 50%、WebSockets 35%——"REST 仍是默认，GraphQL 是特定场景补充"有数据背书。

**真实公司选型案例**：
- **GitHub**：2016 年公开 GraphQL API（自述是"抛弃 XML 拥抱 JSON 以来最大变化"），动机：REST/超媒体端点组合爆炸、集成方要"精确取数"、类型系统与内省带来自文档化、公私 API 合一。但 REST 并未废弃——今天 REST 与 GraphQL **并行提供**，官方文档《Comparing GitHub's REST API and GraphQL API》指导选型；REST 用日期版本化持续演进。实测：GraphQL 端点必须认证（未认证配额 0），REST 未认证 60 次/时。
- **Shopify**：GraphQL-first 最激进案例。2024-10-01 起 REST Admin API 标记为 **legacy**；**2025-04-01 起新提交的公共 App 只能用 GraphQL**；产品类 REST 端点 2025-02-01 前强制迁移。官方博文《All-in on GraphQL》。
- **Netflix**：内部 Studio API 用 **联邦 GraphQL**（70+ 服务、上百团队），2021-02 开源 Spring Boot 框架 **DGS**；同时参与 Composite Schemas 标准化。
- **Meta/Airbnb**：Meta 持续投入（@async defer 演进）；Airbnb 2025 年开源 Viaduct（千人协作规模的 GraphQL 执行框架）。
- **反方/退潮论**：代表作 Matt Bessey《Why, after 6 years, I'm over GraphQL》（2024-05，HN 热帖，后有 Software Engineering Daily 播客《The End of GraphQL》）：攻击面（复杂度攻击）、字段级授权成本、N+1、可观测性差是四大论点。WunderGraph 2024 年综述：小团队退回 REST/tRPC，大org 靠 federation 继续。公认现状：**GraphQL 没有"死"，但定位收窄**——多客户端/多团队/聚合层场景强，"单前端 + 单后端的小项目"不再推荐。
- **第三选项（建议课程用 1 讲带过）**：**tRPC**（v11 于 2025-03-21 stable）——TypeScript 全栈同仓库时的端到端类型安全 RPC，无 schema、无 codegen，Next.js 生态宠儿；**gRPC**——Protobuf + HTTP/2，多语言微服务内部通信标配，浏览器直连需 grpc-web 转换。选型口诀可入课：对外公开 API → REST；多端聚合/大org 多团队 → GraphQL(+Federation)；TS 全栈单团队 → tRPC；内部微服务高性能互调 → gRPC。

### 来源
- Apollo Server 版本与 EOL: https://www.apollographql.com/docs/apollo-server/previous-versions ；迁移: https://www.apollographql.com/docs/apollo-server/migration
- GraphQLConf 2025 发布汇总（已实测抓取全文）: https://graphql.org/blog/2025-10-20-graphql-conf-2025-article-1/
- GraphQL Yoga: https://github.com/graphql-hive/graphql-yoga ；Hasura: https://hasura.io/graphql/ ；urql: https://github.com/urql-graphql/urql ；Relay: https://relay.dev/
- Composite Schemas: https://graphql.org/blog/2024-05-16-composite-schemas-announcement/ ；https://github.com/graphql/composite-schemas-spec ；https://graphql.org/learn/federation/
- Apollo Federation: https://www.apollographql.com/docs/graphos/schema-design/federated-schemas/schema-types
- OpenAPI 3.2 官宣: https://www.openapis.org/blog/2025/09/23/announcing-openapi-v3-2 ；规范: https://spec.openapis.org/oas/v3.2.0.html
- Postman 2025 State of the API: https://www.postman.com/state-of-api/2025/
- GitHub GraphQL 起源: https://github.blog/developer-skills/github/the-github-graphql-api/ ；REST vs GraphQL 对比: https://docs.github.com/en/rest/about-the-rest-api/comparing-githubs-rest-api-and-graphql-api
- Shopify: https://www.shopify.com/partners/blog/all-in-on-graphql ；changelog: https://shopify.dev/changelog/starting-april-2025-new-public-apps-submitted-to-shopify-app-store-must-use-graphql
- Netflix DGS: https://netflixtechblog.com/open-sourcing-the-netflix-domain-graph-service-framework-graphql-for-spring-boot-92b9dcecda18 ；https://netflix.github.io/dgs/
- Bessey 文 + 播客: https://bessey.dev/blog/2024/05/24/why-im-over-graphql/ ；https://softwareengineeringdaily.com/2024/10/16/the-end-of-graphql-matt-bessey/
- WunderGraph 综述: https://wundergraph.com/blog/exploring_reasons_people_embrace_graphql_in_2024_and_the_caveats_behind_its_non_adoption
- tRPC v11: https://trpc.io/ ；发布博文: https://github.com/trpc/trpc/blob/main/www/blog/2025-03-21-announcing-trpc-11.mdx

---

## 六、新手免费练手 API（2026-07-20 全部实测）

| API | 类型 | Base URL | 示例端点（实测） | 需要 key？ | 备注 |
|---|---|---|---|---|---|
| JSONPlaceholder | REST | `https://jsonplaceholder.typicode.com` | `GET /posts/1` → 200 | 否 | 假数据（posts/comments/users…），支持 POST/PUT/DELETE（假写入），第一课首选 |
| PokeAPI | REST | `https://pokeapi.co/api/v2` | `GET /pokemon/pikachu` → 200 | 否 | 只读 GET；官方要求合理使用并本地缓存 |
| **REST Countries** | REST | ~~`restcountries.com/v3.1`~~ → `https://api.restcountries.com/countries/v5` | 旧版实测 301 → "deprecated"；新版示例 `GET /codes.alpha_2/ca`（需 `Authorization: Bearer <key>`） | **是（v5 起需注册，有免费档；官网演示 key `rc_live_demo`）** | ⚠️ 2026 年已不满足"免注册"条件，教材需更新 |
| GitHub REST API | REST | `https://api.github.com` | `GET /users/octocat` → 200 | 否（60 次/时）；带 token 5000 次/时 | 讲限流、Link 分页、版本头的活教材 |
| GitHub GraphQL API | GraphQL | `https://api.github.com/graphql` | 任意查询 | **是（必须 PAT；实测未认证配额为 0）** | 与其 REST 形成对比教学 |
| Countries GraphQL | GraphQL | `https://countries.trevorblades.com/` | `{ country(code:"CN"){ name capital currency } }` → 实测返回 Beijing/CNY | 否 | Trevor Blades 维护，GraphQL 第一课首选 |
| Rick and Morty API | GraphQL + REST | `https://rickandmortyapi.com/graphql`（REST: `/api`） | `{ character(id:1){ name species status } }` → 实测返回 Rick Sanchez | 否 | 同一数据同时有 REST 和 GraphQL 两套接口，天然对照实验 |
| Open-Meteo（替补） | REST | `https://api.open-meteo.com/v1` | `GET /forecast?latitude=42.36&longitude=-71.06&current_weather=true` → 200 | 否（非商用） | 真实天气数据，替代 REST Countries 的好选择 |
| DummyJSON（替补） | REST | `https://dummyjson.com` | `GET /products/1` → 200 | 否 | 类 JSONPlaceholder 但数据更丰富，支持模拟登录 JWT |
| SWAPI（备选） | REST | `https://swapi.dev/api` | `GET /people/1/` → 200 | 否 | 实测可用，但历史上稳定性一般，只做备选 |

教学提示：
- Rick and Morty API 同时提供 REST 与 GraphQL，是"同一需求两种风格"对照实验的最佳载体（REST 拿角色+起源地要 2 次请求，GraphQL 一次搞定）。
- GitHub 双 API 可以布置进阶作业：先匿名 curl REST 感受 60 次/时限流与 `x-ratelimit-*` 头，再申请 PAT 调 GraphQL。

### 来源
- https://jsonplaceholder.typicode.com/guide/
- https://pokeapi.co/docs/v2
- https://restcountries.com/ 与 https://restcountries.com/docs/countries/legacy-api-deprecation （v5 迁移与 key 要求）
- https://docs.github.com/en/rest ；https://docs.github.com/en/graphql
- https://github.com/trevorblades/countries （countries.trevorblades.com）
- https://rickandmortyapi.com/documentation
- https://open-meteo.com/ ；https://dummyjson.com/docs ；https://swapi.dev/

---

## 七、常见新手误区与教学难点

1. **"REST = JSON over HTTP"**：REST 是架构风格（六约束），与格式无关；JSON 只是最流行的表述。业界 93% 自称 REST 的 API 多数只是 Richardson Level 2。建议教法：先讲"资源/表述/URI"，再自然引出 JSON。
2. **PUT vs PATCH**：PUT = 整体替换（漏掉的字段会被清掉）且幂等；PATCH = 部分修改且不保证幂等。常见错误是用 PUT 传半个对象。演示 JSONPlaceholder 上 PUT `{title}` 之后其他字段消失的效果。
3. **401 vs 403**：401 = "你是谁？我不认识你"（缺/错凭据，可通过登录解决）；403 = "我知道你是谁，但你不许进"。补充：有些 API 故意用 404 掩盖 403。
4. **一律 200、错误塞 body**：REST 反模式，但**在 GraphQL 里却是传统行为**——要提前打预防针，否则学员会用 `response.ok` 判断 GraphQL 成败而踩坑；顺带引出 `application/graphql-response+json` 的改进。
5. **GraphQL"单端点"的心理落差**：从"URL 即资源"切到"一个 /graphql + 查询语言"，学员会问"路由去哪了"。教法：资源 → 类型，端点 → 字段，浏览 schema 用 GraphiQL 内省而不是翻 URL 列表。
6. **"GraphQL 总是 POST → 没法缓存"的半真半假**：默认实践确实牺牲了 HTTP 缓存，但 GET + persisted queries + 规范化客户端缓存是标准解法；GraphQL over HTTP 草案明确支持 GET。同时提醒：POST + `application/json` 也会触发 CORS 预检，本地开发时 GraphQL 请求同样会遇到 CORS 报错。
7. **fetch 不会对 4xx/5xx reject**：`fetch()` 只有网络失败才 reject，`res.ok`/`res.status` 必须手动检查——零基础学员第一次调 API 几乎必踩。
8. **把 API key 写进前端代码/仓库**：浏览器里没有秘密；引出"后端代理保管密钥"的架构常识。
9. **CORS 报错误读为"API 挂了"**：报错发生在浏览器侧，curl/Postman 正常 ≠ 浏览器能用；顺势讲预检。
10. **URL 设计动词化**（`/getUser?id=1`）：HTML 表单时代惯性；用"名词 + 方法"重构练习纠正。
11. **GraphQL 字段默认可空 + partial data**：`data` 和 `errors` 可以同时出现，这个"部分成功"心智模型 REST 里没有对应物，需要专门练习。
12. **幂等性抽象难点**："DELETE 是幂等的？第二次不是 404 吗？"——澄清幂等看的是**服务器状态副作用**而非响应码。
13. **认为 GraphQL 是 REST 的"升级版/替代者"**：用 Postman 2025 数据（REST 93% vs GraphQL 33%）和 GitHub 双轨、Bessey 反思文说明二者是取舍关系，防止学员学完 GraphQL 就鄙视 REST。

### 来源
- MDN `fetch()` 错误语义: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- MDN 401/403: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/401 ；/403
- RFC 9110（PUT/PATCH/幂等定义）: https://www.rfc-editor.org/rfc/rfc9110.html
- 《Why Does GraphQL Return 200 Even on Errors?》: https://dev.to/joe-re/why-does-graphql-return-200-even-on-errors-a-clear-guide-to-graphql-http-status-codes-194m
- GraphQL 官方 serving-over-http / debug-errors: https://graphql.org/learn/serving-over-http/ ；https://graphql.org/learn/debug-errors/
- 其余同第二、四、五节来源。

---

## 附：写教材时的"版本号速查卡"（2026-07 快照）

| 事项 | 现状 |
|---|---|
| HTTP 语义标准 | RFC 9110/9111（2022-06） |
| Problem Details | RFC 9457（2023-07，取代 RFC 7807） |
| GraphQL 规范 | **September 2025 Edition**（最新正式版）；Working Draft 2026-06-04 |
| GraphQL over HTTP | 仍为 working draft（`application/graphql-response+json`） |
| OpenAPI | **3.2.0**（2025-09-19） |
| OAuth 2.1 | 仍为 IETF 草案（draft-15 @ 2026-03） |
| Idempotency-Key | IETF 草案 draft-07（2025-10-15） |
| RateLimit 标准头 | IETF 草案 draft-11 |
| Apollo Server | v5 现行；v4 已于 2026-01-26 EOL |
| tRPC | v11（2025-03-21 stable） |
| Shopify | REST legacy（2024-10-01）；新公共 App 仅 GraphQL（2025-04-01 起） |
| GitHub REST 版本 | 日期版本（最新 2026-03-10），`X-GitHub-Api-Version` 头 |
| Stripe 版本 | 半年命名版（acacia/basil…），`Stripe-Version` 头 |
