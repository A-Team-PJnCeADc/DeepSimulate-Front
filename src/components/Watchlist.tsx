import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api'
import { useFeed } from '../feed'
import { cx, pct, price, toneOf } from '../format'
import { useApp } from '../store'

export function Watchlist() {
  const { quotes } = useFeed()
  const { watchlist, selected, select, setWatchlist } = useApp()
  const [keyword, setKeyword] = useState('')
  const [hits, setHits] = useState<{ code: string; name: string }[]>([])

  const { data: serverList } = useQuery({ queryKey: ['watchlist'], queryFn: api.watchlist, staleTime: 30_000 })

  useEffect(() => {
    if (!serverList || serverList.length === 0) return
    setWatchlist(serverList.map((w) => ({ code: w.code, name: w.name })))
    // 服务端列表只在切换账户时提供初始值
  }, [serverList, setWatchlist])

  useEffect(() => {
    if (keyword.trim().length === 0) {
      setHits([])
      return
    }
    const id = window.setTimeout(async () => {
      try {
        setHits(await api.search(keyword.trim()))
      } catch {
        setHits([])
      }
    }, 250)
    return () => window.clearTimeout(id)
  }, [keyword])

  const add = async (code: string) => {
    const list = await api.addWatch(code)
    setWatchlist(list.map((w) => ({ code: w.code, name: w.name })))
    select(code)
    setKeyword('')
    setHits([])
  }

  const remove = async (code: string) => {
    const list = await api.removeWatch(code)
    setWatchlist(list.map((w) => ({ code: w.code, name: w.name })))
  }

  return (
    <div className="panel flex flex-col min-h-0">
      <div className="panel-title">
        <span>自选股</span>
        <span className="text-xxs">{watchlist.length}</span>
      </div>
      <div className="p-2 border-b border-line relative">
        <input
          className="field h-8 text-xs"
          placeholder="代码或名称"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        {hits.length > 0 && (
          <div className="absolute left-2 right-2 top-11 z-20 panel max-h-56 overflow-auto">
            {hits.map((h) => (
              <button
                key={h.code}
                onClick={() => add(h.code)}
                className="w-full flex items-center justify-between px-2 h-8 text-xs hover:bg-panel2"
              >
                <span>{h.name}</span>
                <span className="num text-muted">{h.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        {watchlist.map((w) => {
          const q = quotes[w.code]
          const chg = q && q.prev_close > 0 ? (q.last - q.prev_close) / q.prev_close : 0
          return (
            <div
              key={w.code}
              onClick={() => select(w.code)}
              className={cx(
                'group flex items-center justify-between px-2 h-11 border-b border-line/70 cursor-pointer',
                selected === w.code ? 'bg-accent/[0.06] border-l-2 border-accent' : 'hover:bg-panel2 border-l-2 border-transparent',
              )}
            >
              <div className="min-w-0">
                <div className="text-xs truncate">{q?.name ?? w.name}</div>
                <div className="text-xxs text-muted num">{w.code}</div>
              </div>
              <div className="text-right">
                <div className={cx('text-xs num', q ? toneOf(q.last - q.prev_close) : 'text-muted')}>
                  {q ? price(q.last) : '--'}
                </div>
                <div className={cx('text-xxs num', q ? toneOf(chg) : 'text-muted')}>
                  {q ? pct(chg * 100) : '--'}
                </div>
              </div>
              <button
                className="ml-1 text-muted opacity-0 group-hover:opacity-100 hover:text-up text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  void remove(w.code)
                }}
                title="移出自选"
              >
                ×
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
