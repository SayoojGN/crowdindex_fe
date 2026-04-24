'use client'

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchEntityMetrics } from '@/store/slices/entitySlice'

const KNOWN_COLORS: Record<string, string> = {
  efficacy: '#4664ff',
  tolerability: '#9c27b0',
  safety: '#4caf50',
  accessibility: '#ff9800',
  adverse_effects: '#e91e63',
  availability: '#00bcd4',
}
const PALETTE = ['#4664ff', '#9c27b0', '#4caf50', '#ff9800', '#e91e63', '#00bcd4', '#795548', '#607d8b']

function dimensionColor(dim: string): string {
  if (KNOWN_COLORS[dim]) return KNOWN_COLORS[dim]
  let hash = 0
  for (const ch of dim) hash = (hash * 31 + ch.charCodeAt(0)) % PALETTE.length
  return PALETTE[hash]
}

const PAD = { top: 24, right: 32, bottom: 52, left: 52 }
const VIEW_W = 900
const VIEW_H = 300
const CHART_W = VIEW_W - PAD.left - PAD.right
const CHART_H = VIEW_H - PAD.top - PAD.bottom

function xAt(i: number, total: number) {
  return PAD.left + (i / Math.max(total - 1, 1)) * CHART_W
}

function yAt(score: number) {
  return PAD.top + ((1 - score) / 2) * CHART_H
}

function toPoints(series: number[], total: number) {
  return series.map((score, i) => `${xAt(i, total)},${yAt(score)}`).join(' ')
}

const Y_TICKS = [1, 0.5, 0, -0.5, -1]

export default function SentimentChart({ canonicalName }: { canonicalName: string }) {
  const dispatch = useAppDispatch()
  const { metrics, metricsStatus, metricsError } = useAppSelector((s) => s.entities)
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    dispatch(fetchEntityMetrics(canonicalName))
  }, [canonicalName, dispatch])

  // Derive dimensions that have numeric scores across the dataset
  const numericDimensions: string[] = metrics.length > 0
    ? Object.entries(metrics[0].scores)
        .filter(([, val]) => typeof val === 'number')
        .map(([key]) => key)
    : []

  // Resolve active dimension — fall back to first available when unset or stale
  const activeDim = active && numericDimensions.includes(active)
    ? active
    : numericDimensions[0] ?? ''

  // Build per-dimension series maps: dim → number[]
  const seriesMap: Record<string, number[]> = {}
  for (const dim of numericDimensions) {
    seriesMap[dim] = metrics.map((p) =>
      typeof p.scores[dim] === 'number' ? (p.scores[dim] as number) : 0
    )
  }

  const activeSeries = seriesMap[activeDim] ?? []
  const total = activeSeries.length

  // X-axis labels: every 5th point + last
  const xDates = metrics.map((p) => p.date)
  const xLabelIndices = xDates.reduce<number[]>((acc, _, i) => {
    if (i % 5 === 0 || i === xDates.length - 1) acc.push(i)
    return acc
  }, [])

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h2
            className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]/60"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Sentiment Trends
          </h2>
          <p className="text-xs text-[#6b6b6b] mt-1">Average daily sentiment score per dimension</p>
        </div>

        {numericDimensions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {numericDimensions.map((dim) => {
              const isActive = dim === activeDim
              const color = dimensionColor(dim)
              return (
                <button
                  key={dim}
                  onClick={() => setActive(dim)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-all"
                  style={{
                    backgroundColor: isActive ? color : '#f0f0f0',
                    color: isActive ? '#fff' : '#6b6b6b',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.8)' : color }}
                  />
                  {dim.replace(/_/g, ' ')}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {metricsStatus === 'loading' && (
        <div className="animate-pulse space-y-3">
          <div className="h-44 rounded-xl bg-[#f0f0f0]" />
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-2 w-12 rounded-full bg-[#f0f0f0]" />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {metricsStatus === 'failed' && (
        <p className="text-sm text-[#e55a2b] py-8 text-center">{metricsError}</p>
      )}

      {/* Empty */}
      {metricsStatus === 'succeeded' && total === 0 && (
        <p className="text-sm text-center text-[#6b6b6b] py-8">No metrics data available.</p>
      )}

      {/* Chart */}
      {metricsStatus === 'succeeded' && total > 0 && (
        <>
          <div>
            <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ display: 'block' }}>
              {/* Y-axis gridlines + labels */}
              {Y_TICKS.map((tick) => {
                const y = yAt(tick)
                const isZero = tick === 0
                return (
                  <g key={tick}>
                    <line
                      x1={PAD.left} y1={y}
                      x2={PAD.left + CHART_W} y2={y}
                      stroke={isZero ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.06)'}
                      strokeWidth={isZero ? 1.5 : 1}
                      strokeDasharray={isZero ? '4 3' : undefined}
                    />
                    <text
                      x={PAD.left - 8} y={y} dy="0.35em"
                      textAnchor="end" fontSize={10} fill="#6b6b6b"
                      fontFamily="var(--font-heading)"
                    >
                      {tick.toFixed(1)}
                    </text>
                  </g>
                )
              })}

              {/* Faint background lines for inactive dimensions */}
              {numericDimensions.filter((d) => d !== activeDim).map((dim) => (
                <polyline
                  key={dim}
                  points={toPoints(seriesMap[dim], total)}
                  fill="none"
                  stroke={dimensionColor(dim)}
                  strokeWidth={1}
                  strokeOpacity={0.15}
                />
              ))}

              {/* Active dimension — area fill */}
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={dimensionColor(activeDim)} stopOpacity={0.12} />
                  <stop offset="100%" stopColor={dimensionColor(activeDim)} stopOpacity={0} />
                </linearGradient>
              </defs>
              <polygon
                points={[
                  `${PAD.left},${yAt(0)}`,
                  ...activeSeries.map((score, i) => `${xAt(i, total)},${yAt(score)}`),
                  `${xAt(total - 1, total)},${yAt(0)}`,
                ].join(' ')}
                fill="url(#areaGrad)"
              />

              {/* Active polyline */}
              <polyline
                points={toPoints(activeSeries, total)}
                fill="none"
                stroke={dimensionColor(activeDim)}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* Dots every 3rd point + last */}
              {activeSeries
                .map((score, i) => ({ score, i }))
                .filter(({ i }) => i % 3 === 0 || i === total - 1)
                .map(({ score, i }) => (
                  <circle
                    key={i}
                    cx={xAt(i, total)}
                    cy={yAt(score)}
                    r={3}
                    fill={dimensionColor(activeDim)}
                  />
                ))}

              {/* X-axis date labels */}
              {xLabelIndices.map((i) => (
                <text
                  key={i}
                  x={xAt(i, total)}
                  y={VIEW_H - 8}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#6b6b6b"
                  fontFamily="var(--font-heading)"
                >
                  {new Date(xDates[i]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </text>
              ))}

              {/* Y-axis line */}
              <line
                x1={PAD.left} y1={PAD.top}
                x2={PAD.left} y2={PAD.top + CHART_H}
                stroke="rgba(0,0,0,0.08)" strokeWidth={1}
              />
            </svg>
          </div>

          {/* Latest score badge */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-[#6b6b6b]">
              Latest ({xDates[total - 1]})
            </span>
            <span
              className="text-xs font-semibold tabular-nums rounded-full px-2.5 py-0.5"
              style={{
                backgroundColor: `${dimensionColor(activeDim)}18`,
                color: dimensionColor(activeDim),
                fontFamily: 'var(--font-heading)',
              }}
            >
              {activeSeries[total - 1] > 0 ? '+' : ''}
              {activeSeries[total - 1].toFixed(2)}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
