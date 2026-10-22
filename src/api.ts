import type {
  Account,
  AuthResponse,
  FeeEstimate,
  MinuteResp,
  Order,
  Quote,
  ServerStatus,
  StockMeta,
  Tick,
  Trade,
  WatchItem,
} from './types'

const TOKEN_KEY = 'deepsim.token'
const USER_KEY = 'deepsim.user'

export class ApiError extends Error {
  code: string
  constructor(message: string, code = 'error') {
    super(message)
    this.code = code
  }
}

let token: string | null = sessionStorage.getItem(TOKEN_KEY)
let username: string | null = sessionStorage.getItem(USER_KEY)

export function getToken(): string | null {
  return token
}

export function getUsername(): string | null {
  return username
}

export function setAuth(auth: AuthResponse): void {
  token = auth.token
  username = auth.username
  sessionStorage.setItem(TOKEN_KEY, auth.token)
  sessionStorage.setItem(USER_KEY, auth.username)
}

export function clearAuth(): void {
  token = null
  username = null
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const resp = await fetch(path, { ...init, headers: { ...headers, ...(init?.headers ?? {}) } })
  if (resp.status === 204) return undefined as T
  const text = await resp.text()
  const body: unknown = text ? JSON.parse(text) : null
  if (!resp.ok) {
    // 令牌失效（服务端重启/会话过期）直接退回登录页，避免界面停在“加载中”
    if (resp.status === 401) {
      clearAuth()
      if (!location.pathname.endsWith('/login')) {
        location.reload()
      }
    }
    const err = body as { message?: string; code?: string } | null
    throw new ApiError(err?.message ?? `请求失败 ${resp.status}`, err?.code ?? 'http_error')
  }
  return body as T
}

export const api = {
  login: (u: string, p: string) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ username: u, password: p }) }),
  register: (u: string, p: string) =>
    request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify({ username: u, password: p }) }),
  quotes: (codes: string[]) =>
    request<Quote[]>(`/api/quotes?codes=${encodeURIComponent(codes.join(','))}`),
  minute: (code: string) => request<MinuteResp>(`/api/quotes/${code}/minute`),
  ticks: (code: string) => request<Tick[]>(`/api/quotes/${code}/ticks`),
  search: (q: string) => request<StockMeta[]>(`/api/search?q=${encodeURIComponent(q)}`),
  account: () => request<Account>('/api/me/account'),
  orders: (limit = 200) => request<Order[]>(`/api/me/orders?limit=${limit}`),
  trades: (limit = 200) => request<Trade[]>(`/api/me/trades?limit=${limit}`),
  placeOrder: (body: { code: string; side: string; price: number; qty: number }) =>
    request<Order>('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
  cancelOrder: (id: string) => request<Order>(`/api/orders/${id}`, { method: 'DELETE' }),
  watchlist: () => request<WatchItem[]>('/api/watchlist'),
  addWatch: (code: string) =>
    request<WatchItem[]>('/api/watchlist', { method: 'POST', body: JSON.stringify({ code }) }),
  removeWatch: (code: string) => request<WatchItem[]>(`/api/watchlist/${code}`, { method: 'DELETE' }),
  feeEstimate: (side: string, price: number, qty: number) =>
    request<FeeEstimate>(`/api/fee-estimate?side=${side}&price=${price}&qty=${qty}`),
  status: () => request<ServerStatus>('/api/status'),
}
