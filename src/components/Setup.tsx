import { useState } from 'react'
import { getToken } from '../api'

type Props = { initial: number; onDone: () => void }

const yuan = (milli: number) => (milli / 1000).toFixed(2)

/** 注册后首次进入：设置初始资金、费用与开始日期 */
export function Setup({ initial, onDone }: Props) {
  const [cash, setCash] = useState(String(Math.round(initial / 1000) || 1000000))
  const [commission, setCommission] = useState('2.5')
  const [minFee, setMinFee] = useState('5')
  const [stamp, setStamp] = useState('1')
  // 默认练手日期 = 今天（本地时区，不能用 toISOString 否则会差一天）
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    const pad = (n: number) => (n < 10 ? `0${n}` : String(n))
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
  })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async () => {
    setBusy(true)
    setErr(null)
    try {
      const token = getToken()
      const body = {
        configured: true,
        initial: Math.round(Number(cash) * 1000),
        commission_bp: Math.round(Number(commission) * 10),
        min_commission: Math.round(Number(minFee) * 1000),
        stamp_bp: Math.round(Number(stamp) * 10),
        start_date: startDate,
      }
      const res = await fetch('/api/me/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.message ?? `HTTP ${res.status}`)
      onDone()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="h-full flex items-center justify-center bg-page">
      <div className="panel w-[440px] p-6 flex flex-col gap-4">
        <div>
          <div className="text-base font-semibold text-ink">开始模拟交易前，先设置账户参数</div>
          <div className="text-xs text-muted mt-1">这些参数决定你的练手起点，建仓后初始资金不可再改</div>
        </div>

        {[
          { label: '初始资金（元）', value: cash, set: setCash, hint: '可用资金与总资产初始值' },
          { label: '佣金（万分之）', value: commission, set: setCommission, hint: '默认万 2.5' },
          { label: '最低佣金（元）', value: minFee, set: setMinFee, hint: '默认 5 元' },
          { label: '印花税（千分之）', value: stamp, set: setStamp, hint: '仅卖出收取，默认千 1' },
          { label: '开始操练日期', value: startDate, set: setStartDate, hint: 'YYYYMMDD，回放默认从这里起' },
        ].map((f) => (
          <label key={f.label} className="flex flex-col gap-1">
            <span className="text-xs text-ink">{f.label}</span>
            <input className="input h-8" value={f.value} onChange={(e) => f.set(e.target.value)} />
            <span className="text-xxs text-muted">{f.hint}</span>
          </label>
        ))}

        <div className="text-xxs text-muted">
          预估：买入 {yuan(Number(cash) * 1000)} 元时佣金按 {commission}‱ 计，最低 {minFee} 元
        </div>
        {err && <div className="text-xs text-up">{err}</div>}
        <button className="btn-buy h-9" disabled={busy} onClick={() => void submit()}>
          {busy ? '保存中…' : '进入交易终端'}
        </button>
      </div>
    </div>
  )
}
