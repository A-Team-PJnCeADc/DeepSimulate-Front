export const yuan = (milli: number, digits = 2): string => (milli / 1000).toFixed(digits)

export const price = (milli: number): string => (milli / 1000).toFixed(2)

export const money = (milli: number): string =>
  (milli / 1000).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const signedMoney = (milli: number): string => (milli > 0 ? '+' : '') + money(milli)

export const pct = (ratio: number): string => `${ratio > 0 ? '+' : ''}${ratio.toFixed(2)}%`

export const shares = (qty: number): string => qty.toLocaleString('zh-CN')

export const lots = (qty: number): string => (qty / 100).toFixed(qty % 100 === 0 ? 0 : 2)

export const timeOf = (ms: number): string =>
  new Date(ms).toLocaleTimeString('zh-CN', { hour12: false, timeZone: 'Asia/Shanghai' })

export const clockOf = (ms: number): string =>
  new Date(ms).toLocaleString('zh-CN', { hour12: false, timeZone: 'Asia/Shanghai' })

export const toneOf = (v: number): string => (v > 0 ? 'text-up' : v < 0 ? 'text-down' : 'text-muted')

export const changeTone = (last: number, prevClose: number): string => toneOf(last - prevClose)

export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ')
