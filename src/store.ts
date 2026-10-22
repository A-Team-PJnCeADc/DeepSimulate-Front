import { create } from 'zustand'
import { clearAuth, getToken, getUsername, setAuth } from './api'
import type { Account, AuthResponse, Order, Trade, WatchItem } from './types'

interface AppStore {
  token: string | null
  username: string | null
  selected: string
  watchlist: WatchItem[]
  orders: Record<string, Order>
  trades: Trade[]
  account: Account | null
  conn: 'idle' | 'connecting' | 'open' | 'closed'
  login: (auth: AuthResponse) => void
  logout: () => void
  select: (code: string) => void
  setWatchlist: (list: WatchItem[]) => void
  setOrders: (list: Order[]) => void
  upsertOrder: (o: Order) => void
  setTrades: (list: Trade[]) => void
  upsertTrade: (t: Trade) => void
  setAccount: (a: Account) => void
  setConn: (c: AppStore['conn']) => void
  /** 练手日模式：忽略实时行情推送，页面数据全部来自该日归档 */
  practiceMode: boolean
  setPracticeMode: (v: boolean) => void
}

const DEFAULTS = ['000001', '600519', '300750', '601318', '600036', '002594', '000858', '601899']

export const defaultWatchlist: WatchItem[] = DEFAULTS.map((code) => ({ code, name: code }))

export const useApp = create<AppStore>((set) => ({
  token: getToken(),
  username: getUsername(),
  selected: '000001',
  watchlist: defaultWatchlist,
  orders: {},
  trades: [],
  account: null,
  conn: 'idle',
  login: (auth) => {
    setAuth(auth)
    set({ token: auth.token, username: auth.username })
  },
  logout: () => {
    clearAuth()
    set({ token: null, username: null, account: null, orders: {}, trades: [] })
  },
  select: (code) => set({ selected: code }),
  setWatchlist: (list) => set({ watchlist: list }),
  setOrders: (list) => set({ orders: Object.fromEntries(list.map((o) => [o.id, o])) }),
  upsertOrder: (o) => set((s) => ({ orders: { ...s.orders, [o.id]: o } })),
  setTrades: (list) => set({ trades: list }),
  upsertTrade: (t) =>
    set((s) => (s.trades.some((x) => x.id === t.id) ? s : { trades: [t, ...s.trades].slice(0, 300) })),
  setAccount: (a) => set({ account: a }),
  setConn: (c) => set({ conn: c }),
  practiceMode: false,
  setPracticeMode: (v) => set({ practiceMode: v }),
}))
