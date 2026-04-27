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
const SENTIMENT_COLORS = { positive: '#4caf50', neutral: '#6b6b6b', negative: '#ff5722' }

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
  return PAD.top + ((2 - score) / 4) * CHART_H
}
function toPoints(series: number[], total: number) {
  return series.map((score, i) => `${xAt(i, total)},${yAt(score)}`).join(' ')
}

const Y_TICKS = [2, 1, 0, -1, -2]

// ── Dummy post pool + deterministic generator ─────────────────────────────────
interface DummyPost {
  id: string
  source: string
  content: string
  dims: { dimension: string; sentiment: 'positive' | 'neutral' | 'negative' }[]
}

const POST_POOL: Omit<DummyPost, 'id'>[] = [
  { source: 'reddit',  content: 'Started last week — blood sugar already trending down significantly.',         dims: [{ dimension: 'efficacy',       sentiment: 'positive' }] },
  { source: 'forum',   content: 'Mild nausea in the morning but nothing I can\'t handle.',                     dims: [{ dimension: 'tolerability',   sentiment: 'neutral'  }] },
  { source: 'twitter', content: 'Finally feeling hopeful about managing my condition long-term.',               dims: [{ dimension: 'quality_of_life', sentiment: 'positive' }] },
  { source: 'reddit',  content: 'A1C dropped a full point after two months on the full dose. Really working.', dims: [{ dimension: 'efficacy',       sentiment: 'positive' }] },
  { source: 'forum',   content: 'The gastrointestinal side effects are rough. Had to split the dose.',         dims: [{ dimension: 'tolerability',   sentiment: 'negative' }] },
  { source: 'reddit',  content: 'Three months in — best decision I made. Levels are completely stable.',       dims: [{ dimension: 'efficacy',       sentiment: 'positive' }, { dimension: 'quality_of_life', sentiment: 'positive' }] },
  { source: 'forum',   content: 'Switched to extended release to reduce stomach issues. Much better now.',     dims: [{ dimension: 'tolerability',   sentiment: 'positive' }] },
  { source: 'twitter', content: 'Can\'t believe how affordable it is compared to alternatives out there.',     dims: [{ dimension: 'accessibility',  sentiment: 'positive' }] },
  { source: 'reddit',  content: 'Not working as well as I hoped. Weight hasn\'t budged at all.',               dims: [{ dimension: 'efficacy',       sentiment: 'negative' }] },
  { source: 'forum',   content: 'Doctor adjusted my dose. Hoping the next few weeks show improvement.',        dims: [{ dimension: 'efficacy',       sentiment: 'neutral'  }] },
  { source: 'reddit',  content: 'Brain fog is real — feeling sluggish in the mornings since starting.',        dims: [{ dimension: 'tolerability',   sentiment: 'negative' }] },
  { source: 'twitter', content: 'Six weeks in and my energy levels are noticeably better. Very happy.',        dims: [{ dimension: 'quality_of_life', sentiment: 'positive' }] },
  { source: 'forum',   content: 'Pharmacy had it in stock same day. No issues with availability so far.',      dims: [{ dimension: 'availability',   sentiment: 'positive' }] },
  { source: 'reddit',  content: 'Joint discomfort started around week 4. Mentioned it to my doctor.',          dims: [{ dimension: 'tolerability',   sentiment: 'negative' }] },
  { source: 'twitter', content: 'Manageable side effects, great results. Would recommend to anyone in my position.', dims: [{ dimension: 'efficacy', sentiment: 'positive' }, { dimension: 'tolerability', sentiment: 'neutral' }] },
  { source: 'forum',   content: 'Insurance doesn\'t cover it fully — out-of-pocket costs are a real barrier.', dims: [{ dimension: 'accessibility',  sentiment: 'negative' }] },
  { source: 'reddit',  content: 'Dry mouth is annoying but I\'ve gotten used to it after the first month.',    dims: [{ dimension: 'tolerability',   sentiment: 'neutral'  }] },
  { source: 'twitter', content: 'Numbers speak for themselves — down 15 points in 6 weeks.',                   dims: [{ dimension: 'efficacy',       sentiment: 'positive' }] },
  { source: 'forum',   content: 'I don\'t feel as fatigued as I did before starting. Quality of life improvement.', dims: [{ dimension: 'quality_of_life', sentiment: 'positive' }] },
  { source: 'reddit',  content: 'Had to stop for two weeks due to a surgery. Levels spiked right back up.',   dims: [{ dimension: 'efficacy',       sentiment: 'negative' }] },
]

// Deterministic seeded pick — same date always yields same posts
function getDummyPostsForDate(date: string): DummyPost[] {
  let seed = 0
  for (let i = 0; i < date.length; i++) seed = (seed * 31 + date.charCodeAt(i)) >>> 0
  const count = 2 + (seed % 3) // 2, 3 or 4 posts
  const picked: DummyPost[] = []
  const used = new Set<number>()
  let s = seed
  while (picked.length < count) {
    s = (s * 1664525 + 1013904223) >>> 0
    const idx = s % POST_POOL.length
    if (!used.has(idx)) {
      used.add(idx)
      picked.push({ ...POST_POOL[idx], id: `${date}-${idx}` })
    }
  }
  return picked
}

// ── Posts panel ───────────────────────────────────────────────────────────────
function PostsPanel({
  date,
  onClose,
}: {
  date: string | null
  onClose: () => void
}) {
  const formatted = date
    ? new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : ''
  const posts: DummyPost[] = date ? getDummyPostsForDate(date) : []

  return (
    <div className="flex flex-col h-full" style={{ borderLeft: '1px solid rgba(0,0,0,0.06)' }}>
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]/60" style={{ fontFamily: 'var(--font-heading)' }}>
            Posts
          </p>
          {date && (
            <p className="text-xs font-semibold text-[#0e0e0e] mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
              {formatted}
            </p>
          )}
        </div>
        {date && (
          <button
            onClick={onClose}
            className="text-[#6b6b6b] hover:text-[#0e0e0e] transition-colors text-sm leading-none"
          >
            ✕
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {!date && (
          <div className="flex items-center justify-center h-full px-6 text-center">
            <p className="text-xs text-[#6b6b6b]/40 leading-relaxed" style={{ fontFamily: 'var(--font-heading)' }}>
              Click any point on the chart to view posts for that day
            </p>
          </div>
        )}

        {date && posts.length === 0 && (
          <div className="flex items-center justify-center h-full px-6 text-center">
            <p className="text-xs text-[#6b6b6b]/40 leading-relaxed" style={{ fontFamily: 'var(--font-heading)' }}>
              No posts recorded for this day
            </p>
          </div>
        )}

        {date && posts.length > 0 && (
          <ul>
            {posts.map((post, i) => (
              <li
                key={post.id}
                className="px-4 py-3 space-y-1.5"
                style={{ borderBottom: i < posts.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
              >
                {/* Source badge */}
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-[#f0f0f0] text-[#6b6b6b]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {post.source}
                </span>

                {/* Content — single line truncated */}
                <p className="text-xs text-[#0e0e0e] truncate leading-snug">{post.content}</p>

                {/* Dimension pills */}
                <div className="flex flex-wrap gap-1">
                  {post.dims.map(({ dimension, sentiment }) => {
                    const color = dimensionColor(dimension)
                    return (
                      <span
                        key={dimension}
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize"
                        style={{ backgroundColor: `${color}12`, color, fontFamily: 'var(--font-heading)' }}
                      >
                        {dimension.replace(/_/g, ' ')}
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: SENTIMENT_COLORS[sentiment] }}
                        />
                      </span>
                    )
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SentimentChart({ canonicalName }: { canonicalName: string }) {
  const dispatch = useAppDispatch()
  const { metrics, metricsStatus, metricsError } = useAppSelector((s) => s.entities)
  const [active, setActive] = useState<string>('')
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [selectedPoint, setSelectedPoint] = useState<{ date: string; idx: number } | null>(null)

  useEffect(() => {
    dispatch(fetchEntityMetrics(canonicalName))
  }, [canonicalName, dispatch])

  const numericDimensions: string[] = metrics.length > 0
    ? Object.entries(metrics[0].scores)
        .filter(([, val]) => typeof val === 'number')
        .map(([key]) => key)
    : []

  const activeDim = active && numericDimensions.includes(active)
    ? active
    : numericDimensions[0] ?? ''

  const seriesMap: Record<string, number[]> = {}
  for (const dim of numericDimensions) {
    seriesMap[dim] = metrics.map((p) =>
      typeof p.scores[dim] === 'number' ? (p.scores[dim] as number) : 0
    )
  }

  const activeSeries = seriesMap[activeDim] ?? []
  const total = activeSeries.length
  const xDates = metrics.map((p) => p.date)


  // Column pitch for transparent hit-area rects
  const pitch = total > 1 ? CHART_W / (total - 1) : CHART_W

  const panelOpen = true // panel always rendered, content depends on selectedPoint

  return (
    <div className="rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-6 pb-4 gap-4 flex-wrap" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
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

      {/* Body */}
      <div className="flex" style={{ minHeight: 240 }}>
        {/* Chart column */}
        <div className="flex-1 min-w-0 p-6 pt-4">
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

          {metricsStatus === 'failed' && (
            <p className="text-sm text-[#e55a2b] py-8 text-center">{metricsError}</p>
          )}

          {metricsStatus === 'succeeded' && total === 0 && (
            <p className="text-sm text-center text-[#6b6b6b] py-8">No metrics data available.</p>
          )}

          {metricsStatus === 'succeeded' && total > 0 && (
            <>
              <svg
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                width="100%"
                style={{ display: 'block', cursor: 'crosshair' }}
              >
                {/* Y-axis gridlines + labels */}
                {Y_TICKS.map((tick) => {
                  const y = yAt(tick)
                  const isZero = tick === 0
                  return (
                    <g key={tick}>
                      <line
                        x1={PAD.left} y1={y} x2={PAD.left + CHART_W} y2={y}
                        stroke={isZero ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.06)'}
                        strokeWidth={isZero ? 1.5 : 1}
                        strokeDasharray={isZero ? '4 3' : undefined}
                      />
                      <text x={PAD.left - 8} y={y} dy="0.35em" textAnchor="end" fontSize={10} fill="#6b6b6b" fontFamily="var(--font-heading)">
                        {tick.toFixed(1)}
                      </text>
                    </g>
                  )
                })}

                {/* Hover vertical indicator */}
                {hoveredIdx !== null && hoveredIdx !== selectedPoint?.idx && (
                  <line
                    x1={xAt(hoveredIdx, total)} y1={PAD.top}
                    x2={xAt(hoveredIdx, total)} y2={PAD.top + CHART_H}
                    stroke="rgba(0,0,0,0.12)" strokeWidth={1} strokeDasharray="4 3"
                  />
                )}

                {/* Selected vertical indicator */}
                {selectedPoint !== null && (
                  <line
                    x1={xAt(selectedPoint.idx, total)} y1={PAD.top}
                    x2={xAt(selectedPoint.idx, total)} y2={PAD.top + CHART_H}
                    stroke={dimensionColor(activeDim)} strokeWidth={1.5} strokeOpacity={0.4}
                  />
                )}

                {/* Inactive dimension lines */}
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

                {/* Area fill */}
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

                {/* Solid circle at every data point */}
                {activeSeries.map((score, i) => {
                  if (i === hoveredIdx || i === selectedPoint?.idx) return null
                  return (
                    <circle key={i} cx={xAt(i, total)} cy={yAt(score)} r={2} fill={dimensionColor(activeDim)} />
                  )
                })}

                {/* Hovered dot */}
                {hoveredIdx !== null && hoveredIdx !== selectedPoint?.idx && (
                  <circle
                    cx={xAt(hoveredIdx, total)}
                    cy={yAt(activeSeries[hoveredIdx])}
                    r={5}
                    fill={dimensionColor(activeDim)}
                    fillOpacity={0.7}
                  />
                )}

                {/* Selected dot */}
                {selectedPoint !== null && (
                  <circle
                    cx={xAt(selectedPoint.idx, total)}
                    cy={yAt(activeSeries[selectedPoint.idx])}
                    r={5}
                    fill={dimensionColor(activeDim)}
                    stroke="white"
                    strokeWidth={2}
                  />
                )}

                {/* X-axis label at every point — small font to fit density */}
                {xDates.map((date, i) => (
                  <text key={i} x={xAt(i, total)} y={VIEW_H - 8} textAnchor="middle" fontSize={8} fill="#6b6b6b" fontFamily="var(--font-heading)">
                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </text>
                ))}

                {/* Y-axis line */}
                <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + CHART_H} stroke="rgba(0,0,0,0.08)" strokeWidth={1} />

                {/* Transparent hit-area rects over each data point */}
                {activeSeries.map((_, i) => {
                  const cx = xAt(i, total)
                  const hw = pitch / 2
                  return (
                    <rect
                      key={i}
                      x={cx - hw}
                      y={PAD.top}
                      width={hw * 2}
                      height={CHART_H}
                      fill="transparent"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      onClick={() => setSelectedPoint({ date: xDates[i], idx: i })}
                    />
                  )
                })}
              </svg>

              {/* Latest score badge */}
              <div className="mt-2 flex items-center gap-2">
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

        {/* Posts panel — always rendered, width collapses when nothing selected */}
        {panelOpen && (
          <div
            className="shrink-0 flex flex-col transition-all duration-300"
            style={{ width: 260, borderLeft: '1px solid rgba(0,0,0,0.06)' }}
          >
            <PostsPanel
              date={selectedPoint?.date ?? null}
              onClose={() => setSelectedPoint(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
