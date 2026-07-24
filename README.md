# APIer · 把 API 讲透

面向零基础学习者的交互式 API 课程网站。从「什么是 API」讲起,
把 **RESTful API** 和 **GraphQL** 两大主流风格讲到能上手、能设计、能选型。

DataData(看得见的数据结构)/ AlgoAlgo(看得见的算法)的姊妹篇,同一套设计语言。

## 课程地图(12 章)

| # | 章节 | 内容 |
|---|------|------|
| 00 | 序章 · API 是什么 | 餐厅比喻 / 客户端-服务器 / JSON / 第一次真实请求 |
| 01 | HTTP:API 的母语 | URL 解剖 / 方法与幂等 / 状态码 / Header / 报文 |
| 02 | 第一次调用 API | fetch / async-await / res.ok 的坑 / POST / DevTools |
| 03 | REST 的思想 | 六大约束 / 资源与表述 / 成熟度模型 / HATEOAS |
| 04 | RESTful 设计实战 | URL 命名 / CRUD 映射 / 状态码决策 / RFC 9457 错误格式 |
| 05 | REST 进阶模式 | 分页 / 过滤排序 / 版本化 / ETag 缓存 / 幂等键 / 限流 / OpenAPI |
| 06 | 认证与安全 | API Key / Basic / JWT / OAuth 2.0 / CORS / HTTPS |
| 07 | GraphQL 初见 | over/under-fetching / 第一个 query / 单端点 / GraphiQL |
| 08 | Schema 与类型系统 | SDL / 标量与修饰符 / 关联图 / interface·union·input / 内省 |
| 09 | 查询、变更与订阅 | 变量·别名·片段·指令 / mutation / subscription / 错误与分页 |
| 10 | GraphQL 后台与性能 | resolver / N+1 / DataLoader / 缓存策略 / 安全防线 |
| ✦ | 终章 · 对决与选型 | 全维度对比 / 决策树 / GitHub·Shopify 案例 / 总测验 |

每章统一节奏:直觉比喻 → 交互可视化 → 能跑的真代码 → 常见误区 →
动手任务(真实公开 API)→ 通关测验 → 要点卡。进度存在浏览器本地。

## 跑起来

```bash
# 需要 Node 22(本机默认 16 跑不动)
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
npm install
npm run dev        # 默认 3000;或 npm run dev -- -p 3300
```

技术栈:Next.js 15(App Router)+ React 19 + TypeScript,纯 CSS 无依赖。
顶栏「☾ / ☀」切换深浅主题,⌘K 快速跳转章节。

开发规范见 [CLAUDE.md](CLAUDE.md);内容事实基准与来源见
[docs/research-report.md](docs/research-report.md)。
