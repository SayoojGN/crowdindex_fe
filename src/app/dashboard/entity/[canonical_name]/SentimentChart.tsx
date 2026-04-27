'use client'

import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchEntityMetrics, fetchPostsForDate } from '@/store/slices/entitySlice'
import type { PostForDate } from '@/store/slices/entitySlice'
import { Spinner } from '@/components/Spinner'

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
  return PAD.top + ((2 - score) / 4) * CHART_H
}
function toPoints(series: number[], total: number) {
  return series.map((score, i) => `${xAt(i, total)},${yAt(score)}`).join(' ')
}

const Y_TICKS = [2, 1, 0, -1, -2]

// ── Post detail modal ─────────────────────────────────────────────────────────
function PostModal({ post, onClose }: { post: PostForDate; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const preview = post.content.length > 200 ? post.content.slice(0, 200) + '…' : post.content

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl bg-white shadow-[0_16px_48px_rgba(0,0,0,0.16)] overflow-hidden">
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}
        >
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-[#f0f0f0] text-[#6b6b6b]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {post.source_type}
          </span>
          <button
            onClick={onClose}
            className="rounded-full w-7 h-7 flex items-center justify-center text-[#6b6b6b] hover:bg-[#f0f0f0] transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto">
          {/* Content preview */}
          <div className="px-6 py-5 space-y-3">
            <p className="text-sm text-[#0e0e0e] leading-relaxed">{preview}</p>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs font-medium text-[#4664ff] hover:underline"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Read more →
            </a>
          </div>

          {/* Extraction mentions */}
          {(post.extraction_mentions ?? []).length > 0 && (
            <div className="pb-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="px-6 pt-4 pb-2">
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]/60"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Mentions
                </p>
              </div>
              {(post.extraction_mentions ?? []).map((m, i) => (
                <div
                  key={m.id}
                  className="px-6 py-3 space-y-1.5"
                  style={{ borderTop: i > 0 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
                >
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize"
                    style={{
                      backgroundColor: `${dimensionColor(m.dimension)}12`,
                      color: dimensionColor(m.dimension),
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {m.dimension.replace(/_/g, ' ')}
                  </span>
                  <p className="text-xs text-[#3a3a3a] leading-relaxed">{m.evidence}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Posts panel ───────────────────────────────────────────────────────────────
function PostsPanel({
  date,
  canonicalName,
  onClose,
}: {
  date: string | null
  canonicalName: string
  onClose: () => void
}) {
  const dispatch = useAppDispatch()
  const { postsForDate: posts, postsForDateStatus, postsForDateError: error } = useAppSelector((s) => s.entities)
  const [modalPost, setModalPost] = useState<PostForDate | null>(null)

  const formatted = date
    ? new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : ''

  useEffect(() => {
    if (!date) return
    dispatch(fetchPostsForDate({ canonicalName, date }))
  }, [date, canonicalName, dispatch])

  if (!date) return null

  const colClass =
    posts.length === 1 ? 'grid-cols-1' :
    posts.length === 2 ? 'grid-cols-2' :
    'grid-cols-3'

  return (
    <>
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        {/* Section header */}
        <div
          className="flex items-center justify-between px-6 py-3"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]/60"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Posts
            </span>
            <span
              className="text-xs font-semibold text-[#0e0e0e]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {formatted}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#6b6b6b] hover:text-[#0e0e0e] transition-colors text-sm leading-none"
          >
            ✕
          </button>
        </div>

        {/* States */}
        {(postsForDateStatus === 'idle' || postsForDateStatus === 'loading') && (
          <Spinner className="py-6" />
        )}

        {postsForDateStatus === 'failed' && (
          <p className="px-6 py-6 text-xs text-center text-[#e55a2b]">{error}</p>
        )}

        {postsForDateStatus === 'succeeded' && posts.length === 0 && (
          <p className="px-6 py-6 text-xs text-center text-[#6b6b6b]/50">No posts recorded for this day</p>
        )}

        {postsForDateStatus === 'succeeded' && posts.length > 0 && (
          <div className="overflow-y-auto" style={{ maxHeight: 294 }}>
            <div className={`grid ${colClass} gap-px bg-black/[0.04]`}>
              {posts.map((post) => {
                const truncated = post.content.length > 100
                  ? post.content.slice(0, 100) + '…'
                  : post.content
                const mentionCount = (post.extraction_mentions ?? []).length
                return (
                  <div
                    key={post.id}
                    onClick={() => setModalPost(post)}
                    className="bg-white px-5 py-4 space-y-2 cursor-pointer hover:bg-[#f7f7f7] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-[#f0f0f0] text-[#6b6b6b]"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {post.source_type}
                      </span>
                      {mentionCount > 0 && (
                        <span
                          className="text-[10px] text-[#4664ff] shrink-0"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          {mentionCount} mention{mentionCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#0e0e0e] leading-snug">{truncated}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {modalPost && (
        <PostModal post={modalPost} onClose={() => setModalPost(null)} />
      )}
    </>
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

  const pitch = total > 1 ? CHART_W / (total - 1) : CHART_W

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
      <div style={{ minHeight: 240 }}>
        {/* Chart column */}
        <div className="min-w-0 p-6 pt-4">
          {metricsStatus === 'loading' && <Spinner />}

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

                {/* X-axis labels */}
                {xDates.map((date, i) => (
                  <text key={i} x={xAt(i, total)} y={VIEW_H - 8} textAnchor="middle" fontSize={8} fill="#6b6b6b" fontFamily="var(--font-heading)">
                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </text>
                ))}

                {/* Y-axis line */}
                <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + CHART_H} stroke="rgba(0,0,0,0.08)" strokeWidth={1} />

                {/* Transparent hit-area rects */}
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

      </div>

      <PostsPanel
        date={selectedPoint?.date ?? null}
        canonicalName={canonicalName}
        onClose={() => setSelectedPoint(null)}
      />
    </div>
  )
}
