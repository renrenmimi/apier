"use client";

// 第 03 章 · REST 的思想(双语,英文默认):
// 风格 vs 协议 → 资源/URI/表述三件套(内容协商互动)→
// 六大约束翻转卡 + 无状态对照演示 → 成熟度阶梯 → HATEOAS 理想与现实 →
// 动手任务 → 测验 → 要点。

import "./chapter.css";

import {
  Hero,
  Section,
  Callout,
  KeyPoints,
  ChapterFooter,
} from "@/lib/kit";
import { CodeBlock } from "@/lib/code";
import { LabSet } from "@/lib/labs";
import { Quiz } from "@/lib/quiz";
import { LABS, QUIZ } from "@/lib/rest-data";
import { T } from "@/lib/i18n";
import {
  HeroCity,
  RepresentationSwitcher,
  ConstraintFlips,
  StatelessTheater,
  MaturityLadder,
} from "./viz";

export default function RestPage() {
  return (
    <main className="page" data-ch="rest">
      <Hero
        ch="rest"
        title={{
          en: (
            <>
              The ideas behind <span className="grad">REST</span>
            </>
          ),
          zh: (
            <>
              REST 的<span className="grad">思想</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              The web is the largest distributed system people have built. It
              reached that size without being redesigned, because a small set of
              architectural constraints was followed from the start. REST is the
              name for that set.
            </>
          ),
          zh: (
            <>
              Web 是人类造过的最大的分布式系统。它能长到今天这么大而不必推倒重来,
              是因为一开始就守住了一小组架构约束。REST,就是这组约束的名字。
            </>
          ),
        }}
        chips={[
          {
            id: "style",
            n: "01",
            label: { en: "Style, not protocol", zh: "风格,不是协议" },
          },
          {
            id: "trio",
            n: "02",
            label: {
              en: "Resource, URI, representation",
              zh: "资源 · URI · 表述",
            },
          },
          {
            id: "constraints",
            n: "03",
            label: { en: "The constraints", zh: "六大约束" },
          },
          {
            id: "maturity",
            n: "04",
            label: { en: "Maturity model", zh: "成熟度阶梯" },
          },
          { id: "hateoas", n: "05", label: "HATEOAS" },
          { id: "labs", n: "06", label: { en: "Practice", zh: "动手" } },
          { id: "quiz", n: "07", label: { en: "Quiz", zh: "测验" } },
        ]}
      >
        <HeroCity />
      </Hero>

      {/* ================= §01 风格,不是协议 ================= */}
      <Section
        id="style"
        index="01"
        title={{
          en: "REST is an architectural style, not a protocol",
          zh: "REST 是架构风格,不是协议",
        }}
        desc={{
          en: "The first thing to correct: REST is not another name for 'JSON over HTTP'.",
          zh: "进入 REST 之前,先拆掉一个流行误解:REST 不是「JSON over HTTP」的别名。",
        }}
      >
        <Callout
          tone="story"
          title={{
            en: "A dissertation, in the year 2000",
            zh: "2000 年,一篇博士论文",
          }}
        >
          <p>
            <T
              en={
                <>
                  Roy Fielding was one of the authors of the HTTP/1.1
                  specification. He looked back at the web he had helped build
                  and asked one question: why can it grow from a few machines to
                  a global system without falling apart? He wrote his answer as
                  an <b>architectural style</b> in chapter 5 of his doctoral
                  dissertation and named it REpresentational State Transfer,
                  shortened to REST.
                </>
              }
              zh={
                <>
                  Roy Fielding 是 HTTP/1.1 规范的作者之一。他回头审视自己参与建造的
                  Web,问了一个问题:它凭什么能从几台机器长成覆盖全球的系统而不散架?
                  他把答案写成一种<b>架构风格</b>,放进博士论文第五章,
                  起名 REpresentational State Transfer,缩写 REST。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  The order matters. <b>REST did not come first, with the web
                  built to follow it.</b> The web came first. REST is
                  Fielding&apos;s description of why the web works.
                </>
              }
              zh={
                <>
                  注意这个顺序:<b>不是先有 REST,再照着它造出 Web</b>。
                  是 Web 先跑通了,REST 是对「它为什么跑得通」的总结。
                </>
              }
            />
          </p>
        </Callout>

        <p className="sec-desc">
          <T
            en={
              <>
                REST is not a test you pass or fail. It is a set of constraints,
                and a system can follow all of them, some of them, or none. The
                more of them it follows, the more it can rely on infrastructure
                the web already provides: caches, proxies, and clients that were
                not written for that one API. Most APIs called REST follow some
                of the constraints, not all — this chapter is about which ones,
                and why they matter.
              </>
            }
            zh={
              <>
                REST 不是一场「合格 / 不合格」的考试。它是一组约束,
                一个系统可以全部遵守、部分遵守,也可以一条都不守。
                守得越多,就越能用上 Web 已经准备好的基础设施:
                缓存、代理,以及并非为你这一个 API 而写的通用客户端。
                大多数自称 REST 的 API 只守了其中一部分 ——
                这一章要讲的,就是这些约束分别是什么、为什么重要。
              </>
            }
          />
        </p>

        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">protocol</div>
            <div className="card-title">
              <T en="Rules that must match exactly" zh="必须逐字对上的规则" />
            </div>
            <p>
              <T
                en={
                  <>
                    A protocol fixes the exact format of a message. HTTP is a
                    protocol. Get one byte wrong and the other side cannot read
                    it. A protocol has version numbers and a written
                    specification.
                  </>
                }
                zh={
                  <>
                    协议规定消息的确切格式。HTTP 是协议:格式错一个字节,
                    对方就读不懂。协议有版本号,有正式的规范文本。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">style</div>
            <div className="card-title">
              <T en="Principles that guide a design" zh="指导设计的原则" />
            </div>
            <p>
              <T
                en={
                  <>
                    A style is a set of design principles. Nothing enforces it.
                    REST has no version number, no official certification, and
                    no error response that says &quot;not REST&quot;.
                  </>
                }
                zh={
                  <>
                    风格是一组设计原则,没有强制力。REST 没有版本号,
                    没有官方认证,也不存在「REST 报错」这回事。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">RESTful</div>
            <div className="card-title">
              <T en="An adjective, a matter of degree" zh="一个形容词,程度问题" />
            </div>
            <p>
              <T
                en={
                  <>
                    RESTful means &quot;follows the REST style&quot;. Calling an
                    API RESTful describes a degree, not a yes or no. §04 gives
                    you a scale to measure it with.
                  </>
                }
                zh={
                  <>
                    RESTful 就是「遵循 REST 风格的」。说一个 API 很 RESTful,
                    描述的是程度,不是有无。§04 会给你一把量它的尺子。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <Callout
          tone="warn"
          title={{
            en: "So these sentences are wrong",
            zh: "所以,下面这几句都不对",
          }}
        >
          <p>
            <T
              en={
                <>
                  &quot;REST means JSON over HTTP.&quot; &quot;If it returns
                  JSON, it is a REST API.&quot; Both are wrong.{" "}
                  <b>Fielding&apos;s dissertation does not mention JSON</b> —
                  JSON was not in common use in 2000. REST is about
                  architecture: how resources are named, how state moves between
                  client and server, and how responses can be cached. Which
                  format carries the data is a separate decision. The next
                  section shows one resource in three formats.
                </>
              }
              zh={
                <>
                  「REST 就是 JSON over HTTP」「返回 JSON 的就是 REST API」——
                  都不对。<b>Fielding 的论文里根本没提 JSON</b>
                  ,2000 年 JSON 还没流行起来。REST 谈的是架构:资源怎么命名、
                  状态怎么在客户端与服务器之间流转、响应怎么被缓存。
                  用什么格式装数据,是另一件事。§02 会把同一个资源用三种格式展示给你看。
                </>
              }
            />
          </p>
        </Callout>

        <p className="sec-desc">
          <T
            en={
              <>
                For scale: Postman&apos;s 2025 State of the API report found
                that <b>93% of teams work with REST APIs</b>. It is the default
                style for public APIs. Even so, by Fielding&apos;s own standard
                most of them do not qualify. §04 shows where the line sits.
              </>
            }
            zh={
              <>
                给个行情:Postman 2025 年的 State of the API 报告显示,
                <b>93% 的团队在用 REST API</b>,它是对外 API 的默认选择。
                但按 Fielding 本人的标准,其中大多数并不算合格。
                合格线画在哪,§04 见。
              </>
            }
          />
        </p>
      </Section>

      {/* ================= §02 资源、URI、表述 ================= */}
      <Section
        id="trio"
        index="02"
        title={{
          en: "Three ideas: resource, URI, representation",
          zh: "三件套:资源、URI、表述",
        }}
        desc={{
          en: "A thing, its identifier, and a copy of it in one format. Everything else in REST is built on these three.",
          zh: "一个事物、它的标识符、它的一份副本 —— REST 的其余部分都建在这三个词上。",
        }}
      >
        <div className="grid-3">
          <div className="card">
            <div className="card-kicker">
              <T en="the thing" zh="名词" />
            </div>
            <div className="card-title">
              <T en="Resource" zh="资源 resource" />
            </div>
            <p>
              <T
                en={
                  <>
                    Anything worth naming: user 42, this article,
                    today&apos;s weather in Hangzhou. Resources are{" "}
                    <b>nouns</b>. A resource is the thing itself — an abstract
                    concept, not a file.
                  </>
                }
                zh={
                  <>
                    任何值得命名的事物:42 号用户、这篇文章、今天的杭州天气。
                    资源全是<b>名词</b>。资源是「那个事物本身」,
                    是一个抽象概念,不是一份文件。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="the address" zh="地址" />
            </div>
            <div className="card-title">URI</div>
            <p>
              <T
                en={
                  <>
                    The identifier of a resource. <code>/users/42</code>{" "}
                    identifies the user, not a JSON file stored somewhere.
                    Anything you can name can have a URI.
                  </>
                }
                zh={
                  <>
                    资源的标识符。<code>/users/42</code> 指的是「42 号用户」这个人,
                    而不是磁盘上的某份 JSON 文件。凡是能命名的事物,都可以有 URI。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="the copy" zh="副本" />
            </div>
            <div className="card-title">
              <T en="Representation" zh="表述 representation" />
            </div>
            <p>
              <T
                en={
                  <>
                    The resource captured at <b>one moment</b>, in{" "}
                    <b>one format</b>. JSON is one representation; HTML is
                    another. There can be many representations, but only one
                    resource.
                  </>
                }
                zh={
                  <>
                    资源在<b>某一刻</b>、以<b>某种格式</b>留下的一份副本。
                    JSON 是一种表述,HTML 是另一种 —— 表述可以有很多份,
                    资源只有一个。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <RepresentationSwitcher />

        <p className="sec-desc">
          <T
            en={
              <>
                Because resources are the nouns, the HTTP method carries the
                verb. <code>POST /createUser</code> puts the verb back into the
                URI, and REST avoids that. The reason is the uniform interface,
                not taste: if every API invents its own action names, a cache or
                a proxy cannot tell what a request does, and no general-purpose
                tool can be written for it. <code>POST /users</code> says the
                same thing using the one vocabulary every HTTP component already
                understands. Chapter 04 turns this into concrete naming rules.
              </>
            }
            zh={
              <>
                资源是名词,所以动词由 HTTP 方法来承担。
                <code>POST /createUser</code> 把动词又塞回了 URI 里,
                REST 要避免的正是这种写法。理由是统一接口,不是审美:
                如果每个 API 都自造一套动作名,缓存和代理就无法判断一个请求在做什么,
                通用工具也无从写起。<code>POST /users</code>{" "}
                表达的是同一件事,用的却是所有 HTTP 组件都已经认识的那套词汇。
                第 04 章会把这条原则落成具体的命名规则。
              </>
            }
          />
        </p>

        <Callout
          tone="idea"
          title={{
            en: "Where the name REST comes from",
            zh: "REST 这个名字是怎么来的",
          }}
        >
          <p>
            <T
              en={
                <>
                  REpresentational State Transfer. The client never holds the
                  resource itself; it holds a <b>representation</b> of it. Each
                  time the client follows a link and makes a request, a new
                  representation is transferred and the application moves to a
                  new state. Browsing a website is exactly this: every click
                  transfers a new representation and changes the state you are
                  in.
                </>
              }
              zh={
                <>
                  Representational State Transfer,表述性状态转移:
                  客户端手里从来只有<b>表述</b>;每跟着一个链接发一次请求,
                  新的表述被传输过来,应用的状态就前进一步。
                  你逛网页的每一次点击,都是一次表述的传输和一次状态的转移。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 六大约束 ================= */}
      <Section
        id="constraints"
        index="03"
        title={{
          en: "The six constraints",
          zh: "约法六章:REST 的六大约束",
        }}
        desc={{
          en: "Fielding derives REST by adding one constraint at a time. Five are required and one is optional. Click a card to turn it over.",
          zh: "Fielding 是一条一条加约束推导出 REST 的:五条必需,一条可选。点卡片翻面看看。",
        }}
      >
        <ConstraintFlips />

        <Callout
          tone="deep"
          title={{
            en: "The uniform interface has four parts",
            zh: "统一接口,拆开是四条",
          }}
        >
          <p>
            <T
              en={
                <>
                  The uniform interface is the constraint that separates REST
                  from other styles, and Fielding splits it into four. ①{" "}
                  <b>Identification of resources</b>: every resource has a URI.
                  ② <b>Manipulation of resources through representations</b>:
                  the client sends back a modified representation, and the
                  server decides how to apply it. ③{" "}
                  <b>Self-descriptive messages</b>: a message carries what is
                  needed to understand it — the method, the status code, the
                  media type — with no agreement negotiated outside the message.
                  ④ <b>HATEOAS</b>, hypermedia as the engine of application
                  state, which §05 covers on its own.
                </>
              }
              zh={
                <>
                  统一接口是把 REST 与其他风格区分开的约束,Fielding 把它拆成四条。①{" "}
                  <b>资源标识</b>:每个资源都有 URI。②{" "}
                  <b>通过表述操纵资源</b>:客户端把改过的表述寄回去,
                  由服务器决定如何应用。③ <b>自描述消息</b>:
                  一条消息自带理解它所需的一切 —— 方法、状态码、媒体类型,
                  不依赖消息之外另行约定的知识。④ <b>HATEOAS</b>,
                  超媒体作为应用状态的引擎,§05 单独讲。
                </>
              }
            />
          </p>
        </Callout>

        <p className="sec-desc">
          <T
            en={
              <>
                Of the six, <b>stateless</b> is the one people find hardest to
                accept. Having the server remember the user seems convenient.
                But it is the reason a website can be scaled by adding machines.
                The comparison below runs the same session against two servers.
              </>
            }
            zh={
              <>
                六条里最反直觉的是<b>无状态</b>:让服务器记住用户,
                明明方便得多。可正是这一条,让一个网站能靠加机器来扩容。
                下面的对照演示,把同一段会话分别跑在两种服务器上。
              </>
            }
          />
        </p>

        <StatelessTheater />

        <Callout
          tone="warn"
          title={{
            en: "Stateless does not mean the server stores nothing",
            zh: "无状态 ≠ 什么都不存",
          }}
        >
          <p>
            <T
              en={
                <>
                  A common misreading: &quot;does stateless mean the server
                  cannot have a database?&quot; No. <b>Resource data</b> —
                  articles, users, orders — is stored as usual. What the server
                  does not keep between requests is <b>session state</b>: who
                  you are logged in as, which page you were reading. That part
                  travels with the client and is sent again with every request.
                </>
              }
              zh={
                <>
                  常见误会:「无状态是不是连数据库都不能有?」不是。文章、用户、
                  订单这些<b>资源数据</b>照存不误。服务器在两次请求之间不保留的是
                  <b>会话状态</b>:你以谁的身份登录、看到第几页。
                  这部分由客户端随身带着,每次请求重新送来。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §04 成熟度阶梯 ================= */}
      <Section
        id="maturity"
        index="04"
        title={{
          en: "The Richardson maturity model: how close to REST are you?",
          zh: "Richardson 成熟度模型:你离 REST 有多近",
        }}
        desc={{
          en: "A scale proposed by Leonard Richardson and made widely known by Martin Fowler. It is not an official standard, but it is the scale the industry uses.",
          zh: "Leonard Richardson 提出、Martin Fowler 撰文普及的一把尺子 —— 不是官方标准,但业界都拿它来量。",
        }}
      >
        <MaturityLadder />

        <Callout
          tone="idea"
          title={{ en: "Back to that 93%", zh: "回收 §01 的伏笔" }}
        >
          <p>
            <T
              en={
                <>
                  Most of those self-described REST APIs stop at <b>L2</b>. So
                  &quot;REST&quot; as the industry uses the word usually means
                  &quot;L2 plus JSON&quot;. That is not a failure. L2 already
                  gets you most of what HTTP offers: caching, idempotent
                  methods, and tools that work with any API. It is still worth
                  knowing that the scale has one more step.
                </>
              }
              zh={
                <>
                  那些自称 REST 的 API,绝大多数停在 <b>L2</b>。
                  所以业界口中的「REST」,通常是「L2 + JSON」的简称。
                  这并不丢人 —— L2 已经拿到了 HTTP 的大部分好处:缓存、幂等方法、
                  以及对任何 API 都通用的工具。但你该知道,尺子上面还有一格。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §05 HATEOAS ================= */}
      <Section
        id="hateoas"
        index="05"
        title={{
          en: "HATEOAS: the idea, and what actually gets built",
          zh: "HATEOAS:理想与现实",
        }}
        desc={{
          en: "The requirement for L3, the part Fielding considers essential, and the reason it is rarely implemented.",
          zh: "L3 的入场券,Fielding 眼中「真正的 REST」—— 以及它为什么很少落地。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                HATEOAS stands for Hypermedia As The Engine Of Application
                State. The idea is one you already use every day: <b>you browse
                the web</b>. You do not memorize URLs; the page gives you links
                and you click them. HATEOAS applies the same idea to programs.
                The response includes links, and the client follows them instead
                of building URLs from rules written into its own code.
              </>
            }
            zh={
              <>
                HATEOAS 是 Hypermedia As The Engine Of Application State
                的缩写,超媒体作为应用状态的引擎。名字唬人,做的事你天天在做:
                <b>逛网页</b>。你从不背 URL,页面给你链接,你点。
                HATEOAS 就是让程序也这样工作:响应里带着链接,
                客户端跟着链接走,而不是按自己代码里写死的规则拼 URL。
              </>
            }
          />
        </p>

        <CodeBlock
          lang="http"
          title={{
            en: "A hypermedia response · GET /posts/42",
            zh: "理想中的博客 API · GET /posts/42",
          }}
          hl={[9, 10, 11]}
          code={`HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 42,
  "title": "The ideas behind REST",
  "authorId": 1,
  "_links": {
    "self":     { "href": "/posts/42" },
    "author":   { "href": "/users/1" },
    "comments": { "href": "/posts/42/comments" }
  }
}`}
          note={{
            en: (
              <>
                The client does not build <b>/posts/42/comments</b> itself. If
                the server changes its routes, the links in the response change
                with them and the client keeps working. That is what hypermedia
                is for: it removes the client&apos;s dependency on the URL
                layout.
              </>
            ),
            zh: (
              <>
                客户端不再自己拼 <b>/posts/42/comments</b>。
                服务器哪天改了路由,响应里的链接跟着变,客户端不受影响。
                这就是超媒体的用处:让客户端不再依赖 URL 的拼法。
              </>
            ),
          }}
        />

        <p className="sec-desc">
          <T
            en={
              <>
                In practice you have probably seen a partial version of this.
                GitHub&apos;s API returns a set of <code>*_url</code> fields:
              </>
            }
            zh={
              <>
                现实中你多半见过它的局部版本 —— GitHub API
                的响应里躺着一排 <code>*_url</code> 字段:
              </>
            }
          />
        </p>

        <CodeBlock
          lang="json"
          title={{
            en: "GET https://api.github.com/users/octocat (extract)",
            zh: "GET https://api.github.com/users/octocat(节选)",
          }}
          code={`{
  "login": "octocat",
  "url": "https://api.github.com/users/octocat",
  "followers_url": "https://api.github.com/users/octocat/followers",
  "repos_url": "https://api.github.com/users/octocat/repos",
  "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}"
}`}
          note={{
            en: (
              <>
                These are links to related resources, which is the first half of
                the idea. GitHub&apos;s API is not fully hypermedia-driven — a
                client still needs the documentation to know what it may do —
                but the links are there. <code>starred_url</code> also shows a
                URI Template (RFC 6570): <code>{"{/owner}{/repo}"}</code> are
                placeholders the client fills in. The first task in §06 asks you
                to count these fields.
              </>
            ),
            zh: (
              <>
                这些是指向相关资源的链接,是超媒体想法的前半段。
                GitHub API 并不是完全由超媒体驱动的 ——
                客户端仍然要读文档才知道自己能做什么 —— 但链接确实在那里。
                <code>starred_url</code> 还展示了 URI 模板(RFC 6570):
                <code>{"{/owner}{/repo}"}</code> 是留给客户端填的占位符。
                §06 的第一个任务,就是去数一数这些字段。
              </>
            ),
          }}
        />

        <Callout
          tone="story"
          title={{
            en: "Fielding's 2008 blog post",
            zh: "Fielding 的著名牢骚(2008)",
          }}
        >
          <p>
            <T
              en={
                <>
                  By 2008, very few APIs calling themselves REST were driven by
                  hypermedia. Fielding published a post titled{" "}
                  <i>REST APIs must be hypertext-driven</i>, arguing that{" "}
                  <b>
                    if the engine of application state is not hypermedia, the
                    API is not REST
                  </b>{" "}
                  — follow the constraint or pick a different name. By that
                  standard, most APIs described as REST today would need a
                  different name.
                </>
              }
              zh={
                <>
                  到 2008 年,满世界的「REST API」几乎没有几个是超媒体驱动的。
                  Fielding 发了一篇著名博文《REST APIs must be
                  hypertext-driven》,主张:<b>
                    应用状态的引擎如果不是超媒体,那它就不是 REST
                  </b>
                  —— 要么按约束来,要么换个名字。按这个标准,
                  今天绝大多数「REST API」都得改名。
                </>
              }
            />
          </p>
        </Callout>

        <p className="sec-desc">
          <T
            en={
              <>
                Measurements agree with him. A 2019 study of the most-used
                public web APIs (<i>RESTful or RESTless — Current State of
                Today&apos;s Top Web APIs</i>, arXiv:1902.10514) found that only
                a small share of them put links to related resources in their
                responses. HATEOAS is the least implemented of the constraints.
                Four reasons come up again and again. First, the client and the
                API are usually written by the same team, so discovering
                endpoints at runtime has little value. Second, links make
                responses larger and add extra round trips. Third, there is no
                single format — HAL, JSON:API, and Siren all do it differently.
                Fourth, support in frameworks and client libraries has stayed
                thin.
              </>
            }
            zh={
              <>
                实测也站在他这边。2019 年一项针对主流公开 Web API 的研究
                (《RESTful or RESTless — Current State of Today&apos;s Top Web
                APIs》,arXiv:1902.10514)发现,
                会在响应里给出相关资源链接的 API 只占很小一部分 ——
                HATEOAS 是六条约束里落地最差的一条。常见原因有四个:
                第一,客户端和 API 多半出自同一个团队,运行时动态发现没什么用武之地;
                第二,链接让响应变大,还多出往返;第三,没有统一格式 ——
                HAL、JSON:API、Siren 各行其是;第四,
                框架和客户端库的支持一直很薄。
              </>
            }
          />
        </p>

        <Callout
          tone="win"
          title={{ en: "An honest summary", zh: "诚实的结论" }}
        >
          <p>
            <T
              en={
                <>
                  What the industry calls REST is usually <b>L2 plus JSON</b>.
                  This course follows that reality: chapters 04 and 05 are all
                  L2 practice. But you now know what the full idea asks for. The
                  next time HATEOAS comes up, you can explain what it requires,
                  how little of it is built, and why.
                </>
              }
              zh={
                <>
                  业界所说的「REST」通常是 <b>L2 + JSON</b>。
                  这门课接下来也按现实教 —— 第 04、05 章练的全是 L2 的手艺。
                  但你现在知道完整的想法长什么样了:
                  下次有人聊起 HATEOAS,你能讲清它要求什么、落地了多少、以及为什么。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 动手任务 ================= */}
      <Section
        id="labs"
        index="06"
        title={{ en: "Practice", zh: "动手任务" }}
        desc={{
          en: "Three tasks: find hypermedia links in a real API, then practice judging maturity level and modeling resources.",
          zh: "三个任务:在真实 API 里找超媒体的痕迹,再练一练判级和资源建模。",
        }}
      >
        <LabSet ch="rest" items={LABS} />
      </Section>

      {/* ================= §07 通关测验 ================= */}
      <Section
        id="quiz"
        index="07"
        title={{ en: "Chapter quiz", zh: "通关测验" }}
        desc={{
          en: "Eight questions. 'What is REST' is a common interview question. After this chapter you can answer it with the detail most people miss.",
          zh: "八道题。「REST 是什么」是面试常考题,答完这一章,你能讲出大多数人讲不出的层次。",
        }}
      >
        <Quiz ch="rest" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                REST is an <b>architectural style</b> — not a protocol and not a
                data format. It is a set of constraints, and the more of them
                your system follows, the more of the web&apos;s existing
                infrastructure it can reuse.
              </>
            ),
            zh: (
              <>
                REST 是<b>架构风格</b>,不是协议,也不是数据格式。
                它是一组约束:守得越多,你的系统就越能复用 Web 已有的基础设施。
              </>
            ),
          },
          {
            en: (
              <>
                Three ideas: the <b>resource</b> is the thing, the <b>URI</b> is
                its identifier, and the <b>representation</b> is a copy of it in
                one format at one moment. JSON is the most common
                representation, not a requirement — change the{" "}
                <code>Accept</code> header and you get another one.
              </>
            ),
            zh: (
              <>
                三件套:<b>资源</b>是那个事物,<b>URI</b> 是它的标识符,
                <b>表述</b>是它在某一刻、某种格式下的副本。JSON
                是最常见的表述,不是要求 —— 换个 <code>Accept</code>{" "}
                就能换一种。
              </>
            ),
          },
          {
            en: (
              <>
                <b>Stateless</b> means each request carries everything needed to
                understand it, and session state stays with the client. It does
                not mean the server stores no data. This is what makes it
                possible to scale by adding machines.
              </>
            ),
            zh: (
              <>
                <b>无状态</b>是指每个请求自带理解它所需的一切,
                会话状态由客户端保管。它不表示服务器什么都不存。
                这正是「加机器就能扩容」的前提。
              </>
            ),
          },
          {
            en: (
              <>
                The maturity model: L0 one endpoint → L1 separate resources →
                L2 methods and status codes → L3 hypermedia. What the industry
                calls REST is usually L2 plus JSON.
              </>
            ),
            zh: (
              <>
                成熟度阶梯:L0 单端点 → L1 资源分开 → L2 方法 + 状态码 → L3
                超媒体。业界口中的「REST」通常是 L2 + JSON。
              </>
            ),
          },
          {
            en: (
              <>
                HATEOAS asks the server to put the available next steps into the
                response as links. Few APIs do it, and Fielding considers those
                APIs not REST. GitHub&apos;s <code>*_url</code> fields are a
                partial example.
              </>
            ),
            zh: (
              <>
                HATEOAS 要求服务器把「接下来能做什么」以链接的形式放进响应。
                真正做到的 API 很少,而 Fielding 认为那些 API 不算 REST。
                GitHub 的一排 <code>*_url</code> 字段是一个局部的例子。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="rest" />
    </main>
  );
}
