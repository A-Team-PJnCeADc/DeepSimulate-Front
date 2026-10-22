import { cx, money, pct, price, shares, toneOf } from '../format'
import type { Quote } from '../types'

export function QuoteHeader({ quote }: { quote: Quote | undefined }) {
  if (!quote) {
    return <div className="panel h-[86px] flex items-center justify-center text-xs text-muted">正在等待行情推送…</div>
  }
  const chg = quote.last - quote.prev_close
  const chgPct = quote.prev_close > 0 ? (chg / quote.prev_close) * 100 : 0
  const tone = toneOf(chg)

  return (
    <div className="panel px-4 py-3">
      <div className="flex items-center gap-6">
        <div className="shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{quote.name}</span>
            <span className="num text-xxs text-muted">{quote.code}</span>
            {quote.is_st && <span className="tag bg-up/10 text-up">ST</span>}
          </div>
          <div className={cx('num text-3xl font-semibold leading-9 mt-1', tone)}>{price(quote.last)}</div>
        </div>

        <div className={cx('num text-sm shrink-0', tone)}>
          <div>
            {chg > 0 ? '+' : ''}
            {price(chg)}
          </div>
          <div className="text-xxs">{pct(chgPct)}</div>
        </div>

        <div className="grid grid-cols-4 gap-x-6 gap-y-2 text-xxs ml-2">
          <Stat label="今开" value={price(quote.open)} tone={toneOf(quote.open - quote.prev_close)} />
          <Stat label="昨收" value={price(quote.prev_close)} />
          <Stat label="最高" value={price(quote.high)} tone={toneOf(quote.high - quote.prev_close)} />
          <Stat label="最低" value={price(quote.low)} tone={toneOf(quote.low - quote.prev_close)} />
          <Stat label="成交量" value={`${shares(quote.total_hand)} 手`} />
          <Stat label="成交额" value={fmtAmount(quote.amount)} />
          <Stat label="涨停" value={price(quote.limit_up)} tone="text-up" />
          <Stat label="跌停" value={price(quote.limit_down)} tone="text-down" />
        </div>
      </div>
    </div>
  )
}

/** 成交额单位元，超过一亿按亿显示 */
function fmtAmount(yuan: number): string {
  if (yuan >= 100_000_000) return `${(yuan / 100_000_000).toFixed(2)} 亿`
  if (yuan >= 10_000) return `${(yuan / 10_000).toFixed(1)} 万`
  return money(yuan * 1000)
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex gap-1.5 whitespace-nowrap">
      <span className="text-muted">{label}</span>
      <span className={cx('num', tone ?? 'text-ink')}>{value}</span>
    </div>
  )
}
