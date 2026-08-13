"use client";

// 第 04 章 · RESTful 设计实战:
// 建筑师开工 → 贯穿案例「博客 API」→ URL 命名规矩(诊断台)→
// CRUD 映射总表 → 三场完整对话(创建/更新/删除)→ 状态码决策室 →
// RFC 9457 错误格式 → 端点竣工图 → 动手任务 → 测验 → 要点。

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
import { HeroBlueprint, UrlClinic, StatusDealer } from "./viz";

export default function RestDesignPage() {
  return (
    <main className="page" data-ch="rest-design">
      <Hero
        ch="rest-design"
        title={
          <>
            RESTful <span className="grad">设计实战</span>
          </>
        }
        essence={
          <>
            前三章你一直在看别人的图纸。这一章轮到你画:一套博客 API,
            从第一个 URL,到最后一张能拍在桌上的端点总表。
          </>
        }
        chips={[
          { id: "naming", n: "01", label: "URL 命名" },
          { id: "crud", n: "02", label: "CRUD 映射" },
          { id: "dialogs", n: "03", label: "三场对话" },
          { id: "status", n: "04", label: "状态码决策室" },
          { id: "errors", n: "05", label: "错误的说法" },
          { id: "blueprint", n: "06", label: "竣工图" },
          { id: "labs", n: "07", label: "动手" },
          { id: "quiz", n: "08", label: "测验" },
        ]}
      >
        <HeroBlueprint />
      </Hero>

      {/* ================= §01 URL 命名 ================= */}
      <Section
        id="naming"
        index="01"
        title="URL 命名的规矩"
        desc="门牌号起得好,后面全顺;起得差,天天返工。先立五条规矩。"
      >
        <Callout tone="story" title="你接到一个需求">
          <p>
            团队要做一个博客产品:用户能注册、能发文章、能在文章下评论。
            三种资源已经摆在桌上 —— <b>users、posts、comments</b>
            。后端同事看着你:「接口怎么定?」
          </p>
          <p>
            这一章结束时,你能把一张像样的端点总表拍在桌上。这套
            「博客世界观」还会一路跟着你:第 08 章用同一套数据写 GraphQL
            schema,终章拿它做两大阵营的对比 —— 全书一个世界观。
          </p>
        </Callout>

        <ul className="rd-rules">
          <li>
            <span className="no">规矩 1</span>
            <span>
              <b>名词复数表集合。</b>
              <code>/posts</code>,不是 <code>/getPosts</code>,也不是{" "}
              <code>/post</code>。集合是货架,货架上放的是同类东西。
            </span>
          </li>
          <li>
            <span className="no">规矩 2</span>
            <span>
              <b>全小写,单词之间用连字符。</b>
              <code>/blog-posts</code>,不是 <code>/BlogPosts</code> 或{" "}
              <code>/blog_posts</code>。URL 是大小写敏感的,别给调用方埋雷。
            </span>
          </li>
          <li>
            <span className="no">规矩 3</span>
            <span>
              <b>动词不进 URL。</b>URL 回答「哪儿」,方法回答「干嘛」——
              GET 就是取,POST 就是建,写在路径里属于重复。
            </span>
          </li>
          <li>
            <span className="no">规矩 4</span>
            <span>
              <b>别暴露实现。</b>路径里出现 <code>.php</code>、
              <code>.jsp</code>,等于把装修图钉在门牌上 ——
              换个技术栈,全网链接作废。
            </span>
          </li>
          <li>
            <span className="no">规矩 5</span>
            <span>
              <b>嵌套最多两层。</b>
              <code>collection/id/collection</code> 到头
              (如 <code>/posts/42/comments</code>),再深就拆平。
            </span>
          </li>
        </ul>

        <UrlClinic />

        <Callout tone="idea" title="路径与 query 的分工">
          <p>
            路径回答「<b>要什么</b>」,query 参数回答「<b>怎么要</b>」:过滤{" "}
            <code>?status=published</code>、排序{" "}
            <code>?sort=-created_at</code>、分页 <code>?page=2</code>
            。这三件套的完整玩法在第 05 章展开。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 CRUD 映射 ================= */}
      <Section
        id="crud"
        index="02"
        title="CRUD 映射总表"
        desc="URL 定好了,把动作接上。这张表背下来,九成接口设计不用再想。"
      >
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>请求</th>
                <th>通俗说法</th>
                <th>成功回</th>
                <th>幂等?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Method m="GET" /> <code>/posts</code>
                </td>
                <td>把文章列表给我</td>
                <td>
                  <Status code={200} />
                </td>
                <td>✓(还「安全」:保证不改数据)</td>
              </tr>
              <tr>
                <td>
                  <Method m="POST" /> <code>/posts</code>
                </td>
                <td>登一篇新文章</td>
                <td>
                  <Status code={201} />
                </td>
                <td>✕(发两次 = 两篇文章)</td>
              </tr>
              <tr>
                <td>
                  <Method m="GET" /> <code>/posts/42</code>
                </td>
                <td>把 42 号这篇给我</td>
                <td>
                  <Status code={200} />
                </td>
                <td>✓</td>
              </tr>
              <tr>
                <td>
                  <Method m="PUT" /> <code>/posts/42</code>
                </td>
                <td>
                  把 42 号<b>整篇</b>换成我发的这份
                </td>
                <td>
                  <Status code={200} />
                </td>
                <td>✓(换十次结果一样)</td>
              </tr>
              <tr>
                <td>
                  <Method m="PATCH" /> <code>/posts/42</code>
                </td>
                <td>42 号只改这几个字段</td>
                <td>
                  <Status code={200} />
                </td>
                <td>不承诺</td>
              </tr>
              <tr>
                <td>
                  <Method m="DELETE" /> <code>/posts/42</code>
                </td>
                <td>把 42 号删了</td>
                <td>
                  <Status code={204} />
                </td>
                <td>✓(§03 有戏)</td>
              </tr>
              <tr>
                <td>
                  <Method m="GET" /> <code>/posts/42/comments</code>
                </td>
                <td>42 号下面的评论</td>
                <td>
                  <Status code={200} />
                </td>
                <td>✓</td>
              </tr>
              <tr>
                <td>
                  <Method m="POST" /> <code>/posts/42/comments</code>
                </td>
                <td>在 42 号下面发条评论</td>
                <td>
                  <Status code={201} />
                </td>
                <td>✕</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout tone="warn" title="表里没有的组合,多半有问题">
          <p>
            <Method m="POST" /> <code>/posts/42</code>
            (对单个资源 POST)没有约定俗成的含义,能不用就不用;
            <Method m="GET" /> 永远不该改数据 —— 它是「安全」方法,
            浏览器预加载和爬虫会随意触发它,§01 诊断台里那起
            「爬虫删库」就是这么来的。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 三场对话 ================= */}
      <Section
        id="dialogs"
        index="03"
        title="三场完整对话"
        desc="创建、更新、删除 —— 三段真实报文。中间那场是本章的重头戏:PUT 会吃掉你的字段。"
      >
        <div className="rd-sub">
          <span className="n">对话一</span>创建一篇文章
        </div>
        <CodePair
          left={
            <CodeBlock
              lang="http"
              title="请求"
              code={`POST /posts HTTP/1.1
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "我的第一篇文章",
  "body": "Hello, API 世界!"
}`}
            />
          }
          right={
            <CodeBlock
              lang="http"
              title="响应"
              hl={[1, 2]}
              code={`HTTP/1.1 201 Created
Location: /posts/43
Content-Type: application/json

{
  "id": 43,
  "title": "我的第一篇文章",
  "body": "Hello, API 世界!",
  "authorId": 1,
  "createdAt": "2026-07-01T09:30:00Z"
}`}
              note={
                <>
                  三个细节:<b>201</b> 不是 200;<b>Location</b>{" "}
                  头指着新居门牌;body 回显完整资源 —— id 和 createdAt
                  是服务器填的,客户端正等着用。
                </>
              }
            />
          }
        />

        <div className="rd-sub">
          <span className="n">对话二</span>更新 —— PUT 和 PATCH 的分岔口
        </div>
        <p className="sec-desc">
          「更新」有两种,选错会丢数据。同一篇 43 号文章,两种请求都只发一个{" "}
          <code>title</code> 字段 —— 看结局:
        </p>
        <CodePair
          left={
            <CodeBlock
              lang="http"
              title="PUT · 我只发了 title"
              code={`PUT /posts/43 HTTP/1.1
Content-Type: application/json

{ "title": "改个标题而已" }`}
            />
          }
          right={
            <CodeBlock
              lang="http"
              title="PATCH · 我也只发了 title"
              code={`PATCH /posts/43 HTTP/1.1
Content-Type: application/json

{ "title": "改个标题而已" }`}
            />
          }
        />
        <CodePair
          left={
            <CodeBlock
              lang="json"
              title="PUT 之后的 43 号文章"
              code={`{
  "id": 43,
  "title": "改个标题而已"
}`}
              note={
                <>
                  body 呢?authorId 呢?—— <b>蒸发了</b>。PUT 的合同:
                  这个 URI 上的资源,从此就是你发来的这份。
                </>
              }
            />
          }
          right={
            <CodeBlock
              lang="json"
              title="PATCH 之后的 43 号文章"
              code={`{
  "id": 43,
  "title": "改个标题而已",
  "body": "Hello, API 世界!",
  "authorId": 1,
  "createdAt": "2026-07-01T09:30:00Z"
}`}
              note={
                <>
                  没提的字段<b>原样保留</b> —— PATCH 是补丁,打在原文上。
                </>
              }
            />
          }
        />
        <Callout tone="warn" title="新手丢数据的最常见的原因">
          <p>
            用 PUT 传半个对象。记住 PUT 的合同是<b>整体替换</b>:你没提的
            字段,不是「不改」,是「没有」。只想改一处,用
            PATCH。§07 的动手任务里有个真实 API 上的复现实验,
            强烈建议亲手跑一遍 —— 亲眼看着字段蒸发,这辈子都忘不了。
          </p>
        </Callout>

        <div className="rd-sub">
          <span className="n">对话三</span>删除,以及删两次
        </div>
        <CodePair
          left={
            <CodeBlock
              lang="http"
              title="第一次 DELETE"
              code={`DELETE /posts/43 HTTP/1.1
Authorization: Bearer <token>`}
            />
          }
          right={
            <CodeBlock
              lang="http"
              title="响应 · 干净利落"
              code={`HTTP/1.1 204 No Content`}
              note={<>删成了,没什么可说的 —— 连响应体都省了。</>}
            />
          }
        />
        <CodeBlock
          lang="http"
          title="手滑又删了一次 —— 43 号已经不在了"
          code={`HTTP/1.1 404 Not Found
Content-Type: application/problem+json

{
  "type": "https://api.example.com/problems/not-found",
  "title": "资源不存在",
  "status": 404,
  "detail": "43 号文章已经不在了"
}`}
          note={<>这个 body 的格式眼生?§05 马上讲它。</>}
        />
        <Callout tone="deep" title="第二次都 404 了,DELETE 怎么还叫幂等?">
          <p>
            因为幂等看的是<b>服务器状态</b>,不是响应码。删一次和删十次,
            服务器都停在同一个状态:「43 号不存在」。响应码只是每次的答话,
            状态才是合同标的。顺手记全:GET、PUT、DELETE 幂等;POST
            不幂等;PATCH 不承诺。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 状态码决策室 ================= */}
      <Section
        id="status"
        index="04"
        title="状态码决策室"
        desc="八个高频状态码,先看速记卡,再上牌桌 —— 场景发牌,你来定夺。"
      >
        <div className="grid-4 rd-code-legend">
          <div className="card">
            <div className="card-title">
              <Status code={201} text="Created" />
            </div>
            <p>无中生有,创建成功 —— 配 Location 头。</p>
          </div>
          <div className="card">
            <div className="card-title">
              <Status code={204} text="No Content" />
            </div>
            <p>办成了,但没什么可说的 —— 响应体为空。</p>
          </div>
          <div className="card">
            <div className="card-title">
              <Status code={400} text="Bad Request" />
            </div>
            <p>话没说利索 —— 比如 JSON 都解析不了。</p>
          </div>
          <div className="card">
            <div className="card-title">
              <Status code={401} text="Unauthorized" />
            </div>
            <p>你是谁?先亮凭证 —— 名字叫未授权,实为未认证。</p>
          </div>
          <div className="card">
            <div className="card-title">
              <Status code={403} text="Forbidden" />
            </div>
            <p>认识你,但这事你不许做 —— 权限不够。</p>
          </div>
          <div className="card">
            <div className="card-title">
              <Status code={404} text="Not Found" />
            </div>
            <p>查无此物 —— 请求本身没有问题,资源不存在。</p>
          </div>
          <div className="card">
            <div className="card-title">
              <Status code={409} text="Conflict" />
            </div>
            <p>和服务器现有状态撞车 —— 比如用户名被占。</p>
          </div>
          <div className="card">
            <div className="card-title">
              <Status code={422} text="Unprocessable" />
            </div>
            <p>话通顺,内容不合理 —— 校验失败的标准答案。</p>
          </div>
        </div>

        <StatusDealer />
      </Section>

      {/* ================= §05 错误要好好说话 ================= */}
      <Section
        id="errors"
        index="05"
        title="错误要好好说话"
        desc="出错不丢人,装没出错才丢人。先看反面教材,再上标准答案 RFC 9457。"
      >
        <CodeBlock
          lang="http"
          title="反面教材 · 所有错误都装成 200"
          hl={[1]}
          code={`HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": false,
  "errCode": 10086,
  "errMsg": "参数不对"
}`}
          note={
            <>
              三宗罪:① <b>res.ok</b> 形同虚设,客户端得扒开 body 才知道
              出了事;② 中间的缓存层会把「错误」当成功存起来;③ errCode
              10086 是只有你团队才懂的黑话,每个接入方都得重学一遍。
            </>
          }
        />

        <p className="sec-desc">
          正解是让错误有<b>标准长相</b>:RFC 9457 Problem Details(2023
          年发布,取代早年的 RFC 7807)。五个标准字段 ——{" "}
          <code>type</code>(问题类型的 URI)、<code>title</code>
          (一句话标题)、<code>status</code>(状态码)、<code>detail</code>
          (这一次的具体说明)、<code>instance</code>(出事的位置)——
          外加你自己的扩展成员:
        </p>

        <CodeBlock
          lang="http"
          title="标准答案 · 422 校验失败长这样"
          hl={[2]}
          code={`HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json

{
  "type": "https://api.example.com/problems/validation-error",
  "title": "请求体没通过校验",
  "status": 422,
  "detail": "email 字段不是合法的邮箱地址",
  "instance": "/users",
  "errors": [
    { "field": "email", "message": "格式应为 name@example.com" }
  ]
}`}
          note={
            <>
              <b>errors</b> 是扩展成员 —— 规范欢迎你加自己的字段。注意
              Content-Type 是 <b>application/problem+json</b>
              :客户端一看见它,就知道按标准结构解析,不用学黑话。
            </>
          }
        />
      </Section>

      {/* ================= §06 竣工图 ================= */}
      <Section
        id="blueprint"
        index="06"
        title="交出你的第一份 API 设计"
        desc="把整章的决定汇总成一张表 —— 博客 API 的竣工图。"
      >
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>方法</th>
                <th>路径</th>
                <th>成功</th>
                <th>常见失败</th>
                <th>说明</th>
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
                <td>注册(用户名撞车 409,邮箱不合法 422)</td>
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
                <td>查看用户资料</td>
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
                <td>文章列表(过滤/分页见第 05 章)</td>
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
                <td>发文章,回 Location + 新资源</td>
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
                  <code>404</code>
                </td>
                <td>单篇文章</td>
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
                <td>整体替换 —— 发完整对象!</td>
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
                <td>部分修改 —— 只发要改的字段</td>
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
                <td>删文章,无响应体</td>
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
                <td>某篇文章的评论列表</td>
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
                <td>发表评论</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout tone="win" title="别小看这张表">
          <p>
            方法、路径、成功码、失败码 —— 后端照它写实现,前端照它写调用,
            测试照它写用例。<b>它就是一份接口文档的雏形</b>
            ,拿去和后端同事对齐,谁也不用猜谁。第 05 章你会认识它的
            机器可读版:OpenAPI —— 一份 YAML,文档、Mock、
            代码生成全从它长出来。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 动手任务 ================= */}
      <Section
        id="labs"
        index="07"
        title="动手任务"
        desc="三个任务:练手感、复现 PUT 的字段蒸发、再独立画一张竣工图。"
      >
        <LabSet ch="rest-design" items={LABS} />
      </Section>

      {/* ================= §08 通关测验 ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="八道题,全是实战里真会遇到的选择。全对点亮侧栏绿灯。"
      >
        <Quiz ch="rest-design" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            URL 只放名词:复数集合 <code>/posts</code>,单个{" "}
            <code>/posts/42</code>,嵌套最多两层;动作一律交给方法表达。
          </>,
          <>
            CRUD 全景:POST 建、GET 读、PUT 整体换、PATCH 局部改、DELETE 删
            —— <b>PUT 少发字段 = 删字段</b>,只改一处用 PATCH。
          </>,
          <>
            状态码是接口的语言:201 建好了、204 没话说、400 话没说清、401
            不认识你、403 不许进、404 没这东西、409 撞车了、422
            话通顺但不合理。
          </>,
          <>
            错误别装成功:一律 200 是反模式;RFC 9457 的{" "}
            <code>application/problem+json</code> 让错误有标准长相。
          </>,
          <>
            幂等看服务器状态,不看响应码 —— DELETE 第二次 404,照样幂等。
          </>,
          <>
            一张端点总表(方法 × 路径 × 状态码)就是接口文档的雏形 ——
            第 05 章的 OpenAPI 是它的机器可读版。
          </>,
        ]}
      />

      <ChapterFooter ch="rest-design" />
    </main>
  );
}
