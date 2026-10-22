import { useEffect, useRef, useState } from 'react'
import { useFeed } from '../feed'
import { useApp } from '../store'
import type { Quote, Tick } from '../types'
import { cx, money, price, shares, toneOf } from '../format'
import { QuoteHeader } from '../components/QuoteHeader'
import { OrderBook } from '../components/OrderBook'
import { TickList } from '../components/TickList'
import { useD101AsQuote, useLiveQuote, useLiveTicks } from '../live'
import { TimeShareChart } from '../components/TimeShareChart'
import { TradePanel, type SellIntent } from '../components/TradePanel'
import { Watchlist } from '../components/Watchlist'

interface Props {
  fillPrice: number | null
  onFillConsumed: () => void
  sellIntent: SellIntent | null
  onSellConsumed: () => void
  onPickPrice: (p: number) => void
  onOpenAccount: () => void
}

export function MarketPage({ fillPrice, onFillConsumed, sellIntent, onSellConsumed, onPickPrice, onOpenAccount }: Props) {
  const { quotes, ticks, seed } = useFeed()
  const { selected, account, orders } = useApp()
  const authToken = sessionStorage.getItem('deepsim.token')
  const setPracticeMode = useApp((st) => st.setPracticeMode)
  const { quote: liveQuote, closing } = useLiveQuote(selected)
  const d101Quote = useD101AsQuote(selected)
  // 练手日期≠今天时，抑制实时区块（实时条/盘口/逐笔），避免出现"未来的数据"
  const [practice, setPractice] = useState<{ start: string; today: string; initial?: string; clock?: string } | null>(null)
  useEffect(() => {
    let stop = false
    const load = () => {
      Promise.all([
        fetch('/api/me/settings', {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        }).then((r) => (r.ok ? r.json() : null)),
        fetch('/api/clock').then((r) => (r.ok ? r.json() : null)),
      ])
        .then(([st, ck]: [
          { start_date?: string; initial_date?: string; practice_clock?: string } | null,
          { today?: string } | null,
        ]) => {
          if (stop) return
          // 拿不到设置就保持 null（当作今天），但不再静默吞掉：控制台留痕
          if (!st) {
            console.warn('[practice] 读取设置失败，按实时模式处理')
            return
          }
          setPractice({
            start: st.start_date ?? '',
            today: ck?.today ?? '',
            initial: st.initial_date ?? '',
            clock: st.practice_clock ?? '09:15:00',
          })
        })
        .catch((e) => console.warn('[practice] 读取设置异常', e))
    }
    load()
    const t = window.setInterval(load, 30_000)
    return () => {
      stop = true
      window.clearInterval(t)
    }
  }, [authToken])
  const isPracticeToday = !practice || !practice.start || practice.start === practice.today
  useEffect(() => {
    setPracticeMode(Boolean(practice?.start && practice.start !== practice.today))
  }, [practice?.start, practice?.today, setPracticeMode])

  // 刷新/重开后自动续播：把回放引擎推到服务端保存的那一刻
  const resumed = useRef(false)
  useEffect(() => {
    if (resumed.current) return
    if (!practice?.start || practice.start === practice.today) return
    resumed.current = true
    const target = practice.clock && practice.clock.length === 8 ? practice.clock : '09:15:00'
    fetch('/api/replay/status')
      .then((r) => r.json())
      .then(async (st: { status?: string; date?: string; clock?: string }) => {
        const running = ['running', 'paused', 'loading', 'importing'].includes(st.status ?? '')
        const sameDay = st.date === practice.start
        const ahead = (st.clock ?? '') >= target
        if (running && sameDay && ahead) return
        await fetch('/api/replay/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: practice.start, clock: target, speed: 20 }),
        }).catch(() => void 0)
      })
      .catch(() => void 0)
  }, [practice?.start, practice?.today, practice?.clock])
  // 当日 15:00 前视为未收盘
  const sessionClosed = (() => {
    const d = new Date()
    return d.getHours() * 60 + d.getMinutes() >= 15 * 60
  })()
  // 练手日不是今天：改用回放日（D5 归档）的盘口与逐笔
  const [rpClock, setRpClock] = useState('')
  const [histQuote, setHistQuote] = useState<Quote | null>(null)
  const [histTicks, setHistTicks] = useState<Tick[]>([])
  useEffect(() => {
    if (isPracticeToday || !practice?.start) {
      setHistQuote(null)
      setHistTicks([])
      return
    }
    // 跟着回放时钟走：盘口/逐笔都截到当前时刻
    const tick = () =>
      fetch('/api/replay/status')
        .then((r) => r.json())
        .then((d: { clock?: string }) => setRpClock(d?.clock ?? ''))
        .catch(() => void 0)
    void tick()
    const timer = window.setInterval(tick, 2000)
    // 分时进度落库：刷新/重开后从这一刻续播
    const token = sessionStorage.getItem('deepsim.token')
    const saveClock = window.setInterval(() => {
      const c = rpClock
      if (!c || c.length !== 8) return
      void fetch('/api/me/practice/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ clock: c }),
      }).catch(() => void 0)
    }, 10_000)

    let stop = false
    // 自选股整列切到练手日价格：批量拉一次，写回 feed 的行情表
    const codes = (useApp.getState().watchlist ?? []).map((w) => w.code)
    if (codes.length > 0) {
      fetch(`/api/replay/quotes?date=${practice.start}&until=${rpClock}&codes=${codes.join(',')}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (stop || !d?.quotes) return
          const list = Object.values(d.quotes as Record<string, { code: string; last: number; prev_close: number }>).map(
            (q) =>
              ({
                ...(quotes[q.code] ?? {
                  code: q.code,
                  name: q.code,
                  last: 0,
                  prev_close: 0,
                  open: 0,
                  high: 0,
                  low: 0,
                  total_hand: 0,
                  amount: 0,
                  limit_up: 0,
                  limit_down: 0,
                  is_st: false,
                  bids: [],
                  asks: [],
                }),
                code: q.code,
                last: q.last,
                prev_close: q.prev_close,
              }) as Quote,
          )
          if (list.length > 0) seed(list)
        })
        .catch(() => void 0)
    }
    fetch(`/api/replay/quote/${selected}?date=${practice.start}&until=${rpClock}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => !stop && d && setHistQuote(d as Quote))
      .catch(() => void 0)
    fetch(`/api/replay/ticks/${selected}?date=${practice.start}&until=${rpClock}&limit=2000`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => !stop && d && setHistTicks((d.ticks ?? []) as Tick[]))
      .catch(() => void 0)
    return () => {
      stop = true
      window.clearInterval(timer)
      window.clearInterval(saveClock)
    }
  }, [selected, isPracticeToday, practice?.start, rpClock])
  // 涨跌停价：行情源没给就按昨收算（普通 ±10%，ST ±5%），按 0.01 元取整
  const withLimits = (q: typeof quote) => {
    if (!q) return q
    if (q.limit_up > 0 && q.limit_down > 0) return q
    const base = q.prev_close > 0 ? q.prev_close : q.last
    if (base <= 0) return q
    const pct = q.is_st ? 0.05 : 0.1
    const round10 = (v: number) => Math.round(v / 10) * 10
    return { ...q, limit_up: round10(base * (1 + pct)), limit_down: round10(base * (1 - pct)) }
  }
  const { ticks: liveTicks } = useLiveTicks(selected)
  const quote = quotes[selected]
  const position = account?.positions.find((p) => p.code === selected)
  const activeOrders = Object.values(orders)
    .filter((o) => o.code === selected && (o.status === 'pending' || o.status === 'partial'))
    .sort((a, b) => b.created_at - a.created_at)
    .slice(0, 4)

  return (
    <div className="h-full flex gap-2 p-2">
      <div className="w-[250px] shrink-0 min-h-0 h-full">
        <Watchlist />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-2 min-h-0">
        <QuoteHeader quote={withLimits(isPracticeToday ? liveQuote ?? quote : histQuote ?? quote)} />
        {!isPracticeToday && (
          <div className="flex items-center gap-2 px-1 text-xxs">
            <span className="text-muted">
              初始 {practice?.initial || practice?.start} · 当前 {practice?.start} · 回放至 {rpClock || practice?.clock || '09:15:00'}
            </span>
            {/* 倍速：驱动回放/推进节奏 */}
            {[1, 5, 20, 60].map((v) => (
              <button
                key={v}
                onClick={() => void fetch('/api/replay/control', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ speed: v }),
                })}
                className="h-6 px-2 rounded border border-line text-muted hover:bg-panel2"
              >
                {v}x
              </button>
            ))}
            <button
              className="h-6 px-2 rounded border border-line text-muted hover:bg-panel2"
              onClick={() => void fetch('/api/replay/control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ speed: 1 }),
              })}
            >
              恢复原来的速度
            </button>
            <button
              className="h-6 px-2 rounded text-white disabled:opacity-50"
              style={{ background: '#d93025' }}
              title={
                practice?.start === practice?.today && !sessionClosed
                  ? '今日尚未收盘，分时还在走，收盘后才能前往下一天'
                  : undefined
              }
              disabled={Boolean(practice?.start === practice?.today && !sessionClosed)}
              onClick={async () => {
                const token = sessionStorage.getItem('deepsim.token')
                const r = await fetch('/api/me/practice/next', {
                  method: 'POST',
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                }).then((x) => (x.ok ? x.json() : null))
                if (r?.start_date) {
                  // 新的一天从集合竞价开始跑，分时图会随时钟逐分钟出现
                  await fetch('/api/replay/start', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date: r.start_date, clock: '09:25:00', speed: 1 }),
                  }).catch(() => void 0)
                  location.reload()
                }
              }}
            >
              前往下一天
            </button>
          </div>
        )}
        {liveQuote && isPracticeToday && (
          <div className="px-1 text-xxs text-muted">
            实时{closing ? ' · 已收盘' : ''} · 逐笔 {liveTicks.length} 笔 · 盘口五档推送（撤单按成交估算）
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-hidden">
          <TimeShareChart code={selected} mode={isPracticeToday ? 'live' : 'replay'} />
        </div>
        <div className="h-[348px] shrink-0 grid grid-cols-2 gap-2 min-h-0">
          <OrderBook quote={isPracticeToday ? d101Quote ?? liveQuote ?? quote : histQuote ?? quote} onPick={onPickPrice} />
          <TickList ticks={isPracticeToday ? (liveTicks.length > 0 ? liveTicks : ticks[selected] ?? []) : histTicks} />
        </div>
      </div>

      <div className="w-[366px] shrink-0 flex flex-col gap-2 min-h-0 h-full">
        <TradePanel
          fillPrice={fillPrice}
          onFillConsumed={onFillConsumed}
          sellIntent={sellIntent}
          onSellConsumed={onSellConsumed}
        />

        <div className="panel flex flex-col min-h-0 flex-1">
          <div className="panel-title">
            <span>{quote?.name ?? selected} · 本股</span>
            <button className="text-xxs text-accent hover:underline" onClick={onOpenAccount}>
              账户明细
            </button>
          </div>
          <div className="p-3 grid grid-cols-3 gap-2 border-b border-line">
            <Cell label="持仓" value={position ? shares(position.total) : '0'} />
            <Cell label="可卖" value={position ? shares(position.available) : '0'} />
            <Cell label="成本" value={position ? price(position.cost) : '--'} />
            <Cell
              label="市值"
              value={position ? money(position.market_value) : '0.00'}
            />
            <Cell
              label="盈亏"
              value={position ? money(position.pnl) : '0.00'}
              tone={position ? toneOf(position.pnl) : undefined}
            />
            <Cell
              label="盈亏率"
              value={position ? `${position.pnl_pct > 0 ? '+' : ''}${position.pnl_pct.toFixed(2)}%` : '--'}
              tone={position ? toneOf(position.pnl) : undefined}
            />
          </div>
          <div className="flex-1 overflow-auto">
            <div className="px-3 h-7 flex items-center text-xxs text-muted">本股未完成委托</div>
            {activeOrders.length === 0 && (
              <div className="px-3 pb-3 text-xxs text-muted">暂无未完成委托</div>
            )}
            {activeOrders.map((o) => (
              <div key={o.id} className="px-3 h-7 flex items-center justify-between text-xxs border-t border-line/70">
                <span className={cx(o.side === 'buy' ? 'text-up' : 'text-down')}>
                  {o.side === 'buy' ? '买' : '卖'} {price(o.price)}
                </span>
                <span className="num text-muted">
                  {shares(o.filled)}/{shares(o.qty)}
                </span>
                <span className="num text-muted">
                  {o.queue_ahead > 0 ? `前方 ${shares(o.queue_ahead)}` : '等待成交'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Cell({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <div className="text-xxs text-muted">{label}</div>
      <div className={cx('num text-xs mt-0.5', tone ?? 'text-ink')}>{value}</div>
    </div>
  )
}
