"use client";

// 05 · REST 进阶模式 —— 动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "github-pagination",
    title: "亲手翻一页 GitHub",
    d: "easy",
    tags: ["fetch", "分页", "Link header"],
    task: (
      <p>
        在浏览器 Console 里请求{" "}
        <code>
          https://api.github.com/users/octocat/repos?per_page=5&page=2
        </code>{" "}
        —— octocat 的仓库列表,每页 5 条,取第 2 页。打印每个仓库的{" "}
        <code>name</code>,再看看响应头里的 <b>Link</b> ——
        GitHub 把「下一页在哪」直接写在里面了。
      </p>
    ),
    hint: (
      <>
        响应头用 <code>res.headers.get("link")</code> 取,
        Header 名不区分大小写。数组打印可以用{" "}
        <code>repos.map(r =&gt; r.name)</code>。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="js"
          title="console"
          code={`const res = await fetch(
  "https://api.github.com/users/octocat/repos?per_page=5&page=2"
);
const repos = await res.json();
console.log(repos.map((r) => r.name)); // 5 个仓库名
console.log(res.headers.get("link"));`}
        />
        <p>
          Link 头长这样:
          <code>&lt;…page=1&gt;; rel="prev", &lt;…page=3&gt;; rel="next"</code>
          —— 上一页、下一页的完整 URL 都替你拼好了,客户端顺着{" "}
          <code>rel="next"</code> 走就行,不用自己算页码。还记得第 03 章的
          HATEOAS 吗?这就是「响应里带可跟随的链接」在真实世界的一次露脸。
        </p>
      </>
    ),
  },
  {
    id: "rate-limit",
    title: "查一查自己的配额",
    d: "easy",
    tags: ["fetch", "限流", "GitHub"],
    task: (
      <p>
        请求 <code>https://api.github.com/rate_limit</code>,在响应里找到{" "}
        <code>rate.limit</code>、<code>rate.remaining</code>、
        <code>rate.reset</code> 三个数字:你一小时能调几次、还剩几次、
        什么时候重置。reset 是一个奇怪的大数字 —— 想想它是什么。
      </p>
    ),
    hint: (
      <>
        那个大数字是 Unix 时间戳(单位是秒)。
        <code>new Date(x * 1000)</code> 能把它翻译成人话。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="js"
          title="console"
          code={`const res = await fetch("https://api.github.com/rate_limit");
const { rate } = await res.json();
console.log("上限 " + rate.limit + " 次/时,还剩 " + rate.remaining + " 次");
console.log("重置时间:", new Date(rate.reset * 1000).toLocaleTimeString());`}
        />
        <p>
          匿名用户是 <b>60 次/小时</b>(带 token 是 5000 次)。贴心的是,查询{" "}
          <code>/rate_limit</code> 本身<b>不消耗</b>配额 ——
          不然「查余额」这个动作本身就在花钱,多讽刺。
        </p>
      </>
    ),
  },
  {
    id: "etag-304",
    title: "ETag 实战:亲眼看一次 304",
    d: "medium",
    tags: ["ETag", "304", "缓存"],
    task: (
      <p>
        两次请求同一个资源:第一次 fetch{" "}
        <code>https://api.github.com/users/octocat</code>,从响应头里把{" "}
        <code>etag</code> 指纹抠出来;第二次带上{" "}
        <code>If-None-Match</code> 再请求一遍,盯着 <code>res.status</code>{" "}
        看 —— 应该是 <b>304</b>,而且正文是空的。
      </p>
    ),
    hint: (
      <>
        指纹用 <code>res.headers.get("etag")</code> 拿;第二次请求把它原样放进{" "}
        <code>headers: {"{ \"If-None-Match\": tag }"}</code>。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="js"
          title="console"
          code={`const r1 = await fetch("https://api.github.com/users/octocat");
const tag = r1.headers.get("etag");
console.log("指纹:", tag);

const r2 = await fetch("https://api.github.com/users/octocat", {
  headers: { "If-None-Match": tag },
});
console.log(r2.status); // 304 —— 没变,不给正文`}
        />
        <p>
          彩蛋:GitHub 的 <b>304 不消耗你的 60 次配额</b> ——
          协商缓存不但省流量,还替你省钱。另外浏览器自己也有 HTTP 缓存,
          如果第一次就看到 304,换个无痕窗口再试。
        </p>
      </>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: (
      <>
        你在做一个信息流 App:用户不停往下滑,新内容源源不断插进来。
        列表分页选哪种最合适?
      </>
    ),
    opts: [
      <>
        offset 型(<code>?page=N</code>)—— 简单直观
      </>,
      <>cursor 型 —— 带着上一页最后一条的「书签」接着取</>,
      <>不分页,一次全返回,前端自己切</>,
      <>随机返回 20 条,反正用户也记不住</>,
    ],
    correct: 1,
    wrong: [
      <>
        offset 在「频繁插入 + 越翻越深」这两件事上恰好全踩坑:
        行号会被新数据挤得错位(重复/漏条),深翻页还慢 ——
        信息流两样全占。
      </>,
      undefined,
      <>
        百万级数据一次全给,服务器、网络、用户手机三方一起当场去世 ——
        分页就是为了避免这个才存在的。
      </>,
      <>
        用户往下滑是想看「接下来的」,不是抽卡。
        「精确接续」正是分页要保证的底线。
      </>,
    ],
    why: (
      <>
        频繁写入的信息流是 cursor 的主场:书签钉在「上次看到的那条记录」上,
        插入删除都动摇不了接续点,翻到天荒地老速度也不变。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>?page=30000&per_page=20</code> 比 <code>?page=1</code>{" "}
        慢非常多,根本原因是?
      </>
    ),
    opts: [
      <>第 30000 页的 JSON 比第 1 页大</>,
      <>数据库要先数过并丢弃前面 599,980 行,才能取出那 20 条</>,
      <>翻得太深,网络路由变长了</>,
      <>服务器对深翻页用户故意限速</>,
    ],
    correct: 1,
    wrong: [
      <>
        每页都是 20 条,响应体大小几乎一样 —— 慢在「取数」,不在「传输」。
      </>,
      undefined,
      <>网络路径跟页码没有任何关系,包走的还是那条路。</>,
      <>
        有的 API 确实会「限制最大页数」来躲这个坑,但那是无奈的结果,
        不是慢的原因 —— 原因在数据库里一行行数数太贵。
      </>,
    ],
    why: (
      <>
        offset 的本质是「跳过前 N 行」——
        而「跳过」也得一行行数出来再扔掉。N 越大越慢,
        这就是深翻页的性能塌陷;cursor 用索引直接定位,根本不数行。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        JSON:API 风格里,<code>GET /posts?sort=-created_at</code>{" "}
        返回的列表是什么顺序?
      </>
    ),
    opts: [
      <>按创建时间正序,最早的在前</>,
      <>按创建时间倒序,最新的在前</>,
      <>排除 created_at 字段后返回</>,
      <>
        语法错误,<code>-</code> 不能出现在 query 里
      </>,
    ],
    correct: 1,
    wrong: [
      <>
        方向反了 —— 前缀 <code>-</code> 就是「倒过来」的意思,
        不带 <code>-</code> 才是正序。
      </>,
      undefined,
      <>
        「响应里少带几个字段」是 <code>fields</code> 参数的活(字段裁剪),
        <code>sort</code> 只管顺序,不管内容。
      </>,
      <>
        <code>-</code> 在 query 值里完全合法 —— JSON:API 就靠它表达降序,
        省掉了一个 <code>order=desc</code> 参数。
      </>,
    ],
    why: (
      <>
        <code>sort=-created_at</code> 读作「按 created_at 降序」——
        最新的在前,信息流标配。这是 JSON:API 的约定;也有 API 写成{" "}
        <code>sort=created_at&order=desc</code>,一个意思,读文档为准。
      </>
    ),
  },
  {
    type: "multi",
    q: (
      <>
        你的博客 API 已经有一批老用户了。下面哪些改动属于
        <b>破坏性变更(breaking change)</b>,必须走版本化?(多选)
      </>
    ),
    opts: [
      <>
        删掉响应里的 <code>author</code> 字段
      </>,
      <>
        把 <code>id</code> 从数字改成字符串
      </>,
      <>
        把 <code>status: "active"</code> 的含义从「已发布」改成「已存档」
      </>,
      <>
        在响应里新增一个可选的 <code>likes</code> 字段
      </>,
    ],
    correct: [0, 1, 2],
    missHint: (
      <>
        还漏了 —— 提醒一句:「改语义」这种变更不动字段名、不动类型,
        但老客户端一样会被坑,而且坑得最悄无声息。
      </>
    ),
    extraHint: (
      <>
        有一项混进来了 —— 它对老客户端毫无杀伤力:
        JSON 里多出来的键,老代码看都不会看一眼。
      </>
    ),
    why: (
      <>
        判断标准就一条:<b>老客户端会不会坏</b>。删字段 → 取值变
        undefined;改类型 → 解析崩;改语义 → 数据悄悄错(最阴险)。
        只有「加字段」天生安全 —— 所以设计响应时宁可一开始少给,以后再加。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        把 ETag 协商缓存的四步排成正确顺序:① 服务器答 304,不带正文
        ② 第一次 GET,服务器回 200 + ETag ③ 再次请求,带上 If-None-Match
        ④ 资源真变了,回 200 + 新 ETag
      </>
    ),
    opts: [
      <>② → ③ → ① → ④</>,
      <>③ → ② → ① → ④</>,
      <>② → ① → ③ → ④</>,
      <>① → ② → ③ → ④</>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        If-None-Match 里装的指纹是从哪来的?第一次响应给的 —— 所以 ②
        必须发生在 ③ 之前。
      </>,
      <>
        304 是对「带指纹的请求」的回答 —— 没有 ③ 先带指纹去问,
        哪来的 ①?
      </>,
      <>
        304 不可能是第一步:第一次请求时你手里连指纹都没有,
        服务器只能老老实实给 200 + 完整正文。
      </>,
    ],
    why: (
      <>
        先拿指纹(200 + ETag),再带指纹问(If-None-Match),
        没变省流量(304 空身子),变了给新货(200 + 新 ETag)。
        这一轮背下来,受用终身。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>Idempotency-Key</code> 这个请求头,解决的是哪件事?
      </>
    ),
    opts: [
      <>给请求加密,防止被中间人偷看</>,
      <>支付这类 POST 请求超时后,客户端可以放心重试而不会重复扣款</>,
      <>让服务器缓存 GET 响应,下次更快</>,
      <>标识用户身份,代替登录</>,
    ],
    correct: 1,
    wrong: [
      <>
        防偷看是 HTTPS 的活。幂等键明文写在 header 里,谁都看得见 ——
        它防的是「重复做」,不是「被看见」。
      </>,
      undefined,
      <>
        GET 天生幂等,重试本来就安全,轮不到它出场 ——
        它是给 POST 这种非幂等请求「补票」用的。
      </>,
      <>
        身份是 Authorization 头的事。幂等键标识的是「这一次操作」,
        不是「这一个人」。
      </>,
    ],
    why: (
      <>
        超时的本质是「不知道服务器办没办成」。幂等键让服务器能认出重试:
        同一个 key 只办一次,之后原样返回第一次的结果 —— Stripe
        的招牌实践,IETF 正在把它写成标准(目前还是草案)。
      </>
    ),
  },
  {
    type: "fill",
    q: (
      <>
        服务器返回 429 Too Many Requests 时,惯例会配一个响应头,
        告诉客户端「至少等多久再来」。这个头叫____
        (两个英文单词,连字符相连)。
      </>
    ),
    placeholder: "输入 Header 名…",
    answers: ["Retry-After", "retryafter"],
    hint: <>直译就是「多久之后再试」—— Retry 加一个介词。</>,
    why: (
      <>
        429 + Retry-After 是服务器的礼貌:告诉你等几秒(或到几点)再来。
        客户端也要有礼貌:有这个头就照办,没有就指数退避 + 抖动。
      </>
    ),
  },
  {
    type: "choice",
    q: <>OpenAPI(现行 3.2)最贴切的定位是?</>,
    opts: [
      <>一种取代 REST 的新协议</>,
      <>一份机器可读的 API 说明书,能生成文档、客户端代码和 Mock 服务器</>,
      <>OpenAI 提供的 API</>,
      <>Swagger 的付费升级版</>,
    ],
    correct: 1,
    wrong: [
      <>
        它一行请求也不发 —— 只负责「描述」你的 REST API 长什么样,
        跑在网线上的还是 HTTP。
      </>,
      undefined,
      <>差一个字母,差了十万八千里。OpenAPI 是 API 描述规范,和 AI 没有血缘关系。</>,
      <>
        顺序反了:Swagger 是 OpenAPI 3.0 之前的旧名,如今作为一套工具品牌
        (Swagger UI、Swagger Editor)活着;规范本身免费开放。
      </>,
    ],
    why: (
      <>
        把「菜单」写成机器能读的 YAML/JSON,文档、客户端代码、Mock、
        测试就都能从这一份定义里长出来 —— 一处修改,处处同步。
        这就是「设计先行」的底气。
      </>
    ),
  },
];
