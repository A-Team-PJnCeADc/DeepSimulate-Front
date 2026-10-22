import { useMemo } from 'react'
import { cx, price, shares } from '../format'
import type { Tick } from '../types'
import { VirtualList } from './VirtualList'

const ROW_H = 22

/** 逐笔成交。主动买入红色（外盘），主动卖出绿色（内盘）。 */
export function TickList({ ticks }: { ticks: Tick[] }) {
  // 组件内再保证一次时间倒序（最新在最上），不依赖上游或调用方顺序
  const ordered = useMemo(() => {
    const norm = (t: string) => (t.includes('T') ? t.slice(11, 19) : t.slice(0, 8))
    return [...ticks].sort((a, b) => norm(b.time).localeCompare(norm(a.time)))
  }, [ticks])

  return (
    <div className="panel flex flex-col min-h-0">
      <div className="panel-title">
        <span>逐笔成交</span>
        <span className="text-xxs">{ordered.length} 笔</span>
      </div>
      <div className="grid grid-cols-[1fr_1fr_1fr_34px] text-xxs text-muted px-3 py-1">
        <span>时间</span>
        <span className="text-right">价格</span>
        <span className="text-right">数量</span>
        <span className="text-right">方向</span>
      </div>
      <VirtualList
        items={ordered}
        rowHeight={ROW_H}
        className="flex-1 overflow-auto"
        empty={<div className="px-3 py-6 text-center text-xs text-muted">暂无逐笔</div>}
        render={(t) => (
          <div
            key={`${t.time}-${t.price}-${t.volume}-${t.number}`}
            className="grid grid-cols-[1fr_1fr_1fr_34px] items-center px-3 text-xxs num"
            style={{ height: ROW_H }}
          >
            <span className="text-muted">{(t.time.split('T')[1] ?? t.time).slice(0, 8)}</span>
            <span className={cx('text-right', t.side === 'buy' ? 'text-up' : t.side === 'sell' ? 'text-down' : 'text-ink')}>
              {price(t.price)}
            </span>
            <span className="text-right text-ink/80">{shares(t.volume)}</span>
            <span className={cx('text-right', t.side === 'buy' ? 'text-up' : t.side === 'sell' ? 'text-down' : 'text-muted')}>
              {t.side === 'buy' ? 'B' : t.side === 'sell' ? 'S' : '-'}
            </span>
          </div>
        )}
      />
    </div>
  )
}
