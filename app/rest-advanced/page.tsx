"use client";

// 05 · REST 进阶模式 —— 毛坯房通水电:
// 分页 → 过滤/排序/裁剪 → 版本化 → 缓存 → 幂等与重试 → 限流 → OpenAPI →
// 动手任务 → 测验 → 要点。

import "./chapter.css";

import {
  Hero,
  Section,
  Callout,
  KeyPoints,
  ChapterFooter,
  Method,
  Status,
} from "@/lib/kit";
import { CodeBlock, CodePair } from "@/lib/code";
import { LabSet } from "@/lib/labs";
import { Quiz } from "@/lib/quiz";
import { LABS, QUIZ } from "@/lib/rest-advanced-data";
import {
  HeroUtils,
  PagingStepper,
  UrlDissect,
  EtagFlow,
  IdemFlow,
} from "./viz";

export default function RestAdvancedPage() {
  return (
    <main className="page" data-ch="rest-advanced">
      <Hero
        ch="rest-advanced"
        title={
          <>
            REST <span className="grad">进阶模式</span>
          </>
        }
        essence={
          <>
            第 04 章你把博客 API 盖了起来,毛坯房,能住人了。这一章通水电燃气:
            数据一多怎么翻页?接口改版怎么不砸老用户?付款超时,敢不敢重试?
          </>
        }
        chips={[
          { id: "pagination", n: "01", label: "分页" },
          { id: "query", n: "02", label: "过滤·排序·裁剪" },
          { id: "versioning", n: "03", label: "版本化" },
          { id: "caching", n: "04", label: "缓存" },
          { id: "idempotency", n: "05", label: "幂等与重试" },
          { id: "ratelimit", n: "06", label: "速率限制" },
          { id: "openapi", n: "07", label: "OpenAPI" },
          { id: "labs", n: "08", label: "动手" },
          { id: "quiz", n: "09", label: "测验" },
        ]}
      >
        <HeroUtils />
      </Hero>

      {/* ================= §01 分页 ================= */}
      <Section
        id="pagination"
        index="01"
        title="分页:为什么一次不能全给"
        desc="你的博客火了,文章表涨到一百万行。GET /posts 还敢原样返回吗?"
      >
        <Callout tone="story" title="图书馆不会把整个书库推给你">
          <p>
            你去图书馆想看武侠小说,管理员不会把三万本一车推到你面前 ——
            「先拿二十本,看完再来」。API 一样:一百万行数据一次全给,
            服务器查到冒烟、网络传到天黑、用户手机直接卡死,三方一起遭殃。
            所以所有像样的列表接口都<b>分页(pagination)</b>:一次一小份,
            按需再取。
          </p>
          <p>
            问题在「再来」二字上:下一份<b>从哪接着给</b>?对这个问题的两种回答,
            就是两大流派 —— <b>offset 型</b>数行号,<b>cursor 型</b>钉书签。
          </p>
        </Callout>

        <PagingStepper />

        <CodePair
          left={
            <CodeBlock
              lang="js"
              title="offset · GitHub 风格"
              code={`// GET /repos?page=2&per_page=20
// 「跳过前 20 行,再给 20 行」
[
  { "id": 21, "name": "post-21" },
  { "id": 22, "name": "post-22" }
  // …共 20 条
]
// 下一页在哪?响应头里:
// Link: <…page=3>; rel="next"`}
              note={
                <>
                  简单直观,还能「跳页」(直接去第 8 页)。
                  适合数据不常变、翻不深的后台列表。
                </>
              }
            />
          }
          right={
            <CodeBlock
              lang="js"
              title="cursor · Stripe 风格"
              code={`// GET /charges?limit=20
//     &starting_after=ch_3XkV
// 「从 ch_3XkV 这条之后接着给」
{
  "data": [ /* 20 条 */ ],
  "has_more": true
}
// 书签 = 本页最后一条的 id,
// 下一页原样带上即可`}
              note={
                <>
                  不能跳页,但深翻页不塌、数据插删不错位。
                  信息流、无限滚动的标准答案。
                </>
              }
            />
          }
        />

        <Callout tone="warn" title="offset 的两大命门,面试和生产都爱考">
          <p>
            一是<b>深翻页塌陷</b>:「跳过 N 行」也得一行行数,N
            越大越慢;二是<b>数据错位</b>:翻页途中有人插入/删除,
            行号整体挪动,轻则重复、重则漏条 ——
            而漏掉的那条,用户永远不知道自己错过了什么。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 过滤·排序·裁剪 ================= */}
      <Section
        id="query"
        index="02"
        title="过滤、排序、字段裁剪:query 参数的三板斧"
        desc="资源是主语,query 参数是修饰语 —— 一条长 URL,逐段拆给你看。"
      >
        <p className="sec-desc">
          列表接口光会分页还不够:用户想只看已发布的、想按最新排序、
          想在手机上少下点字段。这些需求全都挂在 <code>?</code>{" "}
          后面解决,资源本身岿然不动。点下面这条 URL 的每一段:
        </p>

        <UrlDissect />

        <Callout tone="idea" title="为什么全塞进 query,而不是各开一个端点?">
          <p>
            因为「已发布的文章」「最新的文章」「只带标题的文章」
            本质上是<b>同一个资源集合的不同视图</b>。开{" "}
            <code>/posts/published</code>、<code>/posts/latest</code>{" "}
            这种端点,组合一多就爆炸(已发布 × 最新 × 只带标题 = 又一个端点?)。
            query 参数可以自由组合,这正是它的价值。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 版本化 ================= */}
      <Section
        id="versioning"
        index="03"
        title="版本化:改建房子,不换门牌"
        desc="API 一旦有了用户,你的每次「优化」都可能是别人的事故。"
      >
        <p className="sec-desc">
          你想把响应里的 <code>author</code> 字段改名成{" "}
          <code>writer</code> —— 一推上线,三千个老 App 页面上的作者名齐刷刷变成
          undefined。API 是<b>契约</b>:改约可以,但得让新旧两版共存一阵子,
          给老客户端搬家的时间。怎么标记「你要哪一版」?三大流派:
        </p>

        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>策略</th>
                <th>长相</th>
                <th>代表</th>
                <th>一句话点评</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>URL 版本</b>
                </td>
                <td>
                  <code>/v1/posts</code>
                </td>
                <td>
                  绝大多数 API;Twilio 甚至用日期:
                  <code>/2010-04-01/</code>
                </td>
                <td>
                  最直观,浏览器里一眼看见;洁癖派嫌它「同一资源换了标识」。
                </td>
              </tr>
              <tr>
                <td>
                  <b>自定义 Header</b>
                </td>
                <td>
                  <code>X-GitHub-Api-Version: 2022-11-28</code>
                </td>
                <td>
                  GitHub(日期命名);Stripe(
                  <code>Stripe-Version</code>)
                </td>
                <td>URL 干净、资源标识不变;代价是浏览器地址栏试不出来。</td>
              </tr>
              <tr>
                <td>
                  <b>Media type</b>
                </td>
                <td>
                  <code>Accept: application/vnd.github.v3+json</code>
                </td>
                <td>GitHub 旧法(已退役)</td>
                <td>
                  最「学院派」:版本是表述的一部分;也最难用,
                  基本只活在教科书和考古现场。
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout tone="story" title="GitHub 的版本三部曲">
          <p>
            GitHub 早年用 media type(<code>vnd.github.v3+json</code>
            )—— 理论最优雅,但用户记不住、工具配不对,支持成本高。2022
            年它改用日期命名的自定义头:
            <code>X-GitHub-Api-Version: 2022-11-28</code>
            ,并承诺每个版本发布后<b>至少活 24 个月</b>。理论上的优雅,
            输给了工程上的好用 —— 这个演变本身就是一堂课。
          </p>
        </Callout>

        <div className="grid-2">
          <div className="card">
            <div className="card-kicker" style={{ color: "var(--risk)" }}>
              破坏性 · 必须升版本
            </div>
            <div className="card-title">💥 老客户端会坏</div>
            <p>
              删字段(取值变 undefined)、改字段类型(解析崩)、
              改字段语义(数据悄悄错,最阴险)、改 URL 或状态码含义。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker" style={{ color: "var(--ok)" }}>
              非破坏性 · 随便上
            </div>
            <div className="card-title">🌱 老客户端无感</div>
            <p>
              加可选的响应字段、加新端点、加可选的 query 参数。
              JSON 里多出来的键,老代码看都不看 —— 所以「只加不改不删」
              是 API 长寿的第一秘诀。
            </p>
          </div>
        </div>
      </Section>

      {/* ================= §04 缓存 ================= */}
      <Section
        id="caching"
        index="04"
        title="缓存:同样的答案,别问两遍"
        desc="最快的请求是不用发的请求;第二快的,是只回一句「没变」的请求。"
      >
        <p className="sec-desc">
          先看简单粗暴的<b>强缓存</b>:服务器在响应里声明「保质期」,
          期内浏览器<b>连问都不问</b>,直接用本地副本:
        </p>

        <CodeBlock
          lang="http"
          title="Cache-Control · 强缓存"
          hl={[2]}
          code={`HTTP/1.1 200 OK
Cache-Control: max-age=3600
Content-Type: application/json

{ "name": "Ada Lovelace" }`}
          note={
            <>
              max-age=3600:一小时内再要这个 URL,浏览器直接从本地拿,
              一个请求都不发。适合不常变的数据;定价页秒变的东西别这么干。
            </>
          }
        />

        <p className="sec-desc">
          保质期过了,数据就一定变了吗?未必 —— 这时轮到重头戏
          <b>协商缓存(ETag)</b>:带着上次的「指纹」去问一句,
          没变就只回一个 <Status code={304} text="Not Modified" />
          ,空身子,正文一个字节都不传:
        </p>

        <EtagFlow />

        <Callout tone="idea" title="这份红利,REST 几乎是白捡的">
          <p>
            <Method m="GET" /> + URL 天然构成一把<b>缓存键</b>:同一个
            URL 就是同一个资源,浏览器、CDN、公司代理 ——
            整条链路上的设备都认识它、都能帮你缓存,<b>零配置生效</b>。
            记住这份轻松,第 10 章你会看到 GraphQL 为同一件事费了多大劲
            (单端点 + POST,HTTP 缓存直接失明)。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 幂等与重试 ================= */}
      <Section
        id="idempotency"
        index="05"
        title="幂等与重试:超时之后,敢不敢重发?"
        desc="付款按钮转了十秒,没动静。这个瞬间,是后端工程师的成人礼。"
      >
        <p className="sec-desc">
          复习第 01 章:<b>幂等(idempotent)</b> = 同一请求执行 1 次和 N
          次,服务器状态一样。<Method m="GET" />、<Method m="PUT" />、
          <Method m="DELETE" /> 天生幂等,超时了闭眼重发就是;偏偏{" "}
          <Method m="POST" /> 不幂等 —— 而「支付」恰恰是 POST。
          看下面这场事故,以及那枚救场的 key:
        </p>

        <IdemFlow />

        <CodeBlock
          lang="http"
          title="带幂等键的支付请求"
          hl={[3]}
          code={`POST /v1/payments HTTP/1.1
Content-Type: application/json
Idempotency-Key: 8e03978e-40d5-43e8-bc93-6894a57f9324

{ "amount": 9900, "currency": "cny" }`}
          note={
            <>
              键由客户端生成(UUID 即可),同一笔操作重试时必须原样复用。
              Stripe 的账本里,同一个 key 24 小时内一律返回首次结果;
              IETF 正在把这个头标准化(2026 年中仍是草案)。
            </>
          }
        />

        <Callout tone="deep" title="「DELETE 第二次明明返回 404,怎么还算幂等?」">
          <p>
            好问题 —— 幂等看的是<b>服务器状态的副作用</b>,不是响应码。
            删一次,资源没了;再删一次,资源还是「没了」,状态没有第二次变化,
            所以幂等成立。响应码从 204 变 404,只是「话说得不一样」,
            不是「事做得不一样」。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 速率限制 ================= */}
      <Section
        id="ratelimit"
        index="06"
        title="速率限制:服务器的自我保护"
        desc="免费自助餐也有规矩:一人一次拿一盘。拿太快,请你歇一会儿。"
      >
        <p className="sec-desc">
          任何公开 API 都得防「刷」:恶意的、失控的、或者只是写了个死循环的你。
          手段就是<b>速率限制(rate limiting)</b>:超过配额,回{" "}
          <Status code={429} text="Too Many Requests" />
          ,并用 Header 把规则摊开在明面上 —— 以 GitHub 为例:
        </p>

        <CodeBlock
          lang="http"
          title="撞上限流时的响应"
          hl={[2, 4]}
          code={`HTTP/1.1 429 Too Many Requests
Retry-After: 42
x-ratelimit-limit: 60
x-ratelimit-remaining: 0
x-ratelimit-reset: 1794816042

{ "message": "API rate limit exceeded" }`}
          note={
            <>
              Retry-After:至少等 42 秒再来。x-ratelimit-*
              三兄弟:总配额 / 还剩几次 / 何时重置(Unix 秒)——
              GitHub 匿名用户 60 次/时。这组头是事实标准,IETF
              的统一版 RateLimit 头还在草案阶段。
            </>
          }
        />

        <p className="sec-desc">
          客户端这边也讲礼仪:被限流后别嗷嗷重试(那叫落井下石),要
          <b>指数退避(exponential backoff)</b> ——
          每次失败后等待时间翻倍,再加一点<b>随机抖动(jitter)</b>
          ,免得千军万马同一毫秒卷土重来:
        </p>

        <CodeBlock
          lang="js"
          title="带退避的 fetch 封装"
          hl={[11, 12]}
          code={`async function fetchWithRetry(url, tries = 5) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url);
    // 429 / 5xx 才值得重试;404 这种重试一万次也是 404
    if (res.status !== 429 && res.status < 500) return res;
    // 最后一次还是失败:把响应交给调用方,别再白等一轮
    if (i === tries - 1) return res;

    // 服务器说了等多久就听它的。但 Retry-After 也可能写成 HTTP 日期,
    // 取不到秒数就退回指数退避 —— 否则 setTimeout(NaN) 会立刻空转重试
    const secs = Number(res.headers.get("Retry-After"));
    const base = secs > 0 ? secs * 1000 : 500 * 2 ** i;
    const wait = base + Math.random() * 300; // 抖动
    await new Promise((ok) => setTimeout(ok, wait));
  }
}`}
          note={
            <>
              等待序列大约是 0.5s → 1s → 2s → 4s(共 5 次请求、4 次等待,
              各加随机零头)。注意第 5 行:<b>该重试的才重试</b> ——
              对 4xx 里除 429 外的错误退避,纯属浪费大家时间。
            </>
          }
        />
      </Section>

      {/* ================= §07 OpenAPI ================= */}
      <Section
        id="openapi"
        index="07"
        title="OpenAPI 一瞥:菜单的机器可读版"
        desc="人读的文档会过时,机器读的定义不会 —— 因为一切都从它生成。"
      >
        <p className="sec-desc">
          序章说 API 文档是「菜单」。<b>OpenAPI</b>{" "}
          就是把菜单写成机器能读的 YAML/JSON:有哪些端点、收什么参数、
          回什么结构,一条条列清楚。长这样:
        </p>

        <CodeBlock
          lang="bash"
          title="openapi.yaml(节选)"
          code={`openapi: 3.2.0
info:
  title: 博客 API
  version: 1.0.0
paths:
  /posts:
    get:
      summary: 文章列表(支持分页与过滤)
      parameters:
        - name: page
          in: query
          schema: { type: integer }
      responses:
        "200":
          description: 一页文章`}
          note={
            <>
              现行版本 OpenAPI 3.2(2025 年 9 月发布)。经常听到的
              「Swagger」是它 3.0 之前的旧名,如今指一套工具品牌
              (Swagger UI、Swagger Editor)。
            </>
          }
        />

        <div className="grid-3">
          <div className="card">
            <div className="card-title">📖 生成文档</div>
            <p>
              Swagger UI 读这份 YAML,渲染出可以在线点「Try it out」
              的交互文档 —— 你在大厂开发者官网见过的那种。
            </p>
          </div>
          <div className="card">
            <div className="card-title">🧩 生成代码</div>
            <p>
              客户端 SDK、服务端骨架、TypeScript 类型,都能从定义直接生成 ——
              手写 fetch 拼字段的时代就此谢幕。
            </p>
          </div>
          <div className="card">
            <div className="card-title">🎭 生成 Mock</div>
            <p>
              后端还没写完?按定义起一个假服务器,前端先开工。
              前后端并行,靠的就是这纸契约。
            </p>
          </div>
        </div>

        <Callout tone="idea" title="顺带一句:Postman">
          <p>
            调 API 的行业标配工作台,能直接导入 OpenAPI 文件生成请求集合。
            它每年的《State of the API》报告也是行情风向标 —— 2025 年那份说:
            REST 使用率 93%,GraphQL 33%。谁是主流,数据说话。
          </p>
        </Callout>
      </Section>

      {/* ================= §08 动手任务 ================= */}
      <Section
        id="labs"
        index="08"
        title="动手任务"
        desc="GitHub 的公开 API 就是本章最好的练功房:分页、限流、ETag 全齐。"
      >
        <LabSet ch="rest-advanced" items={LABS} />
      </Section>

      {/* ================= §09 通关测验 ================= */}
      <Section
        id="quiz"
        index="09"
        title="通关测验"
        desc="八道题,把水电燃气逐一验收 —— 全对,这套房才算精装交付。"
      >
        <Quiz ch="rest-advanced" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            分页两条路:offset 数行号,简单但深翻页塌陷、插删错位;
            cursor 钉住记录、精确接续 —— 信息流一律 cursor。
          </>,
          <>
            <code>?status=</code> 过滤、<code>?sort=-created_at</code>{" "}
            倒序、<code>?fields=</code> 裁剪 ——
            query 参数是修饰语,资源才是主语,组合自由。
          </>,
          <>
            版本化的判断标准就一条:老客户端会不会坏。加字段随便加;
            删字段、改类型、改语义,必须升版本并让新旧共存。
          </>,
          <>
            ETag 协商缓存:第一次 200 + 指纹,以后带 If-None-Match 问,
            没变 304 空身子。GET + URL 天然是缓存键 —— REST 白捡的红利。
          </>,
          <>
            超时 ≠ 失败,而是「不知道」。幂等键让 POST 可以安全重试:
            同 key 只办一次,重试返回首次结果。
          </>,
          <>
            429 是服务器喊「慢点」:先看 Retry-After,
            没有就指数退避加抖动 —— 这是客户端的基本礼貌。
          </>,
          <>
            OpenAPI 是机器可读的菜单:文档、代码、Mock 都从一份定义生成,
            一处修改,处处同步。
          </>,
        ]}
      />

      <ChapterFooter ch="rest-advanced" />
    </main>
  );
}
