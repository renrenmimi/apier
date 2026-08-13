"use client";

// 第 01 章 · HTTP:API 的母语 ——
// 一封写给服务器的信:URL 解剖 → 报文解剖 → 方法 → 状态码 → Header → 完整对话。

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
import {
  HeroLetter,
  UrlAnatomy,
  MethodPicker,
  StatusExplorer,
} from "./viz";

/* ---------- §02 报文样例 ---------- */

const REQ_MSG = `POST /v1/products HTTP/1.1
Host: api.shop.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

{ "name": "机械键盘", "price": 399 }`;

const RES_MSG = `HTTP/1.1 201 Created
Content-Type: application/json
Location: /v1/products/43

{ "id": 43, "name": "机械键盘", "price": 399 }`;

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
  "name": "机械键盘",
  "price": 399,
  "stock": 17
}`;

const CONV_CURL = `# -i:连响应头一起打印出来
curl -i "https://api.shop.com/v1/products/42"

# 发 POST:-X 换方法,-H 加请求头,-d 带正文
curl -X POST "https://api.shop.com/v1/products" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "机械键盘", "price": 399 }'`;

export default function HttpPage() {
  return (
    <main className="page" data-ch="http">
      <Hero
        ch="http"
        title={
          <>
            <span className="grad">HTTP</span>,API 的母语
          </>
        }
        essence={
          <>
            每一次 API 调用,本质都是寄出一封格式严格的信:信封上写着你要干什么,
            抬头交代细节,正文装着数据。这一章教你读懂 —— 并且写好 —— 这封信。
          </>
        }
        chips={[
          { id: "url", n: "01", label: "URL 解剖台" },
          { id: "anatomy", n: "02", label: "报文解剖" },
          { id: "methods", n: "03", label: "方法:动词家族" },
          { id: "status", n: "04", label: "状态码" },
          { id: "headers", n: "05", label: "Header 常客" },
          { id: "conversation", n: "06", label: "一次完整对话" },
          { id: "labs", n: "07", label: "动手" },
          { id: "quiz", n: "08", label: "测验" },
        ]}
      >
        <HeroLetter />
      </Hero>

      {/* ================= §01 URL 解剖台 ================= */}
      <Section
        id="url"
        index="01"
        title="URL 解剖台:先看信封上的地址"
        desc="寄信第一步是写对地址。一条 URL 拆开是好几段,每段各管一件事 —— 点每一段试试。"
      >
        <UrlAnatomy />
        <Callout tone="idea" title="读 URL 的口诀">
          <p>
            从左往右:<b>怎么送(协议)→ 送到哪栋楼(域名)→
            楼里哪个房间(路径)→ 有什么附加要求(查询参数)</b>。
            以后看到再长的 URL,按这四段一切,没有读不懂的。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 报文解剖 ================= */}
      <Section
        id="anatomy"
        index="02"
        title="报文解剖:这封信的全文长什么样"
        desc="浏览器、fetch、curl 寄出去的「信」,原文就叫报文(message)。它是纯文本 —— 真的,你现在就能读。"
      >
        <p className="sec-desc">
          先看一封完整的<b>请求报文(request message)</b>:这次不是看一眼商品,
          而是新建一个商品 —— 所以带上了正文。
        </p>
        <CodeBlock
          lang="http"
          title="请求报文 · 原文"
          code={REQ_MSG}
          hl={[1]}
          note={
            <>
              高亮的第一行就是<b>起始行</b>:方法 + 路径 + HTTP 版本,
              一句话说清来意。往下依次是 Header、空行、正文。
            </>
          }
        />
        <div className="grid-2">
          <div className="card">
            <div className="card-kicker">第 1 行 · 信封</div>
            <div className="card-title">起始行</div>
            <p>
              <code>POST /v1/products HTTP/1.1</code> ——
              对哪个资源、干什么、用哪版规矩。整封信的来意,一行说完。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">第 2–4 行 · 信纸抬头</div>
            <div className="card-title">Header 区</div>
            <p>
              一行一条「名字: 值」,交代各种细节:寄到哪(Host)、
              正文是什么格式(Content-Type)、我是谁(Authorization)。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">第 5 行 · 分界线</div>
            <div className="card-title">一个空行</div>
            <p>
              看着不起眼,地位很高:它是「抬头结束、正文开始」的唯一标志。
              解析 HTTP 的程序全靠它划界。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">最后 · 信的内容</div>
            <div className="card-title">正文(body)</div>
            <p>
              这次要新建的商品数据,一段 JSON 文本。GET
              这类只读请求不带正文 —— 看一眼东西,不需要附材料。
            </p>
          </div>
        </div>

        <p className="sec-desc" style={{ marginTop: 18 }}>
          服务器的回信 ——{" "}
          <b>响应报文(response message)</b>—— 结构几乎一样,
          只是第一行从「我要干什么」换成了「办得怎么样」:
        </p>
        <CodeBlock
          lang="http"
          title="响应报文 · 原文"
          code={RES_MSG}
          hl={[1]}
          note={
            <>
              状态行:HTTP 版本 + <b>状态码</b> + 一句原因短语。201 Created
              = 「新资源造好了」,<code>Location</code> 头还附上了新商品的地址。
            </>
          }
        />
        <Callout tone="deep" title="报文就是纯文本,这件事很重要">
          <p>
            上面两段不是示意图,是<b>原文</b>。早年的程序员真的用 telnet
            一个字一个字敲出请求报文来调试。浏览器、fetch、curl、Postman ——
            工具千变万化,寄出去的都是这样一段文本。想通这一点,HTTP
            就没有神秘感了:<b>学 API,学的就是这封信怎么写、怎么读。</b>
          </p>
        </Callout>
      </Section>

      {/* ================= §03 方法 ================= */}
      <Section
        id="methods"
        index="03"
        title="方法:信封上的动词"
        desc="URL 回答「对哪个资源」,方法(method)回答「干什么」。动词家族一共没几个,但每个都有严格的合同。"
      >
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>方法</th>
                <th>一句话语义</th>
                <th>安全</th>
                <th>幂等</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><Method m="GET" /></td>
                <td>读取资源</td>
                <td><span className="ht-yes">✓</span></td>
                <td><span className="ht-yes">✓</span></td>
                <td>不该带请求体;能被缓存</td>
              </tr>
              <tr>
                <td><Method m="POST" /></td>
                <td>把数据交给服务器处理(最常见:创建)</td>
                <td><span className="ht-no">✕</span></td>
                <td><span className="ht-no">✕</span></td>
                <td>重复提交会重复创建</td>
              </tr>
              <tr>
                <td><Method m="PUT" /></td>
                <td>用请求体<b>整体替换</b>资源</td>
                <td><span className="ht-no">✕</span></td>
                <td><span className="ht-yes">✓</span></td>
                <td>同一份放几次,结果一样</td>
              </tr>
              <tr>
                <td><Method m="PATCH" /></td>
                <td><b>部分修改</b>资源</td>
                <td><span className="ht-no">✕</span></td>
                <td><span className="ht-no">✕</span></td>
                <td>规范不承诺幂等</td>
              </tr>
              <tr>
                <td><Method m="DELETE" /></td>
                <td>删除资源</td>
                <td><span className="ht-no">✕</span></td>
                <td><span className="ht-yes">✓</span></td>
                <td>删两次,都是「没了」</td>
              </tr>
              <tr>
                <td><Method m="HEAD" /></td>
                <td>同 GET,但只要响应头</td>
                <td><span className="ht-yes">✓</span></td>
                <td><span className="ht-yes">✓</span></td>
                <td>探测资源存不存在、有多大</td>
              </tr>
              <tr>
                <td><Method m="OPTIONS" /></td>
                <td>问「这里支持哪些操作」</td>
                <td><span className="ht-yes">✓</span></td>
                <td><span className="ht-yes">✓</span></td>
                <td>CORS 预检用它,第 06 章见</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="sec-desc">
          表里那两列术语,是这一节真正的重点。<b>安全(safe)</b>=
          只读,不改变服务器上的任何东西;<b>幂等(idempotent)</b>=
          同一个请求执行 1 次和执行 N 次,服务器状态的变化一模一样。
          安全的方法一定幂等,反过来不成立 ——
          PUT 会改东西(不安全),但反复改成同一份(幂等)。
        </p>

        <Callout tone="idea" title="幂等到底有什么用?一个词:敢重试">
          <p>
            请求发出去,超时了,没等到回音 —— 到底是没送到,还是办成了但回信丢了?
            <b>你不知道。</b>这时幂等方法可以闭着眼重发:反正执行几次结果都一样。
            POST 就不敢 —— 万一第一次已经成功,重发就是重复下单、重复扣款。
          </p>
          <p>
            顺带拆一个经典疑惑:「DELETE 第二次返回 404,那还幂等吗?」——
            幂等看的是<b>服务器状态的副作用</b>,不是响应码。删一次和删两次,
            资源都是「没了」,状态相同,幂等成立。
          </p>
        </Callout>

        <Callout tone="warn" title="PUT 和 PATCH:最容易混淆的一对">
          <p>
            <b>PUT = 整体替换。</b>你只传半个对象,漏掉的字段按语义会被清空 ——
            资料表里 email、bio 一夜蒸发,就是这么来的。
            <b>PATCH = 部分修改</b>,只动你提到的字段。
            另外 PATCH 不承诺幂等:像「库存 +1」这种补丁,执行两次就是 +2。
            想只改几个字段?用 PATCH。想整份覆盖?用 PUT,并且传<b>完整</b>的一份。
          </p>
        </Callout>

        <MethodPicker />
      </Section>

      {/* ================= §04 状态码 ================= */}
      <Section
        id="status"
        index="04"
        title="状态码:回信第一行的表情"
        desc="三位数字,第一位就是态度。先认五大家族,再逐个点名。"
      >
        <div className="ht-fam-grid">
          <div className="ht-fam" data-x={1}>
            <div className="ht-fam-code">1xx</div>
            <div className="ht-fam-name">信息</div>
            <p>「收到,还在处理。」日常几乎见不到,知道有这户人家就行。</p>
          </div>
          <div className="ht-fam" data-x={2}>
            <div className="ht-fam-code">2xx</div>
            <div className="ht-fam-name">成功</div>
            <p>「办成了。」200 有货、201 造好了、204 办成但没啥可说。</p>
          </div>
          <div className="ht-fam" data-x={3}>
            <div className="ht-fam-code">3xx</div>
            <div className="ht-fam-name">重定向</div>
            <p>「东西不在这,去别处。」301 搬家了、304 去你缓存里拿。</p>
          </div>
          <div className="ht-fam" data-x={4}>
            <div className="ht-fam-code">4xx</div>
            <div className="ht-fam-name">你错了</div>
            <p>「问题在你。」请求格式、身份、权限、地址 —— 总有一样不对。</p>
          </div>
          <div className="ht-fam" data-x={5}>
            <div className="ht-fam-code">5xx</div>
            <div className="ht-fam-name">我错了</div>
            <p>「问题在我。」服务器自己崩了 —— 你改请求没用,等修。</p>
          </div>
        </div>

        <p className="sec-desc">
          下面是 API 日常最高频的十六位。<b>点一格,看它的通俗解释和典型场景</b>{" "}
          —— 不用背,混个脸熟,真撞见时回来查就行。
        </p>
        <StatusExplorer />

        <Callout tone="warn" title="401 和 403,一定要分清的一对">
          <p>
            <b>401 Unauthorized:「你是谁?」</b>凭证缺失、过期或无效 ——
            带上有效 token 再来,有救。
            <b>403 Forbidden:「认识你,但你不许进。」</b>身份明明白白,
            权限就是不够 —— 重新登录换谁都没用。名字最坑的是 401:
            叫 Unauthorized(未授权),干的却是「未认证」的活,历史遗留,认了吧。
          </p>
          <p>
            再补充一点:有些 API 会故意用 <b>404 掩盖 403</b> ——
            不让你探知「这个资源存在,只是你没权限」。GitHub API 就这么干:
            访问别人的私有仓库,回你一个 404,装作查无此仓。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 Header ================= */}
      <Section
        id="headers"
        index="05"
        title="Header:信纸抬头的五位常客"
        desc="Header 有上百种,但 API 日常打交道的主要是这五位。每位记一句话加一行示例,够用很久。"
      >
        <div className="ht-hdr-grid">
          <div className="card">
            <div className="card-kicker">我发的是什么</div>
            <div className="card-title">Content-Type</div>
            <p>
              描述<b>随信附上的正文</b>是什么格式。发 JSON 忘了带它,
              服务器可能按表单或纯文本解析 —— 轻则字段全空,重则 400。
            </p>
            <div className="ht-hdr-ex">
              <span className="hn">Content-Type</span>:{" "}
              <span className="hv">application/json; charset=utf-8</span>
            </div>
          </div>
          <div className="card">
            <div className="card-kicker">我想要什么</div>
            <div className="card-title">Accept</div>
            <p>
              表达<b>希望对方返回</b>什么格式,术语叫内容协商(content
              negotiation)。同一个资源,可以按你的口味端出 JSON 或别的表述。
            </p>
            <div className="ht-hdr-ex">
              <span className="hn">Accept</span>:{" "}
              <span className="hv">application/json</span>
            </div>
          </div>
          <div className="card">
            <div className="card-kicker">我的通行证</div>
            <div className="card-title">Authorization</div>
            <p>
              认证凭据放这里,最常见的是 <code>Bearer</code> 加一段
              token。它凭什么能证明「你是你」?第 06 章整章讲它。
            </p>
            <div className="ht-hdr-ex">
              <span className="hn">Authorization</span>:{" "}
              <span className="hv">Bearer eyJhbGciOiJIUzI1NiJ9...</span>
            </div>
          </div>
          <div className="card">
            <div className="card-kicker">能存多久</div>
            <div className="card-title">Cache-Control</div>
            <p>
              服务器给这份响应定的<b>缓存策略</b>:能不能存、存多久。
              下面这行的意思是「一小时内不用再来问我」。
            </p>
            <div className="ht-hdr-ex">
              <span className="hn">Cache-Control</span>:{" "}
              <span className="hv">max-age=3600</span>
            </div>
          </div>
          <div className="card">
            <div className="card-kicker">版本指纹</div>
            <div className="card-title">ETag</div>
            <p>
              资源当前版本的<b>指纹</b>。下次请求带上{" "}
              <code>If-None-Match: &quot;33a64df5&quot;</code>,资源没变就回
              304,正文全省 —— 和 Cache-Control 是缓存二人组。
            </p>
            <div className="ht-hdr-ex">
              <span className="hn">ETag</span>:{" "}
              <span className="hv">&quot;33a64df5&quot;</span>
            </div>
          </div>
        </div>
        <Callout tone="idea" title="两条冷知识,省你以后犯嘀咕">
          <p>
            ① Header 名<b>不区分大小写</b>:DevTools 里显示{" "}
            <code>content-type</code>,文档里写 <code>Content-Type</code>,
            同一位。② 自定义 header 习惯上加 <code>X-</code> 前缀,比如{" "}
            <code>X-API-Key</code> —— 见到了别慌,就是某家 API 自己加的料。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 一次完整对话 ================= */}
      <Section
        id="conversation"
        index="06"
        title="一次完整对话:请求与响应面对面"
        desc="把这章学的全拼起来:左边是你寄出的信,右边是收到的回信。"
      >
        <CodePair
          left={
            <CodeBlock
              lang="http"
              title="你寄出的 · 请求"
              code={CONV_REQ}
              note={
                <>
                  GET 是只读请求:不带正文,所以 Header 完就结束了。
                  <code>Accept</code> 顺便点了菜:请回我 JSON。
                </>
              }
            />
          }
          right={
            <CodeBlock
              lang="http"
              title="你收到的 · 响应"
              code={CONV_RES}
              note={
                <>
                  200 办成了;<code>Cache-Control</code> 和 <code>ETag</code>{" "}
                  说「这份可以缓存,指纹是 v7」—— 下次带指纹来,没变就给你 304。
                </>
              }
            />
          }
        />

        <p className="sec-desc" style={{ marginTop: 18 }}>
          换个工具再寄一次。<b>curl</b>{" "}
          是程序员人手一份的命令行寄信员 —— 界面完全不同,寄出去的报文一模一样:
        </p>
        <CodeBlock
          lang="bash"
          title="terminal"
          code={CONV_CURL}
          note={
            <>
              <b>工具千变,报文不变。</b>浏览器、fetch、curl、Postman
              只是不同的「代笔秘书」—— 学会读报文,你就看懂了所有工具。
              (api.shop.com 是本书虚构的示例域名,想真跑,下面 Labs 有真靶场。)
            </>
          }
        />
      </Section>

      {/* ================= §07 动手任务 ================= */}
      <Section
        id="labs"
        index="07"
        title="动手任务"
        desc="报文这东西,读十遍不如亲手抓一遍。三个任务,DevTools 和 Console 就够。"
      >
        <LabSet ch="http" items={LABS} />
      </Section>

      {/* ================= §08 通关测验 ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="八道题,把方法、状态码、Header 一网打尽。全对点亮侧栏绿灯。"
      >
        <Quiz ch="http" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            一次调用 = 一封信:<b>起始行、Header、空行、正文</b>,
            请求响应都是这四段 —— 而且全是纯文本。
          </>,
          <>
            URL 回答「对哪个资源」,方法回答「干什么」:GET 读、POST 创建、
            PUT 整体替换、PATCH 部分修改、DELETE 删除。
          </>,
          <>
            安全 = 只读;幂等 = 重复执行副作用相同。幂等的现实意义是
            <b>超时敢重试</b> —— GET/PUT/DELETE 敢,POST 不敢。
          </>,
          <>
            状态码第一位是态度:2xx 办成、3xx 去别处、4xx 你的问题、5xx
            我的问题。401 问「你是谁」,403 说「你不许」。
          </>,
          <>
            Header 五常客:Content-Type(我发的)、Accept(我想要的)、
            Authorization(通行证)、Cache-Control 与 ETag(缓存二人组)。
          </>,
        ]}
      />

      <ChapterFooter ch="http" />
    </main>
  );
}
