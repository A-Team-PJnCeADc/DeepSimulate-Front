import type { WsMessage } from './types'

type Status = 'connecting' | 'open' | 'closed'

/**
 * 行情/委托推送通道。断线后指数退避重连，重连成功即触发一次 REST 全量对齐。
 */
class LiveSocket {
  private ws: WebSocket | null = null
  private token = ''
  private want = new Set<string>()
  private attempt = 0
  private stopped = true
  private timer: ReturnType<typeof setTimeout> | null = null

  onMessage: (m: WsMessage) => void = () => {}
  onStatus: (s: Status) => void = () => {}
  onResync: () => void = () => {}

  connect(token: string): void {
    if (this.token === token && this.ws && this.ws.readyState <= 1) return
    this.stop()
    this.token = token
    this.stopped = false
    this.open()
  }

  private open(): void {
    if (this.stopped || !this.token) return
    this.onStatus('connecting')
    const proto = location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${proto}://${location.host}/ws?token=${encodeURIComponent(this.token)}`)
    this.ws = ws
    ws.onopen = () => {
      this.attempt = 0
      this.onStatus('open')
      this.sendSubs()
      this.onResync()
    }
    ws.onmessage = (ev) => {
      try {
        this.onMessage(JSON.parse(String(ev.data)) as WsMessage)
      } catch {
        /* 非法帧忽略 */
      }
    }
    ws.onerror = () => {
      try {
        ws.close()
      } catch {
        /* 已关闭 */
      }
    }
    ws.onclose = () => {
      this.ws = null
      this.onStatus('closed')
      this.schedule()
    }
  }

  private schedule(): void {
    if (this.stopped) return
    const delay = Math.min(8000, 500 * 2 ** this.attempt)
    this.attempt += 1
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => this.open(), delay)
  }

  private send(msg: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg))
  }

  private sendSubs(): void {
    if (this.want.size > 0) this.send({ type: 'subscribe', codes: [...this.want] })
  }

  /** 设置订阅集合，只发送差量。 */
  setCodes(codes: string[]): void {
    const next = new Set(codes)
    const added = [...next].filter((c) => !this.want.has(c))
    const removed = [...this.want].filter((c) => !next.has(c))
    this.want = next
    if (added.length) this.send({ type: 'subscribe', codes: added })
    if (removed.length) this.send({ type: 'unsubscribe', codes: removed })
  }

  stop(): void {
    this.stopped = true
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
    if (this.ws) {
      this.ws.onclose = null
      this.ws.close()
      this.ws = null
    }
  }
}

export const live = new LiveSocket()
