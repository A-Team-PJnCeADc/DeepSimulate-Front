/* 由 代码示例合集/d2_gui.py 的 Capability 定义自动提取（含循环展开的子用法） */

export type D2Cap = {
  id: string
  name: string
  category: string
  sub: string | null
  view_param?: string | null
  view_val?: string | null
  method: string
  params: { key: string; label: string; def: string }[]
}

export const D2_CAPS: D2Cap[] = [
 {
  "id": "guchi",
  "name": "涨跌停与炸板股池",
  "category": "基础股池与榜单",
  "sub": "guchi",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "guchi_pc",
  "name": "股池长区间查询",
  "category": "基础股池与榜单",
  "sub": "guchi_pc",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "guchi_date",
  "name": "股池日期统计",
  "category": "基础股池与榜单",
  "sub": "guchi_date",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "time",
  "name": "服务当前时间",
  "category": "基础股池与榜单",
  "sub": "time",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "lhb_daily",
  "name": "每日龙虎榜明细",
  "category": "基础股池与榜单",
  "sub": "lhb_daily",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "lhb_inst",
  "name": "龙虎榜机构席位追踪",
  "category": "基础股池与榜单",
  "sub": "lhb_inst",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "lhb_dept",
  "name": "营业部龙虎榜排行",
  "category": "基础股池与榜单",
  "sub": "lhb_dept",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "block_trade",
  "name": "大宗交易成交数据",
  "category": "基础股池与榜单",
  "sub": "block_trade",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "flow_industry",
  "name": "行业资金流向",
  "category": "基础股池与榜单",
  "sub": "flow_industry",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "flow_concept",
  "name": "概念资金流向",
  "category": "基础股池与榜单",
  "sub": "flow_concept",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "flow_stock",
  "name": "个股资金流向排行",
  "category": "基础股池与榜单",
  "sub": "flow_stock",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "hot_stocks",
  "name": "股票人气与热度排行",
  "category": "基础股池与榜单",
  "sub": "hot_stocks",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "ipo_apply",
  "name": "新股申购日历",
  "category": "公司事件与日历",
  "sub": "ipo_apply",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "jiejin",
  "name": "限售解禁明细",
  "category": "公司事件与日历",
  "sub": "jiejin",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "dividend",
  "name": "分红送转方案",
  "category": "公司事件与日历",
  "sub": "dividend",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "forecast",
  "name": "业绩预告查询",
  "category": "公司事件与日历",
  "sub": "forecast",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "holder_change",
  "name": "股东与高管持股变动",
  "category": "公司事件与日历",
  "sub": "holder_change",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "holder_num",
  "name": "股东户数与筹码变动",
  "category": "公司事件与日历",
  "sub": "holder_num",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "northbound",
  "name": "沪深港通持仓与资金",
  "category": "公司事件与日历",
  "sub": "northbound",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "stock_profile_basic",
  "name": "个股资料·公司基本信息",
  "category": "资料与研报检索",
  "sub": "stock_profile",
  "view_param": "view",
  "view_val": "basic",
  "method": "GET",
  "params": []
 },
 {
  "id": "stock_profile_financial",
  "name": "个股资料·财务主要指标",
  "category": "资料与研报检索",
  "sub": "stock_profile",
  "view_param": "view",
  "view_val": "financial",
  "method": "GET",
  "params": []
 },
 {
  "id": "stock_profile_industry",
  "name": "个股资料·同业对比指标",
  "category": "资料与研报检索",
  "sub": "stock_profile",
  "view_param": "view",
  "view_val": "industry",
  "method": "GET",
  "params": []
 },
 {
  "id": "report_post_financial",
  "name": "白名单报表·财务POST",
  "category": "资料与研报检索",
  "sub": "report_post",
  "view_param": "report",
  "view_val": "financial",
  "method": "POST",
  "params": []
 },
 {
  "id": "report_post_basic",
  "name": "白名单报表·基本资料POST",
  "category": "资料与研报检索",
  "sub": "report_post",
  "view_param": "report",
  "view_val": "basic",
  "method": "POST",
  "params": []
 },
 {
  "id": "report_post_industry",
  "name": "白名单报表·行业对比POST",
  "category": "资料与研报检索",
  "sub": "report_post",
  "view_param": "report",
  "view_val": "industry",
  "method": "POST",
  "params": []
 },
 {
  "id": "security_search",
  "name": "证券代码与关键词检索",
  "category": "资料与研报检索",
  "sub": "security_search",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "security_suggest",
  "name": "证券输入建议(联想)",
  "category": "资料与研报检索",
  "sub": "security_suggest",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "research_report_list",
  "name": "研究报告检索列表",
  "category": "资料与研报检索",
  "sub": "research_report",
  "view_param": "view",
  "view_val": "list",
  "method": "GET",
  "params": []
 },
 {
  "id": "research_report_detail",
  "name": "研究报告内容详情",
  "category": "资料与研报检索",
  "sub": "research_report",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "content_detail_article",
  "name": "正文详情·资讯文章",
  "category": "资料与研报检索",
  "sub": "content_detail",
  "view_param": "view",
  "view_val": "article",
  "method": "GET",
  "params": []
 },
 {
  "id": "content_detail_brief",
  "name": "正文详情·文章摘要",
  "category": "资料与研报检索",
  "sub": "content_detail",
  "view_param": "view",
  "view_val": "brief",
  "method": "GET",
  "params": []
 },
 {
  "id": "content_detail_announcement",
  "name": "正文详情·公告正文",
  "category": "资料与研报检索",
  "sub": "content_detail",
  "view_param": "view",
  "view_val": "announcement",
  "method": "GET",
  "params": []
 },
 {
  "id": "content_detail_research",
  "name": "正文详情·研究内容",
  "category": "资料与研报检索",
  "sub": "content_detail",
  "view_param": "view",
  "view_val": "research",
  "method": "GET",
  "params": []
 },
 {
  "id": "trade_calendar",
  "name": "交易日历序列",
  "category": "辅助与兼容接口",
  "sub": "trade_calendar",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "trade_day_status",
  "name": "交易日状态判定",
  "category": "辅助与兼容接口",
  "sub": "trade_day_status",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "main_force_build",
  "name": "主力建仓复合数据",
  "category": "辅助与兼容接口",
  "sub": "main_force_build",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "f10_notice",
  "name": "个股公告资料[需参数]",
  "category": "辅助与兼容接口",
  "sub": "f10_notice",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "annual_report_dates",
  "name": "年度财报披露日程",
  "category": "辅助与兼容接口",
  "sub": "annual_report_dates",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "market_overview_change",
  "name": "市场总览·涨跌分布统计",
  "category": "辅助与兼容接口",
  "sub": "market_overview",
  "view_param": "view",
  "view_val": "change_statistics",
  "method": "GET",
  "params": []
 },
 {
  "id": "market_overview_amount",
  "name": "市场总览·成交额趋势",
  "category": "辅助与兼容接口",
  "sub": "market_overview",
  "view_param": "view",
  "view_val": "intraday_amount",
  "method": "GET",
  "params": []
 },
 {
  "id": "market_overview_bull_bear",
  "name": "市场总览·多空指标对象",
  "category": "辅助与兼容接口",
  "sub": "market_overview",
  "view_param": "view",
  "view_val": "bull_bear",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_http_summary",
  "name": "沪深港通页面汇总[兼容]",
  "category": "辅助与兼容接口",
  "sub": "hsgt_http",
  "view_param": "view",
  "view_val": "summary",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_http_stock",
  "name": "沪深港通单证券明细[兼容]",
  "category": "辅助与兼容接口",
  "sub": "hsgt_http",
  "view_param": "view",
  "view_val": "stock_detail",
  "method": "GET",
  "params": []
 },
 {
  "id": "pledge_http_notice",
  "name": "股权质押公告列表[兼容]",
  "category": "辅助与兼容接口",
  "sub": "pledge_http",
  "view_param": "view",
  "view_val": "notice_list",
  "method": "GET",
  "params": []
 },
 {
  "id": "pledge_http_chart",
  "name": "个股质押详情图表[兼容]",
  "category": "辅助与兼容接口",
  "sub": "pledge_http",
  "view_param": "view",
  "view_val": "pledge_chart",
  "method": "GET",
  "params": []
 },
 {
  "id": "custom_query",
  "name": "通用自由查询 (Custom Query)",
  "category": "自定义与通用接口",
  "sub": "",
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "limit_topic_",
  "name": "涨停专题·",
  "category": "涨停专题多视图",
  "sub": "limit_topic",
  "view_param": "view",
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_",
  "name": "诊股·",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "futu_",
  "name": "期货·",
  "category": "期货持仓与成交",
  "sub": "futures_analysis",
  "view_param": "type",
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "dark_market_",
  "name": "暗盘资金·",
  "category": "暗盘资金榜单",
  "sub": "dark_market",
  "view_param": "view",
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "rzrq_",
  "name": "两融·",
  "category": "两融数据中心",
  "sub": "rzrq",
  "view_param": "type",
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_",
  "name": "沪深港通·",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "pledge_",
  "name": "股权质押·",
  "category": "股权质押数据中心",
  "sub": "pledge",
  "view_param": "type",
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "zlcc_",
  "name": "主力持仓·",
  "category": "主力持仓数据中心",
  "sub": "zlcc",
  "view_param": "type",
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "gggz_",
  "name": "估值分析·",
  "category": "估值分析数据中心",
  "sub": "gggz",
  "view_param": "type",
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_",
  "name": "市场指标·",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "专题·",
  "name": "专题·",
  "category": "专题报表与事件",
  "sub": null,
  "view_param": null,
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "quote_",
  "name": "行情·",
  "category": "公共行情与K线",
  "sub": "quote",
  "view_param": "view",
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_http_",
  "name": "沪深港通·[兼容]",
  "category": "辅助与兼容接口",
  "sub": "hsgt_http",
  "view_param": "view",
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "pledge_http_",
  "name": "股权质押·[兼容]",
  "category": "辅助与兼容接口",
  "sub": "pledge_http",
  "view_param": "view",
  "view_val": null,
  "method": "GET",
  "params": []
 },
 {
  "id": "limit_topic_dates",
  "name": "涨停专题·可选交易日期列表",
  "category": "涨停专题多视图",
  "sub": "limit_topic",
  "view_param": "view",
  "view_val": "dates",
  "method": "GET",
  "params": []
 },
 {
  "id": "limit_topic_limit_summary",
  "name": "涨停专题·当日涨停概况",
  "category": "涨停专题多视图",
  "sub": "limit_topic",
  "view_param": "view",
  "view_val": "limit_summary",
  "method": "GET",
  "params": []
 },
 {
  "id": "limit_topic_quality_monitor",
  "name": "涨停专题·质量涨停监控",
  "category": "涨停专题多视图",
  "sub": "limit_topic",
  "view_param": "view",
  "view_val": "quality_monitor",
  "method": "GET",
  "params": []
 },
 {
  "id": "limit_topic_emotion",
  "name": "涨停专题·涨停情绪序列",
  "category": "涨停专题多视图",
  "sub": "limit_topic",
  "view_param": "view",
  "view_val": "emotion",
  "method": "GET",
  "params": []
 },
 {
  "id": "limit_topic_emotion_history",
  "name": "涨停专题·历史情绪趋势",
  "category": "涨停专题多视图",
  "sub": "limit_topic",
  "view_param": "view",
  "view_val": "emotion_history",
  "method": "GET",
  "params": []
 },
 {
  "id": "limit_topic_auction_pool",
  "name": "涨停专题·早盘竞价涨停池",
  "category": "涨停专题多视图",
  "sub": "limit_topic",
  "view_param": "view",
  "view_val": "auction_pool",
  "method": "GET",
  "params": []
 },
 {
  "id": "limit_topic_limit_pool",
  "name": "涨停专题·全市场涨停池",
  "category": "涨停专题多视图",
  "sub": "limit_topic",
  "view_param": "view",
  "view_val": "limit_pool",
  "method": "GET",
  "params": []
 },
 {
  "id": "limit_topic_approaching_pool",
  "name": "涨停专题·即将涨停池",
  "category": "涨停专题多视图",
  "sub": "limit_topic",
  "view_param": "view",
  "view_val": "approaching_pool",
  "method": "GET",
  "params": []
 },
 {
  "id": "limit_topic_continuous_pool",
  "name": "涨停专题·连板池",
  "category": "涨停专题多视图",
  "sub": "limit_topic",
  "view_param": "view",
  "view_val": "continuous_pool",
  "method": "GET",
  "params": []
 },
 {
  "id": "limit_topic_broken_pool",
  "name": "涨停专题·炸板池",
  "category": "涨停专题多视图",
  "sub": "limit_topic",
  "view_param": "view",
  "view_val": "broken_pool",
  "method": "GET",
  "params": []
 },
 {
  "id": "limit_topic_yesterday_pool",
  "name": "涨停专题·昨日涨停表现",
  "category": "涨停专题多视图",
  "sub": "limit_topic",
  "view_param": "view",
  "view_val": "yesterday_pool",
  "method": "GET",
  "params": []
 },
 {
  "id": "limit_topic_down_pool",
  "name": "涨停专题·跌停池",
  "category": "涨停专题多视图",
  "sub": "limit_topic",
  "view_param": "view",
  "view_val": "down_pool",
  "method": "GET",
  "params": []
 },
 {
  "id": "limit_topic_ever_down_pool",
  "name": "涨停专题·曾跌停打开池",
  "category": "涨停专题多视图",
  "sub": "limit_topic",
  "view_param": "view",
  "view_val": "ever_down_pool",
  "method": "GET",
  "params": []
 },
 {
  "id": "limit_topic_history_pool",
  "name": "涨停专题·历史涨停明细",
  "category": "涨停专题多视图",
  "sub": "limit_topic",
  "view_param": "view",
  "view_val": "history_pool",
  "method": "GET",
  "params": []
 },
 {
  "id": "limit_topic_ladder",
  "name": "涨停专题·连板天梯",
  "category": "涨停专题多视图",
  "sub": "limit_topic",
  "view_param": "view",
  "view_val": "ladder",
  "method": "GET",
  "params": []
 },
 {
  "id": "limit_topic_multi_stock",
  "name": "涨停专题·多板个股筛选",
  "category": "涨停专题多视图",
  "sub": "limit_topic",
  "view_param": "view",
  "view_val": "multi_stock",
  "method": "GET",
  "params": []
 },
 {
  "id": "limit_topic_index_list",
  "name": "涨停专题·指数行情摘要",
  "category": "涨停专题多视图",
  "sub": "limit_topic",
  "view_param": "view",
  "view_val": "index_list",
  "method": "GET",
  "params": []
 },
 {
  "id": "limit_topic_index_trend",
  "name": "涨停专题·指数走势指标",
  "category": "涨停专题多视图",
  "sub": "limit_topic",
  "view_param": "view",
  "view_val": "index_trend",
  "method": "GET",
  "params": []
 },
 {
  "id": "limit_topic_minute_trend",
  "name": "涨停专题·指数板块分时",
  "category": "涨停专题多视图",
  "sub": "limit_topic",
  "view_param": "view",
  "view_val": "minute_trend",
  "method": "GET",
  "params": []
 },
 {
  "id": "limit_topic_sector_summary",
  "name": "涨停专题·强势板块概况",
  "category": "涨停专题多视图",
  "sub": "limit_topic",
  "view_param": "view",
  "view_val": "sector_summary",
  "method": "GET",
  "params": []
 },
 {
  "id": "limit_topic_sector_list",
  "name": "涨停专题·强势板块与成分股",
  "category": "涨停专题多视图",
  "sub": "limit_topic",
  "view_param": "view",
  "view_val": "sector_list",
  "method": "GET",
  "params": []
 },
 {
  "id": "limit_topic_limit_reason",
  "name": "涨停专题·涨停原因深度分析",
  "category": "涨停专题多视图",
  "sub": "limit_topic",
  "view_param": "view",
  "view_val": "limit_reason",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_summary",
  "name": "诊股·综合评分摘要",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "summary",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_value",
  "name": "诊股·估值评估摘要",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "value",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_trend",
  "name": "诊股·趋势研判概览",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "trend",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_capital",
  "name": "诊股·资金流向摘要",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "capital",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_market_heat",
  "name": "诊股·市场热度表现",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "market_heat",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_market_cost",
  "name": "诊股·市场成本历史序列",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "market_cost",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_comment",
  "name": "诊股·全景综合点评",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "comment",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_forecast",
  "name": "诊股·涨跌概率预测",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "forecast",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_score_history",
  "name": "诊股·历史评分序列",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "score_history",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_score_ranking_detail",
  "name": "诊股·行业与市场排名",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "score_ranking_detail",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_valuation_comment",
  "name": "诊股·估值维度点评",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "valuation_comment",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_valuation_profitability",
  "name": "诊股·盈利能力分析",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "valuation_profitability",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_valuation_growth",
  "name": "诊股·成长能力评估",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "valuation_growth",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_valuation_level",
  "name": "诊股·估值水平指标",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "valuation_level",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_valuation_special",
  "name": "诊股·估值特殊指标",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "valuation_special",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_valuation_solvency",
  "name": "诊股·偿债与营运能力",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "valuation_solvency",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_valuation_cashflow",
  "name": "诊股·现金流量分析",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "valuation_cashflow",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_capital_summary",
  "name": "诊股·资金详细摘要",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "capital_summary",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_capital_flow",
  "name": "诊股·个股资金趋势曲线",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "capital_flow",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_capital_industry",
  "name": "诊股·所属行业资金流",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "capital_industry",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_capital_level2",
  "name": "诊股·逐笔成交资金",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "capital_level2",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_capital_winner",
  "name": "诊股·龙虎榜上榜资金",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "capital_winner",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_capital_margin",
  "name": "诊股·两融诊断明细",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "capital_margin",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_trend_comment",
  "name": "诊股·趋势研判点评",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "trend_comment",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_trend_energy",
  "name": "诊股·趋势能量指标",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "trend_energy",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_trend_technology",
  "name": "诊股·技术形态概览",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "trend_technology",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_trend_macd",
  "name": "诊股·MACD指标序列",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "trend_macd",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_trend_kdj",
  "name": "诊股·KDJ指标序列",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "trend_kdj",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_trend_rsi",
  "name": "诊股·RSI指标序列",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "trend_rsi",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_trend_boll",
  "name": "诊股·BOLL布林带序列",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "trend_boll",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_trend_bias",
  "name": "诊股·BIAS乖离率序列",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "trend_bias",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_trend_wr",
  "name": "诊股·WR威廉指标序列",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "trend_wr",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_sentiment_comment",
  "name": "诊股·舆情综合点评",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "sentiment_comment",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_sentiment_list",
  "name": "诊股·舆情监控列表",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "sentiment_list",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_ranking",
  "name": "诊股·诊股全市场排行",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "ranking",
  "method": "GET",
  "params": []
 },
 {
  "id": "diag_check",
  "name": "诊股·诊断资格校验",
  "category": "个股智能诊断",
  "sub": "diagnosis",
  "view_param": "type",
  "view_val": "check",
  "method": "GET",
  "params": []
 },
 {
  "id": "futu_varieties",
  "name": "期货·期货市场与品种列表",
  "category": "期货持仓与成交",
  "sub": "futures_analysis",
  "view_param": "type",
  "view_val": "varieties",
  "method": "GET",
  "params": []
 },
 {
  "id": "futu_companies",
  "name": "期货·期货机构席位列表",
  "category": "期货持仓与成交",
  "sub": "futures_analysis",
  "view_param": "type",
  "view_val": "companies",
  "method": "GET",
  "params": []
 },
 {
  "id": "futu_contracts",
  "name": "期货·品种合约与主力映射",
  "category": "期货持仓与成交",
  "sub": "futures_analysis",
  "view_param": "type",
  "view_val": "contracts",
  "method": "GET",
  "params": []
 },
 {
  "id": "futu_market_date",
  "name": "期货·各期货市场最新交易日",
  "category": "期货持仓与成交",
  "sub": "futures_analysis",
  "view_param": "type",
  "view_val": "market_date",
  "method": "GET",
  "params": []
 },
 {
  "id": "futu_position_trend",
  "name": "期货·多空持仓趋势",
  "category": "期货持仓与成交",
  "sub": "futures_analysis",
  "view_param": "type",
  "view_val": "position_trend",
  "method": "GET",
  "params": []
 },
 {
  "id": "futu_position_history",
  "name": "期货·总持仓历史序列",
  "category": "期货持仓与成交",
  "sub": "futures_analysis",
  "view_param": "type",
  "view_val": "position_history",
  "method": "GET",
  "params": []
 },
 {
  "id": "futu_position_detail",
  "name": "期货·多空席位持仓明细",
  "category": "期货持仓与成交",
  "sub": "futures_analysis",
  "view_param": "type",
  "view_val": "position_detail",
  "method": "GET",
  "params": []
 },
 {
  "id": "futu_net_position",
  "name": "期货·席位净持仓明细",
  "category": "期货持仓与成交",
  "sub": "futures_analysis",
  "view_param": "type",
  "view_val": "net_position",
  "method": "GET",
  "params": []
 },
 {
  "id": "futu_volume_trend",
  "name": "期货·成交量与结算趋势",
  "category": "期货持仓与成交",
  "sub": "futures_analysis",
  "view_param": "type",
  "view_val": "volume_trend",
  "method": "GET",
  "params": []
 },
 {
  "id": "futu_volume_history",
  "name": "期货·总成交历史序列",
  "category": "期货持仓与成交",
  "sub": "futures_analysis",
  "view_param": "type",
  "view_val": "volume_history",
  "method": "GET",
  "params": []
 },
 {
  "id": "futu_volume_detail",
  "name": "期货·席位成交量明细",
  "category": "期货持仓与成交",
  "sub": "futures_analysis",
  "view_param": "type",
  "view_val": "volume_detail",
  "method": "GET",
  "params": []
 },
 {
  "id": "futu_position_distribution",
  "name": "期货·全品种净持仓分布",
  "category": "期货持仓与成交",
  "sub": "futures_analysis",
  "view_param": "type",
  "view_val": "position_distribution",
  "method": "GET",
  "params": []
 },
 {
  "id": "futu_kline_broker",
  "name": "期货·席位持仓合并K线",
  "category": "期货持仓与成交",
  "sub": "futures_analysis",
  "view_param": "type",
  "view_val": "kline_broker",
  "method": "GET",
  "params": []
 },
 {
  "id": "futu_kline_broker_full",
  "name": "期货·完整席位持仓K线序列",
  "category": "期货持仓与成交",
  "sub": "futures_analysis",
  "view_param": "type",
  "view_val": "kline_broker_full",
  "method": "GET",
  "params": []
 },
 {
  "id": "futu_broker_position",
  "name": "期货·指定席位持仓曲线",
  "category": "期货持仓与成交",
  "sub": "futures_analysis",
  "view_param": "type",
  "view_val": "broker_position",
  "method": "GET",
  "params": []
 },
 {
  "id": "futu_broker_position_legacy",
  "name": "期货·指定席位历史净持仓",
  "category": "期货持仓与成交",
  "sub": "futures_analysis",
  "view_param": "type",
  "view_val": "broker_position_legacy",
  "method": "GET",
  "params": []
 },
 {
  "id": "futu_company_list",
  "name": "期货·品种席位多空排行",
  "category": "期货持仓与成交",
  "sub": "futures_analysis",
  "view_param": "type",
  "view_val": "company_list",
  "method": "GET",
  "params": []
 },
 {
  "id": "futu_company_pay_by_variety",
  "name": "期货·席位各品种盈亏曲线",
  "category": "期货持仓与成交",
  "sub": "futures_analysis",
  "view_param": "type",
  "view_val": "company_pay_by_variety",
  "method": "GET",
  "params": []
 },
 {
  "id": "futu_variety_pay_by_broker",
  "name": "期货·品种各席位盈亏曲线",
  "category": "期货持仓与成交",
  "sub": "futures_analysis",
  "view_param": "type",
  "view_val": "variety_pay_by_broker",
  "method": "GET",
  "params": []
 },
 {
  "id": "futu_variety_year_pay",
  "name": "期货·品种年度席位盈亏排行",
  "category": "期货持仓与成交",
  "sub": "futures_analysis",
  "view_param": "type",
  "view_val": "variety_year_pay",
  "method": "GET",
  "params": []
 },
 {
  "id": "futu_latest_trade_date",
  "name": "期货·期货最新交易日[兼容]",
  "category": "期货持仓与成交",
  "sub": "futures_analysis",
  "view_param": "type",
  "view_val": "latest_trade_date",
  "method": "GET",
  "params": []
 },
 {
  "id": "dark_market_stock",
  "name": "暗盘资金·个股暗盘资金榜",
  "category": "暗盘资金榜单",
  "sub": "dark_market",
  "view_param": "view",
  "view_val": "stock",
  "method": "GET",
  "params": [
   {
    "key": "view",
    "label": "榜单类型",
    "def": "stock"
   },
   {
    "key": "date",
    "label": "交易日",
    "def": ""
   },
   {
    "key": "page",
    "label": "页码",
    "def": "1"
   },
   {
    "key": "pageSize",
    "label": "每页条数",
    "def": "30"
   },
   {
    "key": "sort",
    "label": "排序字段",
    "def": "6"
   },
   {
    "key": "order",
    "label": "排序方向",
    "def": "desc"
   },
   {
    "key": "market",
    "label": "市场筛选",
    "def": ""
   },
   {
    "key": "datetype",
    "label": "日期阶段",
    "def": ""
   }
  ]
 },
 {
  "id": "dark_market_industry",
  "name": "暗盘资金·行业板块暗盘资金榜",
  "category": "暗盘资金榜单",
  "sub": "dark_market",
  "view_param": "view",
  "view_val": "industry",
  "method": "GET",
  "params": [
   {
    "key": "view",
    "label": "榜单类型",
    "def": "industry"
   },
   {
    "key": "date",
    "label": "交易日",
    "def": ""
   },
   {
    "key": "page",
    "label": "页码",
    "def": "1"
   },
   {
    "key": "pageSize",
    "label": "每页条数",
    "def": "30"
   },
   {
    "key": "sort",
    "label": "排序字段",
    "def": "6"
   },
   {
    "key": "order",
    "label": "排序方向",
    "def": "desc"
   },
   {
    "key": "market",
    "label": "市场筛选",
    "def": ""
   },
   {
    "key": "datetype",
    "label": "日期阶段",
    "def": ""
   }
  ]
 },
 {
  "id": "dark_market_concept",
  "name": "暗盘资金·概念板块暗盘资金榜",
  "category": "暗盘资金榜单",
  "sub": "dark_market",
  "view_param": "view",
  "view_val": "concept",
  "method": "GET",
  "params": [
   {
    "key": "view",
    "label": "榜单类型",
    "def": "concept"
   },
   {
    "key": "date",
    "label": "交易日",
    "def": ""
   },
   {
    "key": "page",
    "label": "页码",
    "def": "1"
   },
   {
    "key": "pageSize",
    "label": "每页条数",
    "def": "30"
   },
   {
    "key": "sort",
    "label": "排序字段",
    "def": "6"
   },
   {
    "key": "order",
    "label": "排序方向",
    "def": "desc"
   },
   {
    "key": "market",
    "label": "市场筛选",
    "def": ""
   },
   {
    "key": "datetype",
    "label": "日期阶段",
    "def": ""
   }
  ]
 },
 {
  "id": "rzrq_list",
  "name": "两融·标的明细列表",
  "category": "两融数据中心",
  "sub": "rzrq",
  "view_param": "type",
  "view_val": "list",
  "method": "GET",
  "params": []
 },
 {
  "id": "rzrq_statistics",
  "name": "两融·两融总体统计",
  "category": "两融数据中心",
  "sub": "rzrq",
  "view_param": "type",
  "view_val": "statistics",
  "method": "GET",
  "params": []
 },
 {
  "id": "rzrq_industry",
  "name": "两融·行业两融明细",
  "category": "两融数据中心",
  "sub": "rzrq",
  "view_param": "type",
  "view_val": "industry",
  "method": "GET",
  "params": []
 },
 {
  "id": "rzrq_industry_profile",
  "name": "两融·行业两融概况",
  "category": "两融数据中心",
  "sub": "rzrq",
  "view_param": "type",
  "view_val": "industry_profile",
  "method": "GET",
  "params": []
 },
 {
  "id": "rzrq_profile",
  "name": "两融·两融标的概况",
  "category": "两融数据中心",
  "sub": "rzrq",
  "view_param": "type",
  "view_val": "profile",
  "method": "GET",
  "params": []
 },
 {
  "id": "rzrq_trade_profile",
  "name": "两融·交易两融全景",
  "category": "两融数据中心",
  "sub": "rzrq",
  "view_param": "type",
  "view_val": "trade_profile",
  "method": "GET",
  "params": []
 },
 {
  "id": "rzrq_stocks",
  "name": "两融·个股两融历史",
  "category": "两融数据中心",
  "sub": "rzrq",
  "view_param": "type",
  "view_val": "stocks",
  "method": "GET",
  "params": []
 },
 {
  "id": "rzrq_etf",
  "name": "两融·ETF两融明细",
  "category": "两融数据中心",
  "sub": "rzrq",
  "view_param": "type",
  "view_val": "etf",
  "method": "GET",
  "params": []
 },
 {
  "id": "rzrq_new_stocks",
  "name": "两融·新增两融股票",
  "category": "两融数据中心",
  "sub": "rzrq",
  "view_param": "type",
  "view_val": "new_stocks",
  "method": "GET",
  "params": []
 },
 {
  "id": "rzrq_new_etf",
  "name": "两融·新增两融ETF",
  "category": "两融数据中心",
  "sub": "rzrq",
  "view_param": "type",
  "view_val": "new_etf",
  "method": "GET",
  "params": []
 },
 {
  "id": "rzrq_kline",
  "name": "两融·两融K线时序",
  "category": "两融数据中心",
  "sub": "rzrq",
  "view_param": "type",
  "view_val": "kline",
  "method": "GET",
  "params": []
 },
 {
  "id": "rzrq_convert_ratio",
  "name": "两融·担保品折算率",
  "category": "两融数据中心",
  "sub": "rzrq",
  "view_param": "type",
  "view_val": "convert_ratio",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_quota",
  "name": "沪深港通·互联互通额度总览",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "quota",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_date_types",
  "name": "沪深港通·统计周期日期列表",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "date_types",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_deal_history",
  "name": "沪深港通·成交历史序列",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "deal_history",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_stock_list",
  "name": "沪深港通·互联互通标的列表",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "stock_list",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_stock_hold",
  "name": "沪深港通·个股持仓明细(新)",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "stock_hold",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_stock_hold_base",
  "name": "沪深港通·个股持仓基础表",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "stock_hold_base",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_stock_hold_s",
  "name": "沪深港通·南向持股明细",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "stock_hold_s",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_stock_hold_etf",
  "name": "沪深港通·ETF持股明细",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "stock_hold_etf",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_stock_hold_update",
  "name": "沪深港通·持仓变动更新",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "stock_hold_update",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_org_hold",
  "name": "沪深港通·机构持股明细",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "org_hold",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_org_hold_base",
  "name": "沪深港通·机构持股基础表",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "org_hold_base",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_org_rank",
  "name": "沪深港通·机构持仓总排行",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "org_rank",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_org_rank_base",
  "name": "沪深港通·机构排行基础表",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "org_rank_base",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_org_rank_date",
  "name": "沪深港通·机构日期持仓排行",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "org_rank_date",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_board_hold",
  "name": "沪深港通·板块持仓明细",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "board_hold",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_board_hold_base",
  "name": "沪深港通·板块持仓基础表",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "board_hold_base",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_board_rank",
  "name": "沪深港通·板块持仓规模排行",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "board_rank",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_board_rank_base",
  "name": "沪深港通·板块排行基础表",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "board_rank_base",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_board_rank_date",
  "name": "沪深港通·板块日期持仓排行",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "board_rank_date",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_top10",
  "name": "沪深港通·十大活跃成交股",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "top10",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_top10_update",
  "name": "沪深港通·十大成交最新变动",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "top10_update",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_hk_deal_rank",
  "name": "沪深港通·港股通成交排行",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "hk_deal_rank",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_etf_list",
  "name": "沪深港通·互联互通ETF列表",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "etf_list",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_index_trade",
  "name": "沪深港通·指数成交统计",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "index_trade",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_net_inflow",
  "name": "沪深港通·资金净流入明细",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "net_inflow",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_net_statistics",
  "name": "沪深港通·资金净流入汇总统计",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "net_statistics",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_deal_amount",
  "name": "沪深港通·成交额深度统计",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "deal_amount",
  "method": "GET",
  "params": []
 },
 {
  "id": "hsgt_all_list",
  "name": "沪深港通·全市场标的汇总",
  "category": "沪深港通数据中心",
  "sub": "hsgt",
  "view_param": "type",
  "view_val": "all_list",
  "method": "GET",
  "params": []
 },
 {
  "id": "pledge_latest",
  "name": "股权质押·最新质押概况",
  "category": "股权质押数据中心",
  "sub": "pledge",
  "view_param": "type",
  "view_val": "latest",
  "method": "GET",
  "params": []
 },
 {
  "id": "pledge_warning",
  "name": "股权质押·质押预警与平仓风险",
  "category": "股权质押数据中心",
  "sub": "pledge",
  "view_param": "type",
  "view_val": "warning",
  "method": "GET",
  "params": []
 },
 {
  "id": "pledge_industry",
  "name": "股权质押·行业质押分布",
  "category": "股权质押数据中心",
  "sub": "pledge",
  "view_param": "type",
  "view_val": "industry",
  "method": "GET",
  "params": []
 },
 {
  "id": "pledge_org_type",
  "name": "股权质押·质押主体类型分布",
  "category": "股权质押数据中心",
  "sub": "pledge",
  "view_param": "type",
  "view_val": "org_type",
  "method": "GET",
  "params": []
 },
 {
  "id": "pledge_ratio",
  "name": "股权质押·个股质押比例详情",
  "category": "股权质押数据中心",
  "sub": "pledge",
  "view_param": "type",
  "view_val": "ratio",
  "method": "GET",
  "params": []
 },
 {
  "id": "pledge_ratio_rank",
  "name": "股权质押·个股质押比例排行",
  "category": "股权质押数据中心",
  "sub": "pledge",
  "view_param": "type",
  "view_val": "ratio_rank",
  "method": "GET",
  "params": []
 },
 {
  "id": "pledge_ledger_ratio",
  "name": "股权质押·大股东质押比例",
  "category": "股权质押数据中心",
  "sub": "pledge",
  "view_param": "type",
  "view_val": "ledger_ratio",
  "method": "GET",
  "params": []
 },
 {
  "id": "pledge_details",
  "name": "股权质押·质押交易明细记录",
  "category": "股权质押数据中心",
  "sub": "pledge",
  "view_param": "type",
  "view_val": "details",
  "method": "GET",
  "params": []
 },
 {
  "id": "pledge_repo",
  "name": "股权质押·解质与质押式回购",
  "category": "股权质押数据中心",
  "sub": "pledge",
  "view_param": "type",
  "view_val": "repo",
  "method": "GET",
  "params": []
 },
 {
  "id": "zlcc_list",
  "name": "主力持仓·主力机构持股汇总",
  "category": "主力持仓数据中心",
  "sub": "zlcc",
  "view_param": "type",
  "view_val": "list",
  "method": "GET",
  "params": []
 },
 {
  "id": "zlcc_detail",
  "name": "主力持仓·个股主力持仓明细",
  "category": "主力持仓数据中心",
  "sub": "zlcc",
  "view_param": "type",
  "view_val": "detail",
  "method": "GET",
  "params": []
 },
 {
  "id": "zlcc_date",
  "name": "主力持仓·主力持股报告期列表",
  "category": "主力持仓数据中心",
  "sub": "zlcc",
  "view_param": "type",
  "view_val": "date",
  "method": "GET",
  "params": []
 },
 {
  "id": "gggz_status",
  "name": "估值分析·个股估值状态",
  "category": "估值分析数据中心",
  "sub": "gggz",
  "view_param": "type",
  "view_val": "status",
  "method": "GET",
  "params": []
 },
 {
  "id": "gggz_trend",
  "name": "估值分析·估值趋势变动",
  "category": "估值分析数据中心",
  "sub": "gggz",
  "view_param": "type",
  "view_val": "trend",
  "method": "GET",
  "params": []
 },
 {
  "id": "gggz_scatter",
  "name": "估值分析·估值散点分布",
  "category": "估值分析数据中心",
  "sub": "gggz",
  "view_param": "type",
  "view_val": "scatter",
  "method": "GET",
  "params": []
 },
 {
  "id": "gggz_scatter_situation",
  "name": "估值分析·估值散点明细",
  "category": "估值分析数据中心",
  "sub": "gggz",
  "view_param": "type",
  "view_val": "scatter_situation",
  "method": "GET",
  "params": []
 },
 {
  "id": "gggz_industry",
  "name": "估值分析·行业估值统计",
  "category": "估值分析数据中心",
  "sub": "gggz",
  "view_param": "type",
  "view_val": "industry",
  "method": "GET",
  "params": []
 },
 {
  "id": "gggz_industry_profile",
  "name": "估值分析·行业估值概况",
  "category": "估值分析数据中心",
  "sub": "gggz",
  "view_param": "type",
  "view_val": "industry_profile",
  "method": "GET",
  "params": []
 },
 {
  "id": "gggz_industry_rank",
  "name": "估值分析·行业估值排行",
  "category": "估值分析数据中心",
  "sub": "gggz",
  "view_param": "type",
  "view_val": "industry_rank",
  "method": "GET",
  "params": []
 },
 {
  "id": "gggz_industry_rank5",
  "name": "估值分析·行业5日估值排行",
  "category": "估值分析数据中心",
  "sub": "gggz",
  "view_param": "type",
  "view_val": "industry_rank5",
  "method": "GET",
  "params": []
 },
 {
  "id": "gggz_industry_detail",
  "name": "估值分析·行业估值明细表",
  "category": "估值分析数据中心",
  "sub": "gggz",
  "view_param": "type",
  "view_val": "industry_detail",
  "method": "GET",
  "params": []
 },
 {
  "id": "gggz_undervalue",
  "name": "估值分析·低估值潜力股筛选",
  "category": "估值分析数据中心",
  "sub": "gggz",
  "view_param": "type",
  "view_val": "undervalue",
  "method": "GET",
  "params": []
 },
 {
  "id": "gggz_historical",
  "name": "估值分析·历史估值全景",
  "category": "估值分析数据中心",
  "sub": "gggz",
  "view_param": "type",
  "view_val": "historical",
  "method": "GET",
  "params": []
 },
 {
  "id": "gggz_quantile",
  "name": "估值分析·估值分位水平",
  "category": "估值分析数据中心",
  "sub": "gggz",
  "view_param": "type",
  "view_val": "quantile",
  "method": "GET",
  "params": []
 },
 {
  "id": "gggz_check",
  "name": "估值分析·估值条件校验",
  "category": "估值分析数据中心",
  "sub": "gggz",
  "view_param": "type",
  "view_val": "check",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_market",
  "name": "市场指标·市场综合指标",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "market",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_date",
  "name": "市场指标·指标日期序列",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "date",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_board",
  "name": "市场指标·板块风向标",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "board",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_currency",
  "name": "市场指标·资金利率指标",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "currency",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_margin",
  "name": "市场指标·两融风向标",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "margin",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_turnover",
  "name": "市场指标·换手率风向标",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "turnover",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_sumtval",
  "name": "市场指标·市场总市值序列",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "sumtval",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_avg_deal",
  "name": "市场指标·每笔平均成交",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "avg_deal",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_fshis",
  "name": "市场指标·资金历史风向标",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "fshis",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_theme",
  "name": "市场指标·热门主题投资",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "theme",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_hot_theme",
  "name": "市场指标·高热度主题序列",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "hot_theme",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_revalue",
  "name": "市场指标·估值重估走势",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "revalue",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_board_wheel",
  "name": "市场指标·板块轮动图谱",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "board_wheel",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_sector_rotation",
  "name": "市场指标·行业轮动排行",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "sector_rotation",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_mutual_stock_hold_type",
  "name": "市场指标·互联互通持股类别",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "mutual_stock_hold_type",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_market_value",
  "name": "市场指标·市值结构统计",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "market_value",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_stock_change",
  "name": "市场指标·市场涨跌分布统计",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "stock_change",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_ipo_rise",
  "name": "市场指标·新股首日涨幅统计",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "ipo_rise",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_ipo_rise_total",
  "name": "市场指标·新股累计表现统计",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "ipo_rise_total",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_recent_lift",
  "name": "市场指标·近期解禁规模统计",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "recent_lift",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_total_lift",
  "name": "市场指标·总量解禁走势",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "total_lift",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_investor",
  "name": "市场指标·投资者月度统计",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "investor",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_futures_change",
  "name": "市场指标·期货跨期变动指标",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "futures_change",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_index_picture",
  "name": "市场指标·指数晴雨图走势",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "index_picture",
  "method": "GET",
  "params": []
 },
 {
  "id": "nxfxb_index_picture_simple",
  "name": "市场指标·指数晴雨简图",
  "category": "市场指标风向标",
  "sub": "nxfxb",
  "view_param": "type",
  "view_val": "index_picture_simple",
  "method": "GET",
  "params": []
 },
 {
  "id": "financial_report_latest",
  "name": "专题·最新业绩预告报告",
  "category": "专题报表与事件",
  "sub": "financial_report",
  "view_param": null,
  "view_val": "latest",
  "method": "GET",
  "params": []
 },
 {
  "id": "financial_report_season",
  "name": "专题·财报季十年摘要",
  "category": "专题报表与事件",
  "sub": "financial_report",
  "view_param": null,
  "view_val": "season",
  "method": "GET",
  "params": []
 },
 {
  "id": "financial_report_board_summary",
  "name": "专题·财报板块汇总",
  "category": "专题报表与事件",
  "sub": "financial_report",
  "view_param": null,
  "view_val": "board_summary",
  "method": "GET",
  "params": []
 },
 {
  "id": "economic_calendar",
  "name": "专题·财经日历大事件",
  "category": "专题报表与事件",
  "sub": "economic_calendar",
  "view_param": null,
  "view_val": "",
  "method": "GET",
  "params": []
 },
 {
  "id": "new_concept_boards",
  "name": "专题·新增概念板块及个股",
  "category": "专题报表与事件",
  "sub": "new_concept_boards",
  "view_param": null,
  "view_val": "",
  "method": "GET",
  "params": []
 },
 {
  "id": "billboard_hot_money",
  "name": "专题·龙虎榜游资净买卖",
  "category": "专题报表与事件",
  "sub": "billboard_hot_money",
  "view_param": null,
  "view_val": "",
  "method": "GET",
  "params": []
 },
 {
  "id": "ipo_statistics",
  "name": "专题·新股月度发行统计",
  "category": "专题报表与事件",
  "sub": "ipo_statistics",
  "view_param": null,
  "view_val": "",
  "method": "GET",
  "params": []
 },
 {
  "id": "ipo_unlisted",
  "name": "专题·新股待上市日历",
  "category": "专题报表与事件",
  "sub": "ipo_unlisted",
  "view_param": null,
  "view_val": "",
  "method": "GET",
  "params": []
 },
 {
  "id": "ipo_today",
  "name": "专题·今日申购清单",
  "category": "专题报表与事件",
  "sub": "ipo_today",
  "view_param": null,
  "view_val": "",
  "method": "GET",
  "params": []
 },
 {
  "id": "sector_rotation",
  "name": "专题·板块轮动指数榜",
  "category": "专题报表与事件",
  "sub": "sector_rotation",
  "view_param": null,
  "view_val": "",
  "method": "GET",
  "params": []
 },
 {
  "id": "board_pe_dividend",
  "name": "专题·板块估值与股息率",
  "category": "专题报表与事件",
  "sub": "board_pe_dividend",
  "view_param": null,
  "view_val": "",
  "method": "GET",
  "params": []
 },
 {
  "id": "theme_hot",
  "name": "专题·热门题材关联证券",
  "category": "专题报表与事件",
  "sub": "theme_hot",
  "view_param": null,
  "view_val": "",
  "method": "GET",
  "params": []
 },
 {
  "id": "data_statistics",
  "name": "专题·市场涨跌家数统计",
  "category": "专题报表与事件",
  "sub": "data_statistics",
  "view_param": null,
  "view_val": "",
  "method": "GET",
  "params": []
 },
 {
  "id": "billboard_brief",
  "name": "专题·龙虎榜市场摘要",
  "category": "专题报表与事件",
  "sub": "billboard_brief",
  "view_param": null,
  "view_val": "",
  "method": "GET",
  "params": []
 },
 {
  "id": "market_indicator_theme",
  "name": "专题·热门主题风向",
  "category": "专题报表与事件",
  "sub": "market_indicator_theme",
  "view_param": null,
  "view_val": "",
  "method": "GET",
  "params": []
 },
 {
  "id": "market_indicator_date",
  "name": "专题·指标日期开闭市状态",
  "category": "专题报表与事件",
  "sub": "market_indicator_date",
  "view_param": null,
  "view_val": "",
  "method": "GET",
  "params": []
 },
 {
  "id": "mutual_quota",
  "name": "专题·互联互通额度概览",
  "category": "专题报表与事件",
  "sub": "mutual_quota",
  "view_param": null,
  "view_val": "",
  "method": "GET",
  "params": []
 },
 {
  "id": "tfp_summary",
  "name": "专题·停复牌市场概况",
  "category": "专题报表与事件",
  "sub": "tfp",
  "view_param": null,
  "view_val": "summary",
  "method": "GET",
  "params": []
 },
 {
  "id": "tfp_list",
  "name": "专题·停复牌详细清单",
  "category": "专题报表与事件",
  "sub": "tfp",
  "view_param": null,
  "view_val": "list",
  "method": "GET",
  "params": []
 },
 {
  "id": "tfp_detail",
  "name": "专题·停复牌详情",
  "category": "专题报表与事件",
  "sub": "tfp",
  "view_param": null,
  "view_val": "detail",
  "method": "GET",
  "params": []
 },
 {
  "id": "ggdq",
  "name": "专题·上市公司公告列表",
  "category": "专题报表与事件",
  "sub": "ggdq",
  "view_param": null,
  "view_val": "",
  "method": "GET",
  "params": []
 },
 {
  "id": "fhsz_plan",
  "name": "专题·分红送转方案明细",
  "category": "专题报表与事件",
  "sub": "fhsz",
  "view_param": null,
  "view_val": "plan",
  "method": "GET",
  "params": []
 },
 {
  "id": "fhsz_date",
  "name": "专题·分红预计披露日期",
  "category": "专题报表与事件",
  "sub": "fhsz",
  "view_param": null,
  "view_val": "report_date",
  "method": "GET",
  "params": []
 },
 {
  "id": "ipov2",
  "name": "专题·注册制新股上市表现",
  "category": "专题报表与事件",
  "sub": "ipov2",
  "view_param": null,
  "view_val": "",
  "method": "GET",
  "params": []
 },
 {
  "id": "dchome_labels",
  "name": "专题·数据中心功能标签",
  "category": "专题报表与事件",
  "sub": "dchome",
  "view_param": null,
  "view_val": "labels",
  "method": "GET",
  "params": []
 },
 {
  "id": "dchome_home",
  "name": "专题·数据中心首页核心数据",
  "category": "专题报表与事件",
  "sub": "dchome",
  "view_param": null,
  "view_val": "home",
  "method": "GET",
  "params": []
 },
 {
  "id": "quote_stock",
  "name": "行情·单证券行情详情",
  "category": "公共行情与K线",
  "sub": "quote",
  "view_param": "view",
  "view_val": "stock",
  "method": "GET",
  "params": []
 },
 {
  "id": "quote_stock_list",
  "name": "行情·分页股票行情列表",
  "category": "公共行情与K线",
  "sub": "quote",
  "view_param": "view",
  "view_val": "stock_list",
  "method": "GET",
  "params": []
 },
 {
  "id": "quote_sector_list",
  "name": "行情·板块行情列表",
  "category": "公共行情与K线",
  "sub": "quote",
  "view_param": "view",
  "view_val": "sector_list",
  "method": "GET",
  "params": []
 },
 {
  "id": "quote_batch_quote",
  "name": "行情·多证券行情列表",
  "category": "公共行情与K线",
  "sub": "quote",
  "view_param": "view",
  "view_val": "batch_quote",
  "method": "GET",
  "params": []
 },
 {
  "id": "quote_batch_quote_post",
  "name": "行情·多证券行情POST",
  "category": "公共行情与K线",
  "sub": "quote",
  "view_param": "view",
  "view_val": "batch_quote_post",
  "method": "GET",
  "params": []
 },
 {
  "id": "quote_trend",
  "name": "行情·分时走势序列",
  "category": "公共行情与K线",
  "sub": "quote",
  "view_param": "view",
  "view_val": "trend",
  "method": "GET",
  "params": []
 },
 {
  "id": "quote_updown_trend",
  "name": "行情·涨跌趋势序列",
  "category": "公共行情与K线",
  "sub": "quote",
  "view_param": "view",
  "view_val": "updown_trend",
  "method": "GET",
  "params": []
 },
 {
  "id": "quote_kline",
  "name": "行情·历史K线序列",
  "category": "公共行情与K线",
  "sub": "quote",
  "view_param": "view",
  "view_val": "kline",
  "method": "GET",
  "params": []
 },
 {
  "id": "quote_today_kline",
  "name": "行情·当日分钟K线",
  "category": "公共行情与K线",
  "sub": "quote",
  "view_param": "view",
  "view_val": "today_kline",
  "method": "GET",
  "params": []
 },
 {
  "id": "quote_fund_flow_kline",
  "name": "行情·资金流K线序列",
  "category": "公共行情与K线",
  "sub": "quote",
  "view_param": "view",
  "view_val": "fund_flow_kline",
  "method": "GET",
  "params": []
 },
 {
  "id": "quote_auction",
  "name": "行情·集合竞价摘要",
  "category": "公共行情与K线",
  "sub": "quote",
  "view_param": "view",
  "view_val": "auction",
  "method": "GET",
  "params": []
 },
 {
  "id": "quote_auction_trend",
  "name": "行情·集合竞价走势",
  "category": "公共行情与K线",
  "sub": "quote",
  "view_param": "view",
  "view_val": "auction_trend",
  "method": "GET",
  "params": []
 },
 {
  "id": "quote_northbound_summary",
  "name": "行情·互联互通资金摘要",
  "category": "公共行情与K线",
  "sub": "quote",
  "view_param": "view",
  "view_val": "northbound_summary",
  "method": "GET",
  "params": []
 },
 {
  "id": "quote_northbound_realtime",
  "name": "行情·互联互通实时资金",
  "category": "公共行情与K线",
  "sub": "quote",
  "view_param": "view",
  "view_val": "northbound_realtime",
  "method": "GET",
  "params": []
 },
 {
  "id": "quote_northbound_block",
  "name": "行情·互联互通板块资金",
  "category": "公共行情与K线",
  "sub": "quote",
  "view_param": "view",
  "view_val": "northbound_block",
  "method": "GET",
  "params": []
 }
]
