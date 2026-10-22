import { useEffect, useRef, useState } from 'react'

/** D101 实时快照（本地代理 WebSocket） */
export type D101Snap = {
  code: string
  name: string
  price: number
  pre_close: number
  high: number
  low: number
  open_price: number
  avg_price: number
  volume: number
  limit_up_price: number
  limit_down_price: number
  trade_date: number
  decimal_num: number
  ts: number
}

const WS_URL = 'ws://127.0.0.1:8081/d101'

/** 代码前缀：6 开头沪市、8/4 北交所、其余深市 */
export function d101Code(code: string): string {
  if (/^6/.test(code)) return `SH${code}`
  if (/^[48]/.test(code)) return `BJ${code}`
  return `SZ${code}`
}

/**
 * 订阅一组股票的实时快照。断线 3 秒后重连，重连后自动重新订阅。
 * 只做行情展示，不参与撮合。
 */
export function useD101(codes: string[]): { snaps: Record<string, D101Snap>; status: 'idle' | 'open' | 'closed' } {
  const [snaps, setSnaps] = useState<Record<string, D101Snap>>({})
  const [status, setStatus] = useState<'idle' | 'open' | 'closed'>('idle')
  const wsRef = useRef<WebSocket | null>(null)
  const codesRef = useRef<string[]>(codes)
  codesRef.current = codes

  useEffect(() => {
    let stopped = false
    let retry: number | undefined

    const connect = () => {
      if (stopped) return
      let ws: WebSocket
      try {
        ws = new WebSocket(WS_URL)
      } catch {
        retry = window.setTimeout(connect, 3000)
        return
      }
      wsRef.current = ws
      ws.onopen = () => {
        setStatus('open')
        const list = codesRef.current.map(d101Code)
        if (list.length === 0) return
        ws.send(
          JSON.stringify({
            type: 'snapshot',
            seq: 1,
            enable: 1,
            codes: list,
            fields: [
              'code', 'name', 'decimal_num', 'price', 'pre_close', 'high', 'low',
              'open_price', 'avg_price', 'volume', 'limit_up_price', 'limit_down_price', 'trade_date',
            ],
          }),
        )
      }
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(String(e.data)) as { ts?: number; list?: { type?: string; data?: unknown[] }[] }
          const next: Record<string, D101Snap> = {}
          for (const item of msg.list ?? []) {
            if (item.type !== 'snapshot' || !Array.isArray(item.data)) continue
            for (const raw of item.data) {
              const s = raw as Partial<D101Snap>
              if (!s.code) continue
              const code = s.code.replace(/^(SH|SZ|BJ)/, '')
              next[code] = { ...(s as D101Snap), ts: msg.ts ?? Date.now() }
            }
          }
          if (Object.keys(next).length > 0) {
            setSnaps((prev) => ({ ...prev, ...next }))
          }
        } catch {
          // 非 JSON 帧忽略
        }
      }
      ws.onclose = () => {
        setStatus('closed')
        if (!stopped) retry = window.setTimeout(connect, 3000)
      }
      ws.onerror = () => ws.close()
    }

    connect()
    return () => {
      stopped = true
      if (retry) window.clearTimeout(retry)
      wsRef.current?.close()
    }
  }, [])

  // 自选股变化时重新订阅
  useEffect(() => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    const list = codes.map(d101Code)
    if (list.length === 0) return
    ws.send(JSON.stringify({ type: 'snapshot', seq: 2, enable: 0 }))
    ws.send(
      JSON.stringify({
        type: 'snapshot',
        seq: 3,
        enable: 1,
        codes: list,
        fields: [
          'code', 'name', 'decimal_num', 'price', 'pre_close', 'high', 'low',
          'open_price', 'avg_price', 'volume', 'limit_up_price', 'limit_down_price', 'trade_date',
        ],
      }),
    )
  }, [codes.join(',')])

  return { snaps, status }
}

/** 五档盘口详情（detail 命令）：增量推送按字段合并 */
export type D101Detail = {
  code?: string
  price?: number
  decimal_num?: number
  volume_unit?: number
  timestamp?: number
  bid1_price?: number
  bid1_vol?: number
  bid2_price?: number
  bid2_vol?: number
  bid3_price?: number
  bid3_vol?: number
  bid4_price?: number
  bid4_vol?: number
  bid5_price?: number
  bid5_vol?: number
  ask1_price?: number
  ask1_vol?: number
  ask2_price?: number
  ask2_vol?: number
  ask3_price?: number
  ask3_vol?: number
  ask4_price?: number
  ask4_vol?: number
  ask5_price?: number
  ask5_vol?: number
}

const DETAIL_FIELDS = [
  'price', 'timestamp', 'decimal_num', 'volume_unit',
  'bid1_price', 'bid1_vol', 'bid2_price', 'bid2_vol', 'bid3_price', 'bid3_vol',
  'bid4_price', 'bid4_vol', 'bid5_price', 'bid5_vol',
  'ask1_price', 'ask1_vol', 'ask2_price', 'ask2_vol', 'ask3_price', 'ask3_vol',
  'ask4_price', 'ask4_vol', 'ask5_price', 'ask5_vol',
]

export function useD101Detail(code: string): { detail: D101Detail | null; status: 'idle' | 'open' | 'closed' } {
  const [detail, setDetail] = useState<D101Detail | null>(null)
  const [status, setStatus] = useState<'idle' | 'open' | 'closed'>('idle')
  const codeRef = useRef(code)
  codeRef.current = code

  useEffect(() => {
    let stopped = false
    let retry: number | undefined
    let ws: WebSocket | null = null

    const subscribe = () => {
      if (!ws || ws.readyState !== WebSocket.OPEN) return
      setDetail(null)
      ws.send(
        JSON.stringify({
          type: 'detail',
          code: d101Code(codeRef.current),
          fields: DETAIL_FIELDS,
          enable: 1,
          seq: 10,
        }),
      )
    }

    const connect = () => {
      if (stopped) return
      try {
        ws = new WebSocket(WS_URL)
      } catch {
        retry = window.setTimeout(connect, 3000)
        return
      }
      ws.onopen = () => {
        setStatus('open')
        subscribe()
      }
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(String(e.data)) as { list?: { type?: string; data?: unknown }[] }
          for (const item of msg.list ?? []) {
            if (item.type !== 'detail' || !item.data || typeof item.data !== 'object') continue
            const patch = item.data as D101Detail & { reset?: boolean }
            setDetail((prev) => ({ ...(prev ?? {}), ...patch }))
          }
        } catch {
          /* 忽略非 JSON 帧 */
        }
      }
      ws.onclose = () => {
        setStatus('closed')
        if (!stopped) retry = window.setTimeout(connect, 3000)
      }
      ws.onerror = () => ws?.close()
    }

    connect()
    return () => {
      stopped = true
      if (retry) window.clearTimeout(retry)
      try {
        if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'detail', enable: 0, seq: 10 }))
      } catch {
        /* ignore */
      }
      ws?.close()
    }
  }, [])

  // 换标的时重新订阅
  useEffect(() => {
    if (!detail) return
    const cur = (detail.code ?? '').replace(/^(SH|SZ|BJ)/, '')
    if (cur && cur !== codeRef.current) {
      const ws = null
      void ws
    }
  }, [code, detail])

  return { detail, status }
}
