import { useEffect, useMemo, useRef, useState } from 'react'
import { ColorType, createChart, type IChartApi, type LineData } from 'lightweight-charts'
import { getToken } from '../api'

type Point = { time: string; price: number; volume: number; avg: number }

const PERIODS = [
  { key: 1, label: '1分' },
  { key: 5, label: '5分' },
  { key: 15, label: '15分' },
  { key: 30, label: '30分' },
  { key: 60, label: '60分' },
]

/** 回放分时/K线：数据来自回放日快照 */
export function ReplayChart({ code }: { code: string }) {
  const [points, setPoints] = useState<Point[]>([])
  const [period, setPeriod] = useState(1)
  const [err, setErr] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')
  const boxRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const token = getToken()
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
        const [rp, mn] = await Promise.all([
          fetch('/api/replay/status', { headers }).then((r) => r.json()),
          fetch(`/api/replay/minute/${code}`, { headers }).then((r) => r.json()),
        ])
        if (cancelled) return
        setStatus(rp?.date ? `${rp.date} ${rp.clock ?? ''} ${rp.status ?? ''}`.trim() : '未开始回放')
        const list = (mn?.points ?? []) as Point[]
        setPoints(list)
        setErr(list.length === 0 ? '当前回放日没有该标的的数据（可在回放条里导入）' : null)
      } catch (e) {
        if (!cancelled) setErr((e as Error).message)
      }
    }
    void load()
    const timer = window.setInterval(load, 3000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [code])

  // 按周期聚合成蜡烛
  const bars = useMemo(() => {
    if (points.length === 0) return []
    const out: { time: number; open: number; high: number; low: number; close: number; volume: number }[] = []
    let bucket: typeof out[number] | null = null
    let bucketKey = ''
    for (const p of points) {
      const [h, m] = p.time.split(':').map(Number)
      const total = h * 60 + m
      const key = String(Math.floor(total / period))
      const sec = Math.floor(new Date().setHours(h, m, 0, 0) / 1000)
      if (!bucket || key !== bucketKey) {
        if (bucket) out.push(bucket)
        bucket = { time: sec, open: p.price, high: p.price, low: p.price, close: p.price, volume: p.volume }
        bucketKey = key
      } else {
        bucket.high = Math.max(bucket.high, p.price)
        bucket.low = Math.min(bucket.low, p.price)
        bucket.close = p.price
        bucket.volume += p.volume
      }
    }
    if (bucket) out.push(bucket)
    return out
  }, [points, period])

  useEffect(() => {
    const box = boxRef.current
    if (!box || bars.length === 0) return
    const chart = createChart(box, {
      height: Math.max(320, window.innerHeight - 340),
      layout: { background: { type: ColorType.Solid, color: '#ffffff' }, textColor: '#4b5563', fontSize: 11 },
      grid: { vertLines: { color: '#f1f3f5' }, horzLines: { color: '#f1f3f5' } },
      rightPriceScale: { borderColor: '#e5e7eb' },
      timeScale: { borderColor: '#e5e7eb', timeVisible: true, secondsVisible: false },
    })
    chartRef.current = chart
    const candle = chart.addCandlestickSeries({
      upColor: '#e0403f', downColor: '#12a35a',
      borderUpColor: '#e0403f', borderDownColor: '#12a35a',
      wickUpColor: '#e0403f', wickDownColor: '#12a35a',
    })
    candle.setData(bars.map((b) => ({ time: b.time as never, open: b.open, high: b.high, low: b.low, close: b.close })))
    const vol = chart.addHistogramSeries({ priceScaleId: 'vol', priceFormat: { type: 'volume' }, color: '#c9ced6' })
    vol.setData(bars.map((b) => ({ time: b.time as never, value: b.volume, color: b.close >= b.open ? 'rgba(224,64,63,0.4)' : 'rgba(18,163,90,0.4)' })))
    chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } })

    // 均价线：直接用回放快照里的累计均价
    const avg: LineData[] = points
      .map((p) => {
        const [h, m] = p.time.split(':').map(Number)
        return { time: Math.floor(new Date().setHours(h, m, 0, 0) / 1000) as never, value: p.price }
      })
    const avgSeries = chart.addLineSeries({ color: '#0f9ba8', lineWidth: 2, priceLineVisible: false, title: '价格' })
    avgSeries.setData(avg)
    const vwap = chart.addLineSeries({ color: '#d98324', lineWidth: 1, priceLineVisible: false, title: '均价' })
    vwap.setData(
      points.map((p) => {
        const [h, m] = p.time.split(':').map(Number)
        return { time: Math.floor(new Date().setHours(h, m, 0, 0) / 1000) as never, value: p.avg }
      }),
    )
    chart.timeScale().fitContent()
    const ro = new ResizeObserver(() => chart.applyOptions({ width: box.clientWidth }))
    ro.observe(box)
    chart.applyOptions({ width: box.clientWidth })
    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
    }
  }, [bars, points])

  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      <div className="flex items-center gap-1">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`h-7 px-2.5 rounded text-xxs border ${
              p.key === period ? 'border-accent text-accent bg-accent/5' : 'border-line text-muted hover:bg-panel2'
            }`}
          >
            {p.label}
          </button>
        ))}
        <span className="ml-2 text-xxs text-muted">
          数据源：回放快照（QuestDB）· {points.length} 个分钟点 · {status}
        </span>
      </div>
      {err && <div className="text-xs text-up">{err}</div>}
      <div ref={boxRef} className="w-full border border-line rounded flex-1" />
    </div>
  )
}
