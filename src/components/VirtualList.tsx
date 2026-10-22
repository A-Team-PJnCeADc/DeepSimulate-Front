import { useCallback, useEffect, useRef, useState } from 'react'

/** 虚拟滚动容器：只渲染可视窗口内的行，配合 rAF 节流滚动事件。 */
export function VirtualList<T>({
  items,
  rowHeight,
  overscan = 8,
  className,
  render,
  empty,
}: {
  items: T[]
  rowHeight: number
  overscan?: number
  className?: string
  render: (item: T, index: number) => React.ReactNode
  empty?: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const raf = useRef(0)
  const [scrollTop, setScrollTop] = useState(0)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setHeight(el.clientHeight))
    ro.observe(el)
    setHeight(el.clientHeight)
    return () => ro.disconnect()
  }, [])

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const st = e.currentTarget.scrollTop
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => setScrollTop(st))
  }, [])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const total = items.length * rowHeight
  const first = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const visible = Math.max(1, Math.ceil(height / rowHeight) + overscan * 2)
  const last = Math.min(items.length, first + visible)

  return (
    <div ref={ref} onScroll={onScroll} className={className ?? 'overflow-auto'}>
      {items.length === 0 ? (
        empty
      ) : (
        <div style={{ height: total, position: 'relative' }}>
          <div style={{ transform: `translateY(${first * rowHeight}px)` }}>
            {items.slice(first, last).map((item, i) => render(item, first + i))}
          </div>
        </div>
      )}
    </div>
  )
}

export interface VirtualRows {
  start: number
  end: number
  padTop: number
  padBottom: number
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void
  containerRef: React.RefObject<HTMLDivElement>
}

/** 表格虚拟行：外层容器滚动，tbody 只用上下占位行补齐高度。 */
export function useVirtualRows(count: number, rowHeight: number, overscan = 10): VirtualRows {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const raf = useRef(0)
  const [scrollTop, setScrollTop] = useState(0)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setHeight(el.clientHeight))
    ro.observe(el)
    setHeight(el.clientHeight)
    return () => ro.disconnect()
  }, [])

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const st = e.currentTarget.scrollTop
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => setScrollTop(st))
  }, [])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const visible = Math.max(1, Math.ceil(height / rowHeight) + overscan * 2)
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const end = Math.min(count, start + visible)

  return {
    start,
    end,
    padTop: start * rowHeight,
    padBottom: Math.max(0, (count - end) * rowHeight),
    onScroll,
    containerRef,
  }
}

/** 表格用的占位行。 */
export function SpacerRow({ height, colSpan }: { height: number; colSpan: number }) {
  if (height <= 0) return null
  return (
    <tr style={{ height }} aria-hidden>
      <td colSpan={colSpan} />
    </tr>
  )
}
