/**
 * 界面清单：按数据源分类
 *   D6 = 市场数据（行情/板块/资金/两融/涨停/资讯/日线）
 *   D2 = 数据中心（龙虎榜/资金流/估值/质押/两融/解禁/公告…）
 *   D1 = 资讯与 F10（示例脚本 d1_gui.py 的能力中心，POST + a/c 接口名）
 * scope='stock' 的界面归到「个股」主页面。
 */

import { D2_CAPS } from './d2caps'

export type ScreenParam = {
  key: string
  label: string
  def: string
  hint?: string
}

export type Source = 'D6' | 'D2' | 'D1' | 'D101'

export type Screen = {
  id: string
  title: string
  group: string
  source: Source
  /** 相对 /api/ext 的路径 */
  path: string
  params?: ScreenParam[]
  /** POST 请求体模板，{{code}} / {{day}} 会被参数替换 */
  body?: Record<string, unknown>
  kind?: 'table' | 'line' | 'kline' | 'd101' | 'klineboard' | 'replaychart' | 'replaybar' | 'replaypanel'
  paging?: { sizeKey: string; pageKey: string; inBody?: boolean; offset?: boolean }
  /** POST 请求：参数走 JSON 体 */
  method?: 'POST'
  /** 固定查询参数（不显示在界面上），如 D2 的 sub */
  fixed?: Record<string, string>
  /** stock = 个股维度，归到个股页面 */
  scope?: 'stock'
  note?: string
}

const CODE: ScreenParam = { key: 'code', label: '代码', def: '000001' }
const PLATE: ScreenParam = { key: 'plateTypeCode', label: '板块类型', def: 'hy' }
const HQTYPE: ScreenParam = { key: 'hqTypeCode', label: '板块类型', def: 'HY' }

/** GET 接口：pageNum 是页码 */
const P_URL: Screen['paging'] = { sizeKey: 'pageSize', pageKey: 'pageNum' }
/** D2 统一分页：pageNumber 是页码 */
const P_D2: Screen['paging'] = { sizeKey: 'pageSize', pageKey: 'pageNumber' }
/** POST 体：st 每页条数 + Index 偏移 */
const P_BODY: Screen['paging'] = { sizeKey: 'st', pageKey: 'Index', inBody: true, offset: true }

/* D6 市场数据 */

const D6: Screen[] = [
  { id: 'overview', title: '市场统计(历史)', group: 'D6 总览', source: 'D6', path: 'd6/market/v1/quote/market/overview', kind: 'table', note: '该接口数据源只到 2022-04' },
  { id: 'index', title: '指数行情', group: 'D6 总览', source: 'D6', path: 'd6/market/v1/quote/index/major' },
  { id: 'dist', title: '涨跌分布', group: 'D6 总览', source: 'D6', path: 'd6/market/v1/quote/overview/change' },
  { id: 'mood', title: '市场情绪', group: 'D6 总览', source: 'D6', path: 'd6/market/v1/market/sentiment' },
  { id: 'cal', title: '交易日历', group: 'D6 总览', source: 'D6', path: 'd6/market/v1/market/trading-days' },
  { id: 'idxcap', title: '指数资金', group: 'D6 总览', source: 'D6', path: 'd6/market/v1/quote/index/capital', kind: 'table' },
  { id: 'rankchg', title: '涨幅榜', group: 'D6 排行', source: 'D6', path: 'd6/market/v1/rank/change', paging: P_URL },
  { id: 'rankamt', title: '成交额榜', group: 'D6 排行', source: 'D6', path: 'd6/market/v1/rank/stocks', paging: P_URL },
  { id: 'hot', title: '人气榜', group: 'D6 排行', source: 'D6', path: 'd6/market/v1/search/hot-stocks', paging: P_URL },
  { id: 'ah', title: 'AH 比价', group: 'D6 排行', source: 'D6', path: 'd6/market/v1/quote/cross-market/ah' },
  { id: 'sector', title: '板块行情', group: 'D6 板块', source: 'D6', path: 'd6/market/v1/sector/quote', params: [HQTYPE], paging: P_URL },
  { id: 'sectorchg', title: '板块涨幅', group: 'D6 板块', source: 'D6', path: 'd6/market/v1/sector/change-rank', params: [PLATE], paging: P_URL },
  { id: 'sectorcap', title: '板块资金', group: 'D6 板块', source: 'D6', path: 'd6/market/v1/sector/capital-rank', params: [PLATE], paging: P_URL },
  { id: 'sectorlead', title: '板块龙头', group: 'D6 板块', source: 'D6', path: 'd6/market/v1/sector/leader-rank', params: [PLATE] },
  { id: 'sectoranom', title: '板块异动', group: 'D6 板块', source: 'D6', path: 'd6/market/v1/sector/anomaly/current', params: [PLATE] },
  { id: 'sectorstyle', title: '风格板块', group: 'D6 板块', source: 'D6', path: 'd6/market/v1/sector/style' },
  { id: 'flowsnap', title: '资金快照', group: 'D6 资金', source: 'D6', path: 'd6/market/v1/capital/flow/snapshot', params: [CODE] },
  { id: 'flowrank', title: '资金排行', group: 'D6 资金', source: 'D6', path: 'd6/market/v1/capital/flow/period-rank' },
  { id: 'flowhis', title: '资金历史', group: 'D6 资金', source: 'D6', path: 'd6/market/v1/capital/flow/history', params: [CODE], kind: 'table' },
  { id: 'lhb', title: '龙虎榜', group: 'D6 资金', source: 'D6', path: 'd6/market/v1/capital/dragon-tiger/sales-rank' },
  { id: 'lhbstock', title: '龙虎榜个股', group: 'D6 资金', source: 'D6', path: 'd6/market/v1/capital/dragon-tiger/stock-flow', params: [CODE] },
  { id: 'lhbtrend', title: '龙虎榜趋势', group: 'D6 资金', source: 'D6', path: 'd6/market/v1/capital/dragon-tiger/trend' },
  { id: 'scramble', title: '抢筹排行', group: 'D6 资金', source: 'D6', path: 'd6/market/v1/capital/scramble-rank' },
  { id: 'connect', title: '沪深港通', group: 'D6 资金', source: 'D6', path: 'd6/market/v1/connect/flow-history', kind: 'table' },
  { id: 'connectactive', title: '北向活跃股', group: 'D6 资金', source: 'D6', path: 'd6/market/v1/connect/active-rank' },
  { id: 'marginsum', title: '两融汇总', group: 'D6 两融', source: 'D6', path: 'd6/market/v1/margin/summary' },
  { id: 'margincurve', title: '两融曲线', group: 'D6 两融', source: 'D6', path: 'd6/market/v1/margin/curve', kind: 'line' },
  { id: 'margintop', title: '两融前五', group: 'D6 两融', source: 'D6', path: 'd6/market/v1/margin/top-five' },
  { id: 'limitlist', title: '涨跌停列表', group: 'D6 涨停', source: 'D6', path: 'd6/market/v1/limit/list', paging: P_URL },
  { id: 'limitdist', title: '涨停分布', group: 'D6 涨停', source: 'D6', path: 'd6/market/v1/limit/distribution', kind: 'table' },
  { id: 'limitmon', title: '涨跌停监控', group: 'D6 涨停', source: 'D6', path: 'd6/market/v1/limit/monitor' },
  { id: 'news', title: '公告', group: 'D6 资讯', source: 'D6', kind: 'table', paging: { sizeKey: 'pageSize', pageKey: 'pageNo', inBody: true }, path: 'd6/market/v1/news/announcements/filter', body: { searchTp: 0, pageNo: 1, pageSize: 50, title: '', level1: '', level2: '', range: 1, dateTp: 2, sentiment: 0, optionStock: [] } },
  { id: 'report', title: '研报', group: 'D6 资讯', source: 'D6', path: 'd6/market/v1/news/research-reports', kind: 'table' },
  { id: 'ipo', title: '新股申购', group: 'D6 资讯', source: 'D6', path: 'd6/market/v1/news/ipo' },
  { id: 'perf', title: '业绩预告', group: 'D6 资讯', source: 'D6', path: 'd6/market/v1/news/performance/summary' },
  { id: 'blocklist', title: '大宗交易', group: 'D6 资讯', source: 'D6', path: 'd6/market/v1/trade/block-list' },
  {
    id: 'kline',
    title: '日线',
    group: 'D6 行情',
    source: 'D6',
    path: 'd6/market/v1/kline/history',
    kind: 'kline',
    params: [
      { key: 'market', label: '市场', def: 'SZ' },
      { key: 'inst', label: '代码', def: '000001' },
      { key: 'period', label: '周期', def: 'DAY' },
      { key: 'limit', label: '条数', def: '200' },
      { key: 'startTime', label: '起', def: '0' },
      { key: 'endTime', label: '止', def: '2524579200' },
    ],
    note: '条数须为 50 的整数倍。DAY / WEEK / MONTH / MIN1 / MIN5 / MIN15 / MIN30 / MIN60',
  },
]

/* D2 数据中心 */

/** D2 二级分类 */
const D2_GROUP: Record<string, string> = {
  gc: 'D2 涨停与市场',
  guchi: 'D2 涨停与市场',
  guchi_stats: 'D2 涨停与市场',
  limit_topic: 'D2 涨停与市场',
  market_overview: 'D2 涨停与市场',
  nxfxb: 'D2 涨停与市场',
  sector_rotation: 'D2 涨停与市场',
  billboard_hot: 'D2 龙虎榜',
  hsgt_org: 'D2 两融与互联',
  zlcc: 'D2 估值与持仓',
  financial_report: 'D2 估值与持仓',
  fhsz: 'D2 股东与解禁',
  ggdq: 'D2 股东与解禁',
  tfp: 'D2 股东与解禁',
  ipo_stat: 'D2 股东与解禁',
  pledge: 'D2 估值与持仓',
  indicator_theme: 'D2 涨停与市场',
  guchi_month: 'D2 涨停与市场', server_time: 'D2 涨停与市场',
  suspend_http: 'D2 股东与解禁',
  announcement_http: 'D2 股东与解禁',
  market_indicator: 'D2 涨停与市场',
  market_indicator_date: 'D2 涨停与市场',
  market_indicator_theme: 'D2 涨停与市场',
  trade_day_status: 'D2 涨停与市场',
  security_suggest: 'D2 涨停与市场',
  hsgt_http: 'D2 两融与互联',
  pledge_http: 'D2 估值与持仓',
  main_hold: 'D2 估值与持仓',
  valuation: 'D2 估值与持仓',
  flow_v2_summary: 'D2 资金流向',
  flow_v2_minute: 'D2 资金流向',
  flow_v2_history: 'D2 资金流向',
  flow_v2_minute_old: 'D2 资金流向',
  margin: 'D2 两融与互联',
  hsgt_reports: 'D2 两融与互联',
  futures_analysis: 'D2 涨停与市场',
  trade_calendar: 'D2 涨停与市场',
  main_force: 'D2 估值与持仓',
  f10_notice: 'D2 个股',
  content_detail: 'D2 个股',
  dividend_reports: 'D2 股东与解禁',
  stock_fund: 'D2 个股',
  stock_margin: 'D2 个股',
  stock_zlcc: 'D2 个股',
  stock_pledge: 'D2 个股',
  stock_gggz: 'D2 个股',
  data_statistics: 'D2 涨停与市场',
  hot_stocks: 'D2 涨停与市场',
  theme_hot: 'D2 涨停与市场',
  extended_reports: 'D2 涨停与市场',
  security_search: 'D2 涨停与市场',
  flow_day: 'D2 资金流向',
  flow_minute: 'D2 资金流向',
  flow_industry: 'D2 资金流向',
  flow_concept: 'D2 资金流向',
  flow_stock: 'D2 资金流向',
  dark_market: 'D2 资金流向',
  lhb_daily: 'D2 龙虎榜',
  lhb_inst: 'D2 龙虎榜',
  lhb_dept: 'D2 龙虎榜',
  billboard_brief: 'D2 龙虎榜',
  northbound: 'D2 两融与互联',
  mutual_quota: 'D2 两融与互联',
  board_pe_dividend: 'D2 估值与持仓',
  holder_change: 'D2 股东与解禁',
  holder_num: 'D2 股东与解禁',
  jiejin: 'D2 股东与解禁',
  dividend: 'D2 股东与解禁',
  forecast: 'D2 股东与解禁',
  ipo: 'D2 股东与解禁',
  block_trade: 'D2 股东与解禁',
  announcement: 'D2 股东与解禁',
  diagnosis: 'D2 个股',
  research_report: 'D2 个股',
  stock_profile: 'D2 个股',
}

/** 只有这些列表类 D2 界面支持 pageNumber 翻页 */
const D2_PAGED = new Set([
  'guchi', 'guchi_stats', 'flow_industry', 'flow_concept', 'flow_stock', 'hot_stocks',
  'lhb_daily', 'lhb_inst', 'lhb_dept', 'zlcc', 'gggz', 'holder_num', 'holder_change',
  'jiejin', 'dividend', 'fhsz', 'forecast', 'ipo_apply', 'ipov2', 'block_trade', 'tfp',
  'pledge', 'data_statistics', 'theme_hot', 'sector_rotation', 'billboard_hot',
  'stock_pledge', 'stock_gggz', 'stock_zlcc',
])

const d2 = (id: string, title: string, path: string, extra?: Partial<Screen>): Screen => ({
  id: `d2_${id}`,
  title,
  group: D2_GROUP[id] ?? 'D2 数据中心',
  source: 'D2',
  path,
  paging: D2_PAGED.has(id) ? P_D2 : undefined,
  ...extra,
})

const D2: Screen[] = [
  // 工作台口径：sub + status(1涨/2炸/3跌) + date 都是必填
  d2('guchi', '涨停股池', 'd2/gc', {
    fixed: { sub: 'guchi_pc', status: '1' },
    params: [{ key: 'date', label: '日期', def: '20261022' }, { key: 'status', label: '涨停1/炸板2/跌停3', def: '1' }],
  }),
  d2('guchi_month', '涨停池(近一月)', 'd2/gc', {
    fixed: { sub: 'guchi' },
    params: [{ key: 'date', label: '日期', def: '20261022' }, { key: 'status', label: '涨停1/炸板2/跌停3', def: '1' }],
  }),
  d2('server_time', '服务器时间', 'd2/gc', { fixed: { sub: 'time' } }),
  d2('guchi_stats', '股池统计', 'd2/gc', {
    fixed: { sub: 'guchi_date', columns: 'TRADE_DATE,ZTJS,DTJS,CJZT_NUM,SEALING_RATE,YI_NUM,LBJS,LB_HIGH,INDEX_YILED', sortColumns: 'TRADE_DATE', sortTypes: '-1' },
  }),
  d2('limit_topic', '涨停专题', 'd2/limit_topic'),
  d2('market_overview', '市场总览与宽度', 'd2/market_overview'),
  d2('nxfxb', '指数风向', 'd2/gc', { fixed: { sub: 'nxfxb', type: 'board' } }),
  d2('data_statistics', '涨跌家数统计', 'd2/gc', { fixed: { sub: 'data_statistics' } }),
  d2('hot_stocks', '股票热度榜', 'd2/gc', { fixed: { sub: 'hot_stocks' } }),
  d2('theme_hot', '热门主题', 'd2/gc', { fixed: { sub: 'theme_hot' } }),
  d2('indicator_theme', '热门主题(指标)', 'd2/gc', { fixed: { sub: 'market_indicator_theme' } }),
  d2('billboard_brief', '龙虎榜市场摘要', 'd2/gc', { fixed: { sub: 'billboard_brief' } }),
  d2('billboard_hot', '龙虎榜游资', 'd2/gc', { fixed: { sub: 'billboard_hot_money' } }),
  d2('sector_rotation', '板块轮动', 'd2/gc', { fixed: { sub: 'sector_rotation' } }),
  // 资金流向
  d2('flow_industry', '行业资金流向', 'd2/gc', { fixed: { sub: 'flow_industry' } }),
  d2('flow_concept', '概念资金流向', 'd2/gc', { fixed: { sub: 'flow_concept' } }),
  d2('flow_stock', '个股资金流向', 'd2/gc', { fixed: { sub: 'flow_stock' } }),
  d2('flow_day', '主力资金流_天', 'd2/flow_day', { params: [CODE] }),
  d2('flow_minute', '主力资金流_分钟', 'd2/flow_minute', { params: [CODE] }),
  d2('flow_v2_minute_old', '主力资金流_分钟(旧)', 'd2/flow_minute', { params: [CODE] }),
  d2('dark_market', '暗盘资金榜', 'd2/dark_market'),
  // 龙虎榜
  d2('lhb_daily', '龙虎榜每日详情', 'd2/gc', { fixed: { sub: 'lhb_daily' } }),
  d2('lhb_inst', '龙虎榜机构席位', 'd2/gc', { fixed: { sub: 'lhb_inst' } }),
  d2('lhb_dept', '龙虎榜营业部排行', 'd2/gc', { fixed: { sub: 'lhb_dept' } }),
  d2('lhb_type', '龙虎榜类型', 'd2/lhb_daily'),
  // 两融与互联
  d2('northbound', '沪深港通持仓', 'd2/gc', { fixed: { sub: 'northbound', type: 'hold' } }),
  d2('hsgt_org', '沪深港通机构持仓', 'd2/gc', { fixed: { sub: 'hsgt', type: 'org_hold' } }),
  d2('mutual_quota', '沪深港通额度', 'd2/gc', { fixed: { sub: 'mutual_quota' } }),
  // 估值与持仓
  d2('zlcc', '主力持仓', 'd2/gc', { fixed: { sub: 'zlcc', type: 'list' } }),
  d2('board_pe_dividend', '板块估值与股息', 'd2/gc', { fixed: { sub: 'board_pe_dividend' } }),
  d2('financial_report', '财报数据', 'd2/gc', { fixed: { sub: 'financial_report', type: 'latest' } }),
  // 股东与解禁
  d2('gggz', '高管持股变动', 'd2/gc', { fixed: { sub: 'gggz', type: 'historical' } }),
  d2('ggdq', '股东户数与筹码', 'd2/gc', { fixed: { sub: 'ggdq' } }),
  d2('holder_num', '股东户数', 'd2/gc', { fixed: { sub: 'holder_num' } }),
  d2('holder_change', '股东高管变动', 'd2/gc', { fixed: { sub: 'holder_change' } }),
  d2('jiejin', '限售解禁', 'd2/gc', { fixed: { sub: 'jiejin' } }),
  d2('dividend', '分红送转', 'd2/gc', { fixed: { sub: 'dividend' } }),
  d2('fhsz', '分红送转方案', 'd2/gc', { fixed: { sub: 'fhsz', type: 'plan' } }),
  d2('forecast', '业绩预告', 'd2/gc', { fixed: { sub: 'forecast' } }),
  d2('ipo_apply', '新股申购日历', 'd2/gc', { fixed: { sub: 'ipo_apply' } }),
  d2('ipov2', '新股发行列表', 'd2/gc', { fixed: { sub: 'ipov2' } }),
  d2('ipo_stat', 'IPO 募集统计', 'd2/gc', { fixed: { sub: 'ipo_statistics' } }),
  d2('block_trade', '大宗交易', 'd2/gc', { fixed: { sub: 'block_trade' } }),
  d2('tfp', '停复牌', 'd2/gc', { fixed: { sub: 'tfp', type: 'list' } }),
  d2('pledge', '股权质押', 'd2/gc', { fixed: { sub: 'pledge', type: 'latest' } }),
  // 个股
  d2('diagnosis', '个股诊断', 'd2/gc', { fixed: { sub: 'diagnosis', type: 'summary' }, params: [CODE], scope: 'stock' }),
  d2('flow_stock2', '个股资金流', 'd2/gc', { fixed: { sub: 'flow_stock' } }),
  d2('stock_margin', '个股两融', 'd2/gc', { fixed: { sub: 'rzrq', type: 'stocks' }, params: [CODE], scope: 'stock' }),
  d2('stock_zlcc', '个股主力持仓', 'd2/gc', { fixed: { sub: 'zlcc', type: 'detail' }, params: [CODE], scope: 'stock' }),
  // warning 视图没有 SECURITY_CODE 列，传 code 会报"列不存在"，必须用 secucode（000001.SZ）
  d2('stock_pledge', '个股质押预警', 'd2/gc', {
    fixed: { sub: 'pledge', type: 'warning' },
    params: [{ key: 'secucode', label: '证券代码', def: '000001.SZ' }],
    scope: 'stock',
  }),
  d2('stock_gggz', '个股高管持股', 'd2/gc', { fixed: { sub: 'gggz', type: 'status' }, params: [CODE], scope: 'stock' }),
  d2('research_report', '研究报告列表', 'd6/market/v1/news/research-reports', { params: [CODE], scope: 'stock', paging: undefined }),
  d2('stock_profile', '个股资料与基本面', 'd2/stock_profile', { params: [CODE], scope: 'stock' }),
  // 工作台直连接口（全部实测有数据）
  d2('suspend_http', '停复牌(直连)', 'd2/suspend'),
  d2('announcement_http', '公告查询(直连)', 'd2/announcement'),
  d2('market_indicator', '市场指标', 'd2/market_indicator'),
  d2('market_indicator_date', '市场指标日期', 'd2/market_indicator_date'),
  d2('market_indicator_theme', '主题指标', 'd2/gc', { fixed: { sub: 'market_indicator_theme' } }),
  d2('trade_day_status', '交易日状态', 'd2/trade_day_status'),
  d2('security_suggest', '证券搜索建议', 'd2/security_suggest', { params: [{ key: 'keyword', label: '关键字', def: '平安' }] }),
  d2('hsgt_http', '沪深港通周期', 'd2/hsgt_http'),
  d2('pledge_http', '质押(直连)', 'd2/pledge_http'),
  d2('main_hold', '主力持仓(直连)', 'd2/main_hold'),
  d2('valuation', '估值分析(直连)', 'd2/valuation'),
  d2('flow_v2_minute', '增强资金流_分钟', 'd2/flow_v2_minute', { params: [CODE] }),
  // 需要额外参数、暂未打通的接口（保留入口，界面会显示上游原始报错）
  d2('margin', '融资融券多视图', 'd2/margin', { note: '需额外参数' }),
  d2('hsgt_reports', '沪深港通多视图', 'd2/hsgt_reports', { note: '需额外参数' }),
  d2('futures_analysis', '期货持仓与成交', 'd2/futures_analysis', { note: '需额外参数' }),
  d2('trade_calendar', '交易日序列', 'd2/trade_calendar_http', { note: '需额外参数' }),
  d2('main_force', '主力建仓', 'd2/main_force_report', { note: '需额外参数' }),
  d2('f10_notice', '资料详情', 'd2/f10_notice_compat', { note: '需额外参数' }),
  d2('content_detail', '公告正文', 'd2/content_detail', { note: '需额外参数' }),
  d2('dividend_reports', '分红送转多视图', 'd2/dividend_reports', { note: '需额外参数' }),
  d2('security_search', '证券搜索', 'd2/security_search', { params: [{ key: 'keyword', label: '关键字', def: '平安' }] }),
]

/* D1 资讯与 F10（来自 d1_gui.py 能力中心） */

const d1 = (
  id: string,
  title: string,
  group: string,
  path: string,
  body: Record<string, unknown>,
  extra?: Partial<Screen>,
): Screen => ({
  id: `d1_${id}`,
  title,
  group: `D1 ${group}`,
  source: 'D1',
  path,
  body,
  paging: 'st' in body ? P_BODY : undefined,
  ...extra,
})

const D1: Screen[] = [
  // 指数行情
  d1('global', '全球市场', '指数行情', 'd1/hq', { a: 'GlobalCommon', c: 'GlobalIndex', View: '1,2,3,4,5,6' }),
  d1('idx_list', '指数列表', '指数行情', 'd1/lhb', { a: 'NewGetList', c: 'Index' }),
  d1('idx_kline', '指数K线', '指数行情', 'd1/his', { a: 'GetZhiShuKLine', c: 'ZhiShuKLine', st: '630', Index: '0', Type: 'd', StockID: 'SH000001' }),
  d1('global_kline', '全球K线', '指数行情', 'd1/hq', { a: 'GetDayKLineGlobal', c: 'StockLineData', st: '120', Index: '0', LeiX: '4', Type: 'd', StockID: 'HSI' }),
  // 市场概况
  d1('trend', '涨跌趋势', '市场概况', 'd1/his', { a: 'ChangeStatistics', c: 'HisHomeDingPan', st: '100', Index: '0' }),
  d1('limit_detail', '涨跌停明细', '市场概况', 'd1/his', { a: 'GetNum', c: 'HisHomeDingPan', Day: '{{day}}', Is_st: '1', FilterMotherboard: '0', FilterGem: '0', FilterTIB: '0', Filter: '0' }, { params: [{ key: 'day', label: '日期', def: '20261022' }] }),
  d1('capacity', '市场容量', '市场概况', 'd1/his', { a: 'MarketCapacity', c: 'HisHomeDingPan', Type: '0', Date: '{{day}}' }, { params: [{ key: 'day', label: '日期', def: '20261022' }] }),
  // 行情排行 / 异动
  d1('weight', '权重表现', '行情排行', 'd1/hq', { a: 'WeightPerformanceList', c: 'HomeDingPan', Order: '1', st: '20', Index: '0', Type: '2' }),
  d1('sector_rank', '板块排行', '行情排行', 'd1/his', { a: 'RealRankingInfo', c: 'ZhiShuRanking', Order: '1', st: '30', Index: '0', Date: '{{day}}', Type: '2', ZSType: '6' }, { params: [{ key: 'day', label: '日期', def: '20261022' }] }),
  d1('sector_live', '实时板块', '行情排行', 'd1/hq', { a: 'RealRankingInfo', c: 'ZhiShuRanking', Order: '1', st: '30', RStart: '0925', Index: '0', REnd: '1315', Type: '1', ZSType: '7' }),
  d1('radar', '市场雷达', '异动监控', 'd1/his', { a: 'Radar', c: 'HisHomeDingPan', st: '30', Index: '0', Date: '{{day}}' }, { params: [{ key: 'day', label: '日期', def: '20261022' }] }),
  // 涨停复盘
  d1('limit_pool', '涨停池', '涨停复盘', 'd1/hq', { a: 'GetPlateInfo', c: 'DailyLimitResumption', st: '100', Index: '0' }),
  d1('limit_his', '历史涨停复盘', '涨停复盘', 'd1/his', { a: 'GetPlateInfo', c: 'HisLimitResumption', st: '100', Index: '0', Date: '{{day}}' }, { params: [{ key: 'day', label: '日期', def: '20261022' }] }),
  d1('limit_perf', '涨停表现', '涨停复盘', 'd1/his', { a: 'ZhangTingExpression', c: 'HisHomeDingPan', Day: '{{day}}' }, { params: [{ key: 'day', label: '日期', def: '20261022' }] }),
  // 题材板块
  d1('topic_core', '异动板块', '题材板块', 'd1/his', { a: 'GetYTFP_BKHX', c: 'FuPanLa', Date: '{{day}}' }, { params: [{ key: 'day', label: '日期', def: '20261022' }] }),
  d1('topic_point', '题材点位', '题材板块', 'd1/hq', { a: 'GetPoint', c: 'ConceptionPoint' }),
  d1('topic_news', '题材资讯', '题材板块', 'd1/lhb', { a: 'InfoGR', c: 'Theme' }),
  // 情绪资金
  d1('emotion_fast', '情绪快线', '情绪资金', 'd1/his', { a: 'GetPMSL_KQXY', c: 'FuPanLa', Date: '{{day}}' }, { params: [{ key: 'day', label: '日期', def: '20261022' }] }),
  d1('emotion_flow', '资金日期', '情绪资金', 'd1/his', { a: 'GetMoneyDate', c: 'Emotion', st: '30', index: '0' }),
  d1('capital_detail', '资金明细', '情绪资金', 'd1/his', { a: 'GetMoneyDetail', c: 'Emotion', Day: '{{day}}' }, { params: [{ key: 'day', label: '日期', def: '20261022' }] }),
  d1('connect_rank', '通道个股排行', '情绪资金', 'd1/hq', { a: 'GetRankingGP', c: 'StockSHGT', Order: '1', st: '20', Index: '0', Type: '2', DEnd: '{{day}}', DStart: '{{day}}' }, { params: [{ key: 'day', label: '日期', def: '20261022' }] }),
  d1('connect_flow', '通道资金', '情绪资金', 'd1/lhb', { a: 'GetNXZJ', c: 'LongHuBang' }),
  d1('hot_money', '游资动向', '情绪资金', 'd1/lhb', { a: 'YouZiDongXiangByList', c: 'Index', Time: '' }),
  // 资讯数据
  d1('news_flash', '资讯快讯', '资讯数据', 'd1/article', { a: 'GetList', c: 'PCNewsFlash', st: '20', Type: '0', NewsID: '1697724', Index: '0' }),
  d1('news_column', '专栏消息', '资讯数据', 'd1/article', { a: 'GetInfo', c: 'ForumsMsgColumn', ColumnID: '14', st: '30', Index: '0', Select: '0,1,2', PreIndex: '0' }),
  // 工具能力
  d1('calendar', '交易日历', '工具能力', 'd1/his', { a: 'GetHoliday', c: 'YiDongKanPan' }),
  d1('search', '功能搜索', '工具能力', 'd1/lhb', { a: 'FuncList', c: 'Search' }),
  // 个股（归到个股页面）
  { id: 'd101_book', title: '实时盘口(D101)', group: 'D101 实时', source: 'D101', path: '', kind: 'd101', params: [CODE], scope: 'stock', note: '本地代理 WebSocket，五档实时推送' },
  d1('stock_limit', '涨跌停价格', '个股详情', 'd1/hq', { a: 'GetStockPercentTurnoverTen', c: 'StockL2Data', StockID: '{{code}}' }, { params: [CODE], scope: 'stock' }),
  // 个股（D6 侧）


  {
    id: 'replay',
    title: '回放',
    group: '回放',
    source: 'D6',
    path: '',
    kind: 'replaypanel',
    params: [CODE],
    scope: 'stock',
    note: '控制条 + 全天分时（集合竞价→尾盘）+ 盘口，数据来自回放快照',
  },
  {
    id: 'kline_board',
    title: '个股K线与筹码',
    group: '个股',
    source: 'D6',
    path: '',
    kind: 'klineboard',
    params: [CODE],
    scope: 'stock',
    note: 'K线与筹码并排；周期可切日/周/年/60分/30分/15分/5分；含 MA5/10/20 与均价线',
  },
  {
    id: 'd6_stock_kline',
    title: '个股K线(D6)',
    group: 'D6 个股',
    source: 'D6',
    path: 'd6/market/v1/kline/history',
    kind: 'kline',
    params: [
      { key: 'market', label: '市场', def: 'SZ' },
      { key: 'inst', label: '代码', def: '000001' },
      { key: 'period', label: '周期', def: 'DAY' },
      { key: 'limit', label: '条数', def: '200' },
      { key: 'startTime', label: '起', def: '0' },
      { key: 'endTime', label: '止', def: '2524579200' },
    ],
    scope: 'stock',
    note: '条数须为 50 的整数倍',
  },
  { id: 'd6_chip', title: '筹码分布', group: 'D6 个股', source: 'D6', path: 'd6/market/v1/stock/chip/distribution', params: [CODE], scope: 'stock' },
  { id: 'd6_fund', title: '基本面摘要', group: 'D6 个股', source: 'D6', path: 'd6/market/v1/stock/fundamentals', params: [CODE], scope: 'stock' },
  { id: 'd6_margin', title: '个股两融明细', group: 'D6 个股', source: 'D6', path: 'd6/market/v1/margin/stock/detail', params: [CODE], scope: 'stock' },
  { id: 'd6_margin_his', title: '个股两融历史', group: 'D6 个股', source: 'D6', path: 'd6/market/v1/margin/stock/history', params: [CODE], scope: 'stock' },
  { id: 'd6_tech', title: '技术分析', group: 'D6 个股', source: 'D6', path: 'd6/market/v1/analysis/technical', params: [CODE], scope: 'stock' },
  { id: 'd6_adjust', title: '复权信息', group: 'D6 个股', source: 'D6', path: 'd6/market/v1/stock/adjustment', params: [CODE], scope: 'stock' },
  { id: 'd6_anomaly', title: '个股异动', group: 'D6 个股', source: 'D6', path: 'd6/market/v1/stock/anomalies', params: [CODE], scope: 'stock' },
  // D1 个股那几个上游 502，这里用 data_interface 的等价接口顶上
  {
    id: 'eq_stock_news', title: '个股资讯(D6)', group: 'D6 个股', source: 'D6', kind: 'table',
    path: 'd6/market/v1/news/announcements/filter', method: 'POST', params: [CODE], scope: 'stock',
    body: { searchTp: 0, pageNo: 1, pageSize: 50, title: '', level1: '', level2: '', range: 1, dateTp: 2, sentiment: 0, optionStock: [] },
  },
  {
    id: 'eq_notice', title: '公司公告(D6)', group: 'D6 个股', source: 'D6', kind: 'table',
    path: 'd6/market/v1/news/announcements/filter', method: 'POST', params: [CODE], scope: 'stock',
    body: { searchTp: 0, pageNo: 1, pageSize: 50, title: '', level1: '', level2: '', range: 1, dateTp: 2, sentiment: 0, optionStock: [] },
  },
  { id: 'eq_reports', title: '研报列表(D6)', group: 'D6 个股', source: 'D6', path: 'd6/market/v1/news/research-reports', params: [CODE], scope: 'stock' },
  { id: 'eq_profile', title: '公司概况(D2)', group: 'D2 个股', source: 'D2', path: 'd2/stock_profile', params: [CODE], scope: 'stock' },
  { id: 'eq_inst_hold', title: '机构持仓(D2)', group: 'D2 个股', source: 'D2', path: 'd2/gc', fixed: { sub: 'hsgt', type: 'org_hold' }, params: [CODE], scope: 'stock' },
]

/** D2 能力中心：示例脚本 d2_gui.py 里 60 个 Capability，全部按 sub + view 参数还原 */
const D2_CAPS_SCREENS: Screen[] = D2_CAPS.map((c) => {
  const fixed: Record<string, string> = {}
  if (c.sub) fixed.sub = c.sub
  if (c.view_param && c.view_val) fixed[c.view_param] = c.view_val
  // 名称用「·」分隔，前段作为数据栏分组（如 白名单报表·基本资料POST → 分组「D2 白名单报表」）
  const prefix = c.name.includes('·') ? c.name.split('·')[0] : c.category ?? '数据中心'
  // 需要传个股代码（含 sh/sz.xxxxxx 证券代码）的界面统一归到「个股详细」
  const codeParam = c.params.find((p) => /^(code|secucode|inst|stockid|symbol|seccode)$/i.test(p.key))
  const isChart = /曲线|趋势|分时|走势|K线|分布|资金流/.test(c.name)
  return {
    id: `cap_${c.id}`,
    title: c.name.includes('·') ? c.name.split('·').slice(1).join('·') : c.name,
    group: `D2 ${prefix}`,
    kind: isChart ? ('line' as const) : ('table' as const),
    source: 'D2' as const,
    path: 'd2/gc',
    method: c.method === 'POST' ? ('POST' as const) : undefined,
    fixed,
    params: c.params.map((p) => ({ key: p.key, label: p.label, def: p.def })),
    scope: codeParam ? ('stock' as const) : undefined,
    paging: c.params.some((p) => p.key === 'pageNumber')
      ? { sizeKey: 'pageSize', pageKey: 'pageNumber' }
      : undefined,
  }
})

/** 去掉分组前缀 D1/D2/D6/D101 与标题后缀 (D6)，界面上不出现数据源代码 */
const clean = (s: Screen): Screen => ({
  ...s,
  group: s.group.replace(/^D\d+\s*/, ''),
  title: s.title.replace(/\s*\(D\d+\)$/, ''),
})

export const SCREENS: Screen[] = [
  ...D6,
  ...D2,
  // D1 里能对上的改用 D6/D2（原 D1 上游 502）；对不上的仍保留在列表里等上游恢复
  ...D1.filter((x) => !['d1_mood', 'd1_calendar', 'd1_limit_pool'].includes(x.id)),
  ...D2_CAPS_SCREENS,
].map(clean)

export const market = SCREENS.filter((s) => s.scope !== 'stock')
export const stockScreens = SCREENS.filter((s) => s.scope === 'stock')

export const groupsOf = (list: Screen[]): string[] => Array.from(new Set(list.map((s) => s.group)))
