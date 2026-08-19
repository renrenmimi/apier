"use client";

// 第 04 章 · RESTful 设计实战(双语,英文默认):
// 接到需求 → 贯穿案例「博客 API」→ URL 命名规矩(诊断台)→
// CRUD 映射总表 → 三场完整对话(创建/更新/删除)→ 状态码决策室 →
// RFC 9457 错误格式 → 端点竣工图 → 动手任务 → 测验 → 要点。
// 文案一律走 <T en zh /> 或 Loc<…>,不要写 lang === "en" ? … : …。

import "./chapter.css";

import {
  Hero,
  Section,
  Callout,
  Method,
  Status,
  KeyPoints,
  ChapterFooter,
} from "@/lib/kit";
import { CodeBlock, CodePair } from "@/lib/code";
import { LabSet } from "@/lib/labs";
import { Quiz } from "@/lib/quiz";
import { LABS, QUIZ } from "@/lib/rest-design-data";
import { T } from "@/lib/i18n";
import { HeroBlueprint, UrlClinic, StatusDealer } from "./viz";

export default function RestDesignPage() {
  return (
    <main className="page" data-ch="rest-design">
      <Hero
        ch="rest-design"
        title={{
          en: (
            <>
              Designing a <span className="grad">RESTful API</span>
            </>
          ),
          zh: (
            <>
              RESTful <span className="grad">设计实战</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              In the first three chapters you read other people&apos;s designs.
              In this one you make the decisions: one blog API, from the first
              URL to a finished table of endpoints.
            </>
          ),
          zh: (
            <>
              前三章你一直在看别人的图纸。这一章轮到你画:一套博客 API,
              从第一个 URL,到最后一张能拍在桌上的端点总表。
            </>
          ),
        }}
        chips={[
          {
            id: "naming",
            n: "01",
            label: { en: "Naming URLs", zh: "URL 命名" },
          },
          { id: "crud", n: "02", label: { en: "CRUD mapping", zh: "CRUD 映射" } },
          {
            id: "dialogs",
            n: "03",
            label: { en: "Three exchanges", zh: "三场对话" },
          },
          {
            id: "status",
            n: "04",
            label: { en: "Choosing a status code", zh: "状态码决策室" },
          },
          {
            id: "errors",
            n: "05",
            label: { en: "Reporting errors", zh: "错误的说法" },
          },
          {
            id: "blueprint",
            n: "06",
            label: { en: "The endpoint table", zh: "竣工图" },
          },
          { id: "labs", n: "07", label: { en: "Practice", zh: "动手" } },
          { id: "quiz", n: "08", label: { en: "Quiz", zh: "测验" } },
        ]}
      >
        <HeroBlueprint />
      </Hero>

      {/* ================= §01 URL 命名 ================= */}
      <Section
        id="naming"
        index="01"
        title={{ en: "Naming URLs", zh: "URL 命名的规矩" }}
        desc={{
          en: "A URL is the part of an API that is hardest to change later, because clients store it. Five rules, then a clinic where you diagnose broken ones.",
          zh: "URL 是 API 里最难改的部分 —— 客户端会把它存下来。先立五条规矩,再上诊断台。",
        }}
      >
        <Callout
          tone="story"
          title={{
            en: "The task you have been given",
            zh: "你接到一个需求",
          }}
        >
          <p>
            <T
              en={
                <>
                  Your team is building a blog product. People can register,
                  publish articles, and comment on them. That gives you three
                  kinds of resources — <b>users, posts, comments</b>. A backend
                  developer asks you the first question: what do the endpoints
                  look like?
                </>
              }
              zh={
                <>
                  团队要做一个博客产品:用户能注册、能发文章、能在文章下评论。
                  三种资源已经摆在桌上 —— <b>users、posts、comments</b>
                  。后端同事问了第一个问题:接口怎么定?
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  By the end of this chapter you will have a full table of
                  endpoints for it. The same blog stays with you for the rest of
                  the course: chapter 08 writes a GraphQL schema over the same
                  data, and the final chapter uses it to compare the two
                  approaches.
                </>
              }
              zh={
                <>
                  这一章结束时,你能交出一张完整的端点总表。
                  这套博客数据还会一路跟着你:第 08 章用同一套数据写 GraphQL
                  schema,终章拿它做两种风格的对比。
                </>
              }
            />
          </p>
        </Callout>

        <ul className="rd-rules">
          <li>
            <span className="no">
              <T en="Rule 1" zh="规矩 1" />
            </span>
            <span>
              <T
                en={
                  <>
                    <b>The path names a thing, not an action.</b>{" "}
                    <code>/posts</code>, not <code>/getPosts</code>. The method
                    already carries the verb, so writing it again in the path
                    says the same thing twice.
                  </>
                }
                zh={
                  <>
                    <b>路径写名词,不写动作。</b>
                    <code>/posts</code>,不是 <code>/getPosts</code>。
                    动词已经由方法承担,再写进路径就是重复一遍。
                  </>
                }
              />
            </span>
          </li>
          <li>
            <span className="no">
              <T en="Rule 2" zh="规矩 2" />
            </span>
            <span>
              <T
                en={
                  <>
                    <b>Use a plural noun for a collection.</b>{" "}
                    <code>/posts</code> is the collection and{" "}
                    <code>/posts/42</code> is one item in it. Plural is a widely
                    used convention, not a rule in any specification. Some APIs
                    use the singular and work fine. What actually matters is
                    that one API does not mix the two.
                  </>
                }
                zh={
                  <>
                    <b>集合用名词复数。</b>
                    <code>/posts</code> 是集合,<code>/posts/42</code>{" "}
                    是集合里的一项。复数是被广泛采用的<b>约定</b>,
                    并不是哪份规范里的硬性规则,有些 API 用单数也运转得很好。
                    真正要紧的是:同一个 API 里别两种混用。
                  </>
                }
              />
            </span>
          </li>
          <li>
            <span className="no">
              <T en="Rule 3" zh="规矩 3" />
            </span>
            <span>
              <T
                en={
                  <>
                    <b>Pick one spelling style and use it everywhere.</b>{" "}
                    Lowercase words joined by hyphens is the common choice:{" "}
                    <code>/blog-posts</code>. Paths are case sensitive, so{" "}
                    <code>/BlogPosts</code> and <code>/blogposts</code> are two
                    different URLs. Mixing styles inside one API produces
                    addresses that look the same and are not.
                  </>
                }
                zh={
                  <>
                    <b>只用一种写法,全站统一。</b>
                    全小写、单词间用连字符是常见选择:<code>/blog-posts</code>。
                    路径区分大小写,<code>/BlogPosts</code> 和{" "}
                    <code>/blogposts</code> 是两个不同的 URL。
                    在一个 API 里混用几种写法,会造出「看着一样、其实不是」的地址。
                  </>
                }
              />
            </span>
          </li>
          <li>
            <span className="no">
              <T en="Rule 4" zh="规矩 4" />
            </span>
            <span>
              <T
                en={
                  <>
                    <b>Keep the implementation out of the path.</b> A{" "}
                    <code>.php</code> or <code>.jsp</code> ending ties the URL
                    to the language you happen to use today. Change the language
                    and every saved link, bookmark, and integration breaks.
                  </>
                }
                zh={
                  <>
                    <b>别把实现写进路径。</b>路径里出现 <code>.php</code>、
                    <code>.jsp</code>,等于把 URL 和你今天恰好用的语言绑死。
                    换一门语言,所有存下来的链接、书签和已接入的系统全部作废。
                  </>
                }
              />
            </span>
          </li>
          <li>
            <span className="no">
              <T en="Rule 5" zh="规矩 5" />
            </span>
            <span>
              <T
                en={
                  <>
                    <b>One level of nesting is enough.</b>{" "}
                    <code>collection/id/collection</code>, for example{" "}
                    <code>/posts/42/comments</code>, states that comments belong
                    to a post. Going deeper writes a hierarchy into the URL that
                    may change later. For anything deeper, filter the top-level
                    collection instead: <code>GET /replies?commentId=3</code>.
                  </>
                }
                zh={
                  <>
                    <b>嵌套一层就够。</b>
                    <code>collection/id/collection</code>,例如{" "}
                    <code>/posts/42/comments</code>
                    ,刚好说明评论从属于文章。再深下去,
                    就把一套以后可能改变的层级关系写死进了 URL。
                    更深的关系改用顶层集合加过滤:
                    <code>GET /replies?commentId=3</code>。
                  </>
                }
              />
            </span>
          </li>
        </ul>

        <UrlClinic />

        <Callout
          tone="idea"
          title={{
            en: "What goes in the path, what goes in the query",
            zh: "路径与查询参数的分工",
          }}
        >
          <p>
            <T
              en={
                <>
                  The path says <b>which resource</b>. Query parameters say{" "}
                  <b>how you want it</b>: filtering{" "}
                  <code>?status=published</code>, sorting{" "}
                  <code>?sort=-created_at</code>, pagination{" "}
                  <code>?page=2&amp;limit=20</code>, and field selection{" "}
                  <code>?fields=id,title</code>. A query parameter never
                  identifies which resource you mean — that is what{" "}
                  <code>/posts/42</code> is for.
                </>
              }
              zh={
                <>
                  路径说明<b>要哪个资源</b>,查询参数说明<b>你想怎么要它</b>:
                  过滤 <code>?status=published</code>、排序{" "}
                  <code>?sort=-created_at</code>、分页{" "}
                  <code>?page=2&amp;limit=20</code>、挑字段{" "}
                  <code>?fields=id,title</code>。
                  查询参数从不负责指认你要的是哪一个资源 —— 那是{" "}
                  <code>/posts/42</code> 的活。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Pagination has one trade-off worth knowing now.{" "}
                  <code>?offset=40&amp;limit=20</code> is simple, but the window
                  moves when rows are added or removed while a user is reading.
                  In a list sorted newest first, one new post inserted before
                  the reader asks for page 3 pushes everything down by one, so
                  the last item of page 2 appears again at the top of page 3.
                  Cursor pagination sends the position of the last item you
                  received instead — <code>?after=eyJpZCI6NjB9</code> — so
                  inserts elsewhere in the list do not shift it. Chapter 05
                  builds both.
                </>
              }
              zh={
                <>
                  分页有一个现在就该知道的取舍。
                  <code>?offset=40&amp;limit=20</code> 写起来最简单,
                  但读者翻页的这段时间里只要有行被插入或删除,窗口就会滑动:
                  按时间倒序的列表中,在读者请求第 3 页之前插进一篇新文章,
                  整体后移一位,第 2 页的最后一条就会在第 3 页开头再出现一次。
                  游标分页改为传「你上次收到的最后一项在哪儿」——
                  <code>?after=eyJpZCI6NjB9</code>
                  ,列表别处的插入就不会让窗口错位。第 05 章两种都会写一遍。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §02 CRUD 映射 ================= */}
      <Section
        id="crud"
        index="02"
        title={{ en: "Mapping CRUD onto HTTP", zh: "CRUD 映射总表" }}
        desc={{
          en: "The URLs are settled. Now attach the actions. This table covers most of the endpoints you will ever design.",
          zh: "URL 定好了,把动作接上。这张表覆盖了你以后要设计的绝大多数端点。",
        }}
      >
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Request" zh="请求" />
                </th>
                <th>
                  <T en="In plain words" zh="通俗说法" />
                </th>
                <th>
                  <T en="On success" zh="成功回" />
                </th>
                <th>
                  <T en="Idempotent?" zh="幂等?" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Method m="GET" /> <code>/posts</code>
                </td>
                <td>
                  <T en="Give me the list of posts" zh="把文章列表给我" />
                </td>
                <td>
                  <Status code={200} />
                </td>
                <td>
                  <T en="✓ — also safe" zh="✓ —— 而且安全" />
                </td>
              </tr>
              <tr>
                <td>
                  <Method m="POST" /> <code>/posts</code>
                </td>
                <td>
                  <T en="Add a new post" zh="登一篇新文章" />
                </td>
                <td>
                  <Status code={201} />
                </td>
                <td>
                  <T en="✕ — sending it twice makes two posts" zh="✕ —— 发两次就是两篇" />
                </td>
              </tr>
              <tr>
                <td>
                  <Method m="GET" /> <code>/posts/42</code>
                </td>
                <td>
                  <T en="Give me post 42" zh="把 42 号这篇给我" />
                </td>
                <td>
                  <Status code={200} />
                </td>
                <td>
                  <T en="✓ — also safe" zh="✓ —— 而且安全" />
                </td>
              </tr>
              <tr>
                <td>
                  <Method m="PUT" /> <code>/posts/42</code>
                </td>
                <td>
                  <T
                    en={
                      <>
                        Replace <b>the whole of</b> post 42 with what I send
                      </>
                    }
                    zh={
                      <>
                        把 42 号<b>整篇</b>换成我发的这份
                      </>
                    }
                  />
                </td>
                <td>
                  <Status code={200} />
                </td>
                <td>
                  <T
                    en="✓ — ten identical writes give one result"
                    zh="✓ —— 同一份写十次结果一样"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <Method m="PATCH" /> <code>/posts/42</code>
                </td>
                <td>
                  <T
                    en="Change only these fields of post 42"
                    zh="42 号只改这几个字段"
                  />
                </td>
                <td>
                  <Status code={200} />
                </td>
                <td>
                  <T en="Not promised" zh="不承诺" />
                </td>
              </tr>
              <tr>
                <td>
                  <Method m="DELETE" /> <code>/posts/42</code>
                </td>
                <td>
                  <T en="Delete post 42" zh="把 42 号删了" />
                </td>
                <td>
                  <Status code={204} />
                </td>
                <td>
                  <T en="✓ — see §03" zh="✓ —— §03 细说" />
                </td>
              </tr>
              <tr>
                <td>
                  <Method m="GET" /> <code>/posts/42/comments</code>
                </td>
                <td>
                  <T en="The comments under post 42" zh="42 号下面的评论" />
                </td>
                <td>
                  <Status code={200} />
                </td>
                <td>
                  <T en="✓ — also safe" zh="✓ —— 而且安全" />
                </td>
              </tr>
              <tr>
                <td>
                  <Method m="POST" /> <code>/posts/42/comments</code>
                </td>
                <td>
                  <T en="Add a comment to post 42" zh="在 42 号下面发条评论" />
                </td>
                <td>
                  <Status code={201} />
                </td>
                <td>
                  <T en="✕" zh="✕" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="sec-desc">
          <T
            en={
              <>
                Two words from chapter 02 are doing the work in the last column.{" "}
                <b>Safe</b> means the request is not meant to change anything on
                the server. <b>Idempotent</b> means sending the same request
                once or many times leaves the server in the same state.
              </>
            }
            zh={
              <>
                最后一列用到了第 02 章的两个词。<b>安全(safe)</b>:
                这个请求本来就不打算改服务器上的任何东西。<b>幂等(idempotent)</b>:
                同一个请求发一次和发多次,服务器最后停在同一个状态。
              </>
            }
          />
        </p>

        <Callout
          tone="warn"
          title={{
            en: "Combinations that are not in the table are usually a mistake",
            zh: "表里没有的组合,多半有问题",
          }}
        >
          <p>
            <T
              en={
                <>
                  <Method m="POST" /> <code>/posts/42</code> — POST to a single
                  resource — has no agreed meaning, so a reader cannot tell what
                  it does. Avoid it unless you document exactly what it does.
                  And <Method m="GET" /> must never change data: it is a safe
                  method, so browsers prefetch it and crawlers follow it without
                  asking. The data loss described in the clinic in §01 came from
                  exactly this.
                </>
              }
              zh={
                <>
                  <Method m="POST" /> <code>/posts/42</code>
                  ,也就是对单个资源 POST,没有约定俗成的含义,
                  读代码的人无法判断它在做什么 —— 除非你在文档里写死,否则别用。
                  另外 <Method m="GET" /> 永远不该改数据:它是安全方法,
                  浏览器会预取,爬虫会自己跟进去。§01
                  诊断台里那起数据丢失,就是这么来的。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 三场对话 ================= */}
      <Section
        id="dialogs"
        index="03"
        title={{ en: "Three complete exchanges", zh: "三场完整对话" }}
        desc={{
          en: "Create, update, delete — real messages on both sides. The middle one is the part of this chapter to read twice.",
          zh: "创建、更新、删除 —— 三段真实报文。中间那场值得读两遍。",
        }}
      >
        <div className="rd-sub">
          <span className="n">
            <T en="Exchange 1" zh="对话一" />
          </span>
          <T en="Creating a post" zh="创建一篇文章" />
        </div>
        <CodePair
          left={
            <CodeBlock
              lang="http"
              title={{ en: "Request", zh: "请求" }}
              code={`POST /posts HTTP/1.1
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "My first post",
  "body": "Hello, API world!"
}`}
            />
          }
          right={
            <CodeBlock
              lang="http"
              title={{ en: "Response", zh: "响应" }}
              hl={[1, 2]}
              code={`HTTP/1.1 201 Created
Location: /posts/43
Content-Type: application/json

{
  "id": 43,
  "title": "My first post",
  "body": "Hello, API world!",
  "authorId": 1,
  "createdAt": "2026-07-01T09:30:00Z"
}`}
              note={{
                en: (
                  <>
                    Three things to notice. The status is <b>201</b>, not 200,
                    because a resource that did not exist now does. The{" "}
                    <b>Location</b> header gives the URL of that new resource.
                    The body echoes the resource in full, because{" "}
                    <code>id</code> and <code>createdAt</code> were generated by
                    the server and the client has no other way to learn them.
                  </>
                ),
                zh: (
                  <>
                    三个细节。状态码是 <b>201</b> 不是 200 ——
                    因为一个原本不存在的资源现在存在了。<b>Location</b>{" "}
                    头给出这个新资源的 URL。响应体完整回显资源,因为{" "}
                    <code>id</code> 和 <code>createdAt</code> 是服务器生成的,
                    客户端没有别的途径知道它们。
                  </>
                ),
              }}
            />
          }
        />

        <div className="rd-sub">
          <span className="n">
            <T en="Exchange 2" zh="对话二" />
          </span>
          <T
            en="Updating — where PUT and PATCH part ways"
            zh="更新 —— PUT 和 PATCH 的分岔口"
          />
        </div>
        <p className="sec-desc">
          <T
            en={
              <>
                There are two ways to update, and choosing the wrong one deletes
                data. Post 43 currently has five fields. Both requests below
                send the same body, containing only <code>title</code>. Read the
                two responses side by side.
              </>
            }
            zh={
              <>
                「更新」有两种,选错会丢数据。43 号文章现在有五个字段,
                下面两个请求发的 body 完全一样,都只带一个 <code>title</code>
                。把两份响应并排读一遍。
              </>
            }
          />
        </p>
        <CodePair
          left={
            <CodeBlock
              lang="http"
              title={{
                en: "PUT · only title in the body",
                zh: "PUT · body 里只有 title",
              }}
              code={`PUT /posts/43 HTTP/1.1
Content-Type: application/json

{ "title": "Just changing the title" }`}
            />
          }
          right={
            <CodeBlock
              lang="http"
              title={{
                en: "PATCH · only title in the body",
                zh: "PATCH · body 里也只有 title",
              }}
              code={`PATCH /posts/43 HTTP/1.1
Content-Type: application/json

{ "title": "Just changing the title" }`}
            />
          }
        />
        <CodePair
          left={
            <CodeBlock
              lang="http"
              title={{
                en: "Response to the PUT",
                zh: "PUT 的响应",
              }}
              hl={[5, 6]}
              code={`HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 43,
  "title": "Just changing the title"
}`}
              note={{
                en: (
                  <>
                    <code>body</code>, <code>authorId</code>, and{" "}
                    <code>createdAt</code> are no longer in the resource. This
                    is what PUT is defined to do: the resource at this URL now
                    equals the representation you sent. A field you left out
                    means <b>absent</b>, not &quot;leave it as it was&quot;.
                  </>
                ),
                zh: (
                  <>
                    <code>body</code>、<code>authorId</code>、
                    <code>createdAt</code> 已经不在资源里了。这正是 PUT
                    的定义:这个 URL 上的资源,从此就等于你发来的那份表述。
                    你没写的字段,含义是<b>不存在</b>,不是「保持原样」。
                  </>
                ),
              }}
            />
          }
          right={
            <CodeBlock
              lang="http"
              title={{
                en: "Response to the PATCH",
                zh: "PATCH 的响应",
              }}
              hl={[7, 8, 9]}
              code={`HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 43,
  "title": "Just changing the title",
  "body": "Hello, API world!",
  "authorId": 1,
  "createdAt": "2026-07-01T09:30:00Z"
}`}
              note={{
                en: (
                  <>
                    Fields you did not mention are kept. PATCH sends a
                    description of the change, and the server applies it to what
                    is already there.
                  </>
                ),
                zh: (
                  <>
                    没提到的字段原样保留。PATCH 发的是「改动的描述」,
                    由服务器把它应用到已有的资源上。
                  </>
                ),
              }}
            />
          }
        />
        <Callout
          tone="warn"
          title={{
            en: "The most common way beginners lose data",
            zh: "新手丢数据最常见的原因",
          }}
        >
          <p>
            <T
              en={
                <>
                  Sending half an object with PUT. To change one field, use
                  PATCH. To use PUT, read the current resource first and send it
                  back complete, with your one change applied. This difference
                  is also why the two methods differ on idempotence: PUT states
                  the final content, so repeating it gives the same result,
                  while PATCH states a change, and a change such as
                  &quot;increase the view count by 1&quot; adds 2 when it runs
                  twice. The second task in §07 reproduces the field loss
                  against a real API — run it once and you will not forget it.
                </>
              }
              zh={
                <>
                  用 PUT 传半个对象。只想改一个字段,就用 PATCH;
                  非用 PUT 不可,就先读回当前资源,改完再<b>整份</b>发回去。
                  这个区别也解释了两者在幂等上的差异:PUT 声明的是最终内容,
                  重复发结果不变;PATCH 声明的是一次改动,
                  而「浏览数加 1」这样的改动,执行两次就是加 2。§07
                  的第二个任务会在真实 API 上复现这次字段丢失 ——
                  亲手跑一遍就忘不掉了。
                </>
              }
            />
          </p>
        </Callout>

        <div className="rd-sub">
          <span className="n">
            <T en="Exchange 3" zh="对话三" />
          </span>
          <T en="Deleting, and deleting twice" zh="删除,以及删两次" />
        </div>
        <CodePair
          left={
            <CodeBlock
              lang="http"
              title={{ en: "The first DELETE", zh: "第一次 DELETE" }}
              code={`DELETE /posts/43 HTTP/1.1
Authorization: Bearer <token>`}
            />
          }
          right={
            <CodeBlock
              lang="http"
              title={{ en: "Response", zh: "响应" }}
              code={`HTTP/1.1 204 No Content`}
              note={{
                en: (
                  <>
                    The delete succeeded and there is nothing to report, so
                    there is no body at all. A 204 response never has one.
                  </>
                ),
                zh: (
                  <>
                    删除成功,没有什么要回报,所以完全没有响应体 ——
                    204 的响应从不带 body。
                  </>
                ),
              }}
            />
          }
        />
        <CodeBlock
          lang="http"
          title={{
            en: "The same request again — post 43 is no longer there",
            zh: "同一个请求再发一次 —— 43 号已经不在了",
          }}
          code={`HTTP/1.1 404 Not Found
Content-Type: application/problem+json

{
  "type": "https://api.example.com/problems/not-found",
  "title": "Resource not found",
  "status": 404,
  "detail": "Post 43 does not exist."
}`}
          note={{
            en: (
              <>
                404 says there is nothing at this URL now. If your server keeps
                a record of deleted posts, <b>410 Gone</b> is the more precise
                answer: it also says the resource existed and was removed on
                purpose, which lets clients drop cached copies and search
                engines remove the URL. Only use 410 when you actually know
                that. The body format is explained in §05.
              </>
            ),
            zh: (
              <>
                404 表示这个 URL 上现在没有东西。如果你的服务器保留了已删除文章的
                记录,<b>410 Gone</b> 更精确:它还说明资源存在过、且是被有意移除的,
                客户端可以丢掉缓存副本,搜索引擎可以删掉这个 URL。
                只有当你确实知道这一点时才用 410。这个响应体的格式,§05 讲。
              </>
            ),
          }}
        />
        <Callout
          tone="deep"
          title={{
            en: "The second DELETE returns 404 — how is DELETE still idempotent?",
            zh: "第二次都 404 了,DELETE 怎么还算幂等?",
          }}
        >
          <p>
            <T
              en={
                <>
                  Because idempotence is defined by the <b>state of the
                  server</b>, not by the status code. After one delete and after
                  ten, the server is in the same state: post 43 does not exist.
                  The status code is only the reply to that particular request.
                  The full list: GET, PUT, and DELETE are idempotent, POST is
                  not, and PATCH is not promised to be.
                </>
              }
              zh={
                <>
                  因为幂等是按<b>服务器状态</b>定义的,不看响应码。
                  删一次和删十次,服务器都停在同一个状态:43 号不存在。
                  响应码只是对那一次请求的回话。完整名单:GET、PUT、DELETE
                  幂等,POST 不幂等,PATCH 不作承诺。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §04 状态码决策室 ================= */}
      <Section
        id="status"
        index="04"
        title={{ en: "Choosing a status code", zh: "状态码决策室" }}
        desc={{
          en: "Eleven codes cover almost every answer a REST API needs to give. Read the cards, then work through the scenes.",
          zh: "十一个状态码几乎覆盖了 REST API 需要给出的全部答复。先看速记卡,再上牌桌。",
        }}
      >
        <div className="grid-4 rd-code-legend">
          <div className="card">
            <div className="card-title">
              <Status code={201} text="Created" />
            </div>
            <p>
              <T
                en={
                  <>
                    A new resource exists now. Send a <code>Location</code>{" "}
                    header with its URL.
                  </>
                }
                zh={
                  <>
                    一个新资源现在存在了。配一个 <code>Location</code>{" "}
                    头给出它的 URL。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">
              <Status code={202} text="Accepted" />
            </div>
            <p>
              <T
                en="The request was accepted and the work is queued. Nothing exists at a new URL yet."
                zh="请求已被接受,工作还排在队列里。此刻还没有任何新资源可取。"
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">
              <Status code={204} text="No Content" />
            </div>
            <p>
              <T
                en="Success, and there is no body to send. The response has no body at all."
                zh="成功了,而且没有响应体要发 —— 204 的响应完全没有 body。"
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">
              <Status code={400} text="Bad Request" />
            </div>
            <p>
              <T
                en="The request is malformed — for example the JSON does not parse."
                zh="请求本身格式不对 —— 比如 JSON 根本解析不了。"
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">
              <Status code={401} text="Unauthorized" />
            </div>
            <p>
              <T
                en={
                  <>
                    Not authenticated, despite the name. The response must carry{" "}
                    <code>WWW-Authenticate</code>.
                  </>
                }
                zh={
                  <>
                    名字叫未授权,含义是<b>未认证</b>。响应必须带上{" "}
                    <code>WWW-Authenticate</code> 头。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">
              <Status code={403} text="Forbidden" />
            </div>
            <p>
              <T
                en="Authenticated, but not permitted to do this. Sending the same credentials again will not help."
                zh="身份已经清楚,但没有这个权限。用同一份凭证再发一次也没用。"
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">
              <Status code={404} text="Not Found" />
            </div>
            <p>
              <T
                en="Nothing at this URL now. It makes no claim about whether anything was ever here."
                zh="这个 URL 上现在没有东西。它不对「过去有没有」做任何断言。"
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">
              <Status code={409} text="Conflict" />
            </div>
            <p>
              <T
                en="The request conflicts with the current state — a duplicate value in a unique column, for example."
                zh="请求与服务器的当前状态冲突 —— 例如唯一字段撞了值。"
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">
              <Status code={410} text="Gone" />
            </div>
            <p>
              <T
                en="The resource existed and was deliberately removed. Use it only when you know that."
                zh="资源存在过,并且是被有意移除的。只有你确实知道时才用。"
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">
              <Status code={422} text="Unprocessable" />
            </div>
            <p>
              <T
                en="The syntax parses and the content fails validation. The usual answer for a failed check."
                zh="语法能解析,内容没通过校验 —— 校验失败的常用答复。"
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">
              <Status code={429} text="Too Many Requests" />
            </div>
            <p>
              <T
                en={
                  <>
                    Too many requests in too short a time. Add{" "}
                    <code>Retry-After</code>. Chapter 05 covers rate limits.
                  </>
                }
                zh={
                  <>
                    单位时间内请求太多。配上 <code>Retry-After</code>{" "}
                    告诉对方什么时候再来。限流细节见第 05 章。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <Callout
          tone="idea"
          title={{
            en: "400 or 422 for a failed validation?",
            zh: "校验失败该回 400 还是 422?",
          }}
        >
          <p>
            <T
              en={
                <>
                  Both are defensible, and real APIs are split. 422 first
                  appeared in the WebDAV specification (RFC 4918) and was later
                  moved into the core HTTP semantics by RFC 9110, which renamed
                  it Unprocessable Content. It is more specific than 400,
                  because it separates &quot;I could not read your
                  request&quot; from &quot;I read it and one value is
                  invalid&quot;. Many APIs still return 400 for both. Pick one
                  and use it consistently across your whole API — a client that
                  cannot predict which code it gets has to handle both anyway.
                  This course uses 422 for validation failures.
                </>
              }
              zh={
                <>
                  两种都说得通,现实中的 API 也确实分成两派。422 最早出现在
                  WebDAV 规范(RFC 4918)里,后来被 RFC 9110
                  收进 HTTP 核心语义,并改名为 Unprocessable Content。
                  它比 400 更精确,因为它把「我读不懂你的请求」和
                  「我读懂了,但有一个值不合法」分开了。不少 API 仍然两种情况都回
                  400。选一种,然后在整个 API 里保持一致 ——
                  客户端如果猜不到会收到哪个,最后还是得两个都处理。
                  本课把校验失败统一记在 422 上。
                </>
              }
            />
          </p>
        </Callout>

        <StatusDealer />
      </Section>

      {/* ================= §05 错误要好好说话 ================= */}
      <Section
        id="errors"
        index="05"
        title={{ en: "Reporting errors", zh: "错误要好好说话" }}
        desc={{
          en: "A wrong status code makes every client work harder. First an anti-pattern, then the standardized shape: RFC 9457.",
          zh: "状态码用错了,每个客户端都得多干活。先看反面教材,再看标准写法 RFC 9457。",
        }}
      >
        <CodeBlock
          lang="http"
          title={{
            en: "Anti-pattern · every error dressed up as 200",
            zh: "反面教材 · 所有错误都装成 200",
          }}
          hl={[1]}
          code={`HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": false,
  "errCode": 10086,
  "errMsg": "bad parameter"
}`}
          note={{
            en: (
              <>
                Three separate problems. First, <code>res.ok</code> is true, so
                every client has to open the body before it knows whether the
                call worked. Second, caches and proxies between the two sides
                may store this failure as a successful response and serve it
                again. Third, <code>errCode: 10086</code> is private vocabulary
                — every team that integrates with you has to learn it from
                scratch.
              </>
            ),
            zh: (
              <>
                三个独立的问题。第一,<code>res.ok</code> 是 true,
                每个客户端都得先拆开 body 才知道这次调用成没成。第二,
                中间的缓存和代理可能把这次失败当成成功响应存起来,下次直接发给别人。
                第三,<code>errCode: 10086</code> 是你们内部才懂的词汇,
                每个来对接的团队都要重新学一遍。
              </>
            ),
          }}
        />

        <p className="sec-desc">
          <T
            en={
              <>
                The standardized alternative is <b>RFC 9457 Problem Details</b>{" "}
                (published in 2023, replacing RFC 7807). It defines five
                members: <code>type</code>, a URI identifying the kind of
                problem; <code>title</code>, a short summary of that kind;{" "}
                <code>status</code>, the HTTP status code; <code>detail</code>,
                an explanation of this one occurrence; and{" "}
                <code>instance</code>, a URI for this occurrence. You may add
                your own members alongside them.
              </>
            }
            zh={
              <>
                标准化的写法是 <b>RFC 9457 Problem Details</b>(2023
                年发布,取代 RFC 7807)。它定义了五个成员:<code>type</code>
                ,标识这类问题的 URI;<code>title</code>,这类问题的简短说明;
                <code>status</code>,HTTP 状态码;<code>detail</code>
                ,对这一次具体情况的解释;<code>instance</code>
                ,标识这一次出错的 URI。你可以在旁边加自己的成员。
              </>
            }
          />
        </p>

        <CodeBlock
          lang="http"
          title={{
            en: "A validation failure in Problem Details form",
            zh: "用 Problem Details 报一次校验失败",
          }}
          hl={[2]}
          code={`HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json

{
  "type": "https://api.example.com/problems/validation-error",
  "title": "The request body failed validation",
  "status": 422,
  "detail": "The email field is not a valid email address.",
  "instance": "/users",
  "errors": [
    { "field": "email", "message": "Expected the form name@example.com" }
  ]
}`}
          note={{
            en: (
              <>
                <code>errors</code> is an extension member — the specification
                expects you to add your own. Note the media type:{" "}
                <b>application/problem+json</b>. A client that sees it knows the
                body follows this structure without reading your documentation
                first.
              </>
            ),
            zh: (
              <>
                <code>errors</code> 是扩展成员 —— 规范本来就允许你加自己的字段。
                注意媒体类型是 <b>application/problem+json</b>
                :客户端一看见它,不必先读你的文档,就知道 body 是这套结构。
              </>
            ),
          }}
        />

        <Callout
          tone="idea"
          title={{
            en: "Problem Details is standardized, not universal",
            zh: "Problem Details 是标准,但不是所有人都在用",
          }}
        >
          <p>
            <T
              en={
                <>
                  Plenty of well-run APIs report errors in their own JSON shape
                  and always will. RFC 9457 is worth reaching for because
                  someone has already made the decisions and clients may already
                  handle it. What matters more is the part that is not
                  negotiable: return a status code that matches what happened,
                  say which field or which rule failed, and use the same shape
                  everywhere in one API.
                </>
              }
              zh={
                <>
                  很多设计良好的 API 一直用着自己那套 JSON 错误结构,以后也会继续用。
                  选 RFC 9457 的理由是:该做的决定别人已经替你做完了,
                  而且有些客户端本来就认得它。更要紧的是不可让步的那部分:
                  状态码要与实际发生的事情相符,要说清是哪个字段、哪条规则没过,
                  并且在同一个 API 里始终用同一种结构。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 竣工图 ================= */}
      <Section
        id="blueprint"
        index="06"
        title={{
          en: "Your first API design, on one page",
          zh: "交出你的第一份 API 设计",
        }}
        desc={{
          en: "Every decision in this chapter, collected into one table: the blog API.",
          zh: "把整章的决定汇总成一张表 —— 博客 API 的竣工图。",
        }}
      >
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Method" zh="方法" />
                </th>
                <th>
                  <T en="Path" zh="路径" />
                </th>
                <th>
                  <T en="Success" zh="成功" />
                </th>
                <th>
                  <T en="Common failures" zh="常见失败" />
                </th>
                <th>
                  <T en="What it does" zh="说明" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Method m="POST" />
                </td>
                <td>
                  <code>/users</code>
                </td>
                <td>
                  <Status code={201} />
                </td>
                <td>
                  <code>409 · 422</code>
                </td>
                <td>
                  <T
                    en="Register (409 if the username is taken, 422 if the email is invalid)"
                    zh="注册(用户名被占 409,邮箱不合法 422)"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <Method m="GET" />
                </td>
                <td>
                  <code>/users/{"{id}"}</code>
                </td>
                <td>
                  <Status code={200} />
                </td>
                <td>
                  <code>404</code>
                </td>
                <td>
                  <T en="Read a user profile" zh="查看用户资料" />
                </td>
              </tr>
              <tr>
                <td>
                  <Method m="GET" />
                </td>
                <td>
                  <code>/posts</code>
                </td>
                <td>
                  <Status code={200} />
                </td>
                <td>—</td>
                <td>
                  <T
                    en="List posts (filtering and pagination in chapter 05)"
                    zh="文章列表(过滤与分页见第 05 章)"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <Method m="POST" />
                </td>
                <td>
                  <code>/posts</code>
                </td>
                <td>
                  <Status code={201} />
                </td>
                <td>
                  <code>400 · 401 · 422</code>
                </td>
                <td>
                  <T
                    en="Publish a post; returns Location and the new resource"
                    zh="发文章,返回 Location 和新资源"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <Method m="GET" />
                </td>
                <td>
                  <code>/posts/{"{id}"}</code>
                </td>
                <td>
                  <Status code={200} />
                </td>
                <td>
                  <code>404 · 410</code>
                </td>
                <td>
                  <T
                    en="One post (410 if it was deliberately removed)"
                    zh="单篇文章(被有意删除的回 410)"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <Method m="PUT" />
                </td>
                <td>
                  <code>/posts/{"{id}"}</code>
                </td>
                <td>
                  <Status code={200} />
                </td>
                <td>
                  <code>401 · 403 · 404 · 422</code>
                </td>
                <td>
                  <T
                    en="Replace the whole post — send the complete object"
                    zh="整体替换 —— 必须发完整对象"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <Method m="PATCH" />
                </td>
                <td>
                  <code>/posts/{"{id}"}</code>
                </td>
                <td>
                  <Status code={200} />
                </td>
                <td>
                  <code>401 · 403 · 404 · 422</code>
                </td>
                <td>
                  <T
                    en="Change part of a post — send only the fields you want changed"
                    zh="部分修改 —— 只发要改的字段"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <Method m="DELETE" />
                </td>
                <td>
                  <code>/posts/{"{id}"}</code>
                </td>
                <td>
                  <Status code={204} />
                </td>
                <td>
                  <code>401 · 403 · 404</code>
                </td>
                <td>
                  <T en="Delete a post; no response body" zh="删文章,无响应体" />
                </td>
              </tr>
              <tr>
                <td>
                  <Method m="GET" />
                </td>
                <td>
                  <code>/posts/{"{id}"}/comments</code>
                </td>
                <td>
                  <Status code={200} />
                </td>
                <td>
                  <code>404</code>
                </td>
                <td>
                  <T en="The comments on one post" zh="某篇文章的评论列表" />
                </td>
              </tr>
              <tr>
                <td>
                  <Method m="POST" />
                </td>
                <td>
                  <code>/posts/{"{id}"}/comments</code>
                </td>
                <td>
                  <Status code={201} />
                </td>
                <td>
                  <code>401 · 404 · 422</code>
                </td>
                <td>
                  <T en="Add a comment" zh="发表评论" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout
          tone="win"
          title={{
            en: "This table is more useful than it looks",
            zh: "别小看这张表",
          }}
        >
          <p>
            <T
              en={
                <>
                  Method, path, success code, failure codes. The backend
                  implements from it, the frontend calls from it, and the tests
                  are written from it. <b>It is the first draft of an API
                  document</b>, and agreeing on it early means nobody has to
                  guess. Chapter 05 introduces the machine-readable version:
                  OpenAPI, one YAML file that documentation, mock servers, and
                  generated clients all come from.
                </>
              }
              zh={
                <>
                  方法、路径、成功码、失败码。后端照它写实现,前端照它写调用,
                  测试照它写用例。<b>它就是一份接口文档的初稿</b>
                  ,早点对齐,谁也不用猜。第 05 章会给你它的机器可读版:OpenAPI ——
                  一份 YAML,文档、Mock 服务和生成的客户端都从它长出来。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §07 动手任务 ================= */}
      <Section
        id="labs"
        index="07"
        title={{ en: "Practice", zh: "动手任务" }}
        desc={{
          en: "Three tasks: fix broken URLs, reproduce the field loss caused by PUT, and design an endpoint table on your own.",
          zh: "三个任务:修 URL、亲手复现 PUT 的字段丢失、再独立画一张端点总表。",
        }}
      >
        <LabSet ch="rest-design" items={LABS} />
      </Section>

      {/* ================= §08 通关测验 ================= */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Chapter quiz", zh: "通关测验" }}
        desc={{
          en: "Eight questions, all of them decisions you will make in real work. Answer them all correctly to mark the chapter complete.",
          zh: "八道题,全是实战里真会遇到的选择。全对即可点亮侧栏的通关标记。",
        }}
      >
        <Quiz ch="rest-design" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                Paths name things, not actions: <code>/posts</code> for the
                collection, <code>/posts/42</code> for one item, and one level
                of nesting such as <code>/posts/42/comments</code>. Plural
                collections are a convention — being consistent inside one API
                matters more than the choice itself.
              </>
            ),
            zh: (
              <>
                路径写名词,不写动作:<code>/posts</code> 是集合,
                <code>/posts/42</code> 是其中一项,嵌套到{" "}
                <code>/posts/42/comments</code> 一层为止。集合用复数是<b>约定</b>
                ,同一个 API 内部保持一致,比选哪一种更重要。
              </>
            ),
          },
          {
            en: (
              <>
                The path says which resource; query parameters say how you want
                it — filtering, sorting, pagination, and field selection. A
                query parameter never identifies a resource.
              </>
            ),
            zh: (
              <>
                路径说明要哪个资源,查询参数说明你想怎么要它 ——
                过滤、排序、分页、挑字段。查询参数从不用来指认资源。
              </>
            ),
          },
          {
            en: (
              <>
                <b>PUT replaces the whole representation</b> and is idempotent:
                a field you leave out means absent, not unchanged.{" "}
                <b>PATCH describes a change</b> and is not idempotent in
                general. To change one field, use PATCH.
              </>
            ),
            zh: (
              <>
                <b>PUT 替换整份表述</b>,并且幂等:你没写的字段,
                含义是「不存在」,不是「不改」。<b>PATCH 描述的是一次改动</b>
                ,一般不幂等。只改一个字段,用 PATCH。
              </>
            ),
          },
          {
            en: (
              <>
                Status codes are how the response states what happened: 201 with
                a <code>Location</code> header for a created resource, 202 when
                the work is queued, 204 for success with no body, 400 for a
                malformed request, 401 for not authenticated (with{" "}
                <code>WWW-Authenticate</code>), 403 for not permitted, 404 for
                not found, 410 for deliberately removed, 409 for a state
                conflict, 422 for content that fails validation, and 429 with{" "}
                <code>Retry-After</code> for too many requests.
              </>
            ),
            zh: (
              <>
                状态码是响应用来说明「发生了什么」的:201 创建成功,配{" "}
                <code>Location</code> 头;202 工作已排队;204 成功且无响应体;400
                请求格式不对;401 未认证,须带 <code>WWW-Authenticate</code>;403
                已认证但无权限;404 找不到;410 存在过、已被有意移除;409
                与当前状态冲突;422 内容校验不通过;429 请求过于频繁,配{" "}
                <code>Retry-After</code>。
              </>
            ),
          },
          {
            en: (
              <>
                Do not dress errors up as 200. Return the status code that
                matches what happened, and use one error shape across the whole
                API. RFC 9457 <code>application/problem+json</code> is the
                standardized one; a documented format of your own also works.
              </>
            ),
            zh: (
              <>
                别把错误装成 200。返回与实际情况相符的状态码,
                并在整个 API 里使用同一种错误结构。RFC 9457 的{" "}
                <code>application/problem+json</code>{" "}
                是标准写法;自己那套只要文档写清楚,同样可行。
              </>
            ),
          },
          {
            en: (
              <>
                Idempotence is about the state of the server, not the status
                code — a second DELETE answering 404 is still idempotent.
              </>
            ),
            zh: (
              <>
                幂等看的是服务器状态,不看响应码 —— 第二次 DELETE 回 404,
                照样幂等。
              </>
            ),
          },
          {
            en: (
              <>
                A table of method, path, and status codes is the first draft of
                an API document. Chapter 05 turns it into OpenAPI, its
                machine-readable form.
              </>
            ),
            zh: (
              <>
                一张「方法 × 路径 × 状态码」的表,就是接口文档的初稿。第 05
                章会把它变成机器可读的 OpenAPI。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="rest-design" />
    </main>
  );
}
