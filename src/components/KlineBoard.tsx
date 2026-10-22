import { useEffect, useMemo, useRef, useState } from 'react'
import { ColorType, createChart, type IChartApi, type LineData, type ISeriesApi } from 'lightweight-charts'
import { getToken } from '../api'

type Period = { key: string; label: string; limit: number }

type Bar = { time: number; open: number; high: number; low: number; close: number; volume: number }
type ChipDay = { ts: number; summary: Record<string, unknown>; items: { price: number; vol: number }[] }

const PERIODS: Period[] = [
  { key: 'DAY', label: '日K', limit: 250 },
  { key: 'WEEK', label: '周K', limit: 200 },
  { key: 'MONTH', label: '年K', limit: 150 },
  { key: 'MIN60', label: '60分', limit: 200 },
  { key: 'MIN30', label: '30分', limit: 200 },
  { key: 'MIN15', label: '15分', limit: 200 },
  { key: 'MIN5', label: '5分', limit: 200 },
]

const MA_COLORS = ['#d98324', '#2f6fdb', '#7a5cd6']
const VWAP_COLOR = '#0f9ba8'

const marketOf = (code: string): string => (/^6/.test(code) ? 'SH' : /^[48]/.test(code) ? 'BJ' : 'SZ')

async function getJson<T>(path: string): Promise<T> {
  const token = getToken()
  const res = await fetch(path, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  const text = await res.text()
  try {
    return (text ? JSON.parse(text) : null) as T
  } catch {
    throw new Error(`上游返回非 JSON：${text.slice(0, 60)}`)
  }
}

function firstArray(v: unknown, dep = 0): Record<string, unknown>[] | null {
  if (dep > 4 || v === null || v === undefined) return null
  if (Array.isArray(v)) return v.length && typeof v[0] === 'object' ? (v as Record<string, unknown>[]) : null
  if (typeof v === 'object') {
    for (const x of Object.values(v as Record<string, unknown>)) {
      const r = firstArray(x, dep + 1)
      if (r) return r
    }
  }
  return null
}

function toSec(v: unknown): number {
  if (typeof v === 'number') return v > 1e11 ? Math.floor(v / 1000) : v
  const s = String(v ?? '')
  if (/^\d{8}$/.test(s)) return Math.floor(Date.parse(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T00:00:00+08:00`) / 1000)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return Math.floor(Date.parse(s) / 1000)
  return 0
}

const num = (...vals: unknown[]): number => {
  for (const v of vals) {
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string' && v && !Number.isNaN(Number(v))) return Number(v)
  }
  return 0
}

export function KlineBoard({ code }: { code: string }) {
  const [period, setPeriod] = useState<Period>(PERIODS[0])
  const [bars, setBars] = useState<Bar[]>([])
  const [chipDays, setChipDays] = useState<ChipDay[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  // 可见区间（下标），缩放/键盘平移后由 lightweight-charts 回调更新
  const [range, setRange] = useState<{ from: number; to: number } | null>(null)

  const boxRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const vwapRef = useRef<ISeriesApi<'Line'> | null>(null)
  const barsRef = useRef<Bar[]>([])
  barsRef.current = bars

  /* 数据 */
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const qs = new URLSearchParams({
      market: marketOf(code),
      inst: code,
      period: period.key,
      startTime: '0',
      endTime: '2524579200',
      limit: String(period.limit),
    })
    getJson<unknown>(`/api/ext/d6/market/v1/kline/history?${qs}`)
      .then((d) => {
        if (cancelled) return
        const out: Bar[] = []
        for (const r of firstArray(d) ?? []) {
          const t = toSec(r.time ?? r.Time ?? r.tradeDate ?? r.date ?? r.ts ?? r.TradeDate)
          if (!t) continue
          const c = num(r.close, r.Close, r.closePx, r.lastPx, r.last)
          const o = num(r.open, r.Open, r.openPx) || c
          if (!c) continue
          out.push({
            time: t,
            open: o,
            high: num(r.high, r.High, r.highPx) || Math.max(o, c),
            low: num(r.low, r.Low, r.lowPx) || Math.min(o, c),
            close: c,
            volume: num(r.volume, r.Volume, r.vol, r.businessAmount, r.amount),
          })
        }
        out.sort((a, b) => a.time - b.time)
        const uniq = new Map<number, Bar>()
        for (const b of out) uniq.set(b.time, b)
        setBars([...uniq.values()])
        setRange(null)
        setErr(null)
      })
      .catch((e: Error) => !cancelled && setErr(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [code, period])

  // 筹码分布：一次取回全部交易日，按当前可见日期动态选取
  useEffect(() => {
    let cancelled = false
    // 上游参数：symbol（不带市场前缀）+ market(sh/sz) + startTime(毫秒) + powerType
    const chipQs = new URLSearchParams({
      symbol: code,
      market: /^6/.test(code) ? 'sh' : 'sz',
      startTime: String(Date.now() - 100 * 86_400_000),
      powerType: '1',
    })
    getJson<unknown>(`/api/ext/d6/market/v1/stock/chip/distribution?${chipQs}`)
      .then((d) => {
        if (cancelled) return
        const days: ChipDay[] = []
        for (const r of firstArray(d) ?? []) {
          const ts = toSec(r.tradeDate ?? r.trade_date ?? r.date) * 1000
          if (!ts) continue
          const items = ((r.items as Record<string, unknown>[]) ?? [])
            .map((it) => ({ price: num(it.price, it.px, it.costPrice), vol: num(it.volume, it.vol, it.percent, it.rate) }))
            .filter((x) => x.price > 0)
            .sort((a, b) => b.price - a.price)
            .slice(0, 60)
          days.push({ ts, summary: (r.chipSummary as Record<string, unknown>) ?? {}, items })
        }
        days.sort((a, b) => a.ts - b.ts)
        setChipDays(days)
      })
      .catch(() => void 0)
    return () => {
      cancelled = true
    }
  }, [code])

  /* 画图 */
  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const chart = createChart(box, {
      height: Math.max(360, window.innerHeight - 320),
      layout: { background: { type: ColorType.Solid, color: '#ffffff' }, textColor: '#4b5563', fontSize: 11 },
      grid: { vertLines: { color: '#f1f3f5' }, horzLines: { color: '#f1f3f5' } },
      rightPriceScale: { borderColor: '#e5e7eb', scaleMargins: { top: 0.05, bottom: 0.28 } },
      timeScale: { borderColor: '#e5e7eb', timeVisible: period.key.startsWith('MIN'), secondsVisible: false },
      localization: { locale: 'zh-CN' },
    })
    chartRef.current = chart
    // 调试钩子：外部可 __kline.timeScale().setVisibleLogicalRange(...) 验证联动
    ;(window as unknown as { __kline?: IChartApi }).__kline = chart

    const candle = chart.addCandlestickSeries({
      upColor: '#e0403f', downColor: '#12a35a',
      borderUpColor: '#e0403f', borderDownColor: '#12a35a',
      wickUpColor: '#e0403f', wickDownColor: '#12a35a',
    })
    candle.setData(bars.map((b) => ({ time: b.time as never, open: b.open, high: b.high, low: b.low, close: b.close })))

    const vol = chart.addHistogramSeries({ priceScaleId: 'vol', priceFormat: { type: 'volume' }, color: '#c9ced6' })
    vol.setData(
      bars.map((b) => ({
        time: b.time as never,
        value: b.volume,
        color: b.close >= b.open ? 'rgba(224,64,63,0.4)' : 'rgba(18,163,90,0.4)',
      })),
    )
    chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.78, bottom: 0 } })
    chart.applyOptions({ timeScale: { minBarSpacing: 0.5, rightOffset: 3 } })

    const ma = (n: number): LineData[] => {
      const out: LineData[] = []
      let sum = 0
      bars.forEach((b, i) => {
        sum += b.close
        if (i >= n) sum -= bars[i - n].close
        if (i >= n - 1) out.push({ time: b.time as never, value: sum / n })
      })
      return out
    }
    ;[5, 10, 20].forEach((n, i) => {
      const line = chart.addLineSeries({
        color: MA_COLORS[i], lineWidth: 1, priceLineVisible: false, lastValueVisible: false, title: `MA${n}`,
      })
      line.setData(ma(n))
    })

    const vwap = chart.addLineSeries({
      color: VWAP_COLOR, lineWidth: 2, priceLineVisible: false, lastValueVisible: false, title: '均价',
    })
    vwapRef.current = vwap

    chart.timeScale().fitContent()
    // 缩放 / 键盘左右平移都会触发，用来重算均价线与筹码
    const onRange = (r: { from: number; to: number } | null) => {
      if (!r) return
      const bs = barsRef.current
      const from = Math.max(0, Math.floor(r.from))
      const to = Math.min(bs.length - 1, Math.ceil(r.to))
      if (to < from) return
      setRange({ from, to })
      // 均价线：从可见区间起点重新累计（缩放后形状随之变化）
      let amt = 0
      let vol2 = 0
      const data: LineData[] = []
      for (let i = from; i <= to; i += 1) {
        const b = bs[i]
        amt += b.close * (b.volume || 1)
        vol2 += b.volume || 1
        data.push({ time: b.time as never, value: amt / vol2 })
      }
      vwap.setData(data)
    }
    chart.timeScale().subscribeVisibleLogicalRangeChange(onRange)

    const ro = new ResizeObserver(() => chart.applyOptions({ width: box.clientWidth }))
    ro.observe(box)
    chart.applyOptions({ width: box.clientWidth })
    return () => {
      ro.disconnect()
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(onRange)
      chart.remove()
      chartRef.current = null
      vwapRef.current = null
    }
  }, [bars, period])

  /* 跟随可见区间的读数 */
  const window0 = useMemo(() => {
    const bs = bars
    if (bs.length === 0) return null
    const from = range ? range.from : 0
    const to = range ? range.to : bs.length - 1
    return { from, to }
  }, [bars, range])

  const legend = useMemo(() => {
    if (!bars.length || !window0) return []
    const i = window0.to
    const ma = (n: number): number | null => {
      if (i - n + 1 < 0) return null
      let sum = 0
      for (let k = i - n + 1; k <= i; k += 1) sum += bars[k].close
      return sum / n
    }
    let amt = 0
    let vol = 0
    for (let k = window0.from; k <= i; k += 1) {
      amt += bars[k].close * (bars[k].volume || 1)
      vol += bars[k].volume || 1
    }
    return [
      { k: 'MA5', v: ma(5), color: MA_COLORS[0] },
      { k: 'MA10', v: ma(10), color: MA_COLORS[1] },
      { k: 'MA20', v: ma(20), color: MA_COLORS[2] },
      { k: '均价', v: vol > 0 ? amt / vol : null, color: VWAP_COLOR },
    ]
  }, [bars, window0])

  // 筹码：选「不晚于可见区间最后一根」的那一天
  const chip = useMemo(() => {
    if (chipDays.length === 0 || !bars.length || !window0) return null
    const lastTs = bars[window0.to].time * 1000
    let pick: ChipDay | null = null
    for (const d of chipDays) {
      if (d.ts <= lastTs) pick = d
      else break
    }
    return pick ?? chipDays[0]
  }, [chipDays, bars, window0])

  const maxVol = chip ? chip.items.reduce((m, x) => Math.max(m, x.vol), 0) || 1 : 1
  const chipDate = chip ? new Date(chip.ts).toLocaleDateString('zh-CN') : ''
  const pct = (v: unknown) => (typeof v === 'number' ? `${v.toFixed(2)}%` : '—')
  const px = (v: unknown) => (typeof v === 'number' ? v.toFixed(2) : '—')

  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      <div className="flex items-center gap-1">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p)}
            className={`h-7 px-2.5 rounded text-xxs border ${
              p.key === period.key ? 'border-accent text-accent bg-accent/5' : 'border-line text-muted hover:bg-panel2'
            }`}
          >
            {p.label}
          </button>
        ))}
        <span className="ml-2 flex items-center gap-3 num text-xxs">
          {legend.map((l) => (
            <span key={l.k} className="flex items-center gap-1">
              <i className="inline-block w-2 h-2 rounded-sm" style={{ background: l.color }} />
              <span style={{ color: l.color }}>{l.k}</span>
              <span style={{ color: l.color }}>{l.v === null ? '—' : l.v.toFixed(2)}</span>
            </span>
          ))}
          {loading && <span className="text-muted">加载中</span>}
        </span>
      </div>
      {err && <div className="text-xs text-up">{err}</div>}
      <div className="grid grid-cols-[1fr_220px] gap-2 flex-1 min-h-0">
        <div ref={boxRef} className="w-full border border-line rounded" />
        <div className="border border-line rounded p-2 overflow-y-auto">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs text-ink">筹码分布 {code}</span>
            <span className="text-xxs text-muted num">{chipDate}</span>
          </div>
          {chip && (
            <div className="mb-2 space-y-0.5">
              {[
                { k: '平均成本', v: px(chip.summary.meanPrice) },
                { k: '获利比例', v: pct(chip.summary.winRatio) },
                { k: '70% 成本区间', v: `${px(chip.summary.costL70)} ~ ${px(chip.summary.costH70)}` },
                { k: '90% 成本区间', v: `${px(chip.summary.costL90)} ~ ${px(chip.summary.costH90)}` },
              ].map((r) => (
                <div key={r.k} className="flex justify-between text-xxs">
                  <span className="text-muted">{r.k}</span>
                  <span className="num text-ink">{r.v}</span>
                </div>
              ))}
            </div>
          )}
          {!chip && <div className="text-xxs text-muted">无筹码明细</div>}

          {chip?.items.map((it) => (
            <div key={it.price} className="flex items-center gap-1 text-xxs num">
              <span className="w-12 text-right text-muted">{it.price.toFixed(2)}</span>
              <div className="flex-1 h-2 bg-panel2 rounded overflow-hidden">
                <div className="h-full bg-accent/60" style={{ width: `${(it.vol / maxVol) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
