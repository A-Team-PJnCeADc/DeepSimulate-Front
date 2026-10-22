import { useState } from 'react'
import { api, ApiError } from '../api'
import { useApp } from '../store'

export function Login() {
  const login = useApp((s) => s.login)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('trader')
  const [password, setPassword] = useState('trader123')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const auth = mode === 'login' ? await api.login(username, password) : await api.register(username, password)
      login(auth)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '网络异常，请确认后端已启动')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="h-full flex items-center justify-center bg-page">
      <form onSubmit={submit} className="w-[380px] panel p-7">
        <div className="text-lg font-semibold tracking-tight">DeepSimulate</div>
        <div className="text-xs text-muted mt-1">A 股高仿真模拟交易 · 真实五档与逐笔撮合</div>
        <div className="mt-6 flex gap-1 p-1 rounded-md bg-panel2 border border-line text-xs">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 h-8 rounded ${mode === 'login' ? 'bg-panel text-ink shadow-card' : 'text-muted'}`}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 h-8 rounded ${mode === 'register' ? 'bg-panel text-ink shadow-card' : 'text-muted'}`}
          >
            注册
          </button>
        </div>
        <label className="block mt-4 text-xs text-muted">用户名</label>
        <input
          className="field mt-1"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <label className="block mt-3 text-xs text-muted">密码</label>
        <input
          className="field mt-1"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error && <div className="mt-3 text-xs text-up">{error}</div>}
        <button className="btn-buy w-full mt-5" disabled={busy || !username || !password}>
          {busy ? '处理中…' : mode === 'login' ? '进入交易终端' : '创建账户（初始资金 100 万）'}
        </button>
        <div className="mt-4 text-xxs text-muted leading-5">
          模拟环境：撮合基于交易所五档快照与逐笔成交推算，不接真实委托，不产生任何资金往来。
        </div>
      </form>
    </div>
  )
}
