import { cx, money, pct, price, shares, toneOf } from '../format'
import { useApp } from '../store'

export function PositionsTable({ onSell }: { onSell: (code: string, qty: number) => void }) {
  const account = useApp((s) => s.account)
  const select = useApp((s) => s.select)
  const positions = account?.positions ?? []

  return (
    <div className="panel flex flex-col min-h-0 h-full">
      <div className="panel-title">
        <span>持仓</span>
        <span className="text-xxs">{positions.length} 只</span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="text-muted sticky top-0 bg-panel z-10">
            <tr className="h-9 border-b border-line">
              <th className="text-left font-normal px-3">名称</th>
              <th className="text-right font-normal px-2">持仓</th>
              <th className="text-right font-normal px-2">可卖</th>
              <th className="text-right font-normal px-2">成本</th>
              <th className="text-right font-normal px-2">现价</th>
              <th className="text-right font-normal px-2">市值</th>
              <th className="text-right font-normal px-2">盈亏</th>
              <th className="text-right font-normal px-2">盈亏率</th>
              <th className="text-right font-normal px-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {positions.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-muted py-10 text-xs">
                  暂无持仓，去自选股页面下单
                </td>
              </tr>
            )}
            {positions.map((p) => (
              <tr key={p.code} className="h-9 border-b border-line/70 hover:bg-panel2">
                <td className="px-3">
                  <button className="hover:text-accent" onClick={() => select(p.code)}>
                    {p.name}
                  </button>
                  <span className="num text-muted ml-1.5">{p.code}</span>
                </td>
                <td className="px-2 text-right num">{shares(p.total)}</td>
                <td className={cx('px-2 text-right num', p.available > 0 ? 'text-ink' : 'text-muted')}>
                  {shares(p.available)}
                </td>
                <td className="px-2 text-right num text-muted">{price(p.cost)}</td>
                <td className="px-2 text-right num">{price(p.last)}</td>
                <td className="px-2 text-right num">{money(p.market_value)}</td>
                <td className={cx('px-2 text-right num', toneOf(p.pnl))}>{money(p.pnl)}</td>
                <td className={cx('px-2 text-right num', toneOf(p.pnl))}>{pct(p.pnl_pct)}</td>
                <td className="px-3 text-right">
                  <button
                    className="text-down hover:underline disabled:opacity-30 disabled:no-underline"
                    disabled={p.available <= 0}
                    onClick={() => onSell(p.code, p.available)}
                  >
                    卖出
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-3 h-8 flex items-center justify-between text-xxs text-muted border-t border-line">
        <span>当日买入的持仓 T+1 才可卖出，可卖数量已扣除卖出挂单冻结</span>
        <span>持仓类别按市值排序</span>
      </div>
    </div>
  )
}
