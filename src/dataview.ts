/** 数据接口返回值的展示层转换：时间代号、金额/比例、布尔、枚举 */

/** 时间类字段名：键名含 time/date/day 即按时间处理（能否解析由 toClock 判定，解析失败按数字原样显示） */
const TIME_KEYS = /(time|date|day)/i

const MONEY_KEYS =
  /amount|value|balance|flow|netin|netup|capital|turnover|circ|share|vol/i

const PCT_KEYS = /rate|pct|percent|change|chg|zdf|amplitude|ratio/i

/** 委托盘口位置（D203 文档字典）：1~3 买一到买三，4 涨停，5~7 卖一到卖三，8 跌停，14~20 买 4~10，24~30 卖 4~10 */
export function mmpText(v: unknown): string {
  const n = Number(v)
  if (!Number.isFinite(n)) return String(v ?? '—')
  if (n === 0) return ''
  const fixed: Record<number, string> = { 1: '买1', 2: '买2', 3: '买3', 4: '涨停', 5: '卖1', 6: '卖2', 7: '卖3', 8: '跌停' }
  if (fixed[n]) return fixed[n]
  if (n >= 14 && n <= 20) return `买${n - 10}`
  if (n >= 24 && n <= 30) return `卖${n - 20}`
  return `档${n}`
}

/** 单据体量级别 */
const VOLUME_CODE: Record<string, string> = { '1': '超大单', '2': '大单', '3': '中单', '4': '小单' }

/** 逐笔委托状态 */
const ENTRUST_STATUS: Record<string, string> = {
  '0': '新增申报', '1': '挂单排队', '2': '部分成交', '3': '部分撤单', '4': '全部撤单',
  '5': '全部成交', '10': '主动成交', '11': '排队撮合', '13': '撮合部撤', '14': '撤单终结',
  '15': '全部成交',
}

/** 买卖方向 0 买 / 1、2 卖 */
const DIRECTION: Record<string, string> = { '0': '买', '1': '卖', '2': '卖' }

/** 主动买卖标志 0 主买 / 1、2 主卖 */
const ACTIVE_SIDE: Record<string, string> = { '0': '主买', '1': '主卖', '2': '主卖' }

const ENUMS: Record<string, Record<string, string>> = {
  market: {
    sh: '沪市',
    sz: '深市',
    bj: '京市',
    SH: '沪市',
    SZ: '深市',
    BJ: '京市',
    AHZBSECTOR: '板块',
  },
  LCGmarket: { SS: '沪市', SZ: '深市', BJ: '京市' },
  boardType: { '0': '主板', '1': '创业板', '2': '科创板', '3': '北交所' },
  listedSector: { '1': '主板', '2': '创业板', '3': '科创板', '4': '北交所' },
  // 文档：up 表示上涨/涨停，down 表示下跌/跌停
  upDownType: { up: '涨停/上涨', down: '跌停/下跌' },
  // 实测：HY 返回电机Ⅱ/医疗美容（行业），DY 返回内蒙古/河南板块（地域），GN 返回兵装重组概念（概念）
  hqTypeCode: { HY: '行业板块', DY: '地域板块', GN: '概念板块' },
  plateTypeCode: { hy: '行业板块', dy: '地域板块', gn: '概念板块' },
  typeCode: {
    'XBHS.HY': '行业板块',
    'XBHS.DY': '地域板块',
    'XBHS.GN': '概念板块',
    'XBHS.ZS': '指数板块',
    XBHS_HY: '行业板块',
    XBHS_DY: '地域板块',
    XBHS_GN: '概念板块',
  },
  AHZBSECTOR: { AHZBSECTOR: '板块' },
}

/** 13 位是毫秒，10 位是秒，8 位是 YYYYMMDD */
export function toClock(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) {
    if (v > 1e11) return Math.floor(v) // 毫秒
    if (v > 1e9) return Math.floor(v * 1000) // 秒
    if (v >= 19000101 && v <= 29991231) return dateToMs(String(v))
    return null
  }
  const s = String(v ?? '').trim()
  if (!s) return null
  if (/^\d{13}$/.test(s)) return Number(s)
  if (/^\d{10}$/.test(s)) return Number(s) * 1000
  if (/^\d{8}$/.test(s)) return dateToMs(s)
  const t = Date.parse(s)
  return Number.isNaN(t) ? null : t
}

function dateToMs(s: string): number {
  return new Date(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T00:00:00+08:00`).getTime()
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

/** 时间代号转可读文本；只有日期部分时不显示 00:00:00 */
export function fmtTime(v: unknown): string {
  const ms = toClock(v)
  if (ms === null) return String(v ?? '—')
  const d = new Date(ms)
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  return time === '00:00:00' ? date : `${date} ${time}`
}

function isTimeKey(key: string): boolean {
  return TIME_KEYS.test(key)
}

function fmtMoney(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1e8) return `${(n / 1e8).toFixed(2)} 亿`
  if (abs >= 1e4) return `${(n / 1e4).toFixed(2)} 万`
  return n.toFixed(2)
}

function fmtNum(n: number): string {
  if (!Number.isFinite(n)) return '—'
  if (Number.isInteger(n)) return n.toLocaleString('zh-CN')
  const abs = Math.abs(n)
  if (abs >= 1e6) return n.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
  return String(Number(n.toFixed(4)))
}

/** 单元格文本：按字段名与数值量级选择格式 */
export function fmtCell(key: string, v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'boolean') return v ? '是' : '否'
  if (typeof v === 'object') return JSON.stringify(v)

  const lk = key.toLowerCase()
  if (lk === 'mmp' || lk === 'ordermmp') return mmpText(v)
  if (lk === 'vc' || lk === 'volumecode' || lk === 'volume_code') return VOLUME_CODE[String(v)] ?? '—'
  if (lk === 'entruststatus' || lk === 'entrust_status' || lk === 'orderstat') {
    const d = ENTRUST_STATUS[String(v)]
    return d ? `${v} (${d})` : `${v} (未知)`
  }
  if (lk === 'dir' || lk === 'direction') return DIRECTION[String(v)] ?? '—'
  if (lk === 'activefunction' || lk === 'activeside') return ACTIVE_SIDE[String(v)] ?? '—'

  const enumMap = ENUMS[key]
  if (enumMap && (typeof v === 'string' || typeof v === 'number')) {
    const hit = enumMap[String(v)]
    if (hit) return hit
  }

  if (isTimeKey(key)) {
    const ms = toClock(v)
    if (ms !== null) return fmtTime(ms)
  }

  if (typeof v === 'string') {
    // 值本身是时间代号（上游偶尔把时间放在 dateStr 之类没规律的键上）
    const ms = /^\d{13}$/.test(v) || /^\d{8}$/.test(v) ? toClock(v) : null
    if (ms !== null) return fmtTime(ms)
    return v
  }

  const n = Number(v)
  if (!Number.isFinite(n)) return String(v)
  if (PCT_KEYS.test(key) && Math.abs(n) <= 1000) {
    // 上游比例有 0.01 / 1.5 / 10.05 三种口径，统一按"百分数"展示但保留原量级
    const pct = Math.abs(n) <= 1.2 ? n * 100 : n
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`
  }
  if (MONEY_KEYS.test(key) && Math.abs(n) >= 1e4) return fmtMoney(n)
  return fmtNum(n)
}

/** 判断一列是否适合画成时间序列（时间列 + 数值列） */
export function seriesKeys(rows: Record<string, unknown>[]): { timeKey: string; values: string[] } | null {
  if (rows.length < 3) return null
  const sample = rows.slice(0, 20)
  let timeKey = ''
  for (const k of Object.keys(sample[0])) {
    if (isTimeKey(k) && sample.every((r) => toClock(r[k]) !== null)) {
      timeKey = k
      break
    }
  }
  if (!timeKey) return null
  const values = Object.keys(sample[0]).filter(
    (k) =>
      k !== timeKey &&
      sample.filter((r) => typeof r[k] === 'number' && Number.isFinite(r[k] as number)).length >= sample.length * 0.8,
  )
  return values.length > 0 ? { timeKey, values } : null
}
