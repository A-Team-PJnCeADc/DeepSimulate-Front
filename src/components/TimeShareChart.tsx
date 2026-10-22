import { useEffect, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ColorType,
  CrosshairMode,
  LineStyle,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts'
import { api } from '../api'
import type { MinuteResp } from '../types'
import { useFeed } from '../feed'
import { price } from '../format'
import type { IPriceLine } from 'lightweight-charts'


/** 把 HH:MM 转成图表用的秒级时间戳（按 UTC 解释，图表即为交易所时钟）。 */
function toStamp(hhmm: string): number {
  const [h, m] = hhmm.split(':').map((x) => Number(x))
  const now = new Date()
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), h || 0, m || 0) / 1000
}

/** 回放时钟（HH:MM:SS）对应的分钟桶 */

function nowBucket(): { stamp: number; label: string } {
  const now = new Date()
  const cn = new Date(now.getTime() + (now.getTimezoneOffset() + 480) * 60_000)
  const h = String(cn.getHours()).padStart(2, '0')
  const m = String(cn.getMinutes()).padStart(2, '0')
  return { stamp: toStamp(`${h}:${m}`), label: `${h}:${m}` }
}

/** 交易时段判定，收盘后不再向分时图追加新点 */
function inSession(hhmm: string): boolean {
  const [h, m] = hhmm.split(':').map((x) => Number(x))
  const t = (h || 0) * 60 + (m || 0)
  return (t >= 570 && t <= 690) || (t >= 780 && t <= 900)
}

export function TimeShareChart({ code, mode = 'live' }: { code: string; mode?: 'live' | 'replay' }) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const priceRef = useRef<ISeriesApi<'Area'> | null>(null)
  const avgRef = useRef<ISeriesApi<'Line'> | null>(null)
  const volRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const lastRef = useRef<{ stamp: number; value: number } | null>(null)
  const prevCloseRef = useRef<number>(0)
  const priceLineRef = useRef<IPriceLine | null>(null)

  const { quotes } = useFeed()
  const quote = quotes[code]

  // 练手日模式：取该日回放分时；实时模式：取当日实时分时
  const { data: replayClock } = useQuery({
    queryKey: ['replay-status'],
    queryFn: () => fetch('/api/replay/status').then((r) => r.json()) as Promise<{ status: string; clock: string; date: string }>,
    refetchInterval: 2_000,
    enabled: mode === 'replay',
  })
  const { data } = useQuery({
    queryKey: ['minute', code, mode],
    queryFn: () =>
      mode === 'replay'
        ? (fetch(`/api/replay/minute/${code}`).then((r) => r.json()) as Promise<MinuteResp>)
        : api.minute(code),
    refetchInterval: mode === 'replay' ? 2_000 : 20_000,
  })

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const chart = createChart(host, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#667085',
        fontSize: 10,
      },
      grid: {
        vertLines: { color: '#eef0f3' },
        horzLines: { color: '#eef0f3' },
      },
      rightPriceScale: { borderColor: '#e4e7ec', scaleMargins: { top: 0.08, bottom: 0.26 } },
      timeScale: { borderColor: '#e4e7ec', timeVisible: true, secondsVisible: false, rightOffset: 3 },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#2563eb', width: 1, style: LineStyle.Dashed, labelBackgroundColor: '#2563eb' },
        horzLine: { color: '#2563eb', width: 1, style: LineStyle.Dashed, labelBackgroundColor: '#2563eb' },
      },
      localization: {
        priceFormatter: (v: number) => v.toFixed(2),
      },
      handleScale: { axisPressedMouseMove: false },
    })
    const area = chart.addAreaSeries({
      lineColor: '#2563eb',
      topColor: 'rgba(37,99,235,0.16)',
      bottomColor: 'rgba(37,99,235,0.01)',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: true,
    })
    const avg = chart.addLineSeries({
      color: '#d97706',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    })
    const vol = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
      lastValueVisible: false,
      priceLineVisible: false,
    })
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })

    chartRef.current = chart
    priceRef.current = area
    avgRef.current = avg
    volRef.current = vol

    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: host.clientWidth, height: host.clientHeight })
    })
    ro.observe(host)
    chart.applyOptions({ width: host.clientWidth, height: host.clientHeight })

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      priceRef.current = null
      avgRef.current = null
      volRef.current = null
      lastRef.current = null
      priceLineRef.current = null
    }
  }, [])

    // 回放模式下只画到当前回放时刻，随时钟推进逐步出现
  const points = useMemo(() => {
    const all = data?.points ?? []
    if (mode !== 'replay' || !replayClock?.clock) return all
    const cutoff = replayClock.clock.slice(0, 5)
    return all.filter((p) => p.time <= cutoff)
  }, [data, mode, replayClock?.clock])

  useEffect(() => {
    const area = priceRef.current
    const avg = avgRef.current
    const vol = volRef.current
    if (!area || !avg || !vol) return
    prevCloseRef.current = data?.prev_close ?? 0
    lastRef.current = null

    const priceData = points.map((p) => ({ time: toStamp(p.time) as UTCTimestamp, value: p.price / 1000 }))
    const avgData = points.map((p) => ({ time: toStamp(p.time) as UTCTimestamp, value: p.avg / 1000 }))
    const volData = points.map((p, i) => {
      const prev = i > 0 ? points[i - 1].price : data?.prev_close ?? p.price
      return {
        time: toStamp(p.time) as UTCTimestamp,
        value: p.volume / 100,
        color: p.price >= prev ? 'rgba(229,52,43,0.45)' : 'rgba(14,159,110,0.45)',
      }
    })
    area.setData(priceData)
    avg.setData(avgData)
    vol.setData(volData)
    if (points.length > 0) {
      const last = points[points.length - 1]
      lastRef.current = { stamp: toStamp(last.time), value: last.price / 1000 }
    }
    if (priceLineRef.current) {
      area.removePriceLine(priceLineRef.current)
      priceLineRef.current = null
    }
    if (prevCloseRef.current > 0) {
      priceLineRef.current = area.createPriceLine({
        price: prevCloseRef.current / 1000,
        color: '#98a2b3',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: '昨收',
      })
    }
    chartRef.current?.timeScale().fitContent()
  }, [points, data?.prev_close])

  // 实时价格：同一分钟内更新末点，跨分钟则追加
  useEffect(() => {
    const area = priceRef.current
    if (!area || !quote || quote.last <= 0) return
    const bucket = nowBucket()
    const value = quote.last / 1000
    const last = lastRef.current
    if (last && bucket.stamp <= last.stamp) {
      area.update({ time: last.stamp as UTCTimestamp, value })
      lastRef.current = { stamp: last.stamp, value }
    } else if (points.length > 0 && inSession(bucket.label)) {
      area.update({ time: bucket.stamp as UTCTimestamp, value })
      lastRef.current = { stamp: bucket.stamp, value }
    } else if (last) {
      area.update({ time: last.stamp as UTCTimestamp, value })
      lastRef.current = { stamp: last.stamp, value }
    }
  }, [quote?.last, quote?.ts, points.length])

  return (
    <div className="panel flex flex-col min-h-0 h-full">
      <div className="panel-title">
        <span>分时</span>
        <div className="flex items-center gap-3 text-xxs">
          <span className="flex items-center gap-1">
            <i className="inline-block w-3 h-[2px] bg-accent" />价格
          </span>
          <span className="flex items-center gap-1">
            <i className="inline-block w-3 h-[2px] bg-[#d97706]" />均价
          </span>
          <span className="num">{quote ? price(quote.last) : '--'}</span>
        </div>
      </div>
      <div ref={hostRef} className="flex-1 min-h-[220px]" />
    </div>
  )
}
