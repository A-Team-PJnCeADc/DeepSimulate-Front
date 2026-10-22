import { cx, money, signedMoney, toneOf } from '../format'
import { useApp } from '../store'

export function AccountBar() {
  const account = useApp((s) => s.account)
  const username = useApp((s) => s.username)
  const logout = useApp((s) => s.logout)

  if (!account) {
    return <div className="text-xs text-muted">账户加载中…</div>
  }
  const roi = account.initial > 0 ? (account.total_pnl / account.initial) * 100 : 0
  return (
    <div className="flex items-center gap-5">
      <Metric label="总资产" value={money(account.total_asset)} />
      <Metric label="可用" value={money(account.cash_available)} />
      <Metric label="市值" value={money(account.market_value)} />
      <Metric
        label="浮动盈亏"
        value={`${signedMoney(account.total_pnl)} (${roi > 0 ? '+' : ''}${roi.toFixed(2)}%)`}
        tone={toneOf(account.total_pnl)}
      />
      <div className="flex items-center gap-3 pl-4 border-l border-line">
        <span className="text-xs text-muted">{username}</span>
        <button className="text-xxs text-muted hover:text-up" onClick={logout}>
          退出
        </button>
      </div>
    </div>
  )
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="leading-4 text-right">
      <div className="text-xxs text-muted">{label}</div>
      <div className={cx('num text-xs', tone ?? 'text-ink')}>{value}</div>
    </div>
  )
}
