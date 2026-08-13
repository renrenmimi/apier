"use client";

// 06 · 认证与安全 —— 动手任务 LABS + 通关测验 QUIZ 数据。

import type { Lab } from "@/lib/labs";
import type { QuizItem } from "@/lib/quiz";
import { CodeBlock } from "@/lib/code";

export const LABS: Lab[] = [
  {
    id: "base64-not-crypto",
    title: "编码 ≠ 加密,亲手验一遍",
    d: "easy",
    tags: ["btoa", "Basic", "Console"],
    task: (
      <p>
        打开浏览器 Console,先 <code>btoa("student:secret123")</code>{" "}
        得到一串「乱码」,再把结果 <code>atob()</code> 回去。
        全程你输入过密钥吗?想清楚这个问题,Basic 认证的安全模型就懂了。
      </p>
    ),
    hint: (
      <>
        btoa = binary to ASCII(编码),atob 反向。注意:没有任何密钥参与
        —— 这正是问题所在。
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="js"
          title="console"
          code={`const secret = btoa("student:secret123");
console.log(secret); // "c3R1ZGVudDpzZWNyZXQxMjM="
console.log(atob(secret)); // "student:secret123" —— 一秒还原`}
        />
        <p>
          这串字符就是 Basic 认证在网线上跑的样子。任何截到这个 header
          的人都能<b>无钥匙还原</b>出账号密码 —— 所以 Basic 离开 HTTPS
          等于把密码写在明信片上寄出去。
        </p>
      </>
    ),
  },
  {
    id: "jwt-io",
    title: "去 jwt.io 解剖一枚真 token",
    d: "medium",
    tags: ["JWT", "jwt.io"],
    task: (
      <>
        <p>
          先在 Console 里跑下面的代码,亲手造一枚和本章解剖台同款的
          JWT;把打印出来的 token 复制到{" "}
          <b>jwt.io</b> 的 Encoded 输入框,看右侧的解码结果,
          和本章 §04 对照。
        </p>
        <CodeBlock
          lang="js"
          title="console · 亲手造一枚 JWT"
          code={`const b64u = (obj) =>
  btoa(JSON.stringify(obj))
    .replace(/=+$/, "").replace(/\\+/g, "-").replace(/\\//g, "_");

const token =
  b64u({ alg: "HS256", typ: "JWT" }) + "." +
  b64u({ sub: "42", name: "Ada Lovelace", role: "editor",
         exp: 1798761600 }) + "." +
  "signature-goes-here";
console.log(token);`}
        />
      </>
    ),
    hint: (
      <>
        jwt.io 会红字提示 <b>Invalid Signature</b> ——
        想想为什么。这个红字恰恰是本章最重要的知识点。
      </>
    ),
    solution: (
      <p>
        左边三段分色,右边 header 和 payload <b>全部现原形</b> ——
        你随手 btoa 出来的东西,jwt.io 一览无余,再次证明 payload
        是明文。而「Invalid Signature」是因为合法签名必须用
        <b>服务器密钥</b>算出来,我们瞎填的当然不合法 ——
        服务器也会用同样的方式,一眼识破伪造的 token。顺手算算{" "}
        <code>new Date(1798761600 * 1000)</code>:exp 指向
        2027-01-01,过了这个点,这枚 token 就是废纸。
      </p>
    ),
  },
  {
    id: "cors-error",
    title: "亲手触发一次 CORS 报错,再读懂它",
    d: "medium",
    tags: ["CORS", "fetch", "Console"],
    task: (
      <p>
        随便找个网页打开 Console(就在本站也行),先{" "}
        <code>fetch("https://www.google.com")</code>
        ,看控制台的红字报错,逐句读一遍;再{" "}
        <code>fetch("https://jsonplaceholder.typicode.com/posts/1")</code>{" "}
        对比 —— 一个被拦,一个畅通,差别在哪?
      </p>
    ),
    hint: (
      <>
        红字里的关键词:blocked by CORS policy、No
        'Access-Control-Allow-Origin' header —— 是<b>谁</b>在
        block?缺的那个头,该由<b>谁</b>来加?
      </>
    ),
    solution: (
      <>
        <CodeBlock
          lang="js"
          title="console"
          code={`// 第一发:被拦
fetch("https://www.google.com").catch((e) => console.log(e.message));
// 红字大意:请求被 CORS 策略拦截 ——
// 响应里没有 Access-Control-Allow-Origin 头

// 第二发:畅通
const res = await fetch("https://jsonplaceholder.typicode.com/posts/1");
console.log(res.status); // 200`}
        />
        <p>
          google.com 没开 CORS(它压根不想让别家网页的 JS 读它);
          jsonplaceholder 开了(<code>Access-Control-Allow-Origin: *</code>
          ,公共练手 API 的标配)。注意报错发生在<b>你这边的浏览器</b>:
          请求很可能已经到达 google 的服务器,只是响应被浏览器保安扣下了。
          用 curl 试同一个地址就毫无障碍 —— 保安只住在浏览器里。
        </p>
      </>
    ),
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: (
      <>
        「认证(authentication)」和「授权(authorization)」的分工是?
      </>
    ),
    opts: [
      <>认证问「你是谁」,授权问「你能干嘛」</>,
      <>认证问「你能干嘛」,授权问「你是谁」</>,
      <>两个词是同义词,混着用没问题</>,
      <>认证给人类用户用,授权给程序用</>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        正好说反了。先验明正身(authentication),再查权限清单
        (authorization)—— 顺序也永远是认证在前。
      </>,
      <>
        HTTP 都替它们分了家:401 管认证、403 管授权 ——
        专门各配一个状态码的,不可能是同义词。
      </>,
      <>
        跟调用方是人是程序无关 —— 程序调 API
        一样要先证明身份、再看权限,两步一步不少。
      </>,
    ],
    why: (
      <>
        保安两连问:「你是谁?」查证件,是认证;「你要进机房?」查权限,
        是授权。分清这两个词,401/403、OAuth 的 scope 全都顺理成章。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        一位普通用户<b>正常登录后</b>,试图删除管理员的帖子。
        服务器最恰当的回应是?
      </>
    ),
    opts: [
      <>401 —— 他没有权限</>,
      <>403 —— 认识你,但这事你不能干</>,
      <>404 —— 假装帖子不存在</>,
      <>
        200 —— 但 body 里写 <code>"error": true</code>
      </>,
    ],
    correct: 1,
    wrong: [
      <>
        401 说的是「凭证有问题」:没带、带错、过期。这位用户凭证好好的,
        卡在权限上 —— 那是 403 的地盘。
      </>,
      undefined,
      <>
        用 404 掩盖 403 确实真实存在(GitHub 就这么干,
        为了不泄露资源存在性),但那是特定安全考量下的取舍,
        不是「最恰当的默认答案」。
      </>,
      <>
        一律 200、把错误藏进 body,是第 04 章点过名的 REST 反模式 ——
        状态码就是干这个的,让它干活。
      </>,
    ],
    why: (
      <>
        口诀:401 = 「你是谁?」认证问题,重新登录有救;403 =
        「我认识你,但不行」,授权问题,登一百次也没用。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        <code>Authorization: Basic c3R1ZGVudDpzZWNyZXQxMjM=</code> ——
        这串「乱码」的本质是?
      </>
    ),
    opts: [
      <>加密后的密码,没有密钥解不开</>,
      <>
        只是 base64 编码,任何人 <code>atob()</code> 一下就能还原出{" "}
        <code>student:secret123</code>
      </>,
      <>密码的哈希值,不可逆</>,
      <>服务器发的随机会话 id</>,
    ],
    correct: 1,
    wrong: [
      <>
        全程没有任何密钥参与 —— btoa/atob 是公开的变形规则。
        它和加密的距离,完全是两回事:编码只是换一种表示方式,不提供任何保密性。
      </>,
      undefined,
      <>
        哈希是单向的、不可还原,而这串字符能完美还原 ——
        它是可逆的编码,连哈希都算不上。
      </>,
      <>
        它是客户端自己算出来的(用户名:密码直接编码),
        根本不需要服务器参与 —— 这正是 Basic 简陋的地方。
      </>,
    ],
    why: (
      <>
        base64 只解决「特殊字符塞进 header」的运输问题,不提供任何保密性。
        所以 Basic 认证的铁律:必须跑在 HTTPS 上,保密交给 TLS。
      </>
    ),
  },
  {
    type: "choice",
    q: <>关于 JWT 的三段结构,下面哪句说对了?</>,
    opts: [
      <>payload 是加密的,只有服务器能看</>,
      <>
        签名(signature)保证前两段没被篡改,但 payload 谁都能解码
        —— 防改,不防看
      </>,
      <>偷偷改掉 payload 里的字段再发回去,服务器发现不了</>,
      <>三段都是随机字符串,没有内部结构</>,
    ],
    correct: 1,
    wrong: [
      <>
        payload 只是 Base64URL 编码 —— 粘到 jwt.io 立刻现原形。
        这就是「敏感数据别放 payload」的原因。
      </>,
      undefined,
      <>
        恰恰会被当场抓住:签名是拿服务器密钥对前两段算出来的,
        内容动一个字,验签就对不上。
      </>,
      <>
        三段分工明确:header 说明算法、payload 装数据、
        signature 是防伪封条 —— 前两段还能原样解码回 JSON。
      </>,
    ],
    why: (
      <>
        一句话记牢:JWT <b>防篡改(签名),不防偷看(明文)</b>。
        不想被看的东西,要么别放进去,要么整体再加密(那叫 JWE,超纲)。
      </>
    ),
  },
  {
    type: "fill",
    q: (
      <>
        access token 故意发得短命(几分钟到几小时)。它过期后,
        客户端不打扰用户,而是拿手里另一枚长寿命的____ token
        去静默换一对新令牌(英文单词)。
      </>
    ),
    placeholder: "输入英文单词…",
    answers: ["refresh", "refresh token", "refreshtoken"],
    hint: <>这个词的本义是「刷新」—— 浏览器上那个 F5 键的英文。</>,
    why: (
      <>
        「短命 access + refresh 换发」是 JWT 无状态方案的标配:
        access 泄露了损失有限(很快过期),refresh 平时不出门、
        只在换发时用一次 —— 用户全程无感,安全和体验两头兼顾。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        OAuth 授权码流程五步:① 用户在授权页点「同意」 ② 应用后端用
        code + secret 换 access token ③ 用户点「用微信登录」,
        浏览器跳到授权服务器 ④ 应用带着 token 调资源服务器的 API
        ⑤ 授权服务器带着 code 把浏览器送回应用 —— 正确顺序是?
      </>
    ),
    opts: [
      <>③ → ① → ⑤ → ② → ④</>,
      <>③ → ① → ② → ⑤ → ④</>,
      <>① → ③ → ⑤ → ② → ④</>,
      <>③ → ⑤ → ① → ④ → ②</>,
    ],
    correct: 0,
    wrong: [
      undefined,
      <>
        code 得先随浏览器回到应用手里(⑤),应用<b>后端</b>才拿它去换
        token(②)—— 换票发生在后台通道,不在浏览器里。
      </>,
      <>
        还没跳到授权页,用户上哪儿点同意?③ 必须先把你送到授权服务器的页面,
        ① 才有地方发生。
      </>,
      <>
        乱了:没有用户同意(①),授权服务器不会发 code;
        没换到 token(②),也调不了 API(④)。
      </>,
    ],
    why: (
      <>
        记这条链:<b>跳转 → 同意 → 发码 → 后台换票 → 持票取数</b>。
        code 是一次性小票,token 才是钥匙;换票必须在后端做,
        client_secret 永远不见浏览器。
      </>
    ),
  },
  {
    type: "multi",
    q: <>关于 CORS,下面哪些说法是对的?(多选)</>,
    opts: [
      <>拦下响应、不让 JS 读的,是浏览器,不是服务器</>,
      <>curl 和 Postman 也会被 CORS 拦住</>,
      <>
        非简单请求(带 Authorization、JSON body 等)发出前,
        浏览器会自动先发一条 OPTIONS 预检
      </>,
      <>CORS 报错时,请求可能其实已经到达服务器、并被正常处理了</>,
    ],
    correct: [0, 2, 3],
    missHint: (
      <>
        有一条你漏了 —— 想想「预检」是谁自动发出的,
        以及报错时那个请求到底走没走出去。
      </>
    ),
    extraHint: (
      <>
        有一项混进来了 —— 想想 CORS 的规矩是<b>谁</b>在执行:
        命令行工具里根本没有那位「保安」。
      </>
    ),
    why: (
      <>
        CORS 是浏览器执行的同源策略「开闸机制」:保安住在浏览器里,
        所以 curl/Postman 畅通无阻;报错时服务器可能早就回了
        200,只是浏览器不给你的 JS 看。这三点想通,
        九成 CORS 疑难杂症都能自己确诊。
      </>
    ),
  },
  {
    type: "choice",
    q: (
      <>
        你申请了一个收费天气 API 的 key,打算直接写在前端 JS 里
        fetch。这个方案?
      </>
    ),
    opts: [
      <>可以,现代打包器会把 key 混淆掉,没人看得出来</>,
      <>可以,只要全程 HTTPS 就没人偷得到</>,
      <>
        不行 —— 浏览器里的代码人人可看,key 等于公开发行;
        应该让自己的后端代为调用
      </>,
      <>不行,但把 key 挪到 query 参数里就可以</>,
    ],
    correct: 2,
    wrong: [
      <>
        混淆只是把变量名改丑。Network 面板里请求一发出去,key
        的原文就躺在 header/URL 里 —— F12 一开,全都看得见。
      </>,
      <>
        HTTPS 防的是路上的窃听者,防不了终点的用户本人 —— key
        就是发到用户浏览器里的,人家打开 DevTools 就能抄走。
      </>,
      undefined,
      <>
        query 比 header 更糟:会进服务器日志、浏览器历史,
        转发个链接都能把 key 送出去。
      </>,
    ],
    why: (
      <>
        铁律:<b>前端藏不住任何秘密</b>。正解是后端代理:浏览器调你自己的
        API,你的服务器(key 存在环境变量里)再去调第三方 ——
        顺手还能加缓存和限流,一举三得。
      </>
    ),
  },
];
