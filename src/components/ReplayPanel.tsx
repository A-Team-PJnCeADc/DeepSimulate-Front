import { useEffect, useMemo, useRef, useState } from 'react'
import { ColorType, createChart, type IChartApi } from 'lightweight-charts'
import { getToken } from '../api'
import { useFeed } from '../feed'
import { ReplayBar } from './ReplayBar'

type Point = { time: string; price: number; volume: number; avg: number }

const SESSION_START = 9 * 60 + 15 // 集合竞价 09:15 开始
const SESSION_END = 15 * 60 // 尾盘 15:00 // 09:25 集合竞价出结果

const clockToMin = (clock: string): number => {
  const [h, m] = clock.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

/** 回放：控制条 + 全天分时（集合竞价→尾盘）+ 实时盘口 */
export function ReplayPanel({ code }: { code: string }) {
  const feed = useFeed() as unknown as {
    replay?: Record<string, { bids: { price: number; volume: number }[]; asks: { price: number; volume: number }[]; last: number; prev_close: number }>
  }
  const quotes = feed.replay ?? {}
  const [points, setPoints] = useState<Point[]>([])
  const [clock, setClock] = useState('09:25:00')
  const [date, setDate] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const token = getToken()
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
      try {
        const [st, mn] = await Promise.all([
          fetch('/api/replay/status', { headers }).then((r) => r.json()),
          fetch(`/api/replay/minute/${code}`, { headers }).then((r) => r.json()),
        ])
        if (cancelled) return
        setDate(st?.date ?? '')
        setClock(st?.clock ?? '09:25:00')
        const list = (mn?.points ?? []) as Point[]
        setPoints(list)
        setErr(list.length === 0 ? (st?.error as string) || `回放日 ${st?.date ?? '-'} 没有 ${code} 的数据` : null)
      } catch (e) {
        if (!cancelled) setErr((e as Error).message)
      }
    }
    void load()
    const t = window.setInterval(load, 2500)
    return () => {
      cancelled = true
      window.clearInterval(t)
    }
  }, [code])

  // 只画到当前回放时刻，后面留白（不预告未来）
  const visible = useMemo(() => {
    const limit = clockToMin(clock)
    return points.filter((p) => clockToMin(p.time) <= Math.max(limit, SESSION_START))
  }, [points, clock])

  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const chart = createChart(box, {
      height: Math.max(300, window.innerHeight - 430),
      layout: { background: { type: ColorType.Solid, color: '#ffffff' }, textColor: '#4b5563', fontSize: 11 },
      grid: { vertLines: { color: '#f1f3f5' }, horzLines: { color: '#f1f3f5' } },
      rightPriceScale: { borderColor: '#e5e7eb', scaleMargins: { top: 0.08, bottom: 0.26 } },
      timeScale: {
        borderColor: '#e5e7eb',
        timeVisible: true,
        secondsVisible: false,
      },
    })
    chartRef.current = chart

    const price = chart.addLineSeries({ color: '#2f6fdb', lineWidth: 2, priceLineVisible: false, title: '价格' })
    price.setData(visible.map((p) => ({ time: Math.floor(new Date().setHours(...(p.time.split(':').map(Number) as [number, number])) / 1000) as never, value: p.price })))
    const avg = chart.addLineSeries({ color: '#d98324', lineWidth: 1, priceLineVisible: false, title: '均价' })
    avg.setData(visible.map((p) => ({ time: Math.floor(new Date().setHours(...(p.time.split(':').map(Number) as [number, number])) / 1000) as never, value: p.avg })))
    const vol = chart.addHistogramSeries({ priceScaleId: 'vol', priceFormat: { type: 'volume' }, color: '#c9ced6' })
    vol.setData(
      visible.map((p) => ({
        time: Math.floor(new Date().setHours(...(p.time.split(':').map(Number) as [number, number])) / 1000) as never,
        value: p.volume,
        color: p.price >= p.avg ? 'rgba(224,64,63,0.4)' : 'rgba(18,163,90,0.4)',
      })),
    )
    chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.76, bottom: 0 } })

    // x 轴固定为当日 09:15 ~ 15:00：用逻辑区间把首尾留白，数据不足也铺满全天
    if (visible.length > 0) {
      const firstMin = clockToMin(visible[0].time)
      const lastMin = clockToMin(visible[visible.length - 1].time)
      const bars = visible.length
      const from = -(firstMin - SESSION_START)
      const to = bars - 1 + (SESSION_END - lastMin)
      chart.timeScale().setVisibleLogicalRange({ from, to })
    }
    ;(window as unknown as { __replayChart?: IChartApi }).__replayChart = chart

    const ro = new ResizeObserver(() => chart.applyOptions({ width: box.clientWidth }))
    ro.observe(box)
    chart.applyOptions({ width: box.clientWidth })
    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
    }
  }, [visible, date])

  const q = quotes[code]
  const rows = (side: 'ask' | 'bid') =>
    [5, 4, 3, 2, 1].map((i) => {
      const lv = side === 'ask' ? q?.asks?.[i - 1] : q?.bids?.[i - 1]
      return (
        <div key={`${side}${i}`} className="grid grid-cols-[26px_1fr_1fr] gap-2 px-2 py-[3px] text-xxs num">
          <span className="text-muted">{side === 'ask' ? '卖' : '买'}{i}</span>
          <span className={side === 'ask' ? 'text-down text-right' : 'text-up text-right'}>
            {lv?.price ? (lv.price / 1000).toFixed(2) : '—'}
          </span>
          <span className="text-ink text-right">{lv?.volume ? lv.volume.toLocaleString('zh-CN') : '—'}</span>
        </div>
      )
    })

  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      <ReplayBar />
      <div className="flex items-center gap-3 px-1 text-xxs text-muted">
        <span>{date} · 回放到 {clock}</span>
        <span>分时：集合竞价 09:15 → 尾盘 15:00（只画到当前回放时刻）</span>
        {err && <span className="text-up">{err}</span>}
      </div>
      <div className="grid grid-cols-[1fr_210px] gap-2 flex-1 min-h-0">
        <div ref={boxRef} className="w-full border border-line rounded" />
        <div className="border border-line rounded overflow-y-auto py-1">
          <div className="flex items-center justify-between px-2 pb-1">
            <span className="text-xs text-ink">盘口</span>
            <span className="text-xxs num text-muted">{q ? (q.last / 1000).toFixed(2) : '—'}</span>
          </div>
          {rows('ask')}
          <div className="border-t border-line/60 my-1" />
          {rows('bid')}
          <div className="px-2 pt-1 text-xxs text-muted">
            {q ? `昨收 ${(q.prev_close / 1000).toFixed(2)}` : '等待回放行情推送…'}
          </div>
        </div>
      </div>
    </div>
  )
}
