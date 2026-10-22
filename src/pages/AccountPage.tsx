import { cx, money, signedMoney, toneOf } from '../format'
import { useApp } from '../store'
import { OrderTabs } from '../components/OrderTabs'
import { PositionsTable } from '../components/PositionsTable'

export function AccountPage({ onSell }: { onSell: (code: string, qty: number) => void }) {
  const account = useApp((s) => s.account)
  const username = useApp((s) => s.username)
  const orders = useApp((s) => s.orders)
  const trades = useApp((s) => s.trades)

  if (!account) {
    return <div className="p-6 text-sm text-muted">账户加载中…</div>
  }

  const roi = account.initial > 0 ? (account.total_pnl / account.initial) * 100 : 0
  const activeCount = Object.values(orders).filter(
    (o) => o.status === 'pending' || o.status === 'partial',
  ).length

  return (
    <div className="h-full flex flex-col gap-2 p-2">
      <div className="grid grid-cols-6 gap-2 shrink-0">
        <Metric label="总资产" value={money(account.total_asset)} hint={`初始 ${money(account.initial)}`} />
        <Metric label="可用资金" value={money(account.cash_available)} />
        <Metric label="冻结资金" value={money(account.cash_frozen)} hint="买入委托占用" />
        <Metric label="持仓市值" value={money(account.market_value)} hint={`${account.positions.length} 只持仓`} />
        <Metric
          label="浮动盈亏"
          value={signedMoney(account.total_pnl)}
          tone={toneOf(account.total_pnl)}
        />
        <Metric
          label="累计收益率"
          value={`${roi > 0 ? '+' : ''}${roi.toFixed(2)}%`}
          tone={toneOf(roi)}
          hint={`账户 ${username}`}
        />
      </div>

      <div className="flex-1 min-h-0">
        <PositionsTable onSell={onSell} />
      </div>

      <div className="h-[300px] shrink-0 min-h-0">
        <OrderTabs activeCount={activeCount} tradeCount={trades.length} />
      </div>
    </div>
  )
}

function Metric({ label, value, tone, hint }: { label: string; value: string; tone?: string; hint?: string }) {
  return (
    <div className="panel px-4 py-3">
      <div className="text-xxs text-muted">{label}</div>
      <div className={cx('num text-lg mt-1', tone ?? 'text-ink')}>{value}</div>
      {hint && <div className="text-xxs text-muted mt-0.5">{hint}</div>}
    </div>
  )
}
