import { useEffect, useRef } from 'react'
import { ColorType, createChart, type IChartApi, type ISeriesApi } from 'lightweight-charts'

export type Candle = { time: number; open: number; high: number; low: number; close: number; volume: number }

type Props = { candles: Candle[]; height?: number }

/** 日线/分钟 K 线：蜡烛 + 成交量，白底配色与分时图一致 */
export function KlineChart({ candles, height = 420 }: Props) {
  const boxRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volRef = useRef<ISeriesApi<'Histogram'> | null>(null)

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
    const candle = chart.addCandlestickSeries({
      upColor: '#e0403f',
      downColor: '#12a35a',
      borderUpColor: '#e0403f',
      borderDownColor: '#12a35a',
      wickUpColor: '#e0403f',
      wickDownColor: '#12a35a',
    })
    const vol = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'vol',
      color: '#c9ced6',
    })
    chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })
    chartRef.current = chart
    candleRef.current = candle
    volRef.current = vol

    const ro = new ResizeObserver(() => chart.applyOptions({ width: box.clientWidth }))
    ro.observe(box)
    chart.applyOptions({ width: box.clientWidth })
    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      candleRef.current = null
      volRef.current = null
    }
  }, [height])

  useEffect(() => {
    const candle = candleRef.current
    const vol = volRef.current
    if (!candle || !vol || candles.length === 0) return
    candle.setData(
      candles.map((c) => ({ time: c.time as never, open: c.open, high: c.high, low: c.low, close: c.close })),
    )
    vol.setData(
      candles.map((c) => ({
        time: c.time as never,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(224,64,63,0.45)' : 'rgba(18,163,90,0.45)',
      })),
    )
    chartRef.current?.timeScale().fitContent()
  }, [candles])

  return <div ref={boxRef} className="w-full" />
}
