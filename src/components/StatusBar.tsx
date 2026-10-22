import { cx, clockOf } from '../format'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api'
import { useFeed } from '../feed'
import { useApp } from '../store'

export function StatusBar() {
  const conn = useApp((s) => s.conn)
  const selected = useApp((s) => s.selected)
  const { busy } = useFeed()
  const { data } = useQuery({
    queryKey: ['status'],
    queryFn: api.status,
    refetchInterval: 5_000,
    staleTime: 3_000,
  })

  const market = data?.market
  const latency = data?.match_latency_us?.[selected]
  const marketOk = market?.ok ?? false

  return (
    <footer className="h-7 shrink-0 border-t border-line bg-panel flex items-center gap-5 px-4 text-xxs text-muted">
      <span className="flex items-center gap-1.5">
        <i className={cx('inline-block w-1.5 h-1.5 rounded-full', marketOk ? 'bg-down' : 'bg-up')} />
        行情源 {marketOk ? '正常' : '异常'}
        {!marketOk && market?.last_error ? `：${market.last_error}` : ''}
      </span>
      <span>订阅 {market?.subscribed ?? 0} 只</span>
      <span>轮次 {market?.rounds ?? 0}</span>
      <span>推送通道 {conn === 'open' ? '已连接' : conn === 'connecting' ? '连接中' : '断开'}</span>
      <span>撮合耗时 {latency !== undefined ? `${(latency / 1000).toFixed(2)} ms` : '--'}</span>
      <span>未完成委托 {data?.pending_orders ?? 0}</span>
      <span className={cx(busy && 'text-accent')}>行情渲染 {busy ? '降级中' : '空闲'}</span>
      <span className="ml-auto">
        {market?.last_ok_ms ? `最后更新 ${clockOf(market.last_ok_ms)}` : '等待首帧行情'}
      </span>
      <span>模拟撮合，非真实成交</span>
    </footer>
  )
}
