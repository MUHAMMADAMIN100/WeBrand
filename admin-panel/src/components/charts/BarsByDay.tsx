import { useId, useState } from 'react'
import type { DayCount } from '../../lib/dashboard'
import { plural } from '../../lib/dashboard'

const fmtDay = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })
const fmtLong = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })

/** Clean y-axis top: 1-2-5 steps so ticks are round numbers. */
function niceMax(max: number): { top: number; ticks: number[] } {
  if (max <= 0) return { top: 4, ticks: [0, 2, 4] }
  const raw = max / 4
  const pow = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 5, 10].map((k) => k * pow).find((s) => s >= raw) ?? raw
  const top = Math.ceil(max / step) * step
  const ticks = []
  for (let v = 0; v <= top; v += step) ticks.push(v)
  return { top, ticks }
}

/**
 * Leads per day as a column chart in plain SVG. One series, so no legend: the
 * card's title names it. Each column is its own hover/focus target with a
 * tooltip; the same numbers live in a visually hidden table for readers who
 * never hover. Columns are thin (<= 24px), rounded only at the data end, and
 * grow from one baseline; the grid is recessive.
 */
export function BarsByDay({ data, title }: { data: DayCount[]; title: string }) {
  const id = useId()
  const [active, setActive] = useState<number | null>(null)

  const W = 720
  const H = 220
  const PAD = { top: 12, right: 8, bottom: 28, left: 32 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const max = Math.max(0, ...data.map((d) => d.count))
  const { top, ticks } = niceMax(max)
  const slot = innerW / data.length
  const barW = Math.min(24, slot - 2) // 2px of surface between neighbours
  const x = (i: number) => PAD.left + i * slot + (slot - barW) / 2
  const y = (v: number) => PAD.top + innerH - (v / top) * innerH
  const total = data.reduce((s, d) => s + d.count, 0)
  const empty = total === 0

  // Month-day labels every 7 days plus the last day, so 30 slots never collide.
  const labelAt = (i: number) => i === data.length - 1 || (data.length - 1 - i) % 7 === 0

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="group"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-table`}
      >
        <title id={`${id}-title`}>{title}</title>
        {/* Grid: hairlines behind the marks. */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              className="stroke-ink-200 dark:stroke-ink-800"
              strokeWidth={1}
              strokeDasharray={t === 0 ? undefined : '2 4'}
            />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className="fill-ink-500 text-[11px] tabular-nums dark:fill-ink-400">
              {t}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const h = (d.count / top) * innerH
          const isActive = active === i
          const bx = x(i)
          const by = y(d.count)
          const r = Math.min(4, barW / 2, h)
          // Rounded data end, square baseline: a path, not a rect with rx.
          const path =
            d.count === 0
              ? ''
              : `M${bx},${PAD.top + innerH} V${by + r} Q${bx},${by} ${bx + r},${by} H${bx + barW - r} Q${bx + barW},${by} ${bx + barW},${by + r} V${PAD.top + innerH} Z`
          return (
            <g key={d.day}>
              {path && (
                <path
                  d={path}
                  className={isActive ? 'fill-lime-deep dark:fill-lime' : 'fill-brand-600 dark:fill-brand-400'}
                />
              )}
              {/* Hit target: the whole slot, taller than the mark. */}
              <rect
                x={PAD.left + i * slot}
                y={PAD.top}
                width={slot}
                height={innerH}
                fill="transparent"
                tabIndex={0}
                role="graphics-symbol"
                aria-label={`${fmtLong.format(d.day)}: ${d.count} ${plural(d.count, 'заявка', 'заявки', 'заявок')}`}
                className="cursor-default outline-none"
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive((a) => (a === i ? null : a))}
                onFocus={() => setActive(i)}
                onBlur={() => setActive((a) => (a === i ? null : a))}
              />
              {labelAt(i) && (
                <text
                  x={bx + barW / 2}
                  y={H - 8}
                  textAnchor="middle"
                  className="fill-ink-500 text-[11px] dark:fill-ink-400"
                >
                  {fmtDay.format(d.day)}
                </text>
              )}
            </g>
          )
        })}

        {empty && (
          <text x={PAD.left + innerW / 2} y={PAD.top + innerH / 2} textAnchor="middle" className="fill-ink-500 text-[13px] dark:fill-ink-400">
            За эти 30 дней заявок не было
          </text>
        )}
      </svg>

      {/* Tooltip: value leads, date follows; positioned over the active slot. */}
      {active !== null && data[active] && (
        <div
          role="tooltip"
          className="pointer-events-none absolute -top-1 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl bg-ink-950 px-3 py-2 text-xs text-white shadow-lg dark:bg-white dark:text-ink-950"
          style={{ left: `${((PAD.left + active * slot + slot / 2) / W) * 100}%` }}
        >
          <span className="font-display text-sm font-bold tabular-nums">{data[active].count}</span>{' '}
          {plural(data[active].count, 'заявка', 'заявки', 'заявок')}
          <span className="ml-2 text-white/70 dark:text-ink-600">{fmtLong.format(data[active].day)}</span>
        </div>
      )}

      {/* The same numbers as a table, for readers who do not hover. */}
      <table id={`${id}-table`} className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">День</th>
            <th scope="col">Заявок</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.day}>
              <td>{fmtLong.format(d.day)}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
