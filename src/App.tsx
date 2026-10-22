import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import { FeedProvider, useFeed } from './feed'
import { live } from './ws'
import { useApp } from './store'
import { AccountBar } from './components/AccountBar'
import { Login } from './components/Login'
import { StatusBar } from './components/StatusBar'
import { AccountPage } from './pages/AccountPage'
import { DataPage } from './pages/DataPage'
import { stockScreens } from './screens'
import { Setup } from './components/Setup'
import { useD101 } from './d101'
import { MarketPage } from './pages/MarketPage'
import type { SellIntent } from './components/TradePanel'

export type Page = 'market' | 'account' | 'data' | 'stock'

/** 顶栏实时行情（D101 本地代理 WS），只做展示 */
function D101Strip({ code }: { code: string }) {
  const { snaps, status } = useD101([code])
  const s = snaps[code]
  if (!s) {
    return (
      <span className="text-xxs text-muted">
        实时 {status === 'open' ? '等待推送' : status === 'closed' ? '已断开' : '连接中…'}
      </span>
    )
  }
  const d = s.decimal_num > 0 ? 10 ** s.decimal_num : 1000
  const px = s.price / d
  const pre = s.pre_close / d
  const pct = pre > 0 ? ((px - pre) / pre) * 100 : 0
  const tone = pct > 0.001 ? 'text-up' : pct < -0.001 ? 'text-down' : 'text-muted'
  return (
    <span className="flex items-center gap-2 num text-xs">
      <span className="text-xxs text-muted">{status === 'open' ? '实时' : '断开'}</span>
      <span className="text-muted">{s.name}</span>
      <span className={tone}>{px.toFixed(2)}</span>
      <span className={tone}>
        {pct >= 0 ? '+' : ''}
        {pct.toFixed(2)}%
      </span>
    </span>
  )
}

export default function App() {
  const token = useApp((s) => s.token)
  const [ready, setReady] = useState<boolean | null>(null)
  const [initial, setInitial] = useState(0)

  useEffect(() => {
    if (!token) {
      setReady(null)
      return
    }
    let cancelled = false
    fetch('/api/me/settings', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d: { configured?: boolean; initial?: number }) => {
        if (cancelled) return
        setInitial(d?.initial ?? 0)
        setReady(Boolean(d?.configured))
      })
      .catch(() => !cancelled && setReady(true))
    return () => {
      cancelled = true
    }
  }, [token])

  if (!token) return <Login />
  if (ready === null) return <div className="h-full flex items-center justify-center text-sm text-muted">加载中…</div>
  if (!ready) {
    return (
      <FeedProvider>
        <Setup initial={initial} onDone={() => setReady(true)} />
      </FeedProvider>
    )
  }
  return (
    <FeedProvider>
      <Terminal />
    </FeedProvider>
  )
}

function Terminal() {
  const qc = useQueryClient()
  const { ticks, seed, setTicks } = useFeed()
  const { selected, watchlist, account, setAccount, setOrders, setTrades, setWatchlist, select, setConn } =
    useApp()
  const [page, setPage] = useState<Page>('market')
  const [fillPrice, setFillPrice] = useState<number | null>(null)
  const [rebirth, setRebirth] = useState(false)
  const [reborn, setReborn] = useState(false)
  const [sellIntent, setSellIntent] = useState<SellIntent | null>(null)

  const { data: accountData } = useQuery({ queryKey: ['account'], queryFn: api.account, refetchInterval: 15_000 })
  const { data: ordersData } = useQuery({ queryKey: ['orders'], queryFn: () => api.orders(200) })
  const { data: tradesData } = useQuery({ queryKey: ['trades'], queryFn: () => api.trades(200) })
  const { data: watchData } = useQuery({ queryKey: ['watchlist'], queryFn: api.watchlist })
  useQuery({ queryKey: ['status'], queryFn: api.status, refetchInterval: 10_000 })

  useEffect(() => {
    if (accountData) setAccount(accountData)
  }, [accountData, setAccount])
  useEffect(() => {
    if (ordersData) setOrders(ordersData)
  }, [ordersData, setOrders])
  useEffect(() => {
    if (tradesData) setTrades(tradesData)
  }, [tradesData, setTrades])
  useEffect(() => {
    if (watchData && watchData.length > 0) setWatchlist(watchData)
  }, [watchData, setWatchlist])

  const codes = useMemo(() => {
    const set = new Set<string>()
    for (const w of watchlist) set.add(w.code)
    for (const p of account?.positions ?? []) set.add(p.code)
    if (selected) set.add(selected)
    return [...set]
  }, [watchlist, account?.positions, selected])

  useEffect(() => {
    live.setCodes(codes)
  }, [codes])

  useEffect(() => {
    live.onStatus = setConn
  }, [setConn])

  /** 断线重连后主动拉一次 REST 快照对齐，不依赖推送补齐。 */
  useEffect(() => {
    live.onResync = () => {
      void (async () => {
        try {
          seed(await api.quotes(codes))
          if (selected) setTicks(selected, await api.ticks(selected))
          await Promise.all([
            qc.invalidateQueries({ queryKey: ['account'] }),
            qc.invalidateQueries({ queryKey: ['orders'] }),
            qc.invalidateQueries({ queryKey: ['trades'] }),
          ])
        } catch {
          /* 对齐失败由下一轮推送与轮询兜底 */
        }
      })()
    }
  }, [codes, selected, seed, setTicks, qc])

  useEffect(() => {
    if (!selected || ticks[selected]) return
    void api
      .ticks(selected)
      .then((list) => setTicks(selected, list))
      .catch(() => undefined)
  }, [selected, ticks, setTicks])

  return (
    <div className="h-full flex flex-col">
      <header className="h-14 shrink-0 bg-panel border-b border-line flex items-center px-4 gap-6">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold tracking-tight">DeepSimulate</span>
          <span className="text-xxs text-muted">模拟交易</span>
        </div>
        <nav className="flex items-center gap-1">
          <button className={page === 'market' ? 'nav-item-active' : 'nav-item'} onClick={() => setPage('market')}>
            自选股
          </button>
          <button className={page === 'account' ? 'nav-item-active' : 'nav-item'} onClick={() => setPage('account')}>
            账户
          </button>
          <button className={page === 'data' ? 'nav-item-active' : 'nav-item'} onClick={() => setPage('data')}>
            数据
          </button>
          <button className={page === 'stock' ? 'nav-item-active' : 'nav-item'} onClick={() => setPage('stock')}>
            个股详细
          </button>
          <button
            className="ml-2 h-8 px-3 rounded text-xs font-medium text-white"
            style={{ background: '#d93025' }}
            onClick={() => setRebirth(true)}
          >
            转世重生·再来一次
          </button>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <D101Strip code={selected} />
          <AccountBar />
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-hidden">
        {page === 'market' ? (
          <MarketPage
            fillPrice={fillPrice}
            onFillConsumed={() => setFillPrice(null)}
            sellIntent={sellIntent}
            onSellConsumed={() => setSellIntent(null)}
            onPickPrice={setFillPrice}
            onOpenAccount={() => setPage('account')}
          />
        ) : page === 'data' ? (
          <div className="h-full p-3">
            <DataPage />
          </div>
        ) : page === 'stock' ? (
          <div className="h-full p-3">
            <DataPage list={stockScreens} initialCode={selected} />
          </div>
        ) : (
          <AccountPage
            onSell={(code, qty) => {
              select(code)
              setSellIntent({ code, qty, at: Date.now() })
              setPage('market')
            }}
          />
        )}
      </main>

      {rebirth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="panel w-[380px] p-5 flex flex-col gap-3">
            <div className="text-sm font-semibold text-ink">确定要转世重生吗？</div>
            <div className="text-xs text-muted leading-5">
              将清空当前账户的全部持仓、委托与成交记录，资金回到初始值，
              并重新设置资金、费用与练手日期。这个操作不可撤销。
            </div>
            {reborn && <div className="text-xs text-up">已重来，正在刷新…</div>}
            <div className="flex justify-end gap-2 pt-1">
              <button className="btn h-8 px-3" onClick={() => setRebirth(false)} disabled={reborn}>
                再想想
              </button>
              <button
                className="h-8 px-3 rounded text-xs text-white disabled:opacity-60"
                style={{ background: '#d93025' }}
                disabled={reborn}
                onClick={async () => {
                  setReborn(true)
                  try {
                    const token = sessionStorage.getItem('deepsim.token')
                    await fetch('/api/me/reset', {
                      method: 'POST',
                      headers: token ? { Authorization: `Bearer ${token}` } : {},
                    })
                    setTimeout(() => location.reload(), 600)
                  } catch {
                    setReborn(false)
                  }
                }}
              >
                确认重来
              </button>
            </div>
          </div>
        </div>
      )}

      <StatusBar />
    </div>
  )
}
