import { useEffect, useState } from 'react'
import type { Quote, Tick } from './types'
import { useD101Detail } from './d101'

/** tdx-api 原始结构（价格厘，挂单量手） */
type RawLevel = { Buy: boolean; Price: number; Number: number }
type RawQuote = {
  Code: string
  K: { Last: number; Open: number; High: number; Low: number; Close: number }
  TotalHand: number
  Amount: number
  BuyLevel?: RawLevel[]
  SellLevel?: RawLevel[]
}
type RawTick = { Time: string; Price: number; Volume: number; Status: number; Number: number }

const HANDS = 100

/** 手 → 股，价格保持厘 */
const lv = (l: RawLevel) => ({ price: l.Price, volume: l.Number * HANDS })

function toQuote(r: RawQuote): Quote {
  const bids = (r.BuyLevel ?? []).slice(0, 5).map(lv)
  const asks = (r.SellLevel ?? []).slice(0, 5).map(lv)
  return {
    code: r.Code,
    name: r.Code,
    last: r.K.Last,
    prev_close: r.K.Close,
    open: r.K.Open,
    high: r.K.High,
    low: r.K.Low,
    total_hand: r.TotalHand,
    amount: r.Amount,
    limit_up: 0,
    limit_down: 0,
    is_st: false,
    bids,
    asks,
  } as unknown as Quote
}

const hhmmss = (iso: string): string => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso.slice(11, 19) : d.toTimeString().slice(0, 8)
}

/** 取当日实时五档（收盘后即收盘快照） */
export function useLiveQuote(code: string, intervalMs = 3000): { quote: Quote | null; closing: boolean } {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [closing, setClosing] = useState(false)
  useEffect(() => {
    let stop = false
    const load = async () => {
      try {
        const r = await fetch(`/api/live/api/quote?code=${code}`).then((x) => x.json())
        const raw = (r?.data?.[0] ?? null) as RawQuote | null
        if (!raw || stop) return
        setQuote(toQuote(raw))
        // 收盘判定：本地时间超过 15:00
        const now = new Date()
        const mins = now.getHours() * 60 + now.getMinutes()
        setClosing(mins >= 15 * 60 || mins < 9 * 60 + 15)
      } catch {
        /* 行情源暂时不可用则保留上一帧 */
      }
    }
    void load()
    const t = window.setInterval(load, intervalMs)
    return () => {
      stop = true
      window.clearInterval(t)
    }
  }, [code, intervalMs])
  return { quote, closing }
}

/**
 * 全天逐笔：/api/trade 一次最多 1800 笔，再用 /api/trade-history 分页补齐。
 * 返回按时间倒序（最新在前）的数组。
 */
export function useLiveTicks(code: string, intervalMs = 15000): { ticks: Tick[]; total: number } {
  const [ticks, setTicks] = useState<Tick[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    let stop = false
    const map = (list: RawTick[]): Tick[] =>
      list.map((x) => ({
        time: hhmmss(x.Time),
        price: x.Price,
        volume: x.Volume,
        side: x.Status === 0 ? 'buy' : 'sell',
        number: x.Number,
      })) as unknown as Tick[]

    const load = async () => {
      const all: Tick[] = []
      try {
        const head = await fetch(`/api/live/api/trade?code=${code}`).then((r) => r.json())
        const first = (head?.data?.List ?? []) as RawTick[]
        all.push(...map(first))
        // 首屏满 1800 说明被截断，继续翻历史页（参数容错：page/size 与 PageIndex/PageSize 都试）
        let page = 1
        while (first.length >= 1800 && page <= 25) {
          const qs = new URLSearchParams({ code, page: String(page), size: '2000', PageIndex: String(page - 1), PageSize: '2000' })
          const res = await fetch(`/api/live/api/trade-history?${qs}`).then((r) => r.json()).catch(() => null)
          const list = ((res?.data?.List ?? res?.data ?? []) as RawTick[]) || []
          if (!Array.isArray(list) || list.length === 0) break
          const before = all.length
          all.push(...map(list))
          if (all.length === before) break
          page += 1
        }
        if (stop) return
        // 去重（同时间同价同量）并按时间倒序
        const seen = new Set<string>()
        const uniq = all.filter((t) => {
          const k = `${t.time}|${t.price}|${t.volume}`
          if (seen.has(k)) return false
          seen.add(k)
          return true
        })
        uniq.sort((a, b) => (a.time < b.time ? 1 : a.time > b.time ? -1 : 0))
        setTicks(uniq)
        setTotal(uniq.length)
      } catch {
        /* 忽略，保留旧数据 */
      }
    }
    void load()
    const t = window.setInterval(load, intervalMs)
    return () => {
      stop = true
      window.clearInterval(t)
    }
  }, [code, intervalMs])

  return { ticks, total }
}

/**
 * D101 detail 作为实时五档主源：推送频率远高于 tdx-api 轮询。
 * 注意：detail 只有档位量，没有逐笔委托，撤单只能靠成交估算。
 */
export function useD101AsQuote(code: string): Quote | null {
  const { detail } = useD101Detail(code)
  if (!detail || !detail.price) return null
  const d = 10 ** (detail.decimal_num ?? 2)
  const unit = detail.volume_unit ?? 100
  const lv = (p?: number, v?: number) =>
    p && v ? { price: Math.round((p / d) * 1000), volume: v * unit } : null
  const bids = [1, 2, 3, 4, 5]
    .map((i) => lv(detail[`bid${i}_price` as keyof typeof detail] as number, detail[`bid${i}_vol` as keyof typeof detail] as number))
    .filter(Boolean)
  const asks = [1, 2, 3, 4, 5]
    .map((i) => lv(detail[`ask${i}_price` as keyof typeof detail] as number, detail[`ask${i}_vol` as keyof typeof detail] as number))
    .filter(Boolean)
  if (bids.length === 0 && asks.length === 0) return null
  return {
    code,
    name: code,
    last: Math.round((detail.price / d) * 1000),
    prev_close: 0,
    open: 0,
    high: 0,
    low: 0,
    total_hand: 0,
    amount: 0,
    limit_up: 0,
    limit_down: 0,
    is_st: false,
    bids, asks,
  } as unknown as Quote
}
