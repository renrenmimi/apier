"use client";

// 05 · REST in production(双语,英文默认):
// 分页 → 过滤/排序/裁剪 → 版本化 → 缓存 → 幂等与重试 → 限流 → OpenAPI →
// 动手任务 → 测验 → 要点。
// 第 04 章负责 URL 命名与状态码选择,这一章不重复;分页实现与缓存头在这里讲透。
// 文案一律走 <T en zh /> 或 Loc<…>,不要写 lang === "en" ? … : …。

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
import { T } from "@/lib/i18n";
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
        title={{
          en: (
            <>
              REST <span className="grad">in production</span>
            </>
          ),
          zh: (
            <>
              REST <span className="grad">进阶模式</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              Chapter 04 gave the blog API a working set of endpoints. This
              chapter adds what a real deployment needs: sending a long list in
              pieces, not sending the same body twice, changing the API without
              breaking old clients, and retrying a payment that timed out.
            </>
          ),
          zh: (
            <>
              第 04 章把博客 API 的端点定了下来,能跑了。这一章补上真实上线所需的部分:
              长列表怎么分批给、同一份正文怎么不发第二遍、接口怎么改才不砸老客户端、
              超时的付款还敢不敢重试。
            </>
          ),
        }}
        chips={[
          { id: "pagination", n: "01", label: { en: "Pagination", zh: "分页" } },
          {
            id: "query",
            n: "02",
            label: { en: "Filter, sort, select", zh: "过滤·排序·裁剪" },
          },
          { id: "versioning", n: "03", label: { en: "Versioning", zh: "版本化" } },
          { id: "caching", n: "04", label: { en: "Caching", zh: "缓存" } },
          {
            id: "idempotency",
            n: "05",
            label: { en: "Retrying safely", zh: "幂等与重试" },
          },
          {
            id: "ratelimit",
            n: "06",
            label: { en: "Rate limits", zh: "速率限制" },
          },
          { id: "openapi", n: "07", label: { en: "OpenAPI", zh: "OpenAPI" } },
          { id: "labs", n: "08", label: { en: "Practice", zh: "动手" } },
          { id: "quiz", n: "09", label: { en: "Quiz", zh: "测验" } },
        ]}
      >
        <HeroUtils />
      </Hero>

      {/* ================= §01 分页 ================= */}
      <Section
        id="pagination"
        index="01"
        title={{
          en: "Pagination: why a list is sent in pieces",
          zh: "分页:列表为什么要分批给",
        }}
        desc={{
          en: "Your blog did well and the posts table now holds a million rows. GET /posts cannot return all of them.",
          zh: "你的博客火了,文章表涨到一百万行。GET /posts 不可能原样全返回。",
        }}
      >
        <Callout
          tone="story"
          title={{
            en: "A library lends you twenty books, not the whole shelf",
            zh: "图书馆一次借你二十本,不是整个书库",
          }}
        >
          <p>
            <T
              en={
                <>
                  Returning a million rows in one response costs three parties
                  at once: the database reads and serializes everything, the
                  network carries megabytes, and the client has to hold it all
                  in memory. So every serious list endpoint uses{" "}
                  <b>pagination</b>: it returns a small slice, and the client
                  asks for the next one when it needs it.
                </>
              }
              zh={
                <>
                  一次返回一百万行,三方同时受损:数据库要把这些数据全部读出并序列化,
                  网络要搬走好几 MB,客户端还得把它们全塞进内存。
                  所以像样的列表接口都做<b>分页(pagination)</b>:
                  一次返回一小片,客户端需要时再要下一片。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  The interesting part is the word &ldquo;next&rdquo;. Where
                  exactly should the next slice start? There are two answers,
                  and they behave very differently: <b>offset</b> counts rows,
                  and a <b>cursor</b> points at the last record you received.
                </>
              }
              zh={
                <>
                  真正有意思的是「下一片」三个字:下一片<b>从哪里开始</b>?
                  两种答案,表现差别很大 —— <b>offset</b> 数行号,<b>cursor</b>
                  (游标)指向你收到的最后一条记录。
                </>
              }
            />
          </p>
        </Callout>

        <PagingStepper />

        <CodePair
          left={
            <CodeBlock
              lang="js"
              title={{ en: "offset · GitHub style", zh: "offset · GitHub 风格" }}
              code={{
                en: `// GET /repos?page=2&per_page=20
// "Skip the first 20 rows, return the next 20"
[
  { "id": 21, "name": "post-21" },
  { "id": 22, "name": "post-22" }
  // …20 items in total
]
// Where is the next page? In a response header:
// Link: <…page=3>; rel="next"`,
                zh: `// GET /repos?page=2&per_page=20
// 「跳过前 20 行,再给 20 行」
[
  { "id": 21, "name": "post-21" },
  { "id": 22, "name": "post-22" }
  // …共 20 条
]
// 下一页在哪?在一个响应头里:
// Link: <…page=3>; rel="next"`,
              }}
              note={{
                en: (
                  <>
                    Simple, and it can jump: page 8 is one request away. Good
                    for admin tables where the data changes slowly and nobody
                    scrolls far.
                  </>
                ),
                zh: (
                  <>
                    简单,而且能跳页:一条请求就到第 8 页。
                    适合数据变化慢、也不会翻很深的后台列表。
                  </>
                ),
              }}
            />
          }
          right={
            <CodeBlock
              lang="js"
              title={{ en: "cursor · Stripe style", zh: "cursor · Stripe 风格" }}
              code={{
                en: `// GET /charges?limit=20
//     &starting_after=ch_3XkV
// "Continue after the record ch_3XkV"
{
  "data": [ /* 20 items */ ],
  "has_more": true
}
// The cursor is the id of the last item
// on this page; send it back unchanged`,
                zh: `// GET /charges?limit=20
//     &starting_after=ch_3XkV
// 「从 ch_3XkV 这条记录之后接着给」
{
  "data": [ /* 20 条 */ ],
  "has_more": true
}
// 游标就是本页最后一条的 id,
// 下一页原样带回去即可`,
              }}
              note={{
                en: (
                  <>
                    No page numbers, so you cannot jump. In exchange, deep pages
                    stay fast and inserts or deletions do not shift the window.
                    This is the usual choice for feeds and infinite scrolling.
                  </>
                ),
                zh: (
                  <>
                    没有页码,所以不能跳页。换来的是:翻得再深也不变慢,
                    插入或删除也不会让窗口错位 ——
                    信息流和无限滚动通常都选它。
                  </>
                ),
              }}
            />
          }
        />

        <Callout
          tone="warn"
          title={{
            en: "The two costs of offset pagination",
            zh: "offset 分页的两个代价",
          }}
        >
          <p>
            <T
              en={
                <>
                  First, <b>deep pages get slow</b>. Skipping N rows still means
                  walking over N rows, so the cost grows with the page number.
                  Second, <b>the window moves</b>. If rows are inserted or
                  deleted before the reader asks for the next page, the
                  positions shift: an insert makes one item appear twice, and a
                  delete makes one item disappear without ever being shown.
                  Chapter 04 mentioned this trade-off; the stepper above is
                  where you can watch it happen.
                </>
              }
              zh={
                <>
                  第一,<b>深翻页变慢</b>:「跳过 N 行」也得逐行走过 N 行,
                  代价随页码增长。第二,<b>窗口会滑动</b>:
                  读者还没要下一页,前面就有行被插入或删除,位置整体挪动 ——
                  插入会让某一条重复出现,删除会让某一条从头到尾都不出现。
                  第 04 章提过这个取舍,上面的逐帧图就是它发生的样子。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Cursor pagination is not free either. There is no page number
                  and no total count you can rely on, and the sort order has to
                  be stable: sort by a unique column, or add the id as a
                  tiebreaker, otherwise two records with the same timestamp can
                  still be skipped or repeated.
                </>
              }
              zh={
                <>
                  游标分页也不是没有代价:没有页码,也没有可靠的总数;
                  而且排序必须稳定 —— 要么按唯一列排序,要么把 id
                  作为第二排序键,否则两条时间戳相同的记录照样可能重复或漏掉。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §02 过滤·排序·裁剪 ================= */}
      <Section
        id="query"
        index="02"
        title={{
          en: "Filtering, sorting, and choosing fields",
          zh: "过滤、排序、字段裁剪",
        }}
        desc={{
          en: "The path says which resource. Query parameters say how you want it. Here is one long URL, taken apart one piece at a time.",
          zh: "路径说明要哪个资源,查询参数说明你想怎么要它 —— 一条长 URL,逐段拆开看。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                Pagination alone is not enough. A client may want only published
                posts, in newest-first order, with just a few fields so the
                response stays small on a phone. All of that goes after the{" "}
                <code>?</code>, and the resource itself does not change. Click
                each part of the URL below.
              </>
            }
            zh={
              <>
                光有分页还不够:客户端可能只想要已发布的文章、按最新排序,
                并且只带少数几个字段,好让手机上的响应小一点。
                这些需求全都挂在 <code>?</code> 后面,资源本身不变。
                点下面这条 URL 的每一段:
              </>
            }
          />
        </p>

        <UrlDissect />

        <Callout
          tone="idea"
          title={{
            en: "Why parameters instead of one endpoint per view?",
            zh: "为什么用参数,而不是每个视图开一个端点?",
          }}
        >
          <p>
            <T
              en={
                <>
                  &ldquo;Published posts&rdquo;, &ldquo;newest posts&rdquo;, and
                  &ldquo;posts with only a title&rdquo; are the same collection
                  seen in different ways. If each view gets its own endpoint, the
                  count multiplies: published, newest, published and newest,
                  published and newest with only a title, and so on. Parameters
                  combine, so five of them cover every combination without
                  adding a single endpoint.
                </>
              }
              zh={
                <>
                  「已发布的文章」「最新的文章」「只带标题的文章」
                  本来就是同一个集合的不同看法。
                  如果每种看法都开一个端点,数量会成倍增长:已发布、最新、
                  已发布且最新、已发布且最新且只带标题……
                  参数则可以自由组合,五个参数就覆盖了所有组合,一个端点都不用加。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 版本化 ================= */}
      <Section
        id="versioning"
        index="03"
        title={{
          en: "Versioning: changing an API that already has users",
          zh: "版本化:改一个已经有用户的 API",
        }}
        desc={{
          en: "Once an API has clients, every change you make is a change they did not ask for.",
          zh: "API 一旦有了客户端,你做的每一次改动,对他们都是没打招呼的改动。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                Suppose you rename the response field <code>author</code> to{" "}
                <code>writer</code>. Every app already installed on a phone
                still reads <code>author</code>, and starts showing an empty
                name. An API is a contract. You can change it, but the old and
                the new form have to exist side by side long enough for clients
                to move. Three ways are used to say which form you want:
              </>
            }
            zh={
              <>
                假设你把响应里的 <code>author</code> 字段改名成{" "}
                <code>writer</code>。已经装在用户手机上的 App 仍然读{" "}
                <code>author</code>,于是作者名变成了空白。
                API 是一份契约:可以改,但新旧两种形态必须并存足够久,
                让客户端有时间迁移。「你要哪一种」有三种表达方式:
              </>
            }
          />
        </p>

        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Strategy" zh="策略" />
                </th>
                <th>
                  <T en="What it looks like" zh="长相" />
                </th>
                <th>
                  <T en="Used by" zh="代表" />
                </th>
                <th>
                  <T en="Trade-off" zh="取舍" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>
                    <T en="Version in the URL" zh="URL 版本" />
                  </b>
                </td>
                <td>
                  <code>/v1/posts</code>
                </td>
                <td>
                  <T
                    en={
                      <>
                        Most public APIs; Twilio uses a date:{" "}
                        <code>/2010-04-01/</code>
                      </>
                    }
                    zh={
                      <>
                        绝大多数公开 API;Twilio 用日期:
                        <code>/2010-04-01/</code>
                      </>
                    }
                  />
                </td>
                <td>
                  <T
                    en="Easy to see, easy to test in a browser, easy to route and cache. The objection is that the same resource now has a different URL in each version."
                    zh="一眼看得见,浏览器里就能试,路由和缓存也好处理。反对意见是:同一个资源在每个版本里有了不同的 URL。"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Version in a header" zh="自定义 Header" />
                  </b>
                </td>
                <td>
                  <code>X-GitHub-Api-Version: 2022-11-28</code>
                </td>
                <td>
                  <T
                    en={
                      <>
                        GitHub (dated versions); Stripe (
                        <code>Stripe-Version</code>)
                      </>
                    }
                    zh={
                      <>
                        GitHub(日期命名);Stripe(
                        <code>Stripe-Version</code>)
                      </>
                    }
                  />
                </td>
                <td>
                  <T
                    en="The URL stays the same for every version. In exchange you cannot try it from the address bar, and any shared cache must be told to vary on that header or it will serve one version to everybody."
                    zh="URL 在所有版本里保持一致。代价是地址栏里试不出来,而且共享缓存必须按这个头区分,否则会把一个版本发给所有人。"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Version in the media type" zh="Media type" />
                  </b>
                </td>
                <td>
                  <code>Accept: application/vnd.github.v3+json</code>
                </td>
                <td>
                  <T en="GitHub, previously" zh="GitHub 旧法" />
                </td>
                <td>
                  <T
                    en="The closest fit to how HTTP is defined: the version belongs to the representation, not to the resource. It is also the hardest to use, because clients and tools have to set Accept correctly every time."
                    zh="最贴合 HTTP 本身的定义:版本属于「表述」,不属于资源。也最难用 —— 客户端和工具每次都得把 Accept 设对。"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout
          tone="idea"
          title={{
            en: "No option is clearly best; the cheapest version is the one you never ship",
            zh: "没有哪种明显更好;最省事的版本是你根本不用发的那个",
          }}
        >
          <p>
            <T
              en={
                <>
                  All three work. URL versioning is the most common because it
                  is the easiest to read, test, and explain. Header versioning
                  keeps URLs stable. Media-type versioning matches the
                  specification most closely. Pick one, apply it consistently,
                  and write down how long an old version will keep working.
                </>
              }
              zh={
                <>
                  三种都能用。URL 版本最常见,因为最好读、最好试、也最好解释;
                  Header 版本让 URL 保持稳定;media type 版本最贴近规范。
                  选定一种,统一用下去,并且写清楚旧版本还能用多久。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  The advice given most often, though, is not about which
                  strategy to pick: <b>avoid breaking changes instead of
                  versioning often</b>. Every version you keep alive is another
                  code path to test, document, and fix. Adding optional fields
                  and new endpoints costs nothing and needs no new version.
                </>
              }
              zh={
                <>
                  不过最常见的建议并不在于选哪一种,而是:
                  <b>尽量不做破坏性变更,而不是频繁升版本</b>。
                  多留一个版本,就多一条要测试、要写文档、要修 bug 的代码路径。
                  加可选字段、加新端点,成本几乎为零,也不需要新版本。
                </>
              }
            />
          </p>
        </Callout>

        <Callout
          tone="story"
          title={{
            en: "How GitHub changed its mind",
            zh: "GitHub 换过一次做法",
          }}
        >
          <p>
            <T
              en={
                <>
                  GitHub used media-type versioning for years (
                  <code>vnd.github.v3+json</code>). It fits the specification
                  well, but users forgot the header and tools set it wrongly, so
                  it was expensive to support. In 2022 GitHub moved to a dated
                  request header, <code>X-GitHub-Api-Version: 2022-11-28</code>,
                  and stated that each version stays supported for at least 24
                  months. The neater design lost to the one that was easier to
                  use correctly.
                </>
              }
              zh={
                <>
                  GitHub 早年用 media type 版本(<code>vnd.github.v3+json</code>
                  )。这种做法很贴合规范,但用户会忘了带这个头,
                  工具也常设错,支持成本很高。2022 年它改用日期命名的请求头{" "}
                  <code>X-GitHub-Api-Version: 2022-11-28</code>
                  ,并声明每个版本至少支持 24 个月。
                  更工整的设计,输给了更容易用对的设计。
                </>
              }
            />
          </p>
        </Callout>

        <div className="grid-2">
          <div className="card">
            <div className="card-kicker" style={{ color: "var(--risk)" }}>
              <T
                en="Breaking · needs a new version"
                zh="破坏性 · 必须升版本"
              />
            </div>
            <div className="card-title">
              <T en="Old clients stop working" zh="老客户端会坏" />
            </div>
            <p>
              <T
                en={
                  <>
                    Removing a field (the value becomes undefined), changing its
                    type (parsing fails), changing what it means (the data is
                    quietly wrong, which is the worst case), or changing what a
                    URL or a status code stands for.
                  </>
                }
                zh={
                  <>
                    删字段(取值变成 undefined)、改字段类型(解析失败)、
                    改字段含义(数据悄悄错掉,最难发现)、
                    改 URL 或状态码的含义。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker" style={{ color: "var(--ok)" }}>
              <T en="Safe · ship it" zh="非破坏性 · 随时可发" />
            </div>
            <div className="card-title">
              <T en="Old clients do not notice" zh="老客户端无感" />
            </div>
            <p>
              <T
                en={
                  <>
                    Adding an optional response field, adding an endpoint, or
                    adding an optional query parameter. A client that does not
                    know a JSON key simply ignores it. This is why an API lasts
                    longer when it only adds.
                  </>
                }
                zh={
                  <>
                    加可选的响应字段、加新端点、加可选的查询参数。
                    客户端遇到不认识的 JSON 键会直接忽略 ——
                    所以「只加,不改不删」的 API 活得最久。
                  </>
                }
              />
            </p>
          </div>
        </div>
      </Section>

      {/* ================= §04 缓存 ================= */}
      <Section
        id="caching"
        index="04"
        title={{
          en: "Caching: do not send the same body twice",
          zh: "缓存:同一份正文不发两遍",
        }}
        desc={{
          en: "The fastest request is the one the client never sends. The second fastest is answered with headers only.",
          zh: "最快的请求是根本不用发的那个;第二快的,只用头部就答完了。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                A cache is a stored copy of a response. Two separate questions
                decide what it can do with that copy. <b>Freshness</b>: may the
                copy be reused right now without contacting the server?{" "}
                <b>Validation</b>: if it may not, has the resource actually
                changed? <code>Cache-Control</code> answers the first question.
                Validators such as <code>ETag</code> answer the second.
              </>
            }
            zh={
              <>
                缓存就是一份存下来的响应副本。它能拿这份副本做什么,取决于两个独立的问题。
                <b>新鲜度</b>:现在能不能不联系服务器,直接复用这份副本?
                <b>校验</b>:如果不能,资源到底变了没有?
                <code>Cache-Control</code> 回答第一个问题,<code>ETag</code>{" "}
                这类校验值回答第二个。
              </>
            }
          />
        </p>

        <CodeBlock
          lang="http"
          title={{
            en: "Cache-Control · how long the copy stays fresh",
            zh: "Cache-Control · 副本能新鲜多久",
          }}
          hl={[2]}
          code={`HTTP/1.1 200 OK
Cache-Control: private, max-age=3600
Content-Type: application/json
ETag: "abc"

{ "name": "Ada Lovelace" }`}
          note={{
            en: (
              <>
                <code>max-age=3600</code>: for the next hour a client may reuse
                this copy without sending a request at all.{" "}
                <code>private</code> restricts that to the browser that asked
                for it. <code>Cache-Control</code> is the modern control;{" "}
                <code>Expires</code> is the older header that does the same job
                with an absolute date, and <code>Cache-Control</code> wins when
                both are present.
              </>
            ),
            zh: (
              <>
                <code>max-age=3600</code>:接下来一小时里,客户端可以直接复用这份副本,
                连请求都不用发。<code>private</code>{" "}
                把这个许可限制在发起请求的那个浏览器里。
                <code>Cache-Control</code> 是现在的控制方式;
                <code>Expires</code> 是更早的头,用一个绝对时间做同一件事,
                两者同时存在时以 <code>Cache-Control</code> 为准。
              </>
            ),
          }}
        />

        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Directive" zh="指令" />
                </th>
                <th>
                  <T en="What it tells a cache" zh="它对缓存的要求" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>max-age=3600</code>
                </td>
                <td>
                  <T
                    en="Reuse this response for 3600 seconds without asking the server."
                    zh="3600 秒内可以直接复用这份响应,不必问服务器。"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <code>no-cache</code>
                </td>
                <td>
                  <T
                    en="Store it, but revalidate with the server before every reuse."
                    zh="可以存,但每次复用前都要先向服务器校验一次。"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <code>no-store</code>
                </td>
                <td>
                  <T
                    en="Do not keep a copy at all. This is the one for private data."
                    zh="根本不要留副本。涉及隐私数据时用的是这一个。"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <code>private</code>
                </td>
                <td>
                  <T
                    en="Only the browser that made the request may store it. A shared cache must not."
                    zh="只有发起请求的那个浏览器可以存,共享缓存不许存。"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <code>public</code>
                </td>
                <td>
                  <T
                    en="A shared cache may store it, even when the request carried an Authorization header."
                    zh="共享缓存可以存,即使请求带了 Authorization 头也可以。"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <code>must-revalidate</code>
                </td>
                <td>
                  <T
                    en="Once max-age has passed, do not serve the copy anyway; revalidate first."
                    zh="max-age 一过就不许再将就着用,必须先校验。"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout
          tone="warn"
          title={{
            en: "no-cache does not mean do not store",
            zh: "no-cache 不是「不要存」",
          }}
        >
          <p>
            <T
              en={
                <>
                  This is the pair people get wrong most often.{" "}
                  <code>no-cache</code> means <b>store the response, but check
                  with the server before using it again</b>. If nothing changed,
                  that check costs one small request and no body.{" "}
                  <code>no-store</code> means <b>do not write it anywhere</b> —
                  not to memory, not to disk. Use <code>no-store</code> for bank
                  statements and password reset pages. Use{" "}
                  <code>no-cache</code> when the data may be reused but must
                  never be shown stale.
                </>
              }
              zh={
                <>
                  这是最容易记反的一对。<code>no-cache</code> 的意思是
                  <b>存下来,但下次使用前必须先问服务器</b> ——
                  如果没变,这次询问只花一个小请求,不传正文。
                  <code>no-store</code> 的意思是<b>哪里都不要写</b>:
                  不写内存,也不写磁盘。账单、重置密码页面用{" "}
                  <code>no-store</code>;数据可以复用、但绝不能显示过期内容时,
                  用 <code>no-cache</code>。
                </>
              }
            />
          </p>
        </Callout>

        <p className="sec-desc">
          <T
            en={
              <>
                When a copy is no longer fresh, the client does not have to
                download it again. It can ask a conditional question:{" "}
                <b>I have this version — has it changed?</b> If the answer is
                no, the server replies <Status code={304} text="Not Modified" />{" "}
                and sends no body. Watch the six steps:
              </>
            }
            zh={
              <>
                副本不新鲜了,并不意味着必须重新下载。客户端可以问一个条件式的问题:
                <b>我手上是这个版本,它变了吗?</b>如果没变,服务器就回一个{" "}
                <Status code={304} text="Not Modified" />,不带正文。
                六步看一遍:
              </>
            }
          />
        </p>

        <EtagFlow />

        <div className="grid-2">
          <div className="card">
            <div className="card-title">
              <code>ETag</code> + <code>If-None-Match</code>
            </div>
            <p>
              <T
                en={
                  <>
                    The server sends an opaque identifier for the current
                    version. The client sends it back in{" "}
                    <code>If-None-Match</code>. A tag written{" "}
                    <code>W/&quot;abc&quot;</code> is <b>weak</b>: it promises
                    the content is equivalent, not byte for byte identical. A
                    weak tag is enough to answer 304, but it cannot be used to
                    request a byte range, because a range needs an exact match.
                  </>
                }
                zh={
                  <>
                    服务器给出当前版本的一个不透明标识,客户端把它放进{" "}
                    <code>If-None-Match</code> 送回来。写成{" "}
                    <code>W/&quot;abc&quot;</code> 的是<b>弱校验值</b>:
                    它只保证内容等价,不保证逐字节相同。
                    弱校验值足以判断能否回 304,但不能用于请求字节范围 ——
                    范围请求需要精确匹配。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">
              <code>Last-Modified</code> + <code>If-Modified-Since</code>
            </div>
            <p>
              <T
                en={
                  <>
                    The older pair, based on a timestamp. It is simpler, but its
                    resolution is one second, so two changes within the same
                    second look identical. Prefer <code>ETag</code> when the
                    server can compute one; send both if you like, and the
                    client will use <code>If-None-Match</code> first.
                  </>
                }
                zh={
                  <>
                    更早的一对,基于时间戳。它更简单,但精度只到秒,
                    同一秒内的两次修改看起来完全一样。
                    服务器能算出 <code>ETag</code> 时优先用 ETag;
                    两个一起发也可以,客户端会优先使用{" "}
                    <code>If-None-Match</code>。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <Callout
          tone="deep"
          title={{
            en: "Private cache, shared cache, and Vary",
            zh: "私有缓存、共享缓存,以及 Vary",
          }}
        >
          <p>
            <T
              en={
                <>
                  A <b>private cache</b> belongs to one user: the cache inside a
                  browser. A <b>shared cache</b> serves many users: a CDN node
                  or a company proxy. That is why the <code>private</code>{" "}
                  directive exists. A response containing one user&apos;s
                  profile must not sit in a CDN where the next visitor could be
                  handed it.
                </>
              }
              zh={
                <>
                  <b>私有缓存</b>只服务一个用户,比如浏览器自己的缓存;
                  <b>共享缓存</b>服务很多用户,比如 CDN 节点或公司代理。
                  <code>private</code> 指令存在的原因就在这里:
                  装着某个用户资料的响应,不能留在 CDN 上,
                  否则下一个访客可能会拿到它。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  When the response depends on a request header, say so with{" "}
                  <code>Vary</code>. A response compressed because the request
                  said <code>Accept-Encoding: gzip</code> needs{" "}
                  <code>Vary: Accept-Encoding</code>; a cache that ignores it
                  can hand a gzip body to a client that cannot decompress it.
                  The same applies to a version header: without{" "}
                  <code>Vary</code>, one client&apos;s version is served to
                  everyone. Note that <code>Vary</code> also multiplies the
                  stored copies, so listing many headers lowers the hit rate.
                </>
              }
              zh={
                <>
                  如果响应取决于某个请求头,就用 <code>Vary</code> 说明。
                  因为请求带了 <code>Accept-Encoding: gzip</code>{" "}
                  而压缩过的响应,需要 <code>Vary: Accept-Encoding</code>;
                  忽略它的缓存可能把 gzip 正文发给一个解不了压的客户端。
                  版本头同理:没有 <code>Vary</code>
                  ,一个客户端的版本会被发给所有人。
                  同时也要知道 <code>Vary</code> 会让副本成倍增加 ——
                  列的头越多,命中率越低。
                </>
              }
            />
          </p>
        </Callout>

        <Callout
          tone="idea"
          title={{
            en: "REST gets most of this from HTTP itself",
            zh: "这部分能力,REST 是从 HTTP 直接继承来的",
          }}
        >
          <p>
            <T
              en={
                <>
                  A <Method m="GET" /> and its URL already identify what is
                  being asked for, so the URL works as a cache key. Every device
                  along the path — the browser, a proxy, a CDN — understands the
                  same rules, and none of them need to know anything about your
                  application. Chapter 10 shows the other side of this: GraphQL
                  usually sends every operation as a <Method m="POST" /> to a
                  single endpoint, so HTTP caches cannot tell two different
                  queries apart and the caching has to be rebuilt at the
                  application layer.
                </>
              }
              zh={
                <>
                  一次 <Method m="GET" /> 加它的 URL
                  已经完整说明了要什么,所以 URL 天然就是缓存键。
                  路径上的每一环 —— 浏览器、代理、CDN ——
                  都懂同一套规则,而且都不需要了解你的应用。
                  第 10 章会看到另一面:GraphQL 通常把所有操作都用{" "}
                  <Method m="POST" /> 发到同一个端点,
                  HTTP 缓存分不清两个不同的查询,缓存只能在应用层重新做一遍。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §05 幂等与重试 ================= */}
      <Section
        id="idempotency"
        index="05"
        title={{
          en: "Retrying safely: what to do after a timeout",
          zh: "安全重试:超时之后该怎么办",
        }}
        desc={{
          en: "The payment button has been spinning for ten seconds and nothing came back. Retry or not?",
          zh: "支付按钮转了十秒,什么都没回来。重试,还是不重试?",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                From chapter 01: an operation is <b>idempotent</b> when running
                it once and running it many times leave the server in the same
                state. <Method m="GET" />, <Method m="PUT" /> and{" "}
                <Method m="DELETE" /> are defined that way, so a client may
                repeat them after a timeout. <Method m="POST" /> is not — and a
                payment is a POST. Watch what goes wrong, and the header that
                fixes it:
              </>
            }
            zh={
              <>
                回顾第 01 章:一个操作是<b>幂等(idempotent)</b>的,
                指执行一次和执行多次之后,服务器状态相同。
                <Method m="GET" />、<Method m="PUT" />、<Method m="DELETE" />{" "}
                在定义上就是幂等的,所以超时后客户端可以放心重发。
                <Method m="POST" /> 不是 —— 而支付恰恰是 POST。
                看看会出什么事,以及哪个请求头能解决它:
              </>
            }
          />
        </p>

        <IdemFlow />

        <CodeBlock
          lang="http"
          title={{
            en: "A payment request with an idempotency key",
            zh: "带幂等键的支付请求",
          }}
          hl={[3]}
          code={`POST /v1/payments HTTP/1.1
Content-Type: application/json
Idempotency-Key: 8e03978e-40d5-43e8-bc93-6894a57f9324

{ "amount": 9900, "currency": "usd" }`}
          note={{
            en: (
              <>
                The client generates the key, one per operation — a UUID is
                fine — and reuses exactly the same value on every retry of that
                operation. The server stores the key with the response it
                produced and returns that stored response if the key comes back.
                Stripe keeps a key for 24 hours. The IETF has a draft for this
                header field; as of mid-2026 it is still a draft, not a
                published standard, so read each API&apos;s own documentation.
              </>
            ),
            zh: (
              <>
                键由客户端生成,一次操作一个(UUID 就够),
                重试这次操作时必须原样复用同一个值。
                服务器把键和它产生的响应一起存起来,
                下次同一个键再来就返回存下的那份响应。Stripe 的键保留 24 小时。
                IETF 有一份关于这个头的草案,截至 2026 年中仍是草案,
                不是已发布的标准,所以具体行为要看各 API 自己的文档。
              </>
            ),
          }}
        />

        <Callout
          tone="deep"
          title={{
            en: "If a second DELETE returns 404, how is DELETE idempotent?",
            zh: "DELETE 第二次返回 404,怎么还算幂等?",
          }}
        >
          <p>
            <T
              en={
                <>
                  Idempotency is about the <b>state of the server</b>, not about
                  the status code. Delete once and the resource is gone. Delete
                  again and it is still gone — the second request changes
                  nothing, which is exactly what idempotent means. Going from{" "}
                  <Status code={204} /> to <Status code={404} /> changes what
                  the server says, not what it did.
                </>
              }
              zh={
                <>
                  幂等说的是<b>服务器的状态</b>,不是状态码。
                  删一次,资源没了;再删一次,资源还是没了 ——
                  第二次请求什么都没改变,这正是幂等的含义。
                  从 <Status code={204} /> 变成 <Status code={404} />
                  ,变的是服务器怎么说,不是它做了什么。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 速率限制 ================= */}
      <Section
        id="ratelimit"
        index="06"
        title={{
          en: "Rate limiting: refusing work on purpose",
          zh: "速率限制:有意识地拒绝请求",
        }}
        desc={{
          en: "A public API has to survive clients that ask too often, whether on purpose or by accident.",
          zh: "公开 API 必须扛得住请求过于频繁的客户端 —— 不管是有意的还是写错了。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                <b>Rate limiting</b> caps how many requests one client may send
                in a period of time. Over the cap, the server answers{" "}
                <Status code={429} text="Too Many Requests" /> instead of doing
                the work, and states the rules in response headers. GitHub looks
                like this:
              </>
            }
            zh={
              <>
                <b>速率限制(rate limiting)</b>
                给单个客户端在一段时间内能发的请求数设一个上限。
                超过上限,服务器不再干活,而是回一个{" "}
                <Status code={429} text="Too Many Requests" />
                ,并在响应头里把规则说清楚。GitHub 长这样:
              </>
            }
          />
        </p>

        <CodeBlock
          lang="http"
          title={{
            en: "The response when you hit the limit",
            zh: "撞上限流时的响应",
          }}
          hl={[2, 4]}
          code={`HTTP/1.1 429 Too Many Requests
Retry-After: 42
x-ratelimit-limit: 60
x-ratelimit-remaining: 0
x-ratelimit-reset: 1794816042

{ "message": "API rate limit exceeded" }`}
          note={{
            en: (
              <>
                <code>Retry-After</code> is the standard field: wait at least 42
                seconds. It may also carry an HTTP date instead of a number of
                seconds, so parse both. The <code>x-ratelimit-*</code> fields
                are GitHub&apos;s own convention — the quota, how much is left,
                and when it resets as a Unix time in seconds. GitHub allows 60
                requests per hour without a token. A standard{" "}
                <code>RateLimit-*</code> set is being written at the IETF, but
                it is still a draft and not ratified, so do not rely on it.
              </>
            ),
            zh: (
              <>
                <code>Retry-After</code> 是标准字段:至少等 42 秒再来。
                它也可以写成 HTTP 日期而不是秒数,两种都要能解析。
                <code>x-ratelimit-*</code> 三个是 GitHub 自己的约定:
                总配额、还剩多少、什么时候重置(Unix 秒)。
                GitHub 不带 token 时是每小时 60 次。IETF 正在制定统一的{" "}
                <code>RateLimit-*</code> 字段,但它仍处于草案阶段、尚未定案,
                不要依赖它。
              </>
            ),
          }}
        />

        <p className="sec-desc">
          <T
            en={
              <>
                The client has a part to play too. Retrying immediately after a
                429 only adds load. Use <b>exponential backoff</b>: double the
                waiting time after each failure. Add a small random amount,
                called <b>jitter</b>, so that many clients that failed at the
                same moment do not all come back at the same moment.
              </>
            }
            zh={
              <>
                客户端这边也有责任。收到 429 就立刻重试,只会让负载更重。
                要用<b>指数退避(exponential backoff)</b>:每失败一次,
                等待时间翻倍;再加一点随机量,叫<b>抖动(jitter)</b>,
                免得同一刻失败的大量客户端又在同一刻一起回来。
              </>
            }
          />
        </p>

        <CodeBlock
          lang="js"
          title={{
            en: "A fetch wrapper with backoff",
            zh: "带退避的 fetch 封装",
          }}
          hl={[11, 12]}
          code={{
            en: `async function fetchWithRetry(url, tries = 5) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url);
    // Only 429 and 5xx are worth retrying; a 404 stays a 404
    if (res.status !== 429 && res.status < 500) return res;
    // Last attempt failed too: return it instead of waiting again
    if (i === tries - 1) return res;

    // Follow Retry-After when it gives seconds. It may also be an
    // HTTP date, so fall back to backoff — setTimeout(NaN) would
    // fire immediately and retry with no wait at all
    const secs = Number(res.headers.get("Retry-After"));
    const base = secs > 0 ? secs * 1000 : 500 * 2 ** i;
    const wait = base + Math.random() * 300; // jitter
    await new Promise((ok) => setTimeout(ok, wait));
  }
}`,
            zh: `async function fetchWithRetry(url, tries = 5) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url);
    // 只有 429 和 5xx 值得重试;404 重试一万次还是 404
    if (res.status !== 429 && res.status < 500) return res;
    // 最后一次也失败了:直接把响应交给调用方,别再白等一轮
    if (i === tries - 1) return res;

    // Retry-After 给了秒数就照做。它也可能是 HTTP 日期,
    // 取不到秒数就退回指数退避 —— 否则 setTimeout(NaN)
    // 会立刻触发,等于没等就重试
    const secs = Number(res.headers.get("Retry-After"));
    const base = secs > 0 ? secs * 1000 : 500 * 2 ** i;
    const wait = base + Math.random() * 300; // 抖动
    await new Promise((ok) => setTimeout(ok, wait));
  }
}`,
          }}
          note={{
            en: (
              <>
                Without a <code>Retry-After</code>, the waits are roughly 0.5s,
                1s, 2s, and 4s across five attempts, each with a random extra.
                Line 5 is the important one: <b>retry only what is worth
                retrying</b>. Backing off from a 400 or a 404 wastes the
                client&apos;s time and does not change the answer.
              </>
            ),
            zh: (
              <>
                没有 <code>Retry-After</code> 时,五次尝试之间的等待大约是
                0.5s、1s、2s、4s,每次再加一点随机量。
                关键是第 5 行:<b>只重试值得重试的</b>。
                对 400 或 404 做退避,只是浪费客户端的时间,答案不会改变。
              </>
            ),
          }}
        />
      </Section>

      {/* ================= §07 OpenAPI ================= */}
      <Section
        id="openapi"
        index="07"
        title={{
          en: "OpenAPI: the description machines can read",
          zh: "OpenAPI:机器能读的接口定义",
        }}
        desc={{
          en: "Hand-written documentation goes out of date. A definition that generates the documentation does not.",
          zh: "手写的文档会过时;能生成文档的那份定义不会。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                Chapter 04 ended with a table of endpoints — method, path,
                status codes. <b>OpenAPI</b> is that table written in YAML or
                JSON in a format tools understand: which endpoints exist, which
                parameters they take, and what the responses look like.
              </>
            }
            zh={
              <>
                第 04 章最后交出了一张端点总表:方法、路径、状态码。
                <b>OpenAPI</b> 就是把这张表写成工具能读懂的 YAML 或 JSON:
                有哪些端点、收什么参数、返回什么结构。
              </>
            }
          />
        </p>

        <CodeBlock
          lang="bash"
          title={{ en: "openapi.yaml (extract)", zh: "openapi.yaml(节选)" }}
          code={{
            en: `openapi: 3.2.0
info:
  title: Blog API
  version: 1.0.0
paths:
  /posts:
    get:
      summary: List posts, with pagination and filtering
      parameters:
        - name: page
          in: query
          schema: { type: integer }
      responses:
        "200":
          description: One page of posts`,
            zh: `openapi: 3.2.0
info:
  title: Blog API
  version: 1.0.0
paths:
  /posts:
    get:
      summary: 文章列表,支持分页与过滤
      parameters:
        - name: page
          in: query
          schema: { type: integer }
      responses:
        "200":
          description: 一页文章`,
          }}
          note={{
            en: (
              <>
                The current version is OpenAPI 3.2, released in September 2025.
                &ldquo;Swagger&rdquo; was the name of the specification before
                3.0; today it refers to a set of tools built on OpenAPI, such as
                Swagger UI and Swagger Editor.
              </>
            ),
            zh: (
              <>
                现行版本是 OpenAPI 3.2(2025 年 9 月发布)。
                「Swagger」是 3.0 之前这份规范的旧名,如今指的是基于 OpenAPI
                的一套工具,比如 Swagger UI 和 Swagger Editor。
              </>
            ),
          }}
        />

        <div className="grid-3">
          <div className="card">
            <div className="card-title">
              <T en="Generated documentation" zh="生成文档" />
            </div>
            <p>
              <T
                en={
                  <>
                    Swagger UI reads the file and renders a documentation page
                    with a working &ldquo;Try it out&rdquo; button. Most large
                    API portals are built this way.
                  </>
                }
                zh={
                  <>
                    Swagger UI 读这份文件,渲染出带「Try it out」按钮的文档页 ——
                    大厂的开发者站点大多是这么来的。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">
              <T en="Generated code" zh="生成代码" />
            </div>
            <p>
              <T
                en={
                  <>
                    Client SDKs, server stubs, and TypeScript types can all be
                    generated from the definition, so the field names in your
                    code match the API by construction.
                  </>
                }
                zh={
                  <>
                    客户端 SDK、服务端骨架、TypeScript 类型都能从定义生成,
                    代码里的字段名因此天然和 API 对得上。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">
              <T en="Generated mock server" zh="生成 Mock 服务" />
            </div>
            <p>
              <T
                en={
                  <>
                    The backend is not finished yet? Start a mock server from
                    the definition and let the frontend build against it. Both
                    sides work in parallel against the same contract.
                  </>
                }
                zh={
                  <>
                    后端还没写完?按定义起一个 mock 服务,前端先照着开发。
                    两边并行,依据的是同一份契约。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <Callout tone="idea" title={{ en: "Postman", zh: "顺带一句:Postman" }}>
          <p>
            <T
              en={
                <>
                  Postman is the tool most teams use to send API requests by
                  hand, and it can import an OpenAPI file and turn it into a
                  collection of ready-made requests. Its yearly State of the API
                  report is a useful snapshot of what people actually use: in
                  the 2025 report, 93% of respondents worked with REST and 33%
                  with GraphQL.
                </>
              }
              zh={
                <>
                  Postman 是大多数团队手动发 API 请求时用的工具,
                  它可以导入 OpenAPI 文件,直接生成一整套现成的请求。
                  它每年的《State of the API》报告可以看看行业实际在用什么:
                  2025 年那份里,93% 的受访者在用 REST,33% 在用 GraphQL。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §08 动手任务 ================= */}
      <Section
        id="labs"
        index="08"
        title={{ en: "Practice", zh: "动手任务" }}
        desc={{
          en: "The public GitHub API is the best place to practice this chapter: pagination, rate limits, and ETags are all live on it.",
          zh: "GitHub 的公开 API 是这一章最好的练手对象:分页、限流、ETag 都是现成的。",
        }}
      >
        <LabSet ch="rest-advanced" items={LABS} />
      </Section>

      {/* ================= §09 通关测验 ================= */}
      <Section
        id="quiz"
        index="09"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Nine questions covering pagination, versioning, caching, retries, and rate limits.",
          zh: "九道题,覆盖分页、版本化、缓存、重试与限流。",
        }}
      >
        <Quiz ch="rest-advanced" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                Two ways to paginate. Offset counts rows: simple and able to
                jump to a page, but slow when the page number is large and
                unstable when rows are inserted or deleted. A cursor points at
                the last record you received: stable and fast at any depth, but
                there is no page to jump to.
              </>
            ),
            zh: (
              <>
                分页两条路。offset 数行号:简单,能跳页,
                但页码一大就慢,而且插入删除会让窗口错位。
                cursor 指向你收到的最后一条记录:稳定,翻多深都快,
                代价是没有页码可跳。
              </>
            ),
          },
          {
            en: (
              <>
                <code>?status=</code> filters, <code>?sort=-created_at</code>{" "}
                sorts, <code>?fields=</code> selects fields. The path names the
                resource; parameters describe how you want it, and they combine
                freely.
              </>
            ),
            zh: (
              <>
                <code>?status=</code> 过滤、<code>?sort=-created_at</code>{" "}
                排序、<code>?fields=</code> 裁剪字段。
                路径指明资源,参数说明你想怎么要它,而且可以自由组合。
              </>
            ),
          },
          {
            en: (
              <>
                One test decides whether a change needs a new version: would an
                existing client break? Adding optional fields is safe. Removing
                a field, changing its type, or changing its meaning is not, and
                the two versions have to run side by side while clients move.
                Avoiding breaking changes is cheaper than versioning often.
              </>
            ),
            zh: (
              <>
                判断要不要升版本只有一条标准:现有客户端会不会坏。
                加可选字段是安全的;删字段、改类型、改含义不安全,
                而且新旧两版必须并存,直到客户端迁移完。
                避免破坏性变更,比频繁升版本省事得多。
              </>
            ),
          },
          {
            en: (
              <>
                <code>Cache-Control</code> decides how long a copy stays fresh.{" "}
                <code>no-cache</code> means revalidate before reuse;{" "}
                <code>no-store</code> means keep no copy at all. They are not
                the same directive and not interchangeable.
              </>
            ),
            zh: (
              <>
                <code>Cache-Control</code> 决定副本能新鲜多久。
                <code>no-cache</code> 是「复用前先校验」,<code>no-store</code>{" "}
                是「根本不要存」—— 两者不是一回事,不能互换。
              </>
            ),
          },
          {
            en: (
              <>
                Revalidation: the server sends <code>ETag</code>, the client
                sends it back in <code>If-None-Match</code>, and an unchanged
                resource is answered with{" "}
                <Status code={304} text="Not Modified" /> and no body. The body
                that is not sent is the saving. <code>Last-Modified</code> with{" "}
                <code>If-Modified-Since</code> does the same with one-second
                resolution.
              </>
            ),
            zh: (
              <>
                重新校验:服务器给 <code>ETag</code>,客户端用{" "}
                <code>If-None-Match</code> 带回去,资源没变就回{" "}
                <Status code={304} text="Not Modified" /> 且不带正文 ——
                省下来的正是那份没传的正文。<code>Last-Modified</code> 配{" "}
                <code>If-Modified-Since</code> 做同一件事,精度到秒。
              </>
            ),
          },
          {
            en: (
              <>
                A timeout does not mean failure; it means you do not know. An
                idempotency key lets the server recognize a retry: the same key
                is executed once, and every repeat gets the stored response from
                the first attempt.
              </>
            ),
            zh: (
              <>
                超时不等于失败,而是「不知道」。
                幂等键让服务器认得出重试:同一个键只执行一次,
                之后每次重发都返回第一次存下的那个响应。
              </>
            ),
          },
          {
            en: (
              <>
                <Status code={429} /> means slow down. Honour{" "}
                <code>Retry-After</code> when it is present; otherwise back off
                exponentially and add jitter. The <code>RateLimit-*</code>{" "}
                fields are still an IETF draft, so treat them as a convention,
                not a guarantee.
              </>
            ),
            zh: (
              <>
                <Status code={429} /> 是让你慢下来。有 <code>Retry-After</code>{" "}
                就照它办,没有就指数退避加抖动。
                <code>RateLimit-*</code> 这组字段还是 IETF 草案,
                只能当约定看,不能当保证。
              </>
            ),
          },
          {
            en: (
              <>
                OpenAPI is the endpoint table in machine-readable form.
                Documentation, client code, and mock servers are generated from
                one definition, so they cannot drift apart.
              </>
            ),
            zh: (
              <>
                OpenAPI 是端点总表的机器可读版本。
                文档、客户端代码、mock 服务都从同一份定义生成,
                因此不会各自跑偏。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="rest-advanced" />
    </main>
  );
}
