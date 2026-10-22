export type Side = 'buy' | 'sell'
export type OrderStatus = 'pending' | 'partial' | 'filled' | 'cancelled' | 'rejected'
export type TickSide = 'buy' | 'sell' | 'neutral'

export interface Level {
  price: number
  volume: number
}

export interface Quote {
  code: string
  name: string
  last: number
  prev_close: number
  open: number
  high: number
  low: number
  total_hand: number
  amount: number
  limit_up: number
  limit_down: number
  is_st: boolean
  bids: Level[]
  asks: Level[]
  ts: number
}

export interface MinutePoint {
  time: string
  price: number
  volume: number
  avg: number
}

export interface MinuteResp {
  code: string
  name: string
  prev_close: number
  points: MinutePoint[]
}

export interface Tick {
  time: string
  price: number
  volume: number
  side: TickSide
  number: number
}

export interface Order {
  id: string
  user_id: number
  code: string
  name: string
  side: Side
  price: number
  qty: number
  filled: number
  status: OrderStatus
  reason: string | null
  seq: number
  queue_ahead: number
  frozen: number
  amount_paid: number
  created_at: number
  updated_at: number
}

export interface Trade {
  id: string
  order_id: string
  user_id: number
  code: string
  name: string
  side: Side
  price: number
  qty: number
  amount: number
  commission: number
  stamp_tax: number
  created_at: number
}

export interface Position {
  code: string
  name: string
  total: number
  available: number
  cost: number
  last: number
  market_value: number
  pnl: number
  pnl_pct: number
}

export interface Account {
  user_id: number
  username: string
  cash_available: number
  cash_frozen: number
  market_value: number
  total_asset: number
  initial: number
  total_pnl: number
  positions: Position[]
}

export interface AuthResponse {
  token: string
  user_id: number
  username: string
}

export interface FeeEstimate {
  amount: number
  commission: number
  stamp_tax: number
  total_fee: number
  net: number
}

export interface StockMeta {
  code: string
  name: string
  exchange: string
}

export interface WatchItem {
  code: string
  name: string
}

export interface MarketStatus {
  ok: boolean
  last_error: string | null
  last_ok_ms: number
  rounds: number
  subscribed: number
}

export interface ServerStatus {
  mode?: string
  market: MarketStatus
  pending_orders: number
  ws_clients: number
  match_latency_us: Record<string, number>
}

export type WsMessage =
  | { type: 'ready'; data: { user_id: number; username: string } }
  | { type: 'quote'; data: Quote }
  | { type: 'rquote'; data: Quote }
  | { type: 'tick'; data: { code: string; ticks: Tick[] } }
  | { type: 'order'; data: Order }
  | { type: 'trade'; data: Trade }
  | { type: 'account'; data: Account }
  | { type: 'subscribed'; data: { codes: string[] } }
  | { type: 'pong'; data: null }
