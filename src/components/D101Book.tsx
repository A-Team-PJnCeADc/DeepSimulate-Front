import { useD101Detail } from '../d101'

type Props = { code: string }

/** D101 实时五档盘口：detail 命令，增量推送按字段合并 */
export function D101Book({ code }: Props) {
  const { detail, status } = useD101Detail(code)
  if (!detail) {
    return <div className="text-xs text-muted p-3">{status === 'open' ? '等待盘口推送…' : status === 'closed' ? '已断开，3 秒后重连' : '连接中…'}</div>
  }
  const d = 10 ** (detail.decimal_num ?? 2)
  const unit = detail.volume_unit ?? 100
  const px = (v?: number) => (v === undefined ? '—' : (v / d).toFixed(2))
  const vol = (v?: number) => (v === undefined ? '—' : (v * unit).toLocaleString('zh-CN'))

  const rows = (side: 'ask' | 'bid') =>
    [5, 4, 3, 2, 1].map((i) => {
      const p = (detail as Record<string, number | undefined>)[`${side}${i}_price`]
      const v = (detail as Record<string, number | undefined>)[`${side}${i}_vol`]
      return (
        <div key={`${side}${i}`} className="grid grid-cols-[28px_1fr_1fr] gap-2 px-3 py-1 text-xs num">
          <span className="text-muted">{side === 'ask' ? '卖' : '买'}{i}</span>
          <span className={side === 'ask' ? 'text-down text-right' : 'text-up text-right'}>{px(p)}</span>
          <span className="text-ink text-right">{vol(v)}</span>
        </div>
      )
    })

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-line">
        <span className="text-sm num text-ink">{px(detail.price)}</span>
        <span className="text-xxs text-muted">
          {status === 'open' ? '实时' : '断开'} · 单位 {unit} 股/手
        </span>
      </div>
      <div className="grid grid-cols-[28px_1fr_1fr] gap-2 px-3 text-xxs text-muted">
        <span />
        <span className="text-right">价格</span>
        <span className="text-right">挂单量</span>
      </div>
      {rows('ask')}
      <div className="border-t border-line/60 my-1" />
      {rows('bid')}
    </div>
  )
}
