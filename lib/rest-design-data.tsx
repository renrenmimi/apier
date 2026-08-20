"use client";

// 第 04 章 · RESTful 设计实战 —— 动手任务 LABS + 通关测验 QUIZ 数据(双语,英文默认)。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "url-makeover",
    title: {
      en: "Fix five broken URLs",
      zh: "修正五个有问题的 URL",
    },
    d: "easy",
    tags: { en: ["URL design"], zh: ["URL 设计"] },
    task: {
      en: (
        <>
          <p>
            Paper or your head is enough. For each of the five URLs below, write
            down what is wrong with it and how you would rewrite it (method +
            path).
          </p>
          <p>
            1. <code>GET /getAllUsers</code>
            <br />
            2. <code>POST /user/create</code>
            <br />
            3. <code>GET /api/fetchPostById?post=7</code>
            <br />
            4. <code>GET /posts/7/delete</code>
            <br />
            5. <code>POST /Users/7/AddComment</code>
          </p>
        </>
      ),
      zh: (
        <>
          <p>
            纸笔或心算都行 —— 给下面五个 URL 写出问题诊断和修改后的写法
            (方法 + 路径):
          </p>
          <p>
            ① <code>GET /getAllUsers</code>
            <br />② <code>POST /user/create</code>
            <br />③ <code>GET /api/fetchPostById?post=7</code>
            <br />④ <code>GET /posts/7/delete</code>
            <br />⑤ <code>POST /Users/7/AddComment</code>
          </p>
        </>
      ),
    },
    hint: {
      en: (
        <>
          The method carries the verb, the path carries the noun, a collection
          is a plural noun, and an id hangs off the collection that contains it.
        </>
      ),
      zh: (
        <>
          动词交给方法,名词留给路径;集合用复数,id 挂在它所属的集合后面。
        </>
      ),
    },
    solution: {
      en: (
        <p>
          1. <code>GET /users</code> — the verb get repeats the method, and All
          adds nothing.
          <br />
          2. <code>POST /users</code> — POST already means create, and the
          collection should be plural.
          <br />
          3. <code>GET /posts/7</code> — fetch and ById both repeat the method,
          and an id identifies a resource, so it belongs in the path rather than
          in a query parameter.
          <br />
          4. <code>DELETE /posts/7</code> — this is the dangerous one. GET is a
          safe method: browsers prefetch it and crawlers follow it, so a delete
          behind GET can be triggered by something that never intended to delete
          anything.
          <br />
          5. <code>POST /users/7/comments</code> is the direct fix. In a blog,
          though, a comment normally belongs to a post, so{" "}
          <code>POST /posts/42/comments</code> is the more common design, with
          the author taken from the request body or from who is signed in.
        </p>
      ),
      zh: (
        <p>
          ① <code>GET /users</code> —— get 与方法重复,All 是多余的。
          <br />② <code>POST /users</code> —— POST 本身就是创建,集合要用复数。
          <br />③ <code>GET /posts/7</code> —— fetch、ById 都与方法重复;
          id 用来指认资源,应该放进路径,而不是查询参数。
          <br />④ <code>DELETE /posts/7</code> —— 这个最危险:GET
          是安全方法,浏览器会预取、爬虫会跟进,
          把删除挂在 GET 上,等于让根本没打算删东西的程序把数据删掉。
          <br />⑤ 直接改成 <code>POST /users/7/comments</code> 就行。
          不过在博客里,评论通常从属于文章,更常见的设计是{" "}
          <code>POST /posts/42/comments</code>,评论人从请求体或登录态里取。
        </p>
      ),
    },
  },
  {
    id: "put-vs-patch",
    title: {
      en: "Reproduce the field loss caused by PUT",
      zh: "亲手复现 PUT 的字段丢失",
    },
    d: "medium",
    tags: { en: ["fetch", "JSONPlaceholder"], zh: ["fetch", "JSONPlaceholder"] },
    task: {
      en: (
        <p>
          Open the browser console and send two requests to{" "}
          <code>https://jsonplaceholder.typicode.com/posts/1</code>: first PUT,
          then PATCH. Both bodies are the same:{" "}
          <code>{'{ "title": "hi" }'}</code>. Compare the two responses, and
          watch what happens to <code>body</code> and <code>userId</code>.
        </p>
      ),
      zh: (
        <p>
          打开浏览器 Console,对{" "}
          <code>https://jsonplaceholder.typicode.com/posts/1</code>{" "}
          发两次请求:先 PUT、后 PATCH,body 都只带{" "}
          <code>{'{ "title": "hi" }'}</code>。对比两次响应,盯住{" "}
          <code>body</code> 和 <code>userId</code> 这两个字段。
        </p>
      ),
    },
    hint: {
      en: (
        <>
          Send a <code>Content-Type: application/json</code> header. Without it
          the server does not know the body is JSON.
        </>
      ),
      zh: (
        <>
          记得带 <code>Content-Type: application/json</code> 请求头,
          否则服务器不知道你发的是 JSON。
        </>
      ),
    },
    solution: {
      en: (
        <>
          <CodeBlock
            lang="js"
            title="console"
            code={`const url = "https://jsonplaceholder.typicode.com/posts/1";
const headers = { "Content-Type": "application/json" };
const body = JSON.stringify({ title: "hi" });

const put = await (await fetch(url, { method: "PUT", headers, body })).json();
console.log(put);   // { id: 1, title: "hi" } — body and userId are gone

const patch = await (await fetch(url, { method: "PATCH", headers, body })).json();
console.log(patch); // { userId: 1, id: 1, title: "hi", body: "quia et..." }`}
          />
          <p>
            The PUT response contains only <code>id</code> and{" "}
            <code>title</code>. The fields you did not send are treated as
            absent, not as unchanged. The PATCH response still has all of them.
            JSONPlaceholder is a practice server and does not store your change,
            but the difference in semantics it demonstrates is real.
          </p>
        </>
      ),
      zh: (
        <>
          <CodeBlock
            lang="js"
            title="console"
            code={`const url = "https://jsonplaceholder.typicode.com/posts/1";
const headers = { "Content-Type": "application/json" };
const body = JSON.stringify({ title: "hi" });

const put = await (await fetch(url, { method: "PUT", headers, body })).json();
console.log(put);   // { id: 1, title: "hi" } —— body、userId 没了

const patch = await (await fetch(url, { method: "PATCH", headers, body })).json();
console.log(patch); // { userId: 1, id: 1, title: "hi", body: "quia et..." }`}
          />
          <p>
            PUT 的响应只剩 <code>id</code> 和 <code>title</code> ——
            你没发的字段被当作「不存在」,而不是「不改」;PATCH
            的响应里这些字段全都还在。JSONPlaceholder 是练习用的服务器,
            不会真的存下你的改动,但它演示的语义差别是真实的。
          </p>
        </>
      ),
    },
  },
  {
    id: "movie-api",
    title: {
      en: "Design the endpoint table for a movie rating site",
      zh: "给电影评分网站画一张端点总表",
    },
    d: "hard",
    tags: {
      en: ["API design", "review"],
      zh: ["API 设计", "综合"],
    },
    task: {
      en: (
        <p>
          A movie rating site has three resources: movies, ratings, users.
          Design its endpoint table — method, path, success code, main failure
          codes. It has to support: browsing movies (filterable by year),
          reading one movie, rating a movie from 1 to 5 (
          <b>one rating per user per movie</b>), changing your own rating,
          deleting your own rating, and reading all ratings of one movie.
        </p>
      ),
      zh: (
        <p>
          一个电影评分网站有三种资源:movies、ratings、users。
          请给它画一张端点总表:方法、路径、成功码、主要失败码。需求:
          浏览电影列表(可按年份过滤)、看单部电影、给电影打 1–5 分(
          <b>一个用户对一部电影只能有一条评分</b>)、改自己的分、删自己的分、
          看某部电影的全部评分。
        </p>
      ),
    },
    hint: {
      en: (
        <>
          &quot;One rating per user per movie&quot; — which status code answers
          a second POST for the same movie? It appeared in the scenes in §04.
        </>
      ),
      zh: (
        <>
          「一人一部只能一条」—— 第二次对同一部电影 POST 打分,该回哪个状态码?
          §04 的场景里出现过它。
        </>
      ),
    },
    solution: {
      en: (
        <>
          <p>One reasonable answer; yours does not have to match exactly.</p>
          <p>
            <code>GET /movies?year=2026</code> → 200. The year is a filter, so
            it goes in the query.
            <br />
            <code>GET /movies/42</code> → 200; 404 if there is no such movie.
            <br />
            <code>GET /movies/42/ratings</code> → 200; 404 if there is no such
            movie.
            <br />
            <code>POST /movies/42/ratings</code> → 201; 401 if not signed in;{" "}
            <b>409</b> if this user already rated this movie; <b>422</b> if the
            score is 6.
            <br />
            <code>PATCH /ratings/1001</code> → 200; 403 when changing someone
            else&apos;s rating.
            <br />
            <code>DELETE /ratings/1001</code> → 204; 404 on a second delete.
          </p>
          <p>
            Three things have to hold: the verb is in the method, the noun is in
            the path, and the status code states what actually happened. Once
            those hold, the remaining details are yours to decide.
          </p>
        </>
      ),
      zh: (
        <>
          <p>参考答案(你的不必一模一样):</p>
          <p>
            <code>GET /movies?year=2026</code> → 200,年份是过滤条件,放 query。
            <br />
            <code>GET /movies/42</code> → 200;查无此片 404。
            <br />
            <code>GET /movies/42/ratings</code> → 200;查无此片 404。
            <br />
            <code>POST /movies/42/ratings</code> → 201;没登录 401;
            该用户已经评过这部片 <b>409</b>;分数写 6 → <b>422</b>。
            <br />
            <code>PATCH /ratings/1001</code> → 200;改别人的分 403。
            <br />
            <code>DELETE /ratings/1001</code> → 204;再删一次 404。
          </p>
          <p>
            三条底线必须成立:动词在方法里、名词在路径里、
            状态码如实说明发生了什么。做到这三条,其余细节由你定。
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
      en: <>Which design is the best way to ask for the list of all movies?</>,
      zh: <>想要「所有电影」的列表,哪个设计最合适?</>,
    },
    opts: [
      <>
        <code>GET /getMovies</code>
      </>,
      <>
        <code>GET /movies</code>
      </>,
      <>
        <code>GET /movie_list.php</code>
      </>,
      <>
        <code>POST /api/FetchAllMovies</code>
      </>,
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            The verb is in the URL. GET already says what the action is, so
            writing get in the path says it a second time.
          </>
        ),
        zh: (
          <>
            动词混进了 URL。动作已经由 GET 说明,路径里再写 get 是重复一遍。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Three problems at once: it exposes the implementation (
            <code>.php</code>), it uses an underscore where the rest of the API
            probably does not, and the noun is singular. Move off PHP and this
            URL becomes a permanent obligation.
          </>
        ),
        zh: (
          <>
            一次犯三条:暴露实现(<code>.php</code>)、
            用了与 API 其余部分不一致的下划线、名词还是单数。
            哪天不用 PHP 了,这个 URL 就成了甩不掉的历史包袱。
          </>
        ),
      },
      {
        en: (
          <>
            POST is used to read data. That gives up caching, bookmarking, and
            safe retries, because POST is neither safe nor idempotent. The verb
            and the mixed case are problems too.
          </>
        ),
        zh: (
          <>
            读数据却用 POST:缓存、书签、安全重试全都放弃了,
            因为 POST 既不安全也不幂等。动词和大写驼峰同样是问题。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          <code>GET /movies</code> is a noun, plural, lowercase, with no verb
          and no implementation detail. The path says which resource; the method
          says what to do with it.
        </>
      ),
      zh: (
        <>
          <code>GET /movies</code>:名词、复数、全小写、没有动词、
          不暴露实现。路径说明要哪个资源,方法说明要对它做什么。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: <>What is the standard request for adding a comment to post 42?</>,
      zh: <>给 42 号文章新增一条评论,最标准的请求是?</>,
    },
    opts: [
      <>
        <code>POST /posts/42/comments</code>
      </>,
      <>
        <code>POST /comments/create?postId=42</code>
      </>,
      <>
        <code>PUT /posts/42/comments</code>
      </>,
      <>
        <code>GET /posts/42/addComment</code>
      </>,
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: (
          <>
            create is a verb, and POST already means create. The post id says
            which post the comment belongs to, so it belongs in the path rather
            than in a query parameter.
          </>
        ),
        zh: (
          <>
            create 是动词,而 POST 本身就是创建。文章 id
            说明这条评论属于哪篇文章,应该写进路径,而不是挂在问号后面。
          </>
        ),
      },
      {
        en: (
          <>
            PUT replaces what is at that URL with what you send. Sending PUT to
            the comment collection asks the server to replace every comment on
            the post with your one comment.
          </>
        ),
        zh: (
          <>
            PUT 是「把这个 URL 上的东西整个换成我发的这份」。
            对评论集合发 PUT,等于要求用你这一条评论替换掉整个评论区。
          </>
        ),
      },
      {
        en: (
          <>
            GET must not have side effects. It is a safe method, so crawlers and
            browser prefetching trigger it freely — one crawl would fill the
            post with comments nobody wrote.
          </>
        ),
        zh: (
          <>
            GET 不该有副作用。它是安全方法,爬虫和浏览器预取会随意触发它 ——
            爬一遍,文章下面就多出一堆没人写过的评论。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          Creating a resource means sending POST to the collection it belongs
          to. A comment belongs to a post, and one level of nesting says exactly
          that. A successful create answers 201.
        </>
      ),
      zh: (
        <>
          创建一个资源,就是向它所属的集合发 POST。评论从属于文章,
          一层嵌套刚好说清这层关系。创建成功回 201。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          <code>POST /posts</code> created the post. What is the most correct
          response?
        </>
      ),
      zh: (
        <>
          <code>POST /posts</code> 成功创建了文章,最规范的响应是?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            200 OK with <code>{'{"success": true}'}</code> in the body
          </>
        ),
        zh: (
          <>
            200 OK,body 里写 <code>{'{"success": true}'}</code>
          </>
        ),
      },
      {
        en: (
          <>
            201 Created, a <code>Location: /posts/43</code> header, and the new
            resource in the body
          </>
        ),
        zh: (
          <>
            201 Created + <code>Location: /posts/43</code> 头 + body 回显新资源
          </>
        ),
      },
      {
        en: <>204 No Content — the client knows what it sent</>,
        zh: <>204 No Content —— 反正客户端知道自己发了什么</>,
      },
      {
        en: <>301, redirecting the client to the new post</>,
        zh: <>301,把客户端重定向到新文章</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            200 works, but HTTP has a code that means &quot;a new resource now
            exists&quot;, and this is it. The <code>success</code> field also
            repeats what the status code already says.
          </>
        ),
        zh: (
          <>
            200 勉强能用,但 HTTP 有一个专门表示「新资源诞生了」的码,
            这里正该用它。<code>success</code> 字段还重复了状态码已经说过的话。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            What the client does not know is exactly the part the server
            generated: the new id and createdAt. 204 keeps them back, so the
            client has to send a GET to find out.
          </>
        ),
        zh: (
          <>
            客户端不知道的恰恰是服务器生成的部分:新的 id 和 createdAt。204
            把它们咽了回去,客户端还得再发一次 GET 才能拿到。
          </>
        ),
      },
      {
        en: (
          <>
            301 means &quot;this resource has moved permanently&quot;. Saying
            that about a resource that was just created does not match what
            happened.
          </>
        ),
        zh: (
          <>
            301 的含义是「这个资源永久搬走了」。
            对一个刚刚创建出来的资源这么说,与实际发生的事情对不上。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          A successful create has three parts: 201 for the status, a{" "}
          <code>Location</code> header giving the URL of the new resource, and a
          body echoing it in full, including the id and timestamps the server
          generated.
        </>
      ),
      zh: (
        <>
          创建成功有三件事:状态码 201、<code>Location</code>{" "}
          头给出新资源的 URL、body 完整回显它 ——
          包括服务器生成的 id 和时间戳。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          You want to change only the <b>title</b> of post 43 and keep every
          other field. Which request do you send?
        </>
      ),
      zh: (
        <>
          你只想改掉 43 号文章的<b>标题</b>,其余字段一律保留。发哪个请求?
        </>
      ),
    },
    opts: [
      {
        en: (
          <>
            <code>PUT /posts/43</code> with only <code>{"{ title }"}</code> in
            the body
          </>
        ),
        zh: (
          <>
            <code>PUT /posts/43</code>,body 只带 <code>{"{ title }"}</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>PATCH /posts/43</code> with only <code>{"{ title }"}</code> in
            the body
          </>
        ),
        zh: (
          <>
            <code>PATCH /posts/43</code>,body 只带 <code>{"{ title }"}</code>
          </>
        ),
      },
      {
        en: (
          <>
            <code>POST /posts/43</code> with only <code>{"{ title }"}</code> in
            the body
          </>
        ),
        zh: (
          <>
            <code>POST /posts/43</code>,body 只带 <code>{"{ title }"}</code>
          </>
        ),
      },
      {
        en: <>DELETE it, then POST a new one</>,
        zh: <>先 DELETE,再重新 POST 一篇</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            PUT replaces the whole representation. Sending only title states
            that the post now consists of a title and nothing else, so body and
            createdAt are removed. This is the most common way beginners lose
            data.
          </>
        ),
        zh: (
          <>
            PUT 替换整份表述。只发 title,等于声明这篇文章从此只有标题,
            body、createdAt 都会被移除。这是新手丢数据最常见的原因。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            POST to a single existing resource has no agreed meaning, so a
            reader of the code cannot tell what the request is supposed to do.
          </>
        ),
        zh: (
          <>
            对已存在的单个资源发 POST 没有约定俗成的含义,
            读代码的人无法判断这个请求打算做什么。
          </>
        ),
      },
      {
        en: (
          <>
            It reaches the goal at a high cost: the id changes, createdAt
            changes, and every link that pointed at the old post breaks.
          </>
        ),
        zh: (
          <>
            目的能达到,代价太大:id 变了,createdAt 变了,
            所有指向旧文章的链接全部失效。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          PATCH describes a change and applies it to what is already there.
          Fields you do not mention are kept. Partial updates are exactly what
          it exists for.
        </>
      ),
      zh: (
        <>
          PATCH 描述的是一次改动,并把它应用到已有资源上,
          没提到的字段原样保留 —— 部分修改正是它存在的意义。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          A registration endpoint receives JSON that is <b>syntactically
          valid</b>, but the email field contains <code>&quot;hello&quot;</code>
          . Which status code states the problem most precisely?
        </>
      ),
      zh: (
        <>
          注册接口收到一份<b>语法合法</b>的 JSON,但 email 字段填的是{" "}
          <code>&quot;hello&quot;</code>。哪个状态码把问题说得最准确?
        </>
      ),
    },
    opts: [<>400</>, <>409</>, <>422</>, <>500</>],
    correct: 2,
    wrong: [
      {
        en: (
          <>
            400 is defensible and many APIs return it here. But 400 means the
            request itself is malformed, and this one parsed correctly — only a
            value is invalid. 422 states that difference, and this course uses
            it for validation failures.
          </>
        ),
        zh: (
          <>
            回 400 说得通,很多 API 也确实这么做。但 400 的含义是请求本身格式不对,
            而这份请求解析得好好的,只是有一个值不合法。422
            恰好表达了这个区别,本课把校验失败统一记在 422 上。
          </>
        ),
      },
      {
        en: (
          <>
            409 is for a conflict with the current state of the server, such as
            a username that is already taken. <code>&quot;hello&quot;</code>{" "}
            collides with nothing; it is simply not an email address.
          </>
        ),
        zh: (
          <>
            409 用于与服务器当前状态的冲突,比如用户名已被占用。
            <code>&quot;hello&quot;</code> 跟任何已有数据都不冲突,
            它单纯不是一个邮箱地址。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            5xx means the server itself failed. Here the client sent data that
            does not pass a rule, which is a client-side problem.
          </>
        ),
        zh: (
          <>
            5xx 表示服务器自身出了问题。这里是客户端发来的数据没通过规则,
            责任在客户端一侧。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          422 Unprocessable Content: the request parsed and the content failed
          validation. Report which field failed in the body — §05 shows the
          Problem Details form.
        </>
      ),
      zh: (
        <>
          422 Unprocessable Content:请求解析成功,内容没通过校验。
          在响应体里说明是哪个字段没过 —— §05 给出了 Problem Details 的写法。
        </>
      ),
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          RFC 9457 Problem Details says the Content-Type of an error response
          should be ____. (Write the full media type.)
        </>
      ),
      zh: (
        <>
          RFC 9457 Problem Details 规定,错误响应的 Content-Type
          应该是____。(完整写出媒体类型)
        </>
      ),
    },
    placeholder: "application/…",
    answers: ["application/problem+json"],
    hint: {
      en: (
        <>
          Insert one word into the middle of <code>application/json</code>: JSON
          that describes a problem.
        </>
      ),
      zh: (
        <>
          在 <code>application/json</code> 中间插一个词 ——「描述问题的 JSON」。
        </>
      ),
    },
    why: {
      en: (
        <>
          <code>application/problem+json</code>. A client that sees this media
          type knows the body holds the standard members type, title, status,
          detail, and instance, so it does not have to learn a format specific
          to your API.
        </>
      ),
      zh: (
        <>
          <code>application/problem+json</code>。客户端一看见这个媒体类型,
          就知道 body 里是 type、title、status、detail、instance
          这套标准成员,不必再学一套你们专有的格式。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          <code>DELETE /posts/43</code> returns 204 the first time and 404 the
          second time. Is DELETE still idempotent?
        </>
      ),
      zh: (
        <>
          <code>DELETE /posts/43</code> 第一次返回 204,第二次返回 404。
          DELETE 还算幂等吗?
        </>
      ),
    },
    opts: [
      {
        en: <>No — the two responses are different</>,
        zh: <>不算 —— 两次响应码都不一样了</>,
      },
      {
        en: (
          <>
            Yes — idempotence is about the state of the server, and after one
            delete or ten the state is the same: post 43 does not exist
          </>
        ),
        zh: (
          <>
            算 —— 幂等看的是服务器状态:执行一次和执行 N 次,
            结果都是「43 号不存在」
          </>
        ),
      },
      {
        en: <>Only the first request is idempotent</>,
        zh: <>只有第一次那下算幂等</>,
      },
      {
        en: <>It depends on how the server is implemented</>,
        zh: <>取决于服务器的具体实现</>,
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            This is the common misreading. Idempotence is defined by the effect
            on the server state, not by whether the responses look the same. A
            status code is only the reply to one request.
          </>
        ),
        zh: (
          <>
            这是最常见的误解。幂等是按「对服务器状态的影响」定义的,
            不看两次响应长得一不一样。状态码只是对某一次请求的回话。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Idempotence describes what happens when a request is repeated. A
            single request cannot be idempotent on its own.
          </>
        ),
        zh: (
          <>
            幂等描述的是「重复发送同一个请求」的性质,
            单独一次请求谈不上幂不幂等。
          </>
        ),
      },
      {
        en: (
          <>
            RFC 9110 defines DELETE as idempotent. That is part of the method
            semantics an implementation is expected to follow, not a per-server
            choice.
          </>
        ),
        zh: (
          <>
            RFC 9110 把 DELETE 定义为幂等方法。
            这是实现应当遵守的方法语义,不是各家自行决定的事。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          After one delete and after ten, the server is in the same state: post
          43 does not exist. That is what makes DELETE idempotent. The status
          code reports one request; the state is what the guarantee is about.
        </>
      ),
      zh: (
        <>
          删一次和删十次,服务器都停在同一个状态:43 号不存在 ——
          这就是 DELETE 幂等的意思。状态码回报的是某一次请求,
          而这个保证针对的是状态。
        </>
      ),
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          What should be done to the URL{" "}
          <code>/users/1/posts/2/comments/3/replies/4</code>?
        </>
      ),
      zh: (
        <>
          <code>/users/1/posts/2/comments/3/replies/4</code> 这个 URL,
          最该做的改动是?
        </>
      ),
    },
    opts: [
      {
        en: <>Nothing — the hierarchy is clear and complete</>,
        zh: <>不用动 —— 层级清晰,信息完整</>,
      },
      {
        en: (
          <>
            Flatten it: comment and reply ids are unique on their own, so{" "}
            <code>/comments/3/replies</code> or <code>/replies/4</code> is
            enough
          </>
        ),
        zh: (
          <>
            拆平:评论和回复的 id 本身就唯一,直接{" "}
            <code>/comments/3/replies</code> 或 <code>/replies/4</code> 就够了
          </>
        ),
      },
      {
        en: <>Replace the numeric ids with names</>,
        zh: <>把数字 id 都换成名字</>,
      },
      {
        en: (
          <>
            Change it to <code>POST /api</code> and move the path into the body
          </>
        ),
        zh: (
          <>
            改成 <code>POST /api</code>,把路径塞进 body
          </>
        ),
      },
    ],
    correct: 1,
    wrong: [
      {
        en: (
          <>
            Four levels of nesting means the client must collect four ids before
            it can build the URL, and the URL now encodes a hierarchy that may
            change. If a reply can one day belong to something other than a
            comment, every URL of this shape breaks.
          </>
        ),
        zh: (
          <>
            四层嵌套意味着客户端要先集齐 4 个 id 才拼得出 URL,
            而且 URL 把一套可能会变的层级关系写死了 ——
            哪天回复可以挂在评论以外的东西上,这类 URL 全部作废。
          </>
        ),
      },
      undefined,
      {
        en: (
          <>
            Using a slug instead of an id is a separate topic, readability. It
            leaves the nesting problem exactly as it was.
          </>
        ),
        zh: (
          <>
            用 slug 代替 id 是另一个话题(可读性),
            嵌套过深的问题一点没有解决。
          </>
        ),
      },
      {
        en: (
          <>
            That is level 0 of the maturity model from chapter 03: every request
            sent to one endpoint. It gives up the addressing that makes the rest
            of this chapter possible.
          </>
        ),
        zh: (
          <>
            这是退回第 03 章成熟度模型的 L0:所有请求都打同一个端点。
            本章其余内容赖以成立的「资源可寻址」也一并放弃了。
          </>
        ),
      },
    ],
    why: {
      en: (
        <>
          One level of nesting, <code>collection/id/collection</code>, is
          enough. When a deeper resource has an id that is unique on its own,
          give it a top-level URL, and express the relationship with a filter
          such as <code>GET /replies?commentId=3</code> when you need it.
        </>
      ),
      zh: (
        <>
          嵌套一层就够,也就是 <code>collection/id/collection</code>。
          更深的资源如果 id 本身唯一,就给它一个顶层 URL;
          需要表达从属关系时,用过滤条件即可,例如{" "}
          <code>GET /replies?commentId=3</code>。
        </>
      ),
    },
  },
];
