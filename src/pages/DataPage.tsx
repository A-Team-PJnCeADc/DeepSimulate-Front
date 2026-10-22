import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getToken } from '../api'
import { D101Book } from '../components/D101Book'
import { KlineBoard } from '../components/KlineBoard'
import { ReplayBar } from '../components/ReplayBar'
import { ReplayPanel } from '../components/ReplayPanel'
import { ReplayChart } from '../components/ReplayChart'
import { fieldLabel } from '../fieldLabels'
import { isBroken } from '../brokenIds'
import { KlineChart, type Candle } from '../components/KlineChart'
import { SeriesChart } from '../components/SeriesChart'
import { fmtCell, seriesKeys, toClock } from '../dataview'
import { market, groupsOf, type Screen } from '../screens'

type Row = Record<string, unknown>

/** 数据接口透传请求：GET 带查询串，POST 带 JSON 体 */
async function call<T>(path: string, body?: unknown): Promise<T> {
  const token = getToken()
  const res = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json: unknown = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    // 上游异常时可能返回纯文本兜底内容（如 hello word），原样提示
    throw new Error(`上游返回非 JSON：${text.trim().slice(0, 120)}`)
  }
  if (!res.ok) {
    const m = json as { message?: string; Msg?: string } | null
    throw new Error(m?.message ?? m?.Msg ?? `HTTP ${res.status}`)
  }
  return json as T
}

/**
 * 挑最像"数据表"的数组：递归收集所有对象数组，
 * 按「有具名字段 + 行数多」打分，避免选到 {rc,data} 这类包装层或列索引数组。
 */
function pickArray(v: unknown, out: { rows: Row[]; score: number }[] = [], depth = 0): Row[] | null {
  if (depth > 5 || v === null || v === undefined) return null
  if (Array.isArray(v)) {
    if (v.length > 0 && typeof v[0] === 'object' && v[0] !== null) {
      const rows = v as Row[]
      const keys = Object.keys(rows[0])
      const named = keys.filter((k) => !/^\d+$/.test(k)).length
      out.push({ rows, score: named * 100 + Math.min(rows.length, 99) })
    }
    return null
  }
  if (typeof v === 'object') {
    for (const val of Object.values(v as Record<string, unknown>)) pickArray(val, out, depth + 1)
  }
  if (depth === 0 && out.length > 0) {
    out.sort((a, b) => b.score - a.score)
    return out[0].rows
  }
  return null
}

const firstArray = (v: unknown): Row[] | null => pickArray(v)

function toCandles(rows: Row[]): Candle[] {
  const out: Candle[] = []
  for (const r of rows) {
    const t = toClock(r.time ?? r.Time ?? r.date ?? r.Date ?? r.ts ?? r.TradeDate ?? r.DetailDate)
    if (t === null) continue
    const n = (...vals: unknown[]): number => {
      for (const v of vals) if (typeof v === 'number' && Number.isFinite(v)) return v
      return 0
    }
    const open = n(r.open, r.Open, r.OPEN)
    const close = n(r.close, r.Close, r.CLOSE, r.last, r.Last)
    if (open <= 0 && close <= 0) continue
    out.push({
      time: Math.floor(t / 1000),
      open: open || close,
      high: n(r.high, r.High, r.HIGH) || Math.max(open, close),
      low: n(r.low, r.Low, r.LOW) || Math.min(open, close),
      close,
      volume: n(r.volume, r.Volume, r.VOLUME, r.vol, r.BusinessAmount, r.businessBalance),
    })
  }
  return out.sort((a, b) => a.time - b.time)
}

/** 列：取前 40 行的非空标量键，最多 12 列 */
const PRIORITY = [
  'ProdName', 'prodName', 'name', 'symbol', 'code', 'inst', 'typeCode', 'hqTypeCode',
  'market', 'lastPx', 'pxChangeRate', 'change', 'BusinessAmount', 'businessAmount',
]

function columnsOf(rows: Row[]): string[] {
  const seen: string[] = []
  for (const r of rows.slice(0, 40)) {
    for (const [k, v] of Object.entries(r)) {
      if (v === null || v === undefined || typeof v === 'object') continue
      if (!seen.includes(k)) seen.push(k)
    }
  }
  // 关键列提到最前，其余按原始顺序补齐，最多 14 列
  const head = PRIORITY.filter((k) => seen.includes(k))
  const rest = seen.filter((k) => !head.includes(k))
  return [...head, ...rest].slice(0, 14)
}

/** 常见字段的中文表头；未收录的保留原始键名 */
const LABELS: Record<string, string> = {
  timestamp: '时间', Timestamp: '时间', dataTimestamp: '时间', updateTime: '更新时间',
  UpdateTime: '更新时间', TRADE_DATE: '日期',
  DetailDate: '日期', MarketType: '市场类型', DRZJLR: '当日主力净流入', DRYE: '两融余额',
  LSZJLR: '历史主力净流入', DRCJJME: '当日成交金额', MRCJE: '买入金额', MCCJE: '卖出金额',
  LCGCode: '领涨股代码', LCG: '领涨股', LCGZDF: '领涨幅', SSEChange: '上证指数',
  SSEChangePrecent: '上证涨跌幅', HistoryPrice: '昨收', Business_amount: '成交额',
  BusinessAmount: '成交额', businessBalance: '成交额', code: '代码', symbol: '代码',
  inst: '代码', name: '名称', market: '市场', typeCode: '板块类型', lastPx: '最新价',
  last: '最新价', close: '收盘', open: '开盘', high: '最高', low: '最低',
  change: '涨跌幅', chg: '涨跌幅', changeRate: '涨跌幅', volume: '成交量', amount: '成交额',
  pubTime: '发布时间', noticeTp1: '分类', noticeTp2: '子类', title: '标题', sentiment: '情绪',
  WAvgPx: '均价', circulationValue: '流通市值', marketValue: '总市值', limitShare: '封单量',
  LimitShareMax: '涨停封单', LimitShareDownMax: '跌停封单', limitType: '涨跌停',
  CountUpBrokenBoard: '炸板次数', countBrokenBoard: '炸板次数', countContLimit: '连板数',
  countContBoard: '连板数', boardType: '板块类型', listedSector: '上市板块',
  latestUpTime: '最近涨停', latestDownTime: '最近跌停', firstUpTime: '首次涨停',
  downBrokenBoardTime: '炸板时间', dragonReason: '上榜原因', dragonNetIn: '龙虎榜净额',
  isDragon: '龙虎榜', total_hand: '总手', totalHand: '总手',
  ProdName: '板块名称', prodName: '板块名称', hqTypeCode: '板块类型',
  plateTypeCode: '板块类型', pxChangeRate: '涨跌幅', pxChange: '涨跌',
  turnoverRatio: '换手率', volRatio: '量比', peRate: '市盈率', dynPbRate: '市净率',
  totalShares: '总股本', circulationAmount: '流通股本',
  mainNetIn: '主力净流入', netAmount: '净额', rank: '排名', mmp: '档位', vc: '单量级别', volumeCode: '单量级别', seq: '委托号', dir: '方向',
  direction: '方向', entrustStatus: '委托状态', activeFunction: '主动方向', isST: 'ST',
  upCount: '上涨家数', downCount: '下跌家数', flatCount: '平盘家数',
}

const MAX_ROWS = 300

/** 表头：先用手写映射，再用示例脚本的字典，最后回退原字段名 */
const headOf = (k: string): string => LABELS[k] ?? fieldLabel(k) ?? k

type Props = { list?: Screen[]; initialCode?: string }

export function DataPage({ list = market, initialCode }: Props) {
  // 默认只列能跑通的接口；勾选后显示全部（含上游未开通/参数待调的）
  const [showAll, setShowAll] = useState(false)
  const visible = useMemo(() => (showAll ? list : list.filter((s) => !isBroken(s.id))), [list, showAll])
  const groups = useMemo(() => groupsOf(visible), [visible])
  const [sid, setSid] = useState(visible[0].id)
  const screen: Screen = visible.find((s) => s.id === sid) ?? visible[0] ?? list[0]
  const [vals, setVals] = useState<Record<string, string>>({})
  const [view, setView] = useState<'auto' | 'chart' | 'table'>('auto')
  const [page, setPage] = useState(1)
  // 服务端权威交易日：日期类参数不得超前，默认取它与 start_date 的较大者
  const [today, setToday] = useState('')
  useEffect(() => {
    fetch('/api/clock')
      .then((r) => r.json())
      .then((d: { today?: string }) => setToday(d?.today ?? ''))
      .catch(() => void 0)
  }, [])
  const [size, setSize] = useState(20)
  const [picked, setPicked] = useState<string[]>([])
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const next: Record<string, string> = {}
    for (const p of screen.params ?? []) {
      if ((p.key === 'code' || p.key === 'inst') && initialCode) {
        next[p.key] = initialCode
      } else if (p.key === 'market' && initialCode) {
        next[p.key] = /^6/.test(initialCode) ? 'SH' : /^[48]/.test(initialCode) ? 'BJ' : 'SZ'
      } else if (p.key === 'code' && initialCode) {
        next[p.key] = initialCode
      } else if (p.key === 'secucode' && initialCode) {
        // 6 开头沪市、其余深市；北交所 8/4 开头用 .BJ
        const suffix = /^6/.test(initialCode) ? 'SH' : /^[48]/.test(initialCode) ? 'BJ' : 'SZ'
        next[p.key] = `${initialCode}.${suffix}`
      } else {
        next[p.key] = p.def
      }
    }
    setVals(next)
    setView('auto')
    setPicked([])
    setPage(1)
    setSortKey(null)
  }, [screen])

  // 分页参数：URL 类接口写查询串，POST 类接口写请求体（st 每页条数、Index 偏移）
  // 自选股选中变化 → 同步代码类参数（code/inst/secucode/market）
  useEffect(() => {
    if (!initialCode) return
    const keys = (screen.params ?? []).map((p) => p.key)
    const patch: Record<string, string> = {}
    if (keys.includes('code')) patch.code = initialCode
    if (keys.includes('inst')) patch.inst = initialCode
    if (keys.includes('secucode')) patch.secucode = `${initialCode}.${/^6/.test(initialCode) ? 'SH' : /^[48]/.test(initialCode) ? 'BJ' : 'SZ'}`
    if (keys.includes('market')) patch.market = /^6/.test(initialCode) ? 'SH' : /^[48]/.test(initialCode) ? 'BJ' : 'SZ'
    if (Object.keys(patch).length > 0) setVals((v) => ({ ...v, ...patch }))
  }, [initialCode, screen])

  // 个股类参数统一以「自选股当前选中」为准，避免同时出现两只标的
  const activeCode = initialCode || vals.code || '000001'

  const qs = useMemo(() => {
    const p = new URLSearchParams(screen.fixed ?? {})
    for (const [k, v] of Object.entries(vals)) p.set(k, v)
    if (screen.paging && !screen.paging.inBody) {
      p.set(screen.paging.sizeKey, String(size))
      p.set(screen.paging.pageKey, String(page))
    }
    return p.toString()
  }, [vals, screen, size, page])

  const body = useMemo(() => {
    if (!screen.body) return undefined
    // 模板替换：{{code}} / {{day}} 取当前参数值
    const filled = JSON.parse(
      JSON.stringify(screen.body)
        .split('{{code}}')
        .join(vals.code ?? '000001')
        .split('{{day}}')
        .join(vals.day ?? ''),
    ) as Record<string, unknown>
    const b = filled
    if (screen.paging?.inBody) {
      b[screen.paging.sizeKey] = size
      b[screen.paging.pageKey] = screen.paging.offset ? (page - 1) * size : page
    }
    return b
  }, [screen, size, page, vals])
  const query = useQuery({
    queryKey: ['ext', screen.id, qs, page, size],
    enabled: !['d101', 'klineboard', 'replaychart', 'replaybar', 'replaypanel'].includes(screen.kind ?? ''),
    queryFn: () =>
      screen.body
        ? call<unknown>(`/api/ext/${screen.path}`, body)
        : screen.method === 'POST'
          ? call<unknown>(`/api/ext/${screen.path}`, { ...(screen.fixed ?? {}), ...vals })
          : call<unknown>(`/api/ext/${screen.path}${qs ? `?${qs}` : ''}`),
    staleTime: 20_000,
    retry: 1,
  })

  const rawRows = useMemo(() => firstArray(query.data), [query.data])
  // 表格统一按主时间列倒序（新→旧）展示：上游很多接口是升序返回，直接显示会把最老的排在最前
  const primaryTimeKey = useMemo(() => {
    if (!rawRows || rawRows.length === 0) return null
    const keys = Object.keys(rawRows[0]).filter((k) => /(time|date|day)/i.test(k))
    for (const k of keys) {
      const ok = rawRows.filter((r) => toClock(r[k]) !== null).length
      if (ok >= rawRows.length * 0.8) return k
    }
    return null
  }, [rawRows])
  const rows = useMemo(() => {
    if (!rawRows) return rawRows
    const key = sortKey ?? primaryTimeKey
    if (!key) return rawRows
    const dir = sortKey ? sortDir : 'desc'
    const val = (r: Row): number | string => {
      const v = r[key]
      if (typeof v === 'number') return v
      const t = toClock(v)
      if (t !== null) return t
      return typeof v === 'string' ? v : ''
    }
    const sorted = [...rawRows].sort((a, b) => {
      const x = val(a)
      const y = val(b)
      if (typeof x === 'number' && typeof y === 'number') return dir === 'asc' ? x - y : y - x
      return dir === 'asc' ? String(x).localeCompare(String(y)) : String(y).localeCompare(String(x))
    })
    return sorted
  }, [rawRows, primaryTimeKey, sortKey, sortDir])
  const cols = useMemo(() => (rows ? columnsOf(rows) : []), [rows])
  const series = useMemo(() => (rows ? seriesKeys(rows) : null), [rows])
  const candles = useMemo(() => (screen.kind === 'kline' && rows ? toCandles(rows) : []), [screen, rows])
  const metrics = picked.length > 0 ? picked : series ? series.values.slice(0, 1) : []
  // 时间列重复度高说明是列表而不是时间序列（如公告同一天多条），不自动转图
  const uniqueRatio = useMemo(() => {
    if (!rows || !series) return 0
    const set = new Set<number | null>()
    for (const r of rows) set.add(toClock(r[series.timeKey]))
    return set.size / rows.length
  }, [rows, series])
  const showChart =
    screen.kind !== 'kline' &&
    series !== null &&
    screen.kind !== 'table' &&
    (view === 'chart' || (view === 'auto' && screen.kind === 'line' && uniqueRatio >= 0.7))

  // 数据新鲜度：扫全表所有时间类字段取**最新**日期（不能只看第一列，否则会把上市日/报告期当成数据日期）
  const stale = useMemo(() => {
    if (!rows || rows.length === 0) return null
    let max = 0
    for (const r of rows) {
      for (const [k, v] of Object.entries(r)) {
        if (!/(time|date|day)/i.test(k)) continue
        const t = toClock(v)
        if (t !== null && t > max) max = t
      }
    }
    if (max === 0) return null
    const days = (Date.now() - max) / 86_400_000
    if (days < 3) return null
    const dt = new Date(max)
    const pad = (n: number) => (n < 10 ? `0${n}` : String(n))
    return { date: `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`, days: Math.round(days) }
  }, [rows])

  const errText = useMemo(() => {
    const d = query.data as { code?: number; message?: string; Msg?: string } | undefined
    if (query.error) return (query.error as Error).message
    if (d && typeof d.code === 'number' && d.code !== 0 && d.code !== 1) return d.message ?? d.Msg ?? `接口返回 code=${d.code}`
    return null
  }, [query.data, query.error])

  return (
    <div className="grid grid-cols-[168px_1fr] gap-3 h-full min-h-0 min-w-0">
      <aside className="panel overflow-y-auto py-2">
        <label className="flex items-center gap-1.5 px-3 py-1.5 text-xxs text-muted cursor-pointer">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
          显示不通的接口
        </label>
        {groups.map((g) => (
          <div key={g} className="mb-1">
            <div className="px-3 py-1 text-xxs text-muted tracking-wide">{g}</div>
            {visible.filter((s) => s.group === g).map((s) => (
              <button
                key={s.id}
                onClick={() => setSid(s.id)}
                className={`w-full text-left px-3 py-1.5 text-xs ${
                  s.id === sid ? 'bg-accent/10 text-accent font-medium' : 'text-ink hover:bg-panel2'
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        ))}
      </aside>

      <section className="panel flex flex-col min-h-0 min-w-0 overflow-hidden">
        <header className="flex items-center gap-3 px-3 h-11 border-b border-line shrink-0">
          <span className="text-sm font-medium text-ink">{screen.title}</span>
          {screen.note && <span className="text-xxs text-muted truncate max-w-[280px]">{screen.note}</span>}
          <div className="ml-auto flex items-center gap-2">
            {series && screen.kind !== 'kline' && (
              <div className="flex rounded-md border border-line overflow-hidden">
                {(['chart', 'table'] as const).map((v) => (
                  <button
                    key={v}
                    className={`h-7 px-2.5 text-xxs ${
                      (view === 'auto' ? (showChart ? 'chart' : 'table') : view) === v
                        ? 'bg-accent/10 text-accent'
                        : 'text-muted hover:bg-panel2'
                    }`}
                    onClick={() => setView(v)}
                  >
                    {v === 'chart' ? '图表' : '表格'}
                  </button>
                ))}
              </div>
            )}
            {(screen.params ?? []).map((p) => (
              <label key={p.key} className="flex items-center gap-1 text-xxs text-muted">
                {p.label}
                <input
                  className="input h-7 w-24"
                  value={p.key === 'code' || p.key === 'inst' ? activeCode : vals[p.key] ?? ''}
                  max={/date|day/i.test(p.key) ? today : undefined}
                  title={/date|day/i.test(p.key) && today ? `不得晚于 ${today}` : undefined}
                  onChange={(e) => {
                    let val = e.target.value
                    // 日期类参数硬性截断到权威交易日，避免看到"未来"的数据
                    if (today && /date|day/i.test(p.key) && /^\d{8}$/.test(val) && val > today) val = today
                    setVals((v) => ({ ...v, [p.key]: val }))
                  }}
                />
              </label>
            ))}
            {screen.paging && (
              <div className="flex items-center gap-1">
                <select
                  className="input h-7 w-16"
                  value={size}
                  onChange={(e) => {
                    setSize(Number(e.target.value))
                    setPage(1)
                  }}
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n} 条
                    </option>
                  ))}
                </select>
                <button
                  className="btn h-7 px-2 text-xxs disabled:opacity-40"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  上一页
                </button>
                <span className="text-xxs text-muted num">第 {page} 页</span>
                <button
                  className="btn h-7 px-2 text-xxs disabled:opacity-40"
                  disabled={!rows || rows.length < size}
                  onClick={() => setPage((p) => p + 1)}
                >
                  下一页
                </button>
              </div>
            )}
            <button className="btn h-7 px-3" onClick={() => void query.refetch()}>
              查询
            </button>
          </div>
        </header>

        <div className="flex-1 min-h-0 min-w-0 overflow-auto p-3">
          {stale && (
            <div className="mb-2 rounded-md border border-up/40 bg-up/5 px-2.5 py-1.5 text-xxs text-up">
              数据日期 {stale.date}（距今 {stale.days} 天）——数据源该接口返回的是历史快照，不是今日
            </div>
          )}
          {query.isLoading && <div className="text-xs text-muted">加载中…</div>}
          {errText && <div className="text-xs text-up">{errText}</div>}

          {screen.kind === 'd101' && <D101Book code={activeCode} />}
          {screen.kind === 'klineboard' && <KlineBoard code={activeCode} />}
          {screen.kind === 'replaychart' && <ReplayChart code={activeCode} />}
          {screen.kind === 'replaybar' && <ReplayBar />}
          {screen.kind === 'replaypanel' && <ReplayPanel code={activeCode} />}
          {!query.isLoading && !errText && screen.kind === 'kline' && (
            candles.length > 0 ? (
              <KlineChart candles={candles} height={Math.max(320, window.innerHeight - 260)} />
            ) : (
              <div className="text-xs text-muted">没有 K 线数据</div>
            )
          )}

          {!query.isLoading && !errText && screen.kind !== 'kline' && showChart && rows && series && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-1">
                {series.values.slice(0, 10).map((k) => {
                  const on = metrics.includes(k)
                  return (
                    <button
                      key={k}
                      onClick={() =>
                        setPicked((p) => (on ? p.filter((x) => x !== k) : [...p, k]))
                      }
                      className={`h-6 px-2 rounded text-xxs border ${
                        on ? 'border-accent text-accent bg-accent/5' : 'border-line text-muted hover:bg-panel2'
                      }`}
                    >
                      {headOf(k)}
                    </button>
                  )
                })}
                <span className="ml-2 text-xxs text-muted self-center">
                  {rows.length} 个点 · 时间列 {headOf(series.timeKey)}
                </span>
              </div>
              <SeriesChart
                rows={rows}
                timeKey={series.timeKey}
                metrics={metrics}
                height={Math.max(300, window.innerHeight - 330)}
              />
            </div>
          )}

          {!query.isLoading && !errText && screen.kind !== 'kline' && !showChart && rows && rows.length > 0 && (
            <>
              <div className="w-full overflow-x-auto">
              <table className="w-max min-w-full text-xxs num">
                <thead className="sticky top-0 bg-panel">
                  <tr className="text-muted text-left">
                    {cols.map((c) => {
                      const active = (sortKey ?? primaryTimeKey) === c
                      const arrow = active ? (sortKey ? sortDir : 'desc') === 'asc' ? ' ▲' : ' ▼' : ''
                      return (
                        <th
                          key={c}
                          onClick={() => {
                            if (sortKey === c) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
                            else {
                              setSortKey(c)
                              setSortDir('desc')
                            }
                          }}
                          className={`px-2 py-1.5 font-normal whitespace-nowrap border-b border-line cursor-pointer select-none hover:text-ink ${
                            active ? 'text-accent' : ''
                          }`}
                          title="点击切换升序/倒序"
                        >
                          {headOf(c)}
                          {arrow}
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, MAX_ROWS).map((r, i) => (
                    <tr key={i} className="hover:bg-panel2">
                      {cols.map((c) => (
                        <td
                          key={c}
                          title={fmtCell(c, r[c])}
                          className="px-2 py-1 whitespace-nowrap text-ink border-b border-line/60 max-w-[320px] truncate"
                        >
                          {fmtCell(c, r[c])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              <div className="mt-2 text-xxs text-muted">
                共 {rows.length} 条{rows.length > MAX_ROWS ? `，显示前 ${MAX_ROWS} 条` : ''}
              </div>
            </>
          )}

          {!query.isLoading && !errText && screen.kind !== 'kline' && !['d101', 'klineboard', 'replaychart', 'replaybar', 'replaypanel'].includes(screen.kind ?? '') && !rows && (
            <KeyValue data={query.data} />
          )}
        </div>
      </section>
    </div>
  )
}

/** 非数组响应（单个对象）按字段表展示，同样做时间与数值转换 */
function KeyValue({ data }: { data: unknown }) {
  const entries = useMemo(() => {
    const out: [string, unknown][] = []
    const walk = (v: unknown, prefix: string, depth: number) => {
      if (depth > 3 || v === null || v === undefined) return
      if (typeof v === 'object' && !Array.isArray(v)) {
        for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
          walk(val, prefix ? `${prefix}.${k}` : k, depth + 1)
        }
      } else if (!Array.isArray(v)) {
        out.push([prefix, v])
      }
    }
    walk(data, '', 0)
    return out
  }, [data])

  if (entries.length === 0) {
    const text = JSON.stringify(data, null, 2) ?? ''
    return <pre className="text-xxs text-muted whitespace-pre-wrap break-all">{text.slice(0, 4000)}</pre>
  }
  return (
    <table className="w-full max-w-3xl text-xxs">
      <tbody>
        {entries.map(([k, v]) => (
          <tr key={k} className="border-b border-line/60">
            <td className="px-2 py-1.5 text-muted whitespace-nowrap">{LABELS[k.split('.').pop() ?? k] ?? k}</td>
            <td className="px-2 py-1.5 num text-ink">{fmtCell(k.split('.').pop() ?? k, v)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
