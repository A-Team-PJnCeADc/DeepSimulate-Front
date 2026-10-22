import { cx, price, shares } from '../format'
import type { Level, Quote } from '../types'

interface Props {
  quote: Quote | undefined
  onPick: (priceMilli: number) => void
}

/**
 * 五档盘口。卖盘在上、买盘在下，中间为最新成交价。
 * 挂单量为模拟 L2 推算值：快照覆盖 + 逐笔扣减，非交易所真实队列。
 */
export function OrderBook({ quote, onPick }: Props) {
  const bids = quote?.bids ?? []
  const asks = quote?.asks ?? []
  const maxVol = Math.max(1, ...bids.map((l) => l.volume), ...asks.map((l) => l.volume))
  const padded = (rows: Level[], count: number): Level[] => {
    const out = [...rows]
    while (out.length < count) out.push({ price: 0, volume: 0 })
    return out.slice(0, count)
  }

  return (
    <div className="panel flex flex-col min-h-0">
      <div className="panel-title">
        <span>五档盘口</span>
        <span className="text-xxs">模拟 L2</span>
      </div>
      <div className="text-xxs text-muted grid grid-cols-[30px_1fr_1fr] px-3 py-1">
        <span />
        <span className="text-right">价格</span>
        <span className="text-right">挂单量</span>
      </div>
      <div className="flex flex-col">
        {padded(asks, 5)
          .slice()
          .reverse()
          .map((l, i) => (
            <Row key={`a${i}`} level={l} side="ask" maxVol={maxVol} label={`卖${5 - i}`} onPick={onPick} />
          ))}
        <div className="flex items-center justify-between px-3 h-8 border-y border-line bg-panel2">
          <span className="text-xxs text-muted">最新</span>
          <span className={cx('num text-sm', quote ? 'text-ink' : 'text-muted')}>
            {quote ? price(quote.last) : '--'}
          </span>
          <span className="text-xxs text-muted">{quote ? `${shares(quote.total_hand)} 手` : ''}</span>
        </div>
        {padded(bids, 5).map((l, i) => (
          <Row key={`b${i}`} level={l} side="bid" maxVol={maxVol} label={`买${i + 1}`} onPick={onPick} />
        ))}
      </div>
    </div>
  )
}

function Row({
  level,
  side,
  maxVol,
  label,
  onPick,
}: {
  level: Level
  side: 'bid' | 'ask'
  maxVol: number
  label: string
  onPick: (p: number) => void
}) {
  const ratio = Math.min(100, (level.volume / maxVol) * 100)
  return (
    <button
      disabled={level.price === 0}
      onClick={() => onPick(level.price)}
      className="relative grid grid-cols-[30px_1fr_1fr] items-center h-[26px] px-3 text-xxs num hover:bg-panel2 disabled:hover:bg-transparent"
    >
      <span className="text-muted text-left">{label}</span>
      <span className={cx('text-right', side === 'ask' ? 'text-down' : 'text-up')}>
        {level.price > 0 ? price(level.price) : '--'}
      </span>
      <span className="text-right text-ink/80">{level.volume > 0 ? shares(level.volume) : '--'}</span>
      <span
        className={cx(
          'absolute right-0 top-[3px] bottom-[3px] opacity-[0.10] pointer-events-none',
          side === 'ask' ? 'bg-down' : 'bg-up',
        )}
        style={{ width: `${ratio}%` }}
      />
    </button>
  )
}
