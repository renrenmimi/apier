"use client";

// 第 01 章 · HTTP:API 的母语 ——
// 一封写给服务器的信:URL 解剖 → 报文解剖 → 方法 → 状态码 → Header → 完整对话。
// 双语:JSX 里用 <T en zh />,组件 props 传 { en, zh }(见 lib/i18n.tsx)。

import "./chapter.css";

import {
  Hero,
  Section,
  Callout,
  KeyPoints,
  ChapterFooter,
  Method,
} from "@/lib/kit";
import { CodeBlock, CodePair } from "@/lib/code";
import { LabSet } from "@/lib/labs";
import { Quiz } from "@/lib/quiz";
import { LABS, QUIZ } from "@/lib/http-data";
import { T } from "@/lib/i18n";
import { HeroLetter, UrlAnatomy, MethodPicker, StatusExplorer } from "./viz";

/* ---------- §02 报文样例 ----------
 * 报文正文两种语言完全一致 —— 线上传的是同一份字节。 */

const REQ_MSG = `POST /v1/products HTTP/1.1
Host: api.shop.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

{ "name": "Mechanical keyboard", "price": 399 }`;

const RES_MSG = `HTTP/1.1 201 Created
Content-Type: application/json
Location: /v1/products/43

{ "id": 43, "name": "Mechanical keyboard", "price": 399 }`;

/* ---------- §06 完整对话 ---------- */

const CONV_REQ = `GET /v1/products/42 HTTP/1.1
Host: api.shop.com
Accept: application/json`;

const CONV_RES = `HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: max-age=60
ETag: "v7"

{
  "id": 42,
  "name": "Mechanical keyboard",
  "price": 399,
  "stock": 17
}`;

/* 只有注释双语,命令逐字节相同。 */
const CONV_CURL = {
  en: `# -i prints the response headers together with the body
curl -i "https://api.shop.com/v1/products/42"

# A POST: -X sets the method, -H adds a header, -d sends the body
curl -X POST "https://api.shop.com/v1/products" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "Mechanical keyboard", "price": 399 }'`,
  zh: `# -i:把响应头连同正文一起打印出来
curl -i "https://api.shop.com/v1/products/42"

# 发一个 POST:-X 换方法,-H 加请求头,-d 带正文
curl -X POST "https://api.shop.com/v1/products" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "Mechanical keyboard", "price": 399 }'`,
};

export default function HttpPage() {
  return (
    <main className="page" data-ch="http">
      <Hero
        ch="http"
        title={{
          en: (
            <>
              The <span className="grad">HTTP</span> message, line by line
            </>
          ),
          zh: (
            <>
              <span className="grad">HTTP</span>,API 的母语
            </>
          ),
        }}
        essence={{
          en: (
            <>
              Every API call is one HTTP request and one HTTP response. A
              request carries a method, a target, headers, and an optional
              body. A response carries a status code, headers, and an optional
              body. This chapter reads both, part by part.
            </>
          ),
          zh: (
            <>
              每一次 API 调用,都是一个 HTTP 请求加一个 HTTP
              响应。请求由方法、目标、Header 和可选的正文组成;
              响应由状态码、Header 和可选的正文组成。这一章把两边逐段拆开读。
            </>
          ),
        }}
        chips={[
          { id: "url", n: "01", label: { en: "The URL", zh: "URL 解剖台" } },
          {
            id: "anatomy",
            n: "02",
            label: { en: "Message anatomy", zh: "报文解剖" },
          },
          { id: "methods", n: "03", label: { en: "Methods", zh: "方法" } },
          { id: "status", n: "04", label: { en: "Status codes", zh: "状态码" } },
          { id: "headers", n: "05", label: { en: "Headers", zh: "Header" } },
          {
            id: "conversation",
            n: "06",
            label: { en: "A full exchange", zh: "一次完整对话" },
          },
          { id: "labs", n: "07", label: { en: "Practice", zh: "动手" } },
          { id: "quiz", n: "08", label: { en: "Quiz", zh: "测验" } },
        ]}
      >
        <HeroLetter />
      </Hero>

      {/* ================= §01 URL 解剖台 ================= */}
      <Section
        id="url"
        index="01"
        title={{
          en: "The URL: which server, which resource",
          zh: "URL 解剖台:先看信封上的地址",
        }}
        desc={{
          en: "A URL says where the request goes and which resource it asks for. It splits into parts, and each part does one job. Click a part to read what it does.",
          zh: "URL 说明这次请求送到哪台服务器、要哪个资源。它拆开是好几段,每段各管一件事 —— 点每一段试试。",
        }}
      >
        <UrlAnatomy />
        <Callout
          tone="idea"
          title={{ en: "How to read any URL", zh: "读 URL 的口诀" }}
        >
          <p>
            <T
              en={
                <>
                  Read it from left to right:{" "}
                  <b>
                    how the message is sent (the scheme) → which server receives
                    it (the host) → which resource (the path) → what options
                    apply (the query string)
                  </b>
                  . However long a URL is, it splits along those four
                  boundaries.
                </>
              }
              zh={
                <>
                  从左往右:
                  <b>
                    怎么送(scheme)→ 送到哪台服务器(host)→
                    要哪个资源(路径)→ 有什么附加选项(查询字符串)
                  </b>
                  。再长的 URL,按这四段一切,都读得懂。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §02 报文解剖 ================= */}
      <Section
        id="anatomy"
        index="02"
        title={{
          en: "Message anatomy: what a request actually looks like",
          zh: "报文解剖:这封信的全文长什么样",
        }}
        desc={{
          en: "The browser, fetch, and curl all send the same thing: an HTTP message. In HTTP/1.1 that message is plain text, so you can read it directly.",
          zh: "浏览器、fetch、curl 寄出去的是同一样东西:HTTP 报文(message)。在 HTTP/1.1 里,它就是纯文本 —— 你现在就能读。",
        }}
      >
        <p className="sec-desc">
          <T
            en={
              <>
                Here is a complete <b>request message</b>. This one does not
                read a product. It creates one, so it carries a body.
              </>
            }
            zh={
              <>
                先看一封完整的<b>请求报文(request message)</b>
                :这次不是读一个商品,而是新建一个商品 —— 所以它带上了正文。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="http"
          title={{ en: "Request message", zh: "请求报文 · 原文" }}
          code={REQ_MSG}
          hl={[1]}
          note={{
            en: (
              <>
                The highlighted first line is the <b>request line</b>: method,
                target, and HTTP version. After it come the headers, one blank
                line, and the body.
              </>
            ),
            zh: (
              <>
                高亮的第一行是<b>请求行(request line)</b>:方法 + 目标 + HTTP
                版本。往下依次是 Header、一个空行、正文。
              </>
            ),
          }}
        />
        <div className="grid-2">
          <div className="card">
            <div className="card-kicker">
              <T en="Line 1" zh="第 1 行 · 信封" />
            </div>
            <div className="card-title">
              <T en="Request line" zh="请求行" />
            </div>
            <p>
              <T
                en={
                  <>
                    <code>POST /v1/products HTTP/1.1</code> — the method says
                    what to do, the target says which resource, and the version
                    says which rules both sides follow.
                  </>
                }
                zh={
                  <>
                    <code>POST /v1/products HTTP/1.1</code> ——
                    方法说要干什么,目标说是哪个资源,版本说双方按哪版规矩来。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Lines 2 to 4" zh="第 2–4 行 · 信纸抬头" />
            </div>
            <div className="card-title">
              <T en="Header block" zh="Header 区" />
            </div>
            <p>
              <T
                en={
                  <>
                    One header per line, written as <code>Name: value</code>.
                    Headers carry metadata: which host the request is for
                    (Host), what format the body uses (Content-Type), and who is
                    calling (Authorization).
                  </>
                }
                zh={
                  <>
                    一行一条 <code>名字: 值</code>
                    。Header 装的是元信息:这封信寄给哪台主机(Host)、
                    正文是什么格式(Content-Type)、调用者是谁(Authorization)。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Line 5" zh="第 5 行 · 分界线" />
            </div>
            <div className="card-title">
              <T en="One blank line" zh="一个空行" />
            </div>
            <p>
              <T
                en={
                  <>
                    The blank line marks the end of the headers and the start of
                    the body. It is the only marker a parser has, so it is never
                    optional.
                  </>
                }
                zh={
                  <>
                    这个空行标记「Header 结束、正文开始」。
                    解析程序只认它这一个界标,所以它一行都不能少。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="After the blank line" zh="最后 · 信的内容" />
            </div>
            <div className="card-title">
              <T en="Body" zh="正文(body)" />
            </div>
            <p>
              <T
                en={
                  <>
                    The data being sent, here a piece of JSON. A real request
                    also sends <code>Content-Length</code> (or uses chunked
                    transfer encoding) so the receiver knows how many bytes the
                    body has. A GET request normally has no body, because it
                    only asks to read something.
                  </>
                }
                zh={
                  <>
                    这次要发送的数据,一段 JSON。真实请求还会带{" "}
                    <code>Content-Length</code>(或者用分块传输编码),
                    好让接收方知道正文有多少字节。GET 这类只读请求通常不带正文 ——
                    只是读一样东西,不需要附材料。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <p className="sec-desc" style={{ marginTop: 18 }}>
          <T
            en={
              <>
                The server replies with a <b>response message</b>. The structure
                is the same. Only the first line changes: instead of saying what
                to do, it reports what happened.
              </>
            }
            zh={
              <>
                服务器的回信是<b>响应报文(response message)</b>
                ,结构完全一样。只有第一行换了内容:
                从「我要干什么」变成「办得怎么样」。
              </>
            }
          />
        </p>
        <CodeBlock
          lang="http"
          title={{ en: "Response message", zh: "响应报文 · 原文" }}
          code={RES_MSG}
          hl={[1]}
          note={{
            en: (
              <>
                The status line carries the HTTP version, the <b>status code</b>
                , and a short reason phrase. 201 Created means a new resource
                was created, and the <code>Location</code> header gives its
                address.
              </>
            ),
            zh: (
              <>
                状态行(status line)由 HTTP 版本 + <b>状态码</b> +
                一句原因短语组成。201 Created 表示新资源已创建,
                <code>Location</code> 头给出它的地址。
              </>
            ),
          }}
        />
        <Callout
          tone="deep"
          title={{
            en: "HTTP/1.1 messages are text; HTTP/2 and HTTP/3 are not",
            zh: "HTTP/1.1 的报文是文本,HTTP/2 与 HTTP/3 不是",
          }}
        >
          <p>
            <T
              en={
                <>
                  The two blocks above are not diagrams. That is the exact text
                  an HTTP/1.1 client puts on the connection, which is why you
                  can type a request by hand in a terminal and get a real
                  response back. HTTP/2 and HTTP/3 replace the text with a
                  compressed binary format, but they carry the same parts: a
                  method, a target, headers, a status code, and a body.{" "}
                  <b>
                    Learn to read the parts, and the wire format stops
                    mattering.
                  </b>
                </>
              }
              zh={
                <>
                  上面两段不是示意图,是 HTTP/1.1
                  客户端真正写到连接上的<b>原文</b> ——
                  所以你可以在终端里一个字一个字敲出请求,拿到真的响应。HTTP/2 和
                  HTTP/3 把这段文本换成了压缩过的二进制格式,但传的还是同样几件东西:
                  方法、目标、Header、状态码、正文。
                  <b>把这几部分读明白,底层用什么格式传就不重要了。</b>
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 方法 ================= */}
      <Section
        id="methods"
        index="03"
        title={{
          en: "Methods: what the request wants to do",
          zh: "方法:这次请求要干什么",
        }}
        desc={{
          en: "The target says which resource. The method says what to do with it. There are only a few methods, and each one comes with a promise.",
          zh: "目标回答「对哪个资源」,方法(method)回答「干什么」。方法一共没几个,但每个都带着一份承诺。",
        }}
      >
        <div className="table-wrap">
          <table className="t-table ht-mtable">
            <thead>
              <tr>
                <th>
                  <T en="Method" zh="方法" />
                </th>
                <th>
                  <T en="Meaning" zh="一句话语义" />
                </th>
                <th>
                  <T en="Safe" zh="安全" />
                </th>
                <th>
                  <T en="Idempotent" zh="幂等" />
                </th>
                <th>
                  <T en="Notes" zh="备注" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Method m="GET" />
                </td>
                <td>
                  <T en="Read the resource." zh="读取资源。" />
                </td>
                <td>
                  <span className="ht-yes">✓</span>
                </td>
                <td>
                  <span className="ht-yes">✓</span>
                </td>
                <td>
                  <T
                    en="No body. The response can be cached."
                    zh="不带正文;响应可以被缓存。"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <Method m="POST" />
                </td>
                <td>
                  <T
                    en="Send data for the server to process. Most often: create a new resource."
                    zh="把数据交给服务器处理,最常见的用法是创建新资源。"
                  />
                </td>
                <td>
                  <span className="ht-no">✕</span>
                </td>
                <td>
                  <span className="ht-no">✕</span>
                </td>
                <td>
                  <T
                    en="Sending it twice can create two resources."
                    zh="发两次可能创建出两份。"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <Method m="PUT" />
                </td>
                <td>
                  <T
                    en={
                      <>
                        <b>Replace</b> the resource with the body you send.
                      </>
                    }
                    zh={
                      <>
                        用请求体<b>整体替换</b>资源。
                      </>
                    }
                  />
                </td>
                <td>
                  <span className="ht-no">✕</span>
                </td>
                <td>
                  <span className="ht-yes">✓</span>
                </td>
                <td>
                  <T
                    en="Sending the same body again leaves the same state."
                    zh="同一份放几次,状态都一样。"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <Method m="PATCH" />
                </td>
                <td>
                  <T
                    en={
                      <>
                        Change <b>part</b> of the resource.
                      </>
                    }
                    zh={
                      <>
                        <b>部分修改</b>资源。
                      </>
                    }
                  />
                </td>
                <td>
                  <span className="ht-no">✕</span>
                </td>
                <td>
                  <span className="ht-no">✕</span>
                </td>
                <td>
                  <T
                    en="The specification does not promise idempotence."
                    zh="规范不承诺幂等。"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <Method m="DELETE" />
                </td>
                <td>
                  <T en="Remove the resource." zh="删除资源。" />
                </td>
                <td>
                  <span className="ht-no">✕</span>
                </td>
                <td>
                  <span className="ht-yes">✓</span>
                </td>
                <td>
                  <T
                    en="After one delete or five, the resource is gone."
                    zh="删一次和删五次,资源都是没了。"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <Method m="HEAD" />
                </td>
                <td>
                  <T
                    en="Same as GET, but the response has no body."
                    zh="和 GET 一样,但响应没有正文。"
                  />
                </td>
                <td>
                  <span className="ht-yes">✓</span>
                </td>
                <td>
                  <span className="ht-yes">✓</span>
                </td>
                <td>
                  <T
                    en="Used to check whether a resource exists, and how large it is."
                    zh="用来探测资源存不存在、有多大。"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <Method m="OPTIONS" />
                </td>
                <td>
                  <T
                    en="Ask which methods the target supports."
                    zh="问这个目标支持哪些方法。"
                  />
                </td>
                <td>
                  <span className="ht-yes">✓</span>
                </td>
                <td>
                  <span className="ht-yes">✓</span>
                </td>
                <td>
                  <T
                    en="Used by the CORS preflight request. Chapter 06."
                    zh="CORS 预检请求用它,第 06 章讲。"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="sec-desc">
          <T
            en={
              <>
                Those two columns are the important part of this section.{" "}
                <b>Safe</b> means the request is not meant to change anything on
                the server. <b>Idempotent</b> means that sending the same
                request once or many times leaves the server in the same state.
                Idempotence is about the effect, not about the reply: a second
                DELETE may answer 404 while the effect is unchanged. Every safe
                method is idempotent. The reverse is not true — PUT writes data,
                so it is not safe, but writing the same body again produces the
                same state, so it is idempotent.
              </>
            }
            zh={
              <>
                表里那两列术语,是这一节真正的重点。<b>安全(safe)</b>=
                这个请求本来就不打算改服务器上的任何东西;<b>幂等(idempotent)</b>=
                同一个请求发 1 次和发 N 次,服务器最后的状态一样。
                幂等看的是<b>效果</b>,不是回信:第二次 DELETE 可能回 404,
                但效果没变。安全的方法一定幂等,反过来不成立 —— PUT
                会写数据(不安全),但同一份写几次结果相同(幂等)。
              </>
            }
          />
        </p>

        <Callout
          tone="idea"
          title={{
            en: "Why idempotence matters: you can retry",
            zh: "幂等到底有什么用?一个词:敢重试",
          }}
        >
          <p>
            <T
              en={
                <>
                  You send a request and the connection times out. You do not
                  know whether the server never received it, or handled it and
                  lost the reply. <b>With an idempotent method you can send it
                  again</b>, because the state ends up the same either way. With
                  POST you cannot: if the first attempt succeeded, the retry
                  creates a second order or charges the card twice.
                </>
              }
              zh={
                <>
                  请求发出去,连接超时了。到底是根本没送到,还是办完了但回信丢了?
                  <b>你不知道。</b>这时候<b>幂等方法可以直接重发</b>
                  ,反正最后的状态一样。POST 不行 ——
                  万一第一次已经成功,重发就是重复下单、重复扣款。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  This also settles a common question. &ldquo;The second DELETE
                  returns 404 — is it still idempotent?&rdquo; Yes. Idempotence
                  is defined by the <b>effect on the server</b>, not by the
                  status code. After one delete and after two, the resource is
                  gone.
                </>
              }
              zh={
                <>
                  顺带解决一个经典疑惑:「DELETE 第二次返回 404,那还幂等吗?」——
                  幂等是按<b>服务器状态的变化</b>定义的,不看响应码。
                  删一次和删两次,资源都是没了,状态相同,幂等成立。
                </>
              }
            />
          </p>
        </Callout>

        <Callout
          tone="warn"
          title={{
            en: "PUT and PATCH: the pair people mix up",
            zh: "PUT 和 PATCH:最容易混淆的一对",
          }}
        >
          <p>
            <T
              en={
                <>
                  <b>PUT replaces the whole resource.</b> If you send half the
                  object, the fields you left out are removed. That is how an
                  email address or a bio disappears from a profile.{" "}
                  <b>PATCH changes only the fields you mention.</b> PATCH is
                  also not idempotent in general: a patch meaning &ldquo;add 1
                  to the stock count&rdquo; adds 2 when it runs twice. To change
                  a few fields, use PATCH. To replace the resource, use PUT and
                  send the <b>complete</b> object.
                </>
              }
              zh={
                <>
                  <b>PUT = 整体替换。</b>你只传半个对象,漏掉的字段按语义会被清空 ——
                  资料表里 email、bio 一夜蒸发,就是这么来的。
                  <b>PATCH = 部分修改</b>,只动你提到的字段。另外 PATCH
                  一般不幂等:像「库存 +1」这样的补丁,执行两次就是 +2。
                  想只改几个字段?用 PATCH。想整份覆盖?用 PUT,并且传
                  <b>完整</b>的一份。
                </>
              }
            />
          </p>
        </Callout>

        <MethodPicker />
      </Section>

      {/* ================= §04 状态码 ================= */}
      <Section
        id="status"
        index="04"
        title={{
          en: "Status codes: the first line of the reply",
          zh: "状态码:回信的第一行",
        }}
        desc={{
          en: "Three digits. The first digit tells you what kind of answer this is. Learn the five families first, then the individual codes.",
          zh: "三位数字,第一位就说明了这是哪一类回答。先认五大家族,再逐个点名。",
        }}
      >
        <div className="ht-fam-grid">
          <div className="ht-fam" data-x={1}>
            <div className="ht-fam-code">1xx</div>
            <div className="ht-fam-name">
              <T en="Informational" zh="信息" />
            </div>
            <p>
              <T
                en="Received, still working. You will rarely meet these."
                zh="「收到,还在处理。」日常几乎见不到。"
              />
            </p>
          </div>
          <div className="ht-fam" data-x={2}>
            <div className="ht-fam-code">2xx</div>
            <div className="ht-fam-name">
              <T en="Success" zh="成功" />
            </div>
            <p>
              <T
                en="It worked. 200 returns a body, 201 created a resource, 202 accepted the work but has not finished it, 204 succeeded with no body."
                zh="「办成了。」200 带正文,201 创建了资源,202 收下了但还没做完,204 成功但没有正文。"
              />
            </p>
          </div>
          <div className="ht-fam" data-x={3}>
            <div className="ht-fam-code">3xx</div>
            <div className="ht-fam-name">
              <T en="Redirection" zh="重定向" />
            </div>
            <p>
              <T
                en="Look somewhere else. 301 moved permanently, 304 says your cached copy is still good."
                zh="「去别处拿。」301 永久搬家,304 说你缓存里那份还能用。"
              />
            </p>
          </div>
          <div className="ht-fam" data-x={4}>
            <div className="ht-fam-code">4xx</div>
            <div className="ht-fam-name">
              <T en="Client error" zh="请求的问题" />
            </div>
            <p>
              <T
                en="The request is the problem: its syntax, its credentials, its permissions, or its target."
                zh="「问题在请求这边。」格式、凭证、权限、地址 —— 总有一样不对。"
              />
            </p>
          </div>
          <div className="ht-fam" data-x={5}>
            <div className="ht-fam-code">5xx</div>
            <div className="ht-fam-name">
              <T en="Server error" zh="服务器的问题" />
            </div>
            <p>
              <T
                en="The server is the problem. Changing your request will not help."
                zh="「问题在服务器这边。」你改请求没用,等修。"
              />
            </p>
          </div>
        </div>

        <p className="sec-desc">
          <T
            en={
              <>
                These sixteen codes cover most of what an API returns.{" "}
                <b>Click one to read a plain explanation and a typical case.</b>{" "}
                You do not have to memorize them. Come back and look them up
                when you meet one.
              </>
            }
            zh={
              <>
                下面十六位覆盖了 API 日常返回的绝大多数情况。
                <b>点一格,看它的通俗解释和典型场景。</b>
                不用背,真撞见时回来查就行。
              </>
            }
          />
        </p>
        <StatusExplorer />

        <Callout
          tone="warn"
          title={{
            en: "401 and 403: keep these two apart",
            zh: "401 和 403,一定要分清的一对",
          }}
        >
          <p>
            <T
              en={
                <>
                  <b>401 asks: who are you?</b> The credential is missing,
                  expired, or invalid. A 401 response must include a{" "}
                  <code>WWW-Authenticate</code> header telling the client how to
                  authenticate. Send a valid token and the request can succeed.{" "}
                  <b>403 means: I know who you are, and you are not allowed.</b>{" "}
                  The identity is clear and the permission is missing, so
                  logging in again changes nothing. The name of 401,
                  Unauthorized, is misleading: it is about authentication, not
                  authorization. That is a historical accident you have to live
                  with.
                </>
              }
              zh={
                <>
                  <b>401 问的是「你是谁?」</b>凭证缺失、过期或无效。规范要求 401
                  响应必须带 <code>WWW-Authenticate</code> 头,告诉客户端该怎么认证
                  —— 带上有效凭证再来,请求就能成功。
                  <b>403 说的是「认识你,但你不许。」</b>
                  身份很明确,就是权限不够,重新登录也没用。401 这个名字
                  (Unauthorized,未授权)其实容易误导:它管的是认证,不是授权。
                  历史遗留,认了吧。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  One more thing: some APIs answer <b>404 where 403 would be
                  correct</b>, so that you cannot learn that the resource
                  exists. The GitHub API does this. Request a private repository
                  you cannot access and it answers 404, as if the repository did
                  not exist.
                </>
              }
              zh={
                <>
                  再补充一点:有些 API 会故意在该回 403 的地方
                  <b>回 404</b>,不让你探知「这个资源存在,只是你没权限」。GitHub API
                  就这么干:访问你无权访问的私有仓库,回你一个 404,装作查无此仓。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §05 Header ================= */}
      <Section
        id="headers"
        index="05"
        title={{
          en: "Headers: five you will see every day",
          zh: "Header:天天见的五位常客",
        }}
        desc={{
          en: "Headers carry metadata about the message, one Name: value pair per line. There are hundreds of them. These five cover most API work. Some belong on requests, some on responses.",
          zh: "Header 是关于这条报文的元信息,一行一条「名字: 值」。它有上百种,但 API 日常主要和这五位打交道。有的出现在请求里,有的出现在响应里。",
        }}
      >
        <div className="ht-hdr-grid">
          <div className="card">
            <div className="card-kicker">
              <T en="What I am sending" zh="我发的是什么" />
            </div>
            <div className="card-title">Content-Type</div>
            <p>
              <T
                en={
                  <>
                    Describes the format of <b>the body in this message</b>. It
                    appears on a request and on a response, whenever there is a
                    body. Send JSON without it and the server may parse the body
                    as a form or as plain text. The usual result is empty
                    fields, or a 400.
                  </>
                }
                zh={
                  <>
                    描述<b>这条报文里正文</b>的格式。请求和响应都可能带它 ——
                    只要有正文就该有它。发 JSON 忘了带,服务器可能按表单或纯文本解析,
                    轻则字段全空,重则 400。
                  </>
                }
              />
            </p>
            <div className="ht-hdr-ex">
              <span className="hn">Content-Type</span>:{" "}
              <span className="hv">application/json; charset=utf-8</span>
            </div>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="What I want back" zh="我想要什么" />
            </div>
            <div className="card-title">Accept</div>
            <p>
              <T
                en={
                  <>
                    A <b>request</b> header. It states which formats the client
                    can handle, and the server picks one. This is called content
                    negotiation. The same resource can be returned as JSON or as
                    another representation.
                  </>
                }
                zh={
                  <>
                    <b>请求</b>头。它说明客户端能处理哪些格式,由服务器挑一个,
                    这叫内容协商(content negotiation)。同一个资源,可以返回 JSON,
                    也可以返回别的表述。
                  </>
                }
              />
            </p>
            <div className="ht-hdr-ex">
              <span className="hn">Accept</span>:{" "}
              <span className="hv">application/json</span>
            </div>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="My credential" zh="我的通行证" />
            </div>
            <div className="card-title">Authorization</div>
            <p>
              <T
                en={
                  <>
                    A <b>request</b> header carrying the credential, most often
                    the word <code>Bearer</code> followed by a token. How a
                    token can prove who you are is the subject of chapter 06.
                  </>
                }
                zh={
                  <>
                    <b>请求</b>头,装的是认证凭据,最常见的是 <code>Bearer</code>{" "}
                    加一段 token。一段 token 凭什么能证明「你是你」?第 06 章整章讲它。
                  </>
                }
              />
            </p>
            <div className="ht-hdr-ex">
              <span className="hn">Authorization</span>:{" "}
              <span className="hv">Bearer eyJhbGciOiJIUzI1NiJ9...</span>
            </div>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="How long it may be stored" zh="能存多久" />
            </div>
            <div className="card-title">Cache-Control</div>
            <p>
              <T
                en={
                  <>
                    Mostly a <b>response</b> header. It states whether the
                    response may be stored and for how long. The line below
                    means the client may reuse this response for one hour
                    without asking again. A request can send it too, to say what
                    it will accept from a cache.
                  </>
                }
                zh={
                  <>
                    主要是<b>响应</b>头,说明这份响应能不能存、能存多久。
                    下面这行的意思是「一小时内可以直接复用,不用再来问我」。
                    请求也可以带它,用来说明自己能接受多旧的缓存。
                  </>
                }
              />
            </p>
            <div className="ht-hdr-ex">
              <span className="hn">Cache-Control</span>:{" "}
              <span className="hv">max-age=3600</span>
            </div>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Version identifier" zh="版本指纹" />
            </div>
            <div className="card-title">ETag</div>
            <p>
              <T
                en={
                  <>
                    A <b>response</b> header. It identifies the current version
                    of the resource. Next time the client sends{" "}
                    <code>If-None-Match: &quot;33a64df5&quot;</code>. If the
                    resource has not changed, the server answers 304 and sends
                    no body.
                  </>
                }
                zh={
                  <>
                    <b>响应</b>头,标识资源当前的版本。下次请求带上{" "}
                    <code>If-None-Match: &quot;33a64df5&quot;</code>,
                    资源没变服务器就回 304,正文一个字节都不发。
                  </>
                }
              />
            </p>
            <div className="ht-hdr-ex">
              <span className="hn">ETag</span>:{" "}
              <span className="hv">&quot;33a64df5&quot;</span>
            </div>
          </div>
        </div>
        <Callout
          tone="idea"
          title={{
            en: "Two details worth knowing",
            zh: "两条细节,省你以后犯嘀咕",
          }}
        >
          <p>
            <T
              en={
                <>
                  Header <b>names are case-insensitive</b>. DevTools shows{" "}
                  <code>content-type</code> and the documentation writes{" "}
                  <code>Content-Type</code>; they are the same header. Header{" "}
                  <b>values</b> are a different matter: whether case matters
                  depends on the field. A media type such as{" "}
                  <code>application/json</code> is case-insensitive, while an
                  ETag value is not.
                </>
              }
              zh={
                <>
                  Header 的<b>名字不区分大小写</b>:DevTools 里显示{" "}
                  <code>content-type</code>,文档里写 <code>Content-Type</code>,
                  是同一个 header。但 header 的<b>值</b>是另一回事:区不区分大小写
                  要看具体字段 —— <code>application/json</code>{" "}
                  这类媒体类型不区分,ETag 的值则区分。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  Non-standard headers used to be written with an{" "}
                  <code>X-</code> prefix, such as <code>X-API-Key</code>. RFC
                  6648 recommends against that prefix, because such a header
                  often becomes standard later and then the name is wrong. You
                  will still meet <code>X-</code> in plenty of APIs.
                </>
              }
              zh={
                <>
                  非标准的自定义 header 过去习惯加 <code>X-</code> 前缀,比如{" "}
                  <code>X-API-Key</code>。RFC 6648 已经不建议这么做 ——
                  这类 header 后来常常被标准化,前缀反而成了错名字。
                  不过现实里还是会经常见到 <code>X-</code>,见到别慌。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 一次完整对话 ================= */}
      <Section
        id="conversation"
        index="06"
        title={{
          en: "One full exchange: request and response side by side",
          zh: "一次完整对话:请求与响应面对面",
        }}
        desc={{
          en: "Everything in this chapter, in one round trip. The request you send on the left, the response you get back on the right.",
          zh: "把这一章学的全拼起来:左边是你发出的请求,右边是收到的响应。",
        }}
      >
        <CodePair
          left={
            <CodeBlock
              lang="http"
              title={{ en: "Request · what you send", zh: "你发出的 · 请求" }}
              code={CONV_REQ}
              note={{
                en: (
                  <>
                    GET only reads, so it sends no body and the message ends
                    with the headers. <code>Accept</code> states what the client
                    wants back: JSON.
                  </>
                ),
                zh: (
                  <>
                    GET 只是读取,所以不带正文,Header 写完这条报文就结束了。
                    <code>Accept</code> 说明客户端想要什么:JSON。
                  </>
                ),
              }}
            />
          }
          right={
            <CodeBlock
              lang="http"
              title={{
                en: "Response · what comes back",
                zh: "你收到的 · 响应",
              }}
              code={CONV_RES}
              note={{
                en: (
                  <>
                    200 means the request succeeded. <code>Cache-Control</code>{" "}
                    allows the client to reuse this response for 60 seconds.{" "}
                    <code>ETag</code> identifies the version: send it back in{" "}
                    <code>If-None-Match</code> later, and an unchanged resource
                    answers 304.
                  </>
                ),
                zh: (
                  <>
                    200 表示请求成功。<code>Cache-Control</code> 允许客户端在 60
                    秒内直接复用这份响应;<code>ETag</code> 标识版本 ——
                    下次把它放进 <code>If-None-Match</code> 发回来,
                    资源没变就回 304。
                  </>
                ),
              }}
            />
          }
        />

        <p className="sec-desc" style={{ marginTop: 18 }}>
          <T
            en={
              <>
                Now send the same kind of request with a different tool.{" "}
                <b>curl</b> is a command line HTTP client. The interface looks
                nothing like fetch, and the message on the connection is
                identical:
              </>
            }
            zh={
              <>
                换个工具再发一次。<b>curl</b> 是命令行 HTTP 客户端 ——
                界面和 fetch 完全不同,写到连接上的报文一模一样:
              </>
            }
          />
        </p>
        <CodeBlock
          lang="bash"
          title="terminal"
          code={CONV_CURL}
          note={{
            en: (
              <>
                <b>The tool changes; the message does not.</b> A browser, fetch,
                curl, and Postman all produce the same HTTP message. Learn to
                read the message and you can read any of them. (api.shop.com is
                an example domain used in this course. The practice tasks below
                use a real public API.)
              </>
            ),
            zh: (
              <>
                <b>工具千变,报文不变。</b>浏览器、fetch、curl、Postman
                生成的是同一份 HTTP 报文 —— 学会读报文,你就看懂了所有工具。
                (api.shop.com 是本课程虚构的示例域名;下面的动手任务用的是真的公开
                API。)
              </>
            ),
          }}
        />
      </Section>

      {/* ================= §07 动手任务 ================= */}
      <Section
        id="labs"
        index="07"
        title={{ en: "Practice", zh: "动手任务" }}
        desc={{
          en: "Reading about messages is not the same as looking at one. Three tasks, using DevTools and the browser console.",
          zh: "报文这东西,读十遍不如亲手抓一遍。三个任务,DevTools 和浏览器 Console 就够。",
        }}
      >
        <LabSet ch="http" items={LABS} />
      </Section>

      {/* ================= §08 通关测验 ================= */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Eight questions on methods, status codes, and headers. Get them all right on the first try to light the chapter dot in the sidebar.",
          zh: "八道题,把方法、状态码、Header 一网打尽。第一次全对,点亮侧栏的绿灯。",
        }}
      >
        <Quiz ch="http" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                One call is one pair of messages. A request is a{" "}
                <b>request line, headers, a blank line, and an optional body</b>
                . A response has the same four parts, with a status line first.
              </>
            ),
            zh: (
              <>
                一次调用 = 一对报文。请求是
                <b>请求行、Header、空行、可选的正文</b>
                ;响应也是这四段,只是第一行换成状态行。
              </>
            ),
          },
          {
            en: (
              <>
                The target says which resource, the method says what to do: GET
                reads, POST creates, PUT replaces the whole resource, PATCH
                changes part of it, DELETE removes it.
              </>
            ),
            zh: (
              <>
                目标回答「对哪个资源」,方法回答「干什么」:GET 读、POST 创建、
                PUT 整体替换、PATCH 部分修改、DELETE 删除。
              </>
            ),
          },
          {
            en: (
              <>
                Safe = the request should not change server state. Idempotent =
                repeating it leaves the same state, which is what makes it{" "}
                <b>safe to retry after a timeout</b>. GET, HEAD, PUT, DELETE,
                and OPTIONS are idempotent; POST and PATCH are not.
              </>
            ),
            zh: (
              <>
                安全 = 这个请求不该改服务器状态;幂等 = 重复发送,最终状态相同 ——
                所以<b>超时之后敢重试</b>。GET、HEAD、PUT、DELETE、OPTIONS
                幂等,POST 和 PATCH 不幂等。
              </>
            ),
          },
          {
            en: (
              <>
                The first digit of the status code says whose problem it is: 2xx
                succeeded, 3xx points elsewhere, 4xx is the request, 5xx is the
                server. 401 means not authenticated, 403 means not allowed.
              </>
            ),
            zh: (
              <>
                状态码第一位说明责任在谁:2xx 成功、3xx 去别处、4xx 请求的问题、5xx
                服务器的问题。401 是「没认证」,403 是「不许」。
              </>
            ),
          },
          {
            en: (
              <>
                Five headers cover most of the work: Content-Type (the format I
                send), Accept (the format I want back), Authorization (my
                credential), Cache-Control and ETag (caching).
              </>
            ),
            zh: (
              <>
                Header 五常客:Content-Type(我发的格式)、Accept(我想要的格式)、
                Authorization(凭证)、Cache-Control 与 ETag(缓存这一对)。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="http" />
    </main>
  );
}
