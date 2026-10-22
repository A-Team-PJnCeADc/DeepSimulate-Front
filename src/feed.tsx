import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import type { ReactNode } from 'react'
import { useApp } from './store'
import type { Quote, Tick } from './types'
import { live } from './ws'

interface FeedState {
  quotes: Record<string, Quote>
  ticks: Record<string, Tick[]>
  /** 回放行情：与实时行情分开存放，互不覆盖 */
  replay: Record<string, Quote>
  /** 行情批量刷新正处于并发降级渲染中 */
  busy: boolean
  seed: (quotes: Quote[]) => void
  setTicks: (code: string, ticks: Tick[]) => void
}

const FeedCtx = createContext<FeedState | null>(null)

// 每帧最多刷新一次；行情批量窗口 100ms，rAF 保证与浏览器绘制对齐
const FLUSH_MS = 100
const TICK_KEEP = 80

function tickKey(t: Tick): string {
  return `${t.time}|${t.price}|${t.volume}|${t.side}|${t.number}`
}

/**
 * 实时行情处理中心。逐笔与五档先进缓冲区，按 150ms 批量刷新，
 * 刷新走 startTransition 降低优先级，避免高频行情阻塞下单等交互。
 */
export function FeedProvider({ children }: { children: ReactNode }) {
  const token = useApp((s) => s.token)
  const [state, setState] = useState<Record<string, Quote>>({})
  const [ticks, setTicksState] = useState<Record<string, Tick[]>>({})
  const [replay, setReplay] = useState<Record<string, Quote>>({})
  const [busy, startTransition] = useTransition()
  const pendingQuotes = useRef(new Map<string, Quote>())
  const pendingReplay = useRef(new Map<string, Quote>())
  const pendingTicks = useRef(new Map<string, Tick[]>())

  useEffect(() => {
    live.onMessage = (m) => {
      switch (m.type) {
        case 'quote':
          // 练手日模式下忽略实时行情，避免把今日价格盖到历史数据上
          if (useApp.getState().practiceMode) break
          pendingQuotes.current.set(m.data.code, m.data)
          break
        case 'rquote':
          pendingReplay.current.set(m.data.code, m.data)
          break
        case 'tick':
          pendingTicks.current.set(m.data.code, m.data.ticks)
          break
        case 'order':
          useApp.getState().upsertOrder(m.data)
          break
        case 'trade':
          useApp.getState().upsertTrade(m.data)
          break
        case 'account':
          useApp.getState().setAccount(m.data)
          break
        default:
          break
      }
    }
  }, [])

  useEffect(() => {
    let raf = 0
    let lastAt = 0
    const flush = (now: number) => {
      raf = requestAnimationFrame(flush)
      if (now - lastAt < FLUSH_MS) return
      if (pendingQuotes.current.size === 0 && pendingTicks.current.size === 0) return
      lastAt = now
      const quotes = [...pendingQuotes.current.values()]
      const tickBatches = [...pendingTicks.current.entries()]
      pendingQuotes.current.clear()
      pendingTicks.current.clear()
      startTransition(() => {
        if (quotes.length > 0) {
          setState((prev) => {
            const next = { ...prev }
            for (const q of quotes) next[q.code] = q
            return next
          })
        }
        if (tickBatches.length > 0) {
          setTicksState((prev) => {
            const next = { ...prev }
            for (const [code, list] of tickBatches) {
              const old = next[code] ?? []
              const seen = new Set(old.map(tickKey))
              const fresh: Tick[] = []
              for (let i = list.length - 1; i >= 0; i -= 1) {
                const t = list[i]
                const key = tickKey(t)
                if (!seen.has(key)) {
                  seen.add(key)
                  fresh.push(t)
                }
              }
              next[code] = [...fresh, ...old].slice(0, TICK_KEEP)
            }
            return next
          })
        }
      })
    }
    raf = requestAnimationFrame(flush)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (token) live.connect(token)
    else live.stop()
  }, [token])

  const seed = useCallback((quotes: Quote[]) => {
    setState((prev) => {
      const next = { ...prev }
      for (const q of quotes) next[q.code] = q
      return next
    })
  }, [])

  // 帧提交：回放行情单独提交，不影响实时行情
  useEffect(() => {
    let raf = 0
    const loop = () => {
      if (pendingReplay.current.size > 0) {
        const batch = new Map(pendingReplay.current)
        pendingReplay.current.clear()
        startTransition(() => {
          setReplay((prev) => {
            const next = { ...prev }
            batch.forEach((q, code) => {
              next[code] = q
            })
            return next
          })
        })
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const setTicks = useCallback((code: string, list: Tick[]) => {
    setTicksState((prev) => ({ ...prev, [code]: list.slice(0, TICK_KEEP) }))
  }, [])

  const value = useMemo<FeedState>(
    () => ({ quotes: state, ticks, busy, seed, setTicks, replay }),
    [state, ticks, busy, seed, setTicks, replay],
  )

  return <FeedCtx.Provider value={value}>{children}</FeedCtx.Provider>
}

export function useFeed(): FeedState {
  const ctx = useContext(FeedCtx)
  if (!ctx) throw new Error('useFeed 必须在 FeedProvider 内使用')
  return ctx
}

export function useQuote(code: string): Quote | undefined {
  return useFeed().quotes[code]
}
