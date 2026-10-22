import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import * as Tabs from '@radix-ui/react-tabs'
import { api, ApiError } from '../api'
import { cx, money, price, shares, timeOf } from '../format'
import { useApp } from '../store'
import type { Order, OrderStatus, Trade } from '../types'
import { SpacerRow, useVirtualRows } from './VirtualList'

const ROW_H = 32

const STATUS_META: Record<OrderStatus, { label: string; cls: string }> = {
  pending: { label: '已报', cls: 'bg-accent/10 text-accent' },
  partial: { label: '部成', cls: 'bg-up/10 text-up' },
  filled: { label: '已成', cls: 'bg-down/10 text-down' },
  cancelled: { label: '已撤', cls: 'bg-panel2 text-muted' },
  rejected: { label: '废单', cls: 'bg-up/15 text-up' },
}

const sideLabel = (s: string) => (s === 'buy' ? '买入' : '卖出')

export function OrderTabs({ activeCount, tradeCount }: { activeCount: number; tradeCount: number }) {
  const orders = useApp((s) => s.orders)
  const trades = useApp((s) => s.trades)
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all')

  const rows = useMemo(() => {
    const list = Object.values(orders).sort((a, b) => b.created_at - a.created_at)
    if (filter === 'active') return list.filter((o) => o.status === 'pending' || o.status === 'partial')
    if (filter === 'done') return list.filter((o) => o.status !== 'pending' && o.status !== 'partial')
    return list
  }, [orders, filter])

  return (
    <div className="panel flex flex-col h-full min-h-0">
      <Tabs.Root defaultValue="orders" className="flex flex-col min-h-0 flex-1">
        <div className="flex items-center justify-between border-b border-line px-3">
          <Tabs.List className="flex gap-4 h-9 items-center text-xs">
            <Tabs.Trigger
              value="orders"
              className="text-muted data-[state=active]:text-ink data-[state=active]:border-b-2 data-[state=active]:border-accent h-9"
            >
              委托
              <span className="ml-1 text-xxs text-muted">{Object.keys(orders).length}</span>
            </Tabs.Trigger>
            <Tabs.Trigger
              value="trades"
              className="text-muted data-[state=active]:text-ink data-[state=active]:border-b-2 data-[state=active]:border-accent h-9"
            >
              成交
              <span className="ml-1 text-xxs text-muted">{tradeCount}</span>
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="orders" className="text-xxs">
            <div className="flex items-center gap-2">
              <span className="text-muted">未完成 {activeCount}</span>
              <div className="flex gap-1">
                {(['all', 'active', 'done'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cx(
                      'px-2 h-6 rounded border',
                      filter === f ? 'border-accent/50 text-ink bg-panel2' : 'border-line text-muted',
                    )}
                  >
                    {f === 'all' ? '全部' : f === 'active' ? '未完成' : '已结束'}
                  </button>
                ))}
              </div>
            </div>
          </Tabs.Content>
        </div>
        <Tabs.Content value="orders" className="flex-1 min-h-0">
          <OrdersTable rows={rows} />
        </Tabs.Content>
        <Tabs.Content value="trades" className="flex-1 min-h-0">
          <TradesTable rows={trades} />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}

function OrdersTable({ rows }: { rows: Order[] }) {
  const qc = useQueryClient()
  const upsertOrder = useApp((s) => s.upsertOrder)
  const select = useApp((s) => s.select)
  const [error, setError] = useState<string | null>(null)
  const v = useVirtualRows(rows.length, ROW_H, 8)

  const cancel = async (id: string) => {
    setError(null)
    try {
      upsertOrder(await api.cancelOrder(id))
      await qc.invalidateQueries({ queryKey: ['account'] })
    } catch (e) {
      setError(e instanceof ApiError ? e.message : '撤单失败')
    }
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      {error && <div className="px-3 py-1 text-xxs text-up">{error}</div>}
      <div ref={v.containerRef} onScroll={v.onScroll} className="flex-1 overflow-auto">
      <table className="w-full text-xxs">
        <thead className="text-muted sticky top-0 bg-panel z-10">
          <tr className="h-8 border-b border-line">
            <th className="text-left font-normal px-3">时间</th>
            <th className="text-left font-normal px-2">股票</th>
            <th className="text-left font-normal px-2">方向</th>
            <th className="text-right font-normal px-2">委托价</th>
            <th className="text-right font-normal px-2">委托量</th>
            <th className="text-right font-normal px-2">已成交</th>
            <th className="text-right font-normal px-2">排队量</th>
            <th className="text-left font-normal px-2">状态</th>
            <th className="text-left font-normal px-2">说明</th>
            <th className="text-right font-normal px-3">操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={10} className="text-center text-muted py-8 text-xs">
                暂无委托
              </td>
            </tr>
          )}
          <SpacerRow height={v.padTop} colSpan={10} />
          {rows.slice(v.start, v.end).map((o) => {
            const meta = STATUS_META[o.status]
            const active = o.status === 'pending' || o.status === 'partial'
            return (
              <tr key={o.id} className="border-b border-line/70 hover:bg-panel2" style={{ height: ROW_H }}>
                <td className="px-3 num text-muted">{timeOf(o.created_at)}</td>
                <td className="px-2">
                  <button className="hover:text-accent" onClick={() => select(o.code)}>
                    {o.name || o.code}
                  </button>
                  <span className="num text-muted ml-1">{o.code}</span>
                </td>
                <td className={cx('px-2', o.side === 'buy' ? 'text-up' : 'text-down')}>{sideLabel(o.side)}</td>
                <td className="px-2 text-right num">{price(o.price)}</td>
                <td className="px-2 text-right num">{shares(o.qty)}</td>
                <td className={cx('px-2 text-right num', o.filled > 0 ? 'text-ink' : 'text-muted')}>
                  {shares(o.filled)}
                </td>
                <td className="px-2 text-right num text-muted">
                  {active && o.queue_ahead > 0 ? shares(o.queue_ahead) : '--'}
                </td>
                <td className="px-2">
                  <span className={cx('tag', meta.cls)}>{meta.label}</span>
                </td>
                <td className="px-2 text-muted truncate max-w-[240px]" title={o.reason ?? ''}>
                  {o.reason ?? (active ? '撮合中' : '')}
                </td>
                <td className="px-3 text-right">
                  {active ? (
                    <button className="text-xxs text-accent hover:underline" onClick={() => void cancel(o.id)}>
                      撤单
                    </button>
                  ) : (
                    <span className="text-muted">--</span>
                  )}
                </td>
              </tr>
            )
          })}
          <SpacerRow height={v.padBottom} colSpan={10} />
        </tbody>
      </table>
      </div>
    </div>
  )
}

function TradesTable({ rows }: { rows: Trade[] }) {
  const v = useVirtualRows(rows.length, ROW_H, 8)
  return (
    <div ref={v.containerRef} onScroll={v.onScroll} className="h-full overflow-auto">
    <table className="w-full text-xxs">
      <thead className="text-muted sticky top-0 bg-panel z-10">
        <tr className="h-8 border-b border-line">
          <th className="text-left font-normal px-3">时间</th>
          <th className="text-left font-normal px-2">股票</th>
          <th className="text-left font-normal px-2">方向</th>
          <th className="text-right font-normal px-2">成交价</th>
          <th className="text-right font-normal px-2">成交量</th>
          <th className="text-right font-normal px-2">成交额</th>
          <th className="text-right font-normal px-2">佣金</th>
          <th className="text-right font-normal px-2">印花税</th>
          <th className="text-right font-normal px-3">费用合计</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={9} className="text-center text-muted py-8 text-xs">
              暂无成交
            </td>
          </tr>
        )}
        <SpacerRow height={v.padTop} colSpan={9} />
        {rows.slice(v.start, v.end).map((t) => (
          <tr key={t.id} className="border-b border-line/70 hover:bg-panel2" style={{ height: ROW_H }}>
            <td className="px-3 num text-muted">{timeOf(t.created_at)}</td>
            <td className="px-2">
              {t.name || t.code}
              <span className="num text-muted ml-1">{t.code}</span>
            </td>
            <td className={cx('px-2', t.side === 'buy' ? 'text-up' : 'text-down')}>{sideLabel(t.side)}</td>
            <td className="px-2 text-right num">{price(t.price)}</td>
            <td className="px-2 text-right num">{shares(t.qty)}</td>
            <td className="px-2 text-right num">{money(t.amount)}</td>
            <td className="px-2 text-right num text-muted">{money(t.commission)}</td>
            <td className="px-2 text-right num text-muted">{money(t.stamp_tax)}</td>
            <td className="px-3 text-right num">{money(t.commission + t.stamp_tax)}</td>
          </tr>
        ))}
        <SpacerRow height={v.padBottom} colSpan={9} />
      </tbody>
    </table>
    </div>
  )
}
