import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '../api'
import { useFeed } from '../feed'
import { cx, money, price as fmtPrice, shares } from '../format'
import { useApp } from '../store'
import type { Order } from '../types'

const QUICK = [100, 300, 500, 1000, 2000]

export interface SellIntent {
  code: string
  qty: number
  at: number
}

interface Props {
  fillPrice: number | null
  onFillConsumed: () => void
  sellIntent: SellIntent | null
  onSellConsumed: () => void
}

/** 买入按 100 股整数倍；卖出全部时允许零股 */
function normalizeQty(side: 'buy' | 'sell', qty: number, sellable: number): number {
  if (qty <= 0) return 0
  if (side === 'buy') return Math.floor(qty / 100) * 100
  if (qty % 100 !== 0 && qty === sellable) return qty
  return Math.floor(qty / 100) * 100
}

export function TradePanel({ fillPrice, onFillConsumed, sellIntent, onSellConsumed }: Props) {
  const { quotes } = useFeed()
  const { selected, account, upsertOrder } = useApp()
  const qc = useQueryClient()
  const quote = quotes[selected]
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [priceText, setPriceText] = useState('')
  const [qtyText, setQtyText] = useState('100')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const priceTouched = useRef(false)

  const position = account?.positions.find((p) => p.code === selected)
  const sellable = position?.available ?? 0
  const cash = account?.cash_available ?? 0

  // 切换标的或方向时，价格重新跟随盘口
  useEffect(() => {
    priceTouched.current = false
    setMsg(null)
  }, [selected, side])

  // 持仓页点击卖出：切到卖出、带出可卖数量与买一价
  useEffect(() => {
    if (!sellIntent) return
    setSide('sell')
    setQtyText(String(sellIntent.qty))
    const bid = quotes[sellIntent.code]?.bids[0]?.price
    if (bid) {
      priceTouched.current = true
      setPriceText((bid / 1000).toFixed(2))
    }
    setMsg(null)
    onSellConsumed()
  }, [sellIntent, quotes, onSellConsumed])

  // 点击盘口回填价格
  useEffect(() => {
    if (fillPrice && fillPrice > 0) {
      priceTouched.current = true
      setPriceText((fillPrice / 1000).toFixed(2))
      setMsg(null)
      onFillConsumed()
    }
  }, [fillPrice, onFillConsumed])

  useEffect(() => {
    if (!quote || priceTouched.current) return
    const target = side === 'buy' ? quote.asks[0]?.price : quote.bids[0]?.price
    if (target && target > 0) setPriceText((target / 1000).toFixed(2))
  }, [quote?.last, quote?.asks, quote?.bids, side, quote])

  const priceMilli = Math.round((Number.parseFloat(priceText) || 0) * 1000)
  const qty = Number.parseInt(qtyText || '0', 10) || 0

  const { data: fee } = useQuery({
    queryKey: ['fee', side, priceMilli, qty],
    queryFn: () => api.feeEstimate(side, priceMilli, qty),
    enabled: priceMilli > 0 && qty > 0,
    staleTime: 5_000,
  })

  const maxBuy = useMemo(() => {
    if (priceMilli <= 0) return 0
    const lots = Math.floor((cash - 5_000) / (priceMilli * 100))
    return Math.max(0, lots) * 100
  }, [cash, priceMilli])

  const submit = async () => {
    if (!quote || priceMilli <= 0 || qty <= 0) return
    setBusy(true)
    setMsg(null)
    try {
      const order: Order = await api.placeOrder({ code: selected, side, price: priceMilli, qty })
      upsertOrder(order)
      if (order.status === 'rejected') {
        setMsg({ ok: false, text: `废单：${order.reason ?? '未通过校验'}` })
      } else if (order.status === 'filled') {
        setMsg({
          ok: true,
          text: `全部成交 ${shares(order.filled)} 股，均价 ${fmtPrice(order.amount_paid / Math.max(1, order.filled))}`,
        })
      } else if (order.status === 'partial') {
        setMsg({
          ok: true,
          text: `部分成交 ${shares(order.filled)} 股，剩余 ${shares(order.qty - order.filled)} 股排队中`,
        })
      } else {
        setMsg({
          ok: true,
          text: order.queue_ahead > 0 ? `委托已报，前方排队 ${shares(order.queue_ahead)} 股` : '委托已报，等待成交',
        })
      }
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['account'] }),
        qc.invalidateQueries({ queryKey: ['orders'] }),
        qc.invalidateQueries({ queryKey: ['trades'] }),
      ])
    } catch (err) {
      setMsg({ ok: false, text: err instanceof ApiError ? err.message : '下单失败，请检查网络' })
    } finally {
      setBusy(false)
    }
  }

  const limitUp = quote?.limit_up ?? 0
  const limitDown = quote?.limit_down ?? 0
  const outOfBand = priceMilli > 0 && (priceMilli > limitUp || priceMilli < limitDown)

  return (
    <div className="panel flex flex-col shrink-0">
      <div className="panel-title">
        <span>交易</span>
        <span className="text-xxs">
          {quote?.name ?? selected} <span className="num">{selected}</span>
        </span>
      </div>
      <div className="p-3 flex flex-col gap-3">
        {!quote && (
          <div className="rounded-md border border-up/40 bg-up/5 px-2.5 py-2 text-xxs text-up leading-5">
            该股票在当前回放日没有数据，无法下单。请在顶部回放条点「导入自选池」或换一只已导入的标的。
          </div>
        )}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-md bg-panel2 border border-line">
          <button
            onClick={() => setSide('buy')}
            className={cx('h-8 rounded text-xs font-medium', side === 'buy' ? 'bg-up text-white' : 'text-muted')}
          >
            买入
          </button>
          <button
            onClick={() => setSide('sell')}
            className={cx('h-8 rounded text-xs font-medium', side === 'sell' ? 'bg-down text-white' : 'text-muted')}
          >
            卖出
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between text-xxs text-muted mb-1">
            <span>价格（元）</span>
            <span className="num">{limitDown > 0 ? `${fmtPrice(limitDown)} ~ ${fmtPrice(limitUp)}` : ''}</span>
          </div>
          <div className="flex gap-1">
            <button
              className="btn-ghost w-8 shrink-0"
              onClick={() => {
                priceTouched.current = true
                setPriceText(Math.max(0.01, (priceMilli - 10) / 1000).toFixed(2))
              }}
            >
              −
            </button>
            <input
              className={cx('field text-center text-[15px]', outOfBand && 'border-up')}
              value={priceText}
              onChange={(e) => {
                priceTouched.current = true
                setPriceText(e.target.value.replace(/[^\d.]/g, ''))
              }}
            />
            <button
              className="btn-ghost w-8 shrink-0"
              onClick={() => {
                priceTouched.current = true
                setPriceText(((priceMilli + 10) / 1000).toFixed(2))
              }}
            >
              +
            </button>
          </div>
          <div className="flex gap-1 mt-1">
            {[
              { label: '卖一', v: quote?.asks[0]?.price },
              { label: '买一', v: quote?.bids[0]?.price },
              { label: '最新', v: quote?.last },
              { label: '涨停', v: limitUp },
              { label: '跌停', v: limitDown },
            ].map((x) => (
              <button
                key={x.label}
                disabled={!x.v}
                onClick={() => {
                  priceTouched.current = true
                  if (x.v) setPriceText((x.v / 1000).toFixed(2))
                }}
                className="flex-1 h-6 text-xxs rounded bg-panel border border-line text-muted hover:text-ink hover:border-accent/50 disabled:opacity-40"
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xxs text-muted mb-1">
            <span>数量（股）</span>
            <span className="num">{side === 'buy' ? `最大可买 ${shares(maxBuy)}` : `可卖 ${shares(sellable)}`}</span>
          </div>
          <input
            className="field text-center text-[15px]"
            value={qtyText}
            onChange={(e) => setQtyText(e.target.value.replace(/[^\d]/g, ''))}
            onBlur={() => setQtyText(String(normalizeQty(side, qty, sellable)))}
          />
          {side === 'sell' && sellable === 0 && (position?.total ?? 0) > 0 && (
            <div className="text-xxs text-up mt-1">
              T+1：当日买入的 {position?.total} 股需次一交易日才能卖出
            </div>
          )}
          <div className="flex gap-1 mt-1">
            {QUICK.map((n) => (
              <button
                key={n}
                onClick={() => setQtyText(String(n))}
                className="flex-1 h-6 text-xxs rounded bg-panel border border-line text-muted hover:text-ink hover:border-accent/50"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setQtyText(String(side === 'buy' ? maxBuy : sellable))}
              className="flex-1 h-6 text-xxs rounded bg-panel border border-line text-muted hover:text-ink hover:border-accent/50"
            >
              {side === 'buy' ? '全仓' : '全部'}
            </button>
          </div>
        </div>

        <div className="rounded-md bg-panel2 border border-line px-2.5 py-2 text-xxs space-y-1">
          <Line label="成交金额" value={fee ? money(fee.amount) : '--'} />
          <Line label="佣金" value={fee ? money(fee.commission) : '--'} hint="万分之 2.5，最低 5 元" />
          <Line label="印花税" value={fee ? money(fee.stamp_tax) : '--'} hint="卖出千分之一" />
          <Line label={side === 'buy' ? '预计扣款' : '预计到账'} value={fee ? money(fee.net) : '--'} strong />
        </div>

        <button
          className={side === 'buy' ? 'btn-buy' : 'btn-sell'}
          disabled={busy || !quote || priceMilli <= 0 || qty <= 0}
          onClick={() => void submit()}
        >
          {busy ? '提交中…' : side === 'buy' ? `买入 ${quote?.name ?? ''}` : `卖出 ${quote?.name ?? ''}`}
        </button>

        {msg && <div className={cx('text-xxs leading-5', msg.ok ? 'text-down' : 'text-up')}>{msg.text}</div>}
        {outOfBand && <div className="text-xxs text-up">价格超出涨跌停范围，下单将被废单</div>}
      </div>
    </div>
  )
}

function Line({ label, value, strong, hint }: { label: string; value: string; strong?: boolean; hint?: string }) {
  return (
    <div className="flex items-center justify-between" title={hint}>
      <span className="text-muted">{label}</span>
      <span className={cx('num', strong ? 'text-ink text-xs' : 'text-ink/80')}>{value}</span>
    </div>
  )
}
