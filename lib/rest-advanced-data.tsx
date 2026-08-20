"use client";

// 05 · REST in production —— 动手任务 LABS + 通关测验 QUIZ 数据(双语,英文默认)。
// 代码窗口里的可执行行两种语言必须逐字节一致,只有注释可以分语言。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "github-pagination",
    title: { en: "Fetch one page from GitHub", zh: "亲手翻一页 GitHub" },
    d: "easy",
    tags: {
      en: ["fetch", "pagination", "Link header"],
      zh: ["fetch", "分页", "Link header"],
    },
    task: {
      en: (
        <p>
          In the browser console, request{" "}
          <code>
            https://api.github.com/users/octocat/repos?per_page=5&page=2
          </code>{" "}
          — octocat&apos;s repositories, 5 per page, second page. Print the{" "}
          <code>name</code> of each repository, then look at the <b>Link</b>{" "}
          response header: GitHub writes the address of the next page directly
          into it.
        </p>
      ),
      zh: (
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
    },
    hint: {
      en: (
        <>
          Read the response header with <code>res.headers.get(&quot;link&quot;)</code>;
          header names are not case sensitive. To print the names, use{" "}
          <code>repos.map(r =&gt; r.name)</code>.
        </>
      ),
      zh: (
        <>
          响应头用 <code>res.headers.get(&quot;link&quot;)</code> 取,
          Header 名不区分大小写。打印名字可以用{" "}
          <code>repos.map(r =&gt; r.name)</code>。
        </>
      ),
    },
    solution: {
      en: (
        <>
          <CodeBlock
            lang="js"
            title="console"
            code={`const res = await fetch(
  "https://api.github.com/users/octocat/repos?per_page=5&page=2"
);
const repos = await res.json();
console.log(repos.map((r) => r.name)); // 5 repository names
console.log(res.headers.get("link"));`}
          />
          <p>
            The Link header looks like this:{" "}
            <code>
              &lt;…page=1&gt;; rel=&quot;prev&quot;, &lt;…page=3&gt;;
              rel=&quot;next&quot;
            </code>
            . The full URLs of the previous and next page are already built for
            you, so the client follows <code>rel=&quot;next&quot;</code> instead
            of calculating page numbers. This is the HATEOAS idea from chapter
            03 in ordinary use: the response carries links you can follow.
          </p>
        </>
      ),
      zh: (
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
            <code>
              &lt;…page=1&gt;; rel=&quot;prev&quot;, &lt;…page=3&gt;;
              rel=&quot;next&quot;
            </code>
            —— 上一页、下一页的完整 URL 都替你拼好了,客户端顺着{" "}
            <code>rel=&quot;next&quot;</code> 走就行,不用自己算页码。
            这就是第 03 章 HATEOAS 在日常中的样子:响应里带着可以跟随的链接。
          </p>
        </>
      ),
    },
  },
  {
    id: "rate-limit",
    title: { en: "Check your own quota", zh: "查一查自己的配额" },
    d: "easy",
    tags: {
      en: ["fetch", "rate limit", "GitHub"],
      zh: ["fetch", "限流", "GitHub"],
    },
    task: {
      en: (
        <p>
          Request <code>https://api.github.com/rate_limit</code> and find three
          numbers in the response: <code>rate.limit</code>,{" "}
          <code>rate.remaining</code>, and <code>rate.reset</code> — how many
          calls you get per hour, how many are left, and when the count starts
          again. <code>reset</code> is a large number. Work out what it
          represents.
        </p>
      ),
      zh: (
        <p>
          请求 <code>https://api.github.com/rate_limit</code>,在响应里找到三个数字:
          <code>rate.limit</code>、<code>rate.remaining</code>、
          <code>rate.reset</code> —— 你一小时能调几次、还剩几次、什么时候重新计数。
          <code>reset</code> 是一个很大的数,想想它表示什么。
        </p>
      ),
    },
    hint: {
      en: (
        <>
          That large number is a Unix timestamp in seconds.{" "}
          <code>new Date(x * 1000)</code> turns it into a readable time.
        </>
      ),
      zh: (
        <>
          那个大数字是 Unix 时间戳,单位是秒。
          <code>new Date(x * 1000)</code> 能把它变成可读的时间。
        </>
      ),
    },
    solution: {
      en: (
        <>
          <CodeBlock
            lang="js"
            title="console"
            code={`const res = await fetch("https://api.github.com/rate_limit");
const { rate } = await res.json();
console.log(rate.limit + " per hour, " + rate.remaining + " left");
console.log("resets at", new Date(rate.reset * 1000).toLocaleTimeString());`}
          />
          <p>
            Without a token you get <b>60 requests per hour</b>; with a token,
            5000. Usefully, calling <code>/rate_limit</code> itself{" "}
            <b>does not count</b> against the quota, so checking how much is
            left never costs you anything.
          </p>
        </>
      ),
      zh: (
        <>
          <CodeBlock
            lang="js"
            title="console"
            code={`const res = await fetch("https://api.github.com/rate_limit");
const { rate } = await res.json();
console.log(rate.limit + " per hour, " + rate.remaining + " left");
console.log("resets at", new Date(rate.reset * 1000).toLocaleTimeString());`}
          />
          <p>
            不带 token 是 <b>每小时 60 次</b>,带 token 是 5000 次。
            贴心的是,调用 <code>/rate_limit</code> 本身<b>不消耗</b>配额 ——
            查还剩多少,永远不用付出代价。
          </p>
        </>
      ),
    },
  },
  {
    id: "etag-304",
    title: { en: "See a 304 for yourself", zh: "亲眼看一次 304" },
    d: "medium",
    tags: {
      en: ["ETag", "304", "caching"],
      zh: ["ETag", "304", "缓存"],
    },
    task: {
      en: (
        <p>
          Request the same resource twice. First fetch{" "}
          <code>https://api.github.com/users/octocat</code> and take the{" "}
          <code>etag</code> out of the response headers. Then request it again
          with that value in <code>If-None-Match</code> and watch{" "}
          <code>res.status</code>: it should be <b>304</b>, and the body should
          be empty.
        </p>
      ),
      zh: (
        <p>
          对同一个资源请求两次。第一次 fetch{" "}
          <code>https://api.github.com/users/octocat</code>,从响应头里取出{" "}
          <code>etag</code>;第二次把它放进 <code>If-None-Match</code>{" "}
          再请求一遍,看 <code>res.status</code> —— 应该是 <b>304</b>
          ,而且正文是空的。
        </p>
      ),
    },
    hint: {
      en: (
        <>
          Read the tag with <code>res.headers.get(&quot;etag&quot;)</code>, then
          send it back unchanged in{" "}
          <code>headers: {"{ \"If-None-Match\": tag }"}</code>.
        </>
      ),
      zh: (
        <>
          用 <code>res.headers.get(&quot;etag&quot;)</code> 取出标识,
          第二次请求把它原样放进{" "}
          <code>headers: {"{ \"If-None-Match\": tag }"}</code>。
        </>
      ),
    },
    solution: {
      en: (
        <>
          <CodeBlock
            lang="js"
            title="console"
            code={`const r1 = await fetch("https://api.github.com/users/octocat");
const tag = r1.headers.get("etag");
console.log("etag:", tag);

const r2 = await fetch("https://api.github.com/users/octocat", {
  headers: { "If-None-Match": tag },
});
console.log(r2.status); // 304 — unchanged, so no body is sent`}
          />
          <p>
            One more detail: a <b>304 does not count against your 60 requests</b>{" "}
            on GitHub, so revalidation saves quota as well as bandwidth. The
            browser also keeps its own HTTP cache, so if the first request
            already returns 304, try again in a private window.
          </p>
        </>
      ),
      zh: (
        <>
          <CodeBlock
            lang="js"
            title="console"
            code={`const r1 = await fetch("https://api.github.com/users/octocat");
const tag = r1.headers.get("etag");
console.log("etag:", tag);

const r2 = await fetch("https://api.github.com/users/octocat", {
  headers: { "If-None-Match": tag },
});
console.log(r2.status); // 304 —— 没变,所以不发正文`}
          />
          <p>
            补充一点:在 GitHub 上 <b>304 不计入那 60 次配额</b> ——
            重新校验省的不只是流量。另外浏览器自己也有 HTTP 缓存,
            如果第一次就看到 304,换个无痕窗口再试。
          </p>
        </>
      ),
    },
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: (
        <>
          You are building a feed. Users scroll continuously and new items keep
          arriving at the top of the list. Which pagination style fits best?
        </>
      ),
      zh: (
        <>
          你在做一个信息流:用户不停往下滑,新内容还在源源不断插到列表顶部。
          这种场景该用哪种分页?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            Offset (<code>?page=N</code>) — the simplest to implement
          </>
        ),
        zh: (
          <>
            offset(<code>?page=N</code>)—— 实现最简单
          </>
        ),
      },
      {
        en: (
          <>
            Cursor — send back the position of the last item you received
          </>
        ),
        zh: <>cursor —— 把你收到的最后一条记录的位置带回去</>,
      },
      {
        en: <>No pagination: return everything and let the client slice it</>,
        zh: <>不分页,一次全返回,前端自己切</>,
      },
      {
        en: <>Return 20 random items each time</>,
        zh: <>每次随机返回 20 条</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            A feed has exactly the two conditions offset handles badly: rows are
            inserted while the user reads, which shifts positions and causes
            repeats or skips, and users scroll deep, which makes offset slow.
          </>
        ),
        zh: (
          <>
            信息流恰好同时踩中 offset 的两个弱点:
            用户在读的过程中不断有新行插入,位置整体挪动,于是重复或漏条;
            而且用户会一直往下滑,offset 越翻越慢。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Returning a very large list at once loads the database, the network,
            and the client&apos;s memory all at the same time. Avoiding that is
            why pagination exists.
          </>
        ),
        zh: (
          <>
            一次返回超大列表,会同时压住数据库、网络和客户端内存 ——
            分页存在的意义正是避免这件事。
          </>
        ),
      },
      {
        en: (
          <>
            Scrolling down means asking for what comes next, so the result has
            to be predictable. Continuing exactly where the last page ended is
            the minimum a paginated list has to guarantee.
          </>
        ),
        zh: (
          <>
            往下滑就是在要「接下来的内容」,结果必须可预期。
            从上一页结束的地方精确接续,是分页列表最起码的保证。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          A cursor is attached to a record, not to a position, so inserts and
          deletions elsewhere in the list do not move the continuation point.
          Reading further down also costs the same at any depth, because the
          server finds the record through an index instead of counting rows.
        </>
      ),
      zh: (
        <>
          游标钉在一条记录上,而不是一个位置上,
          所以列表别处的插入和删除都动不了接续点。
          翻得再深耗时也一样 —— 服务器是走索引找到那条记录的,不是数行数出来的。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          <code>?page=30000&per_page=20</code> is much slower than{" "}
          <code>?page=1</code>. What is the underlying reason?
        </>
      ),
      zh: (
        <>
          <code>?page=30000&per_page=20</code> 比 <code>?page=1</code>{" "}
          慢很多,根本原因是什么?
        </>
      ),
    },
    opts: [
      {
        en: <>The JSON of page 30000 is larger than the JSON of page 1</>,
        zh: <>第 30000 页的 JSON 比第 1 页大</>,
      },
      {
        en: (
          <>
            The database has to walk over and discard 599,980 rows before it
            reaches the 20 you asked for
          </>
        ),
        zh: <>数据库要先走过并丢弃 599,980 行,才能取到你要的那 20 条</>,
      },
      {
        en: <>Deep pages take a longer network route</>,
        zh: <>翻得太深,网络路由变长了</>,
      },
      {
        en: <>The server deliberately slows down users who page deeply</>,
        zh: <>服务器对深翻页的用户故意限速</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            Every page returns 20 items, so the response body is about the same
            size. The cost is in reading the rows, not in transferring them.
          </>
        ),
        zh: (
          <>
            每页都是 20 条,响应体大小几乎一样。
            代价在「读出这些行」,不在「传输」。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            The network path has nothing to do with the page number. The packets
            take the same route.
          </>
        ),
        zh: <>网络路径和页码没有任何关系,数据包走的还是同一条路。</>,
      },
      {
        en: (
          <>
            Some APIs do cap the maximum page number to avoid this problem, but
            that is a response to the cost, not the cause of it. The cost is in
            the database.
          </>
        ),
        zh: (
          <>
            确实有 API 会限制最大页码来躲开这个问题,
            但那是对代价的应对,不是代价的原因 —— 原因在数据库里。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Offset means &ldquo;skip the first N rows&rdquo;, and skipping still
          requires reading those rows in order and discarding them. The larger N
          is, the more work is thrown away. A cursor finds the starting record
          through an index and never counts rows.
        </>
      ),
      zh: (
        <>
          offset 的含义是「跳过前 N 行」,而跳过也得按顺序把这些行读出来再扔掉。
          N 越大,白干的活越多。游标则是走索引直接定位到起点,根本不数行。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          In the JSON:API convention, in what order does{" "}
          <code>GET /posts?sort=-created_at</code> return the list?
        </>
      ),
      zh: (
        <>
          按 JSON:API 的约定,<code>GET /posts?sort=-created_at</code>{" "}
          返回的列表是什么顺序?
        </>
      ),
    },
    opts: [
      {
        en: <>By creation time, oldest first</>,
        zh: <>按创建时间正序,最早的在前</>,
      },
      {
        en: <>By creation time, newest first</>,
        zh: <>按创建时间倒序,最新的在前</>,
      },
      {
        en: <>With the created_at field removed from the response</>,
        zh: <>响应里去掉 created_at 字段</>,
      },
      {
        en: (
          <>
            It is a syntax error; <code>-</code> is not allowed in a query
            string
          </>
        ),
        zh: (
          <>
            语法错误,<code>-</code> 不能出现在查询字符串里
          </>
        ),
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            That is the other direction. The leading <code>-</code> means
            descending; without it the sort is ascending.
          </>
        ),
        zh: (
          <>
            方向反了。前缀 <code>-</code> 表示降序,不带 <code>-</code>{" "}
            才是升序。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Removing fields from a response is what the <code>fields</code>{" "}
            parameter does. <code>sort</code> changes the order only.
          </>
        ),
        zh: (
          <>
            从响应里去掉字段是 <code>fields</code> 参数的工作,
            <code>sort</code> 只改顺序。
          </>
        ),
      },
      {
        en: (
          <>
            A <code>-</code> is perfectly valid inside a query value. JSON:API
            uses it to express descending order without a second parameter.
          </>
        ),
        zh: (
          <>
            <code>-</code> 在查询参数的值里完全合法。JSON:API
            用它表示降序,省掉了一个额外的参数。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>sort=-created_at</code> reads as &ldquo;sort by created_at,
          descending&rdquo;. Other APIs write{" "}
          <code>sort=created_at&order=desc</code> for the same result. Neither
          form is required by a standard, so check the documentation of the API
          you are calling.
        </>
      ),
      zh: (
        <>
          <code>sort=-created_at</code> 读作「按 created_at 降序」。
          也有 API 写成 <code>sort=created_at&order=desc</code>,结果一样。
          两种写法都不是标准强制的,以你要调的那个 API 的文档为准。
        </>
      ),
    },
  },
  {
    type: "multi",
    q: {
      en: (
        <>
          Your blog API already has clients in production. Which of these
          changes are <b>breaking changes</b> that need a new version? (Select
          all that apply.)
        </>
      ),
      zh: (
        <>
          你的博客 API 已经有一批线上客户端了。下面哪些改动属于
          <b>破坏性变更(breaking change)</b>,需要新版本?(多选)
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            Removing the <code>author</code> field from the response
          </>
        ),
        zh: (
          <>
            删掉响应里的 <code>author</code> 字段
          </>
        ),
      },
      {
        en: (
          <>
            Changing <code>id</code> from a number to a string
          </>
        ),
        zh: (
          <>
            把 <code>id</code> 从数字改成字符串
          </>
        ),
      },
      {
        en: (
          <>
            Changing what <code>status: &quot;active&quot;</code> means from
            &ldquo;published&rdquo; to &ldquo;archived&rdquo;
          </>
        ),
        zh: (
          <>
            把 <code>status: &quot;active&quot;</code>{" "}
            的含义从「已发布」改成「已归档」
          </>
        ),
      },
      {
        en: (
          <>
            Adding an optional <code>likes</code> field to the response
          </>
        ),
        zh: (
          <>
            在响应里新增一个可选的 <code>likes</code> 字段
          </>
        ),
      },
    ],
    correct: [0, 1, 2],
    missHint: {
      en: (
        <>
          One is still missing. A change in <b>meaning</b> keeps the field name
          and the type, but old clients are still wrong afterwards — and nothing
          fails loudly, so nobody notices.
        </>
      ),
      zh: (
        <>
          还漏了一个。<b>改含义</b>这种变更字段名和类型都没动,
          但老客户端之后就是错的 —— 而且不会报错,谁都不会发现。
        </>
      ),
    },
    extraHint: {
      en: (
        <>
          One of your selections is safe: a client that does not know a JSON key
          simply ignores it.
        </>
      ),
      zh: (
        <>
          你选中的有一项其实是安全的:
          客户端遇到不认识的 JSON 键会直接忽略它。
        </>
      ),
    },
    why: {
      en: (
        <>
          One test: would an existing client break? Removing a field makes the
          value undefined. Changing the type breaks parsing. Changing the
          meaning makes the data quietly wrong, which is the hardest to detect.
          Only adding is safe, which is why it is better to return few fields at
          first and add more later.
        </>
      ),
      zh: (
        <>
          只有一条标准:现有客户端会不会坏。
          删字段会让取值变成 undefined;改类型会让解析失败;
          改含义会让数据悄悄错掉,最难发现。只有「加」是安全的 ——
          所以设计响应时宁可一开始少给几个字段,以后再加。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Put the four steps of ETag revalidation in the right order: ① the
          server answers 304 with no body ② the first GET returns 200 and an
          ETag ③ a later request carries If-None-Match ④ the resource has
          changed, so the server returns 200 and a new ETag
        </>
      ),
      zh: (
        <>
          把 ETag 重新校验的四步排成正确顺序:① 服务器回 304,不带正文
          ② 第一次 GET 返回 200 和一个 ETag ③ 之后的请求带上 If-None-Match
          ④ 资源变了,服务器返回 200 和新的 ETag
        </>
      ),
    },
    opts: [
      <>② → ③ → ① → ④</>,
      <>③ → ② → ① → ④</>,
      <>② → ① → ③ → ④</>,
      <>① → ② → ③ → ④</>,
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: (
          <>
            Where does the value in If-None-Match come from? The first response.
            So ② has to happen before ③.
          </>
        ),
        zh: (
          <>
            If-None-Match 里的值是从哪来的?第一次响应给的 ——
            所以 ② 必须发生在 ③ 之前。
          </>
        ),
      },
      {
        en: (
          <>
            A 304 is the answer to a request that carried a validator. Without ③
            asking the question, there is nothing for ① to answer.
          </>
        ),
        zh: (
          <>
            304 是对「带了校验值的请求」的回答。
            没有 ③ 先问,① 就无从谈起。
          </>
        ),
      },
      {
        en: (
          <>
            A 304 cannot come first. On the first request the client holds no
            validator, so the server has to send 200 with the full body.
          </>
        ),
        zh: (
          <>
            304 不可能排在第一步:第一次请求时客户端手里没有任何校验值,
            服务器只能返回 200 和完整正文。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Get the tag (200 with an ETag), ask with the tag (If-None-Match), save
          the body when nothing changed (304, headers only), and take the new
          copy when it did (200 with a new ETag).
        </>
      ),
      zh: (
        <>
          先拿到标识(200 + ETag),再带着标识去问(If-None-Match),
          没变就省下正文(304,只有头部),变了就取新的(200 + 新 ETag)。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          A response carries <code>Cache-Control: no-cache</code>. What is a
          cache allowed to do with it?
        </>
      ),
      zh: (
        <>
          一个响应带着 <code>Cache-Control: no-cache</code>,
          缓存可以拿它做什么?
        </>
      ),
    },
    opts: [
      {
        en: <>Keep no copy at all; the body must be downloaded every time</>,
        zh: <>完全不留副本,每次都必须重新下载正文</>,
      },
      {
        en: (
          <>Store the copy, but check with the server before reusing it</>
        ),
        zh: <>可以存下副本,但每次复用前都要先向服务器校验</>,
      },
      {
        en: <>Reuse the stored copy freely for up to one hour</>,
        zh: <>存下的副本一小时内可以随便复用</>,
      },
      {
        en: <>Store it in a CDN, but not in the browser</>,
        zh: <>可以存在 CDN 里,但浏览器不许存</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            That is <code>no-store</code>. The names look similar, which is why
            this pair is mixed up so often. <code>no-cache</code> does allow
            storing.
          </>
        ),
        zh: (
          <>
            那是 <code>no-store</code>。两个名字长得像,所以最容易记反 ——
            <code>no-cache</code> 是允许存的。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            A fixed reuse time comes from <code>max-age</code>.{" "}
            <code>no-cache</code> sets no lifetime at all; it requires a check
            before every reuse.
          </>
        ),
        zh: (
          <>
            固定的复用时长来自 <code>max-age</code>。<code>no-cache</code>{" "}
            不设任何时长,它要求每次复用前都校验。
          </>
        ),
      },
      {
        en: (
          <>
            Which caches may store a response is decided by <code>private</code>{" "}
            and <code>public</code>. <code>no-cache</code> is about when a
            stored copy may be used.
          </>
        ),
        zh: (
          <>
            哪些缓存可以存,由 <code>private</code> 和 <code>public</code>{" "}
            决定。<code>no-cache</code> 管的是存下的副本什么时候能用。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>no-cache</code> means revalidate before use.{" "}
          <code>no-store</code> means keep no copy. The revalidation is usually
          a conditional request with <code>If-None-Match</code>, and when
          nothing has changed the server answers 304 with no body, so the check
          is cheap.
        </>
      ),
      zh: (
        <>
          <code>no-cache</code> 是「用之前先校验」,<code>no-store</code>{" "}
          是「不要留副本」。校验通常就是一次带 <code>If-None-Match</code>{" "}
          的条件请求,没变就回 304 且不带正文,所以这次校验很便宜。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          What problem does the <code>Idempotency-Key</code> request header
          solve?
        </>
      ),
      zh: (
        <>
          <code>Idempotency-Key</code> 这个请求头解决的是什么问题?
        </>
      ),
    },
    opts: [
      {
        en: <>It encrypts the request so nobody in the middle can read it</>,
        zh: <>给请求加密,让中间人看不到内容</>,
      },
      {
        en: (
          <>
            After a POST such as a payment times out, the client can retry
            without being charged twice
          </>
        ),
        zh: <>支付这类 POST 超时后,客户端可以重试而不会被扣两次款</>,
      },
      {
        en: <>It makes the server cache GET responses so the next one is faster</>,
        zh: <>让服务器缓存 GET 响应,下次更快</>,
      },
      {
        en: <>It identifies the user, replacing a login</>,
        zh: <>标识用户身份,代替登录</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            Encryption is what HTTPS provides. An idempotency key travels in
            plain text in a header. It prevents repeated work, not reading.
          </>
        ),
        zh: (
          <>
            加密是 HTTPS 的工作。幂等键明文写在头里,谁都看得见 ——
            它防的是「重复执行」,不是「被看见」。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            GET is already idempotent and safe to retry, so it does not need
            this header. The header exists for methods that are not idempotent,
            such as POST.
          </>
        ),
        zh: (
          <>
            GET 本身就是幂等的,重试是安全的,用不着这个头。
            它是给 POST 这类不幂等的方法用的。
          </>
        ),
      },
      {
        en: (
          <>
            Identity belongs in the Authorization header. An idempotency key
            identifies one operation, not one person.
          </>
        ),
        zh: (
          <>
            身份属于 Authorization 头。幂等键标识的是「这一次操作」,
            不是「这一个人」。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          A timeout means the client does not know whether the server acted. The
          key lets the server recognize a retry: it executes the operation once,
          stores the response, and returns that same stored response for every
          repeat of the key. The IETF draft for this header has not been
          published as a standard, so follow each API&apos;s documentation.
        </>
      ),
      zh: (
        <>
          超时的本质是客户端不知道服务器有没有执行。
          这个键让服务器认得出重试:操作只执行一次,响应存起来,
          之后同一个键再来就返回存下的那份响应。
          IETF 关于这个头的草案尚未成为标准,具体行为以各 API 的文档为准。
        </>
      ),
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          When a server returns 429 Too Many Requests, it usually adds one
          response header telling the client how long to wait before trying
          again. What is that header called? (Two English words joined by a
          hyphen.)
        </>
      ),
      zh: (
        <>
          服务器返回 429 Too Many Requests 时,通常会附上一个响应头,
          告诉客户端至少等多久再来。这个头叫什么?
          (两个英文单词,用连字符相连。)
        </>
      ),
    },
    placeholder: { en: "Header name…", zh: "输入 Header 名…" },
    answers: ["Retry-After", "retryafter"],
    hint: {
      en: <>It reads literally as &ldquo;retry after&rdquo; this long.</>,
      zh: <>直译就是「多久之后再试」—— Retry 加一个介词。</>,
    },
    why: {
      en: (
        <>
          429 with <code>Retry-After</code> tells the client exactly how long to
          wait. The value is either a number of seconds or an HTTP date, so a
          client should handle both. When the header is absent, back off
          exponentially and add jitter.
        </>
      ),
      zh: (
        <>
          429 配上 <code>Retry-After</code>,等于明确告诉客户端要等多久。
          它的值可能是秒数,也可能是 HTTP 日期,客户端两种都要能处理。
          没有这个头时,就指数退避并加上抖动。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: <>What is OpenAPI (currently version 3.2)?</>,
      zh: <>OpenAPI(现行 3.2)最准确的描述是什么?</>,
    },
    opts: [
      {
        en: <>A new protocol that replaces REST</>,
        zh: <>一种取代 REST 的新协议</>,
      },
      {
        en: (
          <>
            A machine-readable description of an API, used to generate
            documentation, client code, and mock servers
          </>
        ),
        zh: (
          <>
            一份机器可读的 API 描述,可以用来生成文档、客户端代码和 mock 服务
          </>
        ),
      },
      { en: <>An API provided by OpenAI</>, zh: <>OpenAI 提供的 API</> },
      {
        en: <>A paid version of Swagger</>,
        zh: <>Swagger 的付费升级版</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            It sends no requests at all. It only describes what your REST API
            looks like; the traffic is still ordinary HTTP.
          </>
        ),
        zh: (
          <>
            它一条请求也不发,只是描述你的 REST API 长什么样,
            网线上跑的还是普通 HTTP。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Similar name, unrelated thing. OpenAPI is a specification for
            describing APIs and has no connection to OpenAI.
          </>
        ),
        zh: (
          <>
            名字像而已。OpenAPI 是描述 API 的规范,和 OpenAI 没有关系。
          </>
        ),
      },
      {
        en: (
          <>
            The other way round: Swagger was the name of the specification
            before 3.0. Today it is a set of tools built on OpenAPI, and the
            specification itself is open and free.
          </>
        ),
        zh: (
          <>
            顺序反了:Swagger 是 3.0 之前这份规范的旧名,
            如今指基于 OpenAPI 的一套工具;规范本身是开放免费的。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Writing the endpoint table in a format tools understand means
          documentation, client code, mock servers, and tests can all be
          generated from one file. Change the definition and every generated
          generated file changes with it.
        </>
      ),
      zh: (
        <>
          把端点总表写成工具能读的格式,文档、客户端代码、mock 服务、
          测试就都能从这一份文件生成。改定义,生成出来的东西一起跟着变。
        </>
      ),
    },
  },
];
