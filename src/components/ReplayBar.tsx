import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useApp } from '../store'
import { cx } from '../format'

interface ReplayStatus {
  status: string
  date: string
  clock: string
  start: string
  end: string
  speed: number
  paused: boolean
  snapshots: number
  trades: number
  codes: string[]
  error: string | null
  progress: number
  detail: string
}

interface ImportStatus {
  running: boolean
  date: string
  total: number
  done: number
  current: string
  last_error: string | null
}

const SPEEDS = [1, 5, 20, 60, 200]
const STATUS_LABEL: Record<string, string> = {
  idle: '未开始',
  loading: '加载中',
  importing: '补数据',
  running: '回放中',
  paused: '已暂停',
  finished: '已结束',
  error: '异常',
}

async function call<T>(path: string, body?: unknown): Promise<T> {
  const resp = await fetch(path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await resp.text()
  const json = text ? JSON.parse(text) : null
  if (!resp.ok) throw new Error(json?.message ?? `请求失败 ${resp.status}`)
  return json as T
}

/** 回放控制条：选择日期与倍速、暂停/继续、导入当日 L2 数据。 */
export function ReplayBar() {
  const qc = useQueryClient()
  const watchlist = useApp((s) => s.watchlist)
  const [date, setDate] = useState('20260930')
  const [msg, setMsg] = useState<string | null>(null)

  const { data: status } = useQuery({
    queryKey: ['replay-status'],
    queryFn: () => call<ReplayStatus>('/api/replay/status'),
    refetchInterval: 1_500,
  })
  const { data: imp } = useQuery({
    queryKey: ['replay-import'],
    queryFn: () => call<ImportStatus>('/api/replay/import/status'),
    refetchInterval: 2_000,
  })
  const { data: days } = useQuery({
    queryKey: ['replay-days'],
    queryFn: () => call<{ imported: { date: string; codes: number }[] }>('/api/replay/days'),
    refetchInterval: 10_000,
  })

  useEffect(() => {
    if (status?.date) setDate(status.date)
  }, [status?.date])

  const imported = useMemo(() => days?.imported ?? [], [days])
  const picked = imported.find((d) => d.date === date)
  const running =
    status?.status === 'running' ||
    status?.status === 'paused' ||
    status?.status === 'loading' ||
    status?.status === 'importing'

  const [starting, setStarting] = useState(false)

  /** 开始回放：缺失的数据由后端自动向 D5 拉取并缓存，前端只关注进度 */
  const startFlow = async () => {
    if (date.length !== 8) return
    setStarting(true)
    setMsg(null)
    try {
      await call('/api/replay/start', {
        date,
        clock: '09:25:00',
        speed: 5,
        codes: watchlist.map((w) => w.code),
      })
      setMsg('回放已启动')
      await qc.invalidateQueries({ queryKey: ['replay-status'] })
    } catch (e) {
      setMsg(e instanceof Error ? e.message : '启动失败')
    } finally {
      setStarting(false)
    }
  }

  const act = async (fn: () => Promise<unknown>, ok: string) => {
    setMsg(null)
    try {
      await fn()
      setMsg(ok)
      await qc.invalidateQueries({ queryKey: ['replay-status'] })
    } catch (e) {
      setMsg(e instanceof Error ? e.message : '操作失败')
    }
  }

  return (
    <div className="h-9 shrink-0 border-b border-line bg-panel2 flex items-center gap-3 px-4 text-xxs text-muted">
      <span className="flex items-center gap-1.5">
        <i
          className={cx(
            'inline-block w-1.5 h-1.5 rounded-full',
            status?.status === 'running' ? 'bg-accent' : status?.status === 'error' ? 'bg-up' : 'bg-muted',
          )}
        />
        回放 {STATUS_LABEL[status?.status ?? 'idle'] ?? status?.status}
      </span>

      <input
        className="field h-7 w-[92px] text-xxs text-center"
        value={date}
        onChange={(e) => setDate(e.target.value.replace(/[^\d]/g, '').slice(0, 8))}
        placeholder="YYYYMMDD"
      />
      {picked ? (
        <span className="num">已导入 {picked.codes} 只</span>
      ) : (
        <span className="text-up">该日未导入</span>
      )}

      <button
        className="btn-ghost h-7 px-2"
        disabled={imp?.running || date.length !== 8}
        onClick={() =>
          act(
            () =>
              call('/api/replay/import', {
                date,
                codes: watchlist.map((w) => w.code),
              }),
            '已开始导入',
          )
        }
      >
        {imp?.running ? `导入 ${imp.done}/${imp.total}` : '导入自选池'}
      </button>

      <button
        className="btn-buy h-7 px-3"
        disabled={running || starting || date.length !== 8}
        onClick={() => void startFlow()}
      >
        {starting ? '准备中…' : '开始'}
      </button>

      <button
        className="btn-ghost h-7 px-2"
        disabled={!status || status.status === 'idle'}
        onClick={() =>
          act(
            () =>
              call('/api/replay/control', {
                action: status?.paused ? 'resume' : 'pause',
              }),
            status?.paused ? '继续' : '暂停',
          )
        }
      >
        {status?.paused ? '继续' : '暂停'}
      </button>

      <div className="flex items-center gap-1">
        {SPEEDS.map((s) => (
          <button
            key={s}
            className={cx(
              'h-6 px-1.5 rounded border',
              Math.round(status?.speed ?? 0) === s
                ? 'border-accent/60 text-ink bg-panel'
                : 'border-line text-muted hover:text-ink',
            )}
            onClick={() => act(() => call('/api/replay/control', { action: 'speed', value: s }), `${s}x`)}
          >
            {s}x
          </button>
        ))}
      </div>

      <span className="num text-ink">
        {status?.clock || '--:--:--'} / {status?.end || '15:00:00'}
      </span>

      <div className="w-24 h-1.5 rounded bg-line overflow-hidden">
        <div className="h-full bg-accent" style={{ width: `${(status?.progress ?? 0) * 100}%` }} />
      </div>

      <span className="num">
        快照 {status?.snapshots ?? 0} · 成交 {status?.trades ?? 0}
      </span>
      <span className="num">
        可交易 {status?.codes.length ?? 0}/{watchlist.length}
      </span>

      {status?.detail && <span className="text-accent">{status.detail}</span>}
      {msg && <span className={cx(msg.includes('失败') || msg.includes('异常') ? 'text-up' : 'text-down')}>{msg}</span>}
      {(status?.error || imp?.last_error) && (
        <span className="text-up truncate max-w-[420px]" title={status?.error ?? imp?.last_error ?? ''}>
          {status?.error ?? imp?.last_error}
        </span>
      )}
    </div>
  )
}
