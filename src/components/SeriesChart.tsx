import { useEffect, useRef } from 'react'
import { ColorType, createChart, type IChartApi, type ISeriesApi, type LineData } from 'lightweight-charts'
import { toClock, fmtCell } from '../dataview'

const COLORS = ['#2f6fdb', '#e0403f', '#12a35a', '#d98324', '#7a5cd6', '#0f9ba8']

type Props = {
  rows: Record<string, unknown>[]
  timeKey: string
  metrics: string[]
  height?: number
}

/** 通用时序折线图：一列时间 + 多个数值列，白底 */
export function SeriesChart({ rows, timeKey, metrics, height = 420 }: Props) {
  const boxRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<Map<string, ISeriesApi<'Line'>>>(new Map())

  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const chart = createChart(box, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#4b5563',
        fontSize: 11,
      },
      grid: { vertLines: { color: '#f1f3f5' }, horzLines: { color: '#f1f3f5' } },
      rightPriceScale: { borderColor: '#e5e7eb' },
      timeScale: { borderColor: '#e5e7eb', timeVisible: true, secondsVisible: false },
      crosshair: { vertLine: { color: '#c7ccd4' }, horzLine: { color: '#c7ccd4' } },
    })
    chartRef.current = chart
    seriesRef.current = new Map()

    const ro = new ResizeObserver(() => chart.applyOptions({ width: box.clientWidth }))
    ro.observe(box)
    chart.applyOptions({ width: box.clientWidth })
    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRef.current = new Map()
    }
  }, [height])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return
    // 指标集合变化时重建线；只改数据时复用
    for (const [key, series] of seriesRef.current) {
      if (!metrics.includes(key)) {
        chart.removeSeries(series)
        seriesRef.current.delete(key)
      }
    }
    metrics.forEach((m, i) => {
      let series = seriesRef.current.get(m)
      if (!series) {
        series = chart.addLineSeries({
          color: COLORS[i % COLORS.length],
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: true,
          title: m,
        })
        seriesRef.current.set(m, series)
      }
      // 同一秒出现多条时只保留最后一条：lightweight-charts 要求时间严格递增
      const byTime = new Map<number, LineData>()
      for (const r of rows) {
        const t = toClock(r[timeKey])
        const v = r[m]
        if (t === null || typeof v !== 'number' || !Number.isFinite(v)) continue
        const sec = Math.floor(t / 1000)
        byTime.set(sec, { time: sec as never, value: v })
      }
      const data = [...byTime.values()].sort((a, b) => (a.time as number) - (b.time as number))
      series.setData(data)
    })
    chart.timeScale().fitContent()
  }, [rows, timeKey, metrics])

  // 图表下方的当前值摘要，方便不看坐标也能读数
  const last = rows[rows.length - 1]
  return (
    <div className="flex flex-col gap-2">
      <div ref={boxRef} className="w-full" />
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xxs">
        {metrics.map((m, i) => (
          <span key={m} className="flex items-center gap-1.5">
            <i className="inline-block w-2 h-2 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-muted">{m}</span>
            <span className="num text-ink">{last ? fmtCell(m, last[m]) : '—'}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
