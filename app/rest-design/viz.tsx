"use client";

// 第 04 章 · RESTful 设计实战 —— 本章专属可视化(双语,英文默认):
//  - HeroBlueprint:hero 里的「图纸」动画,端点行轮流点亮(纯 CSS 驱动)。
//  - UrlClinic:URL 诊断台 —— 六个有问题的 URL,点开看诊断和修改后的写法。
//  - StatusDealer:状态码决策室 —— 十个场景发牌,选码即判,即时讲解。
// 文案一律走 <T en zh /> 或 Loc<…>,不要在这里写 lang === "en" ? … : …。

import { useState, type ReactNode } from "react";
import { Method, type HttpMethod } from "@/lib/kit";
import { T, useL, type Loc } from "@/lib/i18n";

/* ================= HeroBlueprint ================= */

const BP_ROWS: { m: HttpMethod; path: string; code: string }[] = [
  { m: "GET", path: "/posts", code: "200" },
  { m: "POST", path: "/posts", code: "201" },
  { m: "PATCH", path: "/posts/42", code: "200" },
  { m: "DELETE", path: "/posts/42", code: "204" },
];

export function HeroBlueprint() {
  return (
    <div className="rd-bp" aria-hidden>
      <div className="rd-bp-head">
        <span>
          <T en="Blog API · endpoint draft" zh="博客 API · 端点图纸" />
        </span>
        <span>DRAFT v0.1</span>
      </div>
      {BP_ROWS.map((r, i) => (
        <div
          key={i}
          className="rd-bp-row"
          style={{ animationDelay: `${i * 2}s` }}
        >
          <Method m={r.m} />
          <span className="path">{r.path}</span>
          <span className="status" data-x={2}>
            {r.code}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ================= UrlClinic ================= */

interface UrlCase {
  bad: string;
  problems: Loc<string>[];
  fixedMethod: HttpMethod;
  fixedPath: string;
  why: ReactNode;
}

const URL_CASES: UrlCase[] = [
  {
    bad: "/getUser?id=1",
    problems: [
      { en: "The verb get is in the URL", zh: "动词 get 混进了 URL" },
      {
        en: "The identity of the resource sits in a query parameter",
        zh: "资源的身份被放进了查询参数",
      },
    ],
    fixedMethod: "GET",
    fixedPath: "/users/1",
    why: (
      <T
        en={
          <>
            The method already says the action, so the path only needs the noun.
            User 1 is a resource, so its identity belongs in the path. Query
            parameters are for filtering, sorting, pagination, and choosing
            fields — not for identifying which resource you mean.
          </>
        }
        zh={
          <>
            动作已经由方法说清楚了,路径只需要留下名词。1 号用户是一个资源,
            它的身份应该写在路径里。查询参数负责过滤、排序、分页和挑字段,
            不负责指认你要的是哪一个资源。
          </>
        }
      />
    ),
  },
  {
    bad: "/api/DeletePost?postId=42",
    problems: [
      { en: "The verb Delete is in the URL", zh: "动词 Delete 混进了 URL" },
      {
        en: "Mixed case, which does not match the rest of the API",
        zh: "大写驼峰,与 API 其余部分的写法不一致",
      },
      {
        en: "A destructive action that can be triggered by GET",
        zh: "一个破坏性动作,却可能被 GET 触发",
      },
    ],
    fixedMethod: "DELETE",
    fixedPath: "/posts/42",
    why: (
      <T
        en={
          <>
            The DELETE method carries the meaning, so the path stays a noun. The
            third problem is the dangerous one. GET is a safe method: browsers
            prefetch it and crawlers follow it without asking. In 2005, Google
            Web Accelerator prefetched links on web pages, and sites that put
            delete actions behind plain links lost data. Keep destructive
            actions off GET.
          </>
        }
        zh={
          <>
            删除的语义由 DELETE 方法承担,路径只留名词。真正危险的是第三条:
            GET 是安全方法,浏览器会预取它,爬虫会自己跟进去。2005 年 Google
            Web Accelerator 预取网页上的链接,那些把删除动作藏在普通链接后面的
            站点因此丢了数据。破坏性动作不要放在 GET 上。
          </>
        }
      />
    ),
  },
  {
    bad: "/users/1/posts/2/comments/3/replies",
    problems: [
      { en: "Four levels of nesting", zh: "整整四层嵌套" },
      {
        en: "The client needs three ids before it can build the URL",
        zh: "客户端要先集齐三个 id 才拼得出这个 URL",
      },
    ],
    fixedMethod: "GET",
    fixedPath: "/comments/3/replies",
    why: (
      <T
        en={
          <>
            Comment 3 has an id that is unique on its own, so the first two
            levels add nothing. One level of nesting is fine and often useful.
            Beyond that the URL encodes a hierarchy that may change later: if a
            reply can one day belong to something other than a comment, every
            such URL breaks. <code>GET /replies?commentId=3</code> is also a
            reasonable answer — a filter on the top-level collection.
          </>
        }
        zh={
          <>
            3 号评论本身就有全局唯一的 id,前面两层没有提供任何信息。
            一层嵌套是合适的,也常常有用;再深下去,URL 就把一套可能会变的层级
            关系写死了 —— 哪天回复可以挂在评论以外的东西上,这类 URL 全部作废。
            <code>GET /replies?commentId=3</code> 同样是合理答案:
            在顶层集合上加一个过滤条件。
          </>
        }
      />
    ),
  },
  {
    bad: "/Blog_Posts/List.php",
    problems: [
      {
        en: "Uppercase and underscores, mixed with the rest of the API",
        zh: "大写加下划线,与 API 其余部分的写法混在一起",
      },
      {
        en: "Exposes the implementation (.php)",
        zh: "暴露了实现细节(.php)",
      },
      { en: "The verb List is in the path", zh: "路径里还有动词 List" },
    ],
    fixedMethod: "GET",
    fixedPath: "/posts",
    why: (
      <T
        en={
          <>
            Paths are case sensitive, so mixing styles inside one API creates
            URLs that look the same and are not. Lowercase with hyphens is the
            common choice; what matters more is that you use one style
            everywhere. The <code>.php</code> ending ties the URL to the
            language you happen to use today. Move to another one and every
            saved link stops working.
          </>
        }
        zh={
          <>
            路径区分大小写,所以在一个 API 里混用几种写法,会造出「看着一样、
            其实不是同一个」的 URL。全小写加连字符是常见选择;更要紧的是
            全站只用一种写法。<code>.php</code> 后缀把 URL 和你今天恰好用的语言
            绑在了一起 —— 换一门语言,所有存下来的链接就全废了。
          </>
        }
      />
    ),
  },
  {
    bad: "/posts/latest-posts-list",
    problems: [
      {
        en: "'latest' and 'list' are query conditions, not resources",
        zh: "「latest」「list」是查询条件,不是资源",
      },
      {
        en: "Sorting logic has moved into the path",
        zh: "排序逻辑被写进了路径",
      },
    ],
    fixedMethod: "GET",
    fixedPath: "/posts?sort=-created_at",
    why: (
      <T
        en={
          <>
            The path says which resource you want. Query parameters say how you
            want it: filtering, sorting, pagination, and field selection. Keep
            them in the query and switching to &quot;most popular&quot; is one
            parameter change, not a new endpoint. Chapter 05 covers these
            parameters in detail.
          </>
        }
        zh={
          <>
            路径说明你要哪一类资源,查询参数说明你想怎么要它:过滤、排序、分页
            和挑字段。把这些放在问号后面,想换成「最热」时只要改一个参数,
            不必再造一个端点。第 05 章会详细讲这些参数。
          </>
        }
      />
    ),
  },
  {
    bad: "/createNewComment",
    problems: [
      {
        en: "The verb create is in the URL, and New repeats it",
        zh: "动词 create 写进了 URL,New 还把它重复了一遍",
      },
      {
        en: "The URL does not say which post the comment belongs to",
        zh: "看不出这条评论挂在哪篇文章下",
      },
    ],
    fixedMethod: "POST",
    fixedPath: "/posts/42/comments",
    why: (
      <T
        en={
          <>
            Creating a resource means sending POST to the collection it belongs
            to. POST already means &quot;add a new one&quot;, so the word create
            in the path repeats it. A comment belongs to a post, and one level
            of nesting states that relationship.
          </>
        }
        zh={
          <>
            创建一个资源,就是向它所属的集合发 POST。POST 本身已经表示
            「新增一个」,路径里再写 create 是重复。评论从属于文章,
            一层嵌套刚好把这层关系说清楚。
          </>
        }
      />
    ),
  },
];

export function UrlClinic() {
  const L = useL();
  const [sel, setSel] = useState(0);
  const c = URL_CASES[sel];

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="URL clinic — pick a broken URL on the left to see the diagnosis"
          zh="URL 诊断台 —— 点左边的问题 URL,看诊断结果"
        />
      </div>
      <div className="rd-clinic">
        <div className="rd-url-list" role="group">
          {URL_CASES.map((u, i) => (
            <button
              key={u.bad}
              type="button"
              className={`rd-url-btn${sel === i ? " on" : ""}`}
              onClick={() => setSel(i)}
            >
              <span className="x" aria-hidden>
                ✕
              </span>
              {u.bad}
            </button>
          ))}
        </div>
        <div className="rd-report" aria-live="polite">
          <div className="rd-report-bad">{c.bad}</div>
          <div className="rd-report-h">
            <T en="Diagnosis" zh="诊断" />
          </div>
          <ul>
            {c.problems.map((p, i) => (
              <li key={i}>{L(p)}</li>
            ))}
          </ul>
          <div className="rd-report-h">
            <T en="Rewritten" zh="修改后" />
          </div>
          <div className="rd-fixed">
            <Method m={c.fixedMethod} />
            {c.fixedPath}
          </div>
          <p className="rd-report-why">{c.why}</p>
        </div>
      </div>
    </div>
  );
}

/* ================= StatusDealer ================= */

const CODES = [201, 202, 204, 400, 401, 403, 404, 410, 409, 422] as const;

const CODE_TEXT: Record<number, string> = {
  201: "Created",
  202: "Accepted",
  204: "No Content",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  410: "Gone",
  422: "Unprocessable Content",
};

const CODE_MEANING: Record<number, Loc<string>> = {
  201: {
    en: "201 means a new resource now exists",
    zh: "201 表示一个新资源已经存在了",
  },
  202: {
    en: "202 means the request was accepted and the work is not finished",
    zh: "202 表示请求已被接受,但工作还没做完",
  },
  204: {
    en: "204 means the request succeeded and there is no body to send",
    zh: "204 表示请求成功,而且没有响应体要发",
  },
  400: {
    en: "400 means the request itself is malformed",
    zh: "400 表示请求本身的格式就不对",
  },
  401: {
    en: "401 means the client is not authenticated",
    zh: "401 表示客户端还没有通过认证",
  },
  403: {
    en: "403 means the client is authenticated but not permitted",
    zh: "403 表示客户端身份没问题,但没有这个权限",
  },
  404: { en: "404 means the resource was not found", zh: "404 表示找不到该资源" },
  409: {
    en: "409 means the request conflicts with the current state of the server",
    zh: "409 表示请求与服务器的当前状态冲突",
  },
  410: {
    en: "410 means the resource existed and was deliberately removed",
    zh: "410 表示这个资源存在过,已被有意移除",
  },
  422: {
    en: "422 means the request parsed correctly but its content failed validation",
    zh: "422 表示请求能解析,但内容没通过校验",
  },
};

interface Scene {
  scene: ReactNode;
  correct: number;
  explain: ReactNode;
  traps?: Partial<Record<number, Loc<string>>>;
}

const SCENES: Scene[] = [
  {
    scene: (
      <T
        en={
          <>
            A client sends POST /posts with a valid new article. The server
            stored it and is about to send the article back with its new id.
          </>
        }
        zh={
          <>
            客户端 POST /posts 发来一篇合法的新文章,服务器已经写入,
            正准备把带着新 id 的文章发回去。
          </>
        }
      />
    ),
    correct: 201,
    explain: (
      <T
        en={
          <>
            A new resource now exists, so the answer is 201 Created. Add a
            Location header pointing at it, such as{" "}
            <code>Location: /posts/43</code>, so the client knows the URL of the
            resource it just created.
          </>
        }
        zh={
          <>
            一个新资源诞生了,所以回 201 Created,并加上指向它的 Location 头,
            例如 <code>Location: /posts/43</code>,让客户端知道刚创建的资源在
            哪个 URL 上。
          </>
        }
      />
    ),
    traps: {
      204: {
        en: "204 means there is no body. Here the response should carry the new resource: the server generated id and createdAt, and the client needs them.",
        zh: "204 表示没有响应体。可这里应该回显新资源:id 和 createdAt 是服务器生成的,客户端正等着用。",
      },
      202: {
        en: "202 is for work that has not finished. This article was stored already, so the resource exists now.",
        zh: "202 用于还没做完的工作。这篇文章已经写入了,资源此刻就存在。",
      },
    },
  },
  {
    scene: (
      <T
        en={
          <>
            A client sends POST /exports to request a full data export.
            Producing the file takes several minutes, so the server puts the job
            on a queue and answers right away.
          </>
        }
        zh={
          <>
            客户端 POST /exports,请求导出全部数据。生成文件要好几分钟,
            服务器把任务放进队列,先给出一个答复。
          </>
        }
      />
    ),
    correct: 202,
    explain: (
      <T
        en={
          <>
            202 Accepted: the request was accepted, and the work is not finished
            yet. Nothing exists at a new URL, so 201 would be a promise the
            server cannot keep. A useful response body gives the client a URL to
            poll for the status of the job.
          </>
        }
        zh={
          <>
            202 Accepted:请求已被接受,工作还没完成。此刻还没有任何新资源可取,
            回 201 就成了服务器兑现不了的承诺。响应体里通常给客户端一个 URL,
            让它去轮询任务状态。
          </>
        }
      />
    ),
    traps: {
      201: {
        en: "201 promises that a resource exists now at the URL in the Location header. The export file does not exist yet.",
        zh: "201 承诺此刻在 Location 指向的 URL 上已经有一个资源。导出文件还不存在。",
      },
      204: {
        en: "204 says the request succeeded and there is nothing to report. Here the work has not even started.",
        zh: "204 表示请求成功且没什么可说的。这里的工作甚至还没开始。",
      },
    },
  },
  {
    scene: (
      <T
        en={
          <>
            DELETE /posts/42 succeeded. The resource is gone and the server has
            nothing to put in the response body.
          </>
        }
        zh={
          <>
            DELETE /posts/42 执行成功,资源已经删掉,服务器没有任何东西需要
            放进响应体。
          </>
        }
      />
    ),
    correct: 204,
    explain: (
      <T
        en={
          <>
            The request succeeded and there is no content to return, so 204 No
            Content. A 204 response has no body at all.
          </>
        }
        zh={
          <>
            请求成功,又没有内容要回,所以用 204 No Content。
            204 的响应完全没有响应体。
          </>
        }
      />
    ),
    traps: {
      404: {
        en: "404 means the resource was not found. This delete succeeded — the resource was there a moment ago.",
        zh: "404 表示找不到资源。这次删除是成功的,资源刚才还在。",
      },
      201: {
        en: "201 is for creation. A successful delete does not create anything.",
        zh: "201 用于创建。删除成功不会产生任何新资源。",
      },
    },
  },
  {
    scene: (
      <T
        en={
          <>
            The request body is <code>{'{"title": "hi"'}</code> — the closing
            brace is missing, and the JSON parser fails immediately.
          </>
        }
        zh={
          <>
            请求体写着 <code>{'{"title": "hi"'}</code> —— 少了个右花括号,
            JSON 解析器当场报错。
          </>
        }
      />
    ),
    correct: 400,
    explain: (
      <T
        en={
          <>
            The server cannot even parse the request, so the request itself is
            malformed: 400 Bad Request. Business rules never ran.
          </>
        }
        zh={
          <>
            服务器连请求都解析不了,说明请求本身格式有问题:400 Bad Request。
            业务规则根本没有机会执行。
          </>
        }
      />
    ),
    traps: {
      422: {
        en: "422 assumes the body parsed and the structure is readable, and only the content is wrong. Here parsing failed, so validation never ran.",
        zh: "422 的前提是请求体能解析、结构可读,只有内容不对。这里连解析都没过,校验根本没开始。",
      },
    },
  },
  {
    scene: (
      <T
        en={<>A client sends POST /posts with no credentials at all.</>}
        zh={<>客户端没带任何凭证,直接 POST /posts 想发文章。</>}
      />
    ),
    correct: 401,
    explain: (
      <T
        en={
          <>
            The name is misleading: 401 Unauthorized means{" "}
            <b>not authenticated</b>. The server does not know who is calling. A
            401 response is required to include a <code>WWW-Authenticate</code>{" "}
            header naming the scheme, for example{" "}
            <code>WWW-Authenticate: Bearer</code>, so the client knows what kind
            of credentials to send.
          </>
        }
        zh={
          <>
            这个名字有点误导:401 Unauthorized 的实际含义是<b>未认证</b>——
            服务器不知道来的是谁。规范要求 401 响应必须带上{" "}
            <code>WWW-Authenticate</code> 头说明认证方式,例如{" "}
            <code>WWW-Authenticate: Bearer</code>,客户端才知道该送哪种凭证。
          </>
        }
      />
    ),
    traps: {
      403: {
        en: "403 assumes the server knows who is calling and refuses anyway. Here the identity is still unknown, so ask for credentials first.",
        zh: "403 的前提是服务器知道来的是谁,仍然拒绝。这里身份还不知道,得先请对方出示凭证。",
      },
    },
  },
  {
    scene: (
      <T
        en={
          <>
            A signed-in user with an ordinary account sends DELETE for an
            article written by someone else.
          </>
        }
        zh={<>一位已登录的普通用户,想 DELETE 一篇别人写的文章。</>}
      />
    ),
    correct: 403,
    explain: (
      <T
        en={
          <>
            The identity is known and the permission is missing: 403 Forbidden.
            Repeating the request with the same credentials will not help, and
            the response should say so. Some APIs answer 404 here on purpose, so
            that an outsider cannot learn which resources exist.
          </>
        }
        zh={
          <>
            身份是清楚的,缺的是权限:403 Forbidden。用同一份凭证再发一次也没用,
            响应里应当把这点说清楚。有些 API 在这里故意回 404,
            为的是不让外人推断出哪些资源存在。
          </>
        }
      />
    ),
    traps: {
      401: {
        en: "The credentials are fine and the server knows this user. What is missing is permission, not identity.",
        zh: "凭证没问题,服务器认识这个用户。缺的是权限,不是身份。",
      },
    },
  },
  {
    scene: (
      <T
        en={
          <>
            GET /posts/9999. There has never been an article with id 9999 in
            this database.
          </>
        }
        zh={<>GET /posts/9999,数据库里从来没有过 9999 号文章。</>}
      />
    ),
    correct: 404,
    explain: (
      <T
        en={
          <>
            404 Not Found: the URL is well formed and the method is allowed,
            but there is no resource behind it. 404 makes no claim about the
            past — it only says the server has nothing to return now.
          </>
        }
        zh={
          <>
            404 Not Found:URL 写法没问题,方法也允许,只是后面没有资源。
            404 不对过去做任何断言,它只说服务器现在没有东西可以给你。
          </>
        }
      />
    ),
    traps: {
      400: {
        en: "The request has nothing wrong with it. The thing it asks for does not exist, which is exactly what 404 reports.",
        zh: "请求本身挑不出毛病,只是它要的东西不存在 —— 这正是 404 的职责。",
      },
      410: {
        en: "410 states that the resource existed and was removed on purpose. Post 9999 never existed, so the server cannot say that.",
        zh: "410 断言资源存在过、且被有意移除。9999 号文章从未存在,服务器没法这么说。",
      },
    },
  },
  {
    scene: (
      <T
        en={
          <>
            Post 43 was deleted last week. The server keeps a record of removed
            posts, and the team wants clients and search engines to stop asking
            for this one.
          </>
        }
        zh={
          <>
            43 号文章上周被删除了。服务器保留了已删除文章的记录,
            团队希望客户端和搜索引擎不要再来要这一篇。
          </>
        }
      />
    ),
    correct: 410,
    explain: (
      <T
        en={
          <>
            410 Gone: the resource existed, it was removed deliberately, and the
            server is willing to say so. Clients can drop cached copies and
            search engines can remove the URL from their index. Use 410 only
            when you actually know the resource is gone for good.
          </>
        }
        zh={
          <>
            410 Gone:资源存在过、被有意移除,而且服务器愿意公开这一点。
            客户端可以丢掉缓存的副本,搜索引擎可以把这个 URL 从索引里删掉。
            只有当你确实知道资源不会再回来时,才用 410。
          </>
        }
      />
    ),
    traps: {
      404: {
        en: "404 is not wrong here, and many APIs return it. But 404 only says 'nothing here now'. 410 also says the resource is gone for good, which is the extra information this team wants to send.",
        zh: "在这里回 404 并不算错,很多 API 就是这么做的。但 404 只说「现在没有」;410 还说明资源不会再回来 —— 那正是这个团队想传达的额外信息。",
      },
      204: {
        en: "204 is a success code for a request that did complete. This request found nothing to return.",
        zh: "204 是成功码,用于确实完成了的请求。这次请求没有任何东西可回。",
      },
    },
  },
  {
    scene: (
      <T
        en={
          <>
            POST /users to register. The username <code>ada</code> was taken by
            someone else one second ago.
          </>
        }
        zh={
          <>
            POST /users 注册,用户名 <code>ada</code> 一秒钟前刚被别人用掉了。
          </>
        }
      />
    ),
    correct: 409,
    explain: (
      <T
        en={
          <>
            409 Conflict: the request is fine on its own, but it conflicts with
            the <b>current state</b> of the server. A duplicate value in a
            unique column is the usual example. The same request sent at another
            time could succeed.
          </>
        }
        zh={
          <>
            409 Conflict:请求本身没毛病,但它和服务器的<b>当前状态</b>冲突 ——
            唯一字段撞值是最常见的例子。同一个请求换个时间发,可能就成功了。
          </>
        }
      />
    ),
    traps: {
      422: {
        en: "The value is valid on its own; sending it yesterday would have worked. The problem is another row that already holds it, and that is a state conflict.",
        zh: "这个值本身是合法的,昨天发就能成功。问题在于已经有另一条记录占了它 —— 那是状态冲突。",
      },
      400: {
        en: "Nothing is wrong with the syntax or the values. The request collides with data that already exists, which is what 409 reports.",
        zh: "语法和取值都挑不出错,坏在与已有数据相撞 —— 那是 409 管的事。",
      },
    },
  },
  {
    scene: (
      <T
        en={
          <>
            POST /users to register. The JSON parses, every required field is
            present, but <code>email</code> contains <code>&quot;hello&quot;</code>.
          </>
        }
        zh={
          <>
            POST /users 注册,JSON 能解析、字段齐全,但 <code>email</code>{" "}
            填的是 <code>&quot;hello&quot;</code>。
          </>
        }
      />
    ),
    correct: 422,
    explain: (
      <T
        en={
          <>
            The syntax is fine and the content is not: 422 Unprocessable
            Content. Many APIs return 400 for this instead, and that is
            defensible. 422 is more specific because it separates &quot;I could
            not read your request&quot; from &quot;I read it and the value is
            invalid&quot;. Pick one and use it consistently. §05 shows how to
            report which field failed.
          </>
        }
        zh={
          <>
            语法没问题,内容有问题:422 Unprocessable Content。
            很多 API 在这里回 400,也说得通。422 更精确,
            因为它把「我读不懂你的请求」和「我读懂了,但这个值不合法」分开了。
            选一种,然后全站保持一致。哪个字段没通过,怎么报得清楚,§05 见。
          </>
        }
      />
    ),
    traps: {
      400: {
        en: "400 is a defensible answer and many APIs use it. But this body parsed correctly and only one value is invalid, and 422 states that difference. This course uses 422 for validation failures.",
        zh: "回 400 说得通,很多 API 也这么做。但这份请求体解析正常,只有一个值不合法,422 恰好表达了这个区别。本课把校验失败统一记在 422 上。",
      },
      409: {
        en: "Nothing collides with existing data here. The value is simply not a valid email address.",
        zh: "这里没有和任何已有数据相撞,单纯是这个值不是合法邮箱。",
      },
    },
  },
];

type DealPhase = "picking" | "answered" | "done";

export function StatusDealer() {
  const L = useL();
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<DealPhase>("picking");

  const scene = SCENES[idx];
  const isLast = idx === SCENES.length - 1;

  const pick = (code: number) => {
    if (phase !== "picking") return;
    setPicked(code);
    setPhase("answered");
    if (code === scene.correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (isLast) {
      setPhase("done");
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
    setPhase("picking");
  };

  const restart = () => {
    setIdx(0);
    setPicked(null);
    setScore(0);
    setPhase("picking");
  };

  if (phase === "done") {
    return (
      <div className="viz">
        <div className="viz-title">
          <T
            en="Status code decisions — all scenes played"
            zh="状态码决策室 —— 发牌完毕"
          />
        </div>
        <div className="rd-deal-end">
          <span className="rd-deal-score">
            {score} / {SCENES.length}
          </span>
          <p className="viz-msg">
            {score === SCENES.length ? (
              <T
                en={
                  <>
                    Every scene correct. You can now pick a status code more
                    carefully than many working backend developers do.
                  </>
                }
                zh={
                  <>
                    全对。你选状态码的准头,已经比不少在岗后端更靠谱了。
                  </>
                }
              />
            ) : score >= SCENES.length - 3 ? (
              <T
                en={
                  <>
                    Close. The ones you missed are probably on the borders
                    between 400, 422, and 409. Those three are the easiest to
                    confuse — play again and watch that boundary.
                  </>
                }
                zh={
                  <>
                    差不多了。错的那几张多半落在 400、422、409
                    的边界上,这三个最容易混。再来一轮,专门盯住这条界线。
                  </>
                }
              />
            ) : (
              <T
                en={
                  <>
                    Play again, and each time ask one question first: did the
                    request fail to parse, did it parse but hold an invalid
                    value, or does it conflict with data that already exists?
                  </>
                }
                zh={
                  <>
                    再来一轮。每次先问自己一个问题:是请求解析不了,
                    是解析得了但值不合法,还是与已有数据冲突?
                  </>
                }
              />
            )}
          </p>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={restart}
          >
            <T en="↻ Play again" zh="↻ 再来一轮" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="Status code decisions — read the situation, pick the code"
          zh="状态码决策室 —— 场景发牌,你来定夺"
        />
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          <T
            en={
              <>
                Scene {idx + 1} / {SCENES.length} · {score} correct
              </>
            }
            zh={
              <>
                场景 {idx + 1} / {SCENES.length} · 答对 {score}
              </>
            }
          />
        </span>
      </div>
      <div className="rd-scene">{scene.scene}</div>
      <div className="rd-codes" role="group">
        {CODES.map((code) => {
          let cls = "rd-code-btn";
          if (phase === "answered") {
            if (code === scene.correct) cls += " right";
            else if (code === picked) cls += " wrong";
          }
          return (
            <button
              key={code}
              type="button"
              className={cls}
              data-x={Math.floor(code / 100)}
              disabled={phase === "answered"}
              onClick={() => pick(code)}
            >
              {code} {CODE_TEXT[code]}
            </button>
          );
        })}
      </div>
      {phase === "answered" && picked !== null && (
        <>
          <div
            className={`rd-deal-fb ${picked === scene.correct ? "ok" : "no"}`}
            aria-live="polite"
          >
            {picked === scene.correct ? (
              <>✓ {scene.explain}</>
            ) : (
              <>
                ✕{" "}
                {scene.traps?.[picked] ? (
                  L(scene.traps[picked]!)
                ) : (
                  <T
                    en={
                      <>
                        {L(CODE_MEANING[picked])}, which does not fit this
                        situation.
                      </>
                    }
                    zh={<>{L(CODE_MEANING[picked])},放在这个场景不对。</>}
                  />
                )}
                <p style={{ marginTop: 6, marginBottom: 0 }}>
                  <b>
                    <T
                      en={<>The answer is {scene.correct}: </>}
                      zh={<>正确答案 {scene.correct}:</>}
                    />
                  </b>
                  {scene.explain}
                </p>
              </>
            )}
          </div>
          <div className="rd-deal-next">
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={next}
            >
              {isLast ? (
                <T en="See the result →" zh="看结果 →" />
              ) : (
                <T en="Next scene →" zh="下一个场景 →" />
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
