# DeepSimulate-Front

A 股模拟交易前端。React + TypeScript + Vite，图表用 TradingView Lightweight Charts，状态用 TanStack Query（REST）+ Zustand（委托/账户）+ React 并发特性（高频行情），样式 Tailwind + Radix Primitives。

## 运行

```
cd DeepSimulate-Front
npm install
npm run dev      # http://127.0.0.1:5173
npm run build    # 产物 dist/
```

开发服务器把 `/api` 与 `/ws` 代理到后端 `127.0.0.1:9010`（见 `vite.config.ts`）。

## 页面结构

顶部导航切换两个页面，公用的账户摘要与连接状态常驻页头，状态栏常驻页脚。

### 自选股（`src/pages/MarketPage.tsx`）

| 区域 | 组件 | 说明 |
| --- | --- | --- |
| 左栏 | `Watchlist` | 自选清单，代码/名称搜索加入、移出，选中即订阅 |
| 中栏上 | `QuoteHeader` | 名称、最新价、涨跌、今开/昨收/最高/最低、成交量、成交额、涨停/跌停 |
| 中栏中 | `TimeShareChart` | 分时价格线 + 当日累计均价线 + 量能柱 + 昨收虚线 |
| 中栏下 | `OrderBook` / `TickList` | 五档盘口（点价回填）与逐笔成交 |
| 右栏上 | `TradePanel` | 买入/卖出、限价、数量（整手校验）、费用预估、下单结果 |
| 右栏下 | 本股面板 | 该股持仓/可卖/成本/市值/盈亏与本股未完成委托 |

### 账户（`src/pages/AccountPage.tsx`）

| 区域 | 组件 | 说明 |
| --- | --- | --- |
| 顶部 | 六个指标卡 | 总资产、可用资金、冻结资金、持仓市值、浮动盈亏、累计收益率 |
| 中部 | `PositionsTable` | 持仓明细，含 T+1 可卖列与「卖出」联动（跳回自选股并回填卖单） |
| 底部 | `OrderTabs` | 委托（状态/排队量/废单原因/撤单）与成交（佣金、印花税） |

## 数据流

- **REST**（TanStack Query）：登录、账户、持仓、历史委托、成交、分时、自选股。
- **WebSocket**（`src/ws.ts`）：五档、逐笔、委托状态、成交流水、账户变动。断线按 500ms 起指数退避重连，重连成功即触发一次 REST 快照对齐（`App.tsx` 的 `live.onResync`），不只等推送补齐。
- **高频行情**（`src/feed.tsx`）：五档与逐笔先写入 `Map` 缓冲区，每 150ms 批量合并后用 `startTransition` 提交，属并发低优先级更新；下单、切换标的等交互保持同步优先级，不被行情刷屏阻塞。页脚「行情渲染」显示是否处于降级更新。
- **委托/账户**（Zustand）：低频但强一致，收到 WS 消息立即写入 store。

## 目录

```
src/
  main.tsx          入口、QueryClient
  App.tsx           页面外壳、导航、数据订阅与快照对齐
  pages/            自选股页、账户页
  components/       行情头、盘口、逐笔、分时图、交易面板、持仓、委托/成交、状态栏、登录
  feed.tsx          行情缓冲与并发刷新（Context）
  ws.ts             WebSocket 通道（重连 + 订阅差量）
  store.ts          Zustand：账户、委托、成交、自选、连接状态
  api.ts            REST 客户端与 token 管理（sessionStorage）
  types.ts          与后端一一对应的 TypeScript 类型（无 any）
  format.ts         价格（厘→元）、金额、百分比、涨跌配色
```

## 单位约定

后端价格与金额均为厘（1 元 = 1000 厘）、数量为股。展示层统一用 `format.ts` 换算：`price()` 保留两位小数，`money()` 千分位两位小数，`shares()` 千分位整数。分时图时间按 UTC 解释以对齐交易所时钟。

## 状态与配色

A 股习惯：红涨绿跌（`up` / `down`）。涨跌幅以外的中性信息用 `muted`。白底主题，卡片 `panel` 带 1px 边框与轻投影。

## 已知边界

- 五档挂单量为后端模拟 L2 推算值，不等同交易所真实队列，界面上标注「模拟 L2」。
- 分时图每 20s 从 REST 刷新，期间只更新末点价格，成交量与均价以下一次刷新为准。
- 会话 token 存 sessionStorage，标签页关闭即失效；后端重启后需重新登录。
