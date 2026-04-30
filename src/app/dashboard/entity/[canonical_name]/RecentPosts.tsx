'use client'

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchEntityAnalysis, type AnalysisPost } from '@/store/slices/entitySlice'

function RecentPostsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-black/[0.05] animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white px-6 py-5 space-y-3">
          {/* source badge + date */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 rounded-full bg-[#f0f0f0]" />
            <div className="h-3 w-20 rounded-full bg-[#f0f0f0] ml-auto" />
          </div>
          {/* content lines */}
          <div className="space-y-2">
            <div className="h-3 w-full rounded-full bg-[#f0f0f0]" />
            <div className="h-3 w-4/5 rounded-full bg-[#f0f0f0]" />
            <div className="h-3 w-3/4 rounded-full bg-[#f0f0f0]" />
            <div className="h-3 w-2/3 rounded-full bg-[#f0f0f0]" />
          </div>
          {/* dimension badges + link */}
          <div className="flex gap-1.5 pt-1">
            <div className="h-4 w-14 rounded-full bg-[#f0f0f0]" />
            <div className="h-4 w-16 rounded-full bg-[#f0f0f0]" />
            <div className="h-3 w-16 rounded-full bg-[#f0f0f0] ml-auto self-center" />
          </div>
        </div>
      ))}
    </div>
  )
}

type SentimentFilter = 'all' | 'positive' | 'neutral' | 'negative'
type DimensionFilter = 'all' | string

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

const SENTIMENT_COLORS = {
  positive: '#4caf50',
  neutral: '#6b6b6b',
  negative: '#ff5722',
}

function evaluativeDims(post: AnalysisPost) {
  return (post.dimensions ?? []).filter((d) => d.dimension_type === 'evaluative')
}

function postMatchesSentiment(post: AnalysisPost, sentiment: SentimentFilter): boolean {
  if (sentiment === 'all') return true
  return evaluativeDims(post).some((d) => d.overall_sentiment === sentiment)
}

function postMatchesDimension(post: AnalysisPost, dim: DimensionFilter): boolean {
  if (dim === 'all') return true
  return evaluativeDims(post).some((d) => d.dimension === dim)
}

export default function RecentPosts({ canonicalName }: { canonicalName: string }) {
  const dispatch = useAppDispatch()
  const { analysis, analysisStatus, analysisError } = useAppSelector((s) => s.entities)
  const [activeDimension, setActiveDimension] = useState<DimensionFilter>('all')
  const [activeSentiment, setActiveSentiment] = useState<SentimentFilter>('all')
  const [page, setPage] = useState(0)

  const PAGE_SIZE = 4

  useEffect(() => {
    dispatch(fetchEntityAnalysis(canonicalName))
  }, [canonicalName, dispatch])

  const analysisRows = analysis ?? []

  // Derive unique evaluative dimensions from data
  const allDimensions = Array.from(
    new Set(
      analysisRows.flatMap((p) =>
        (p.dimensions ?? []).filter((d) => d.dimension_type === 'evaluative').map((d) => d.dimension)
      )
    )
  ).sort()

  const filtered = analysisRows
    .filter((p) =>
      evaluativeDims(p).length > 0 &&
      postMatchesDimension(p, activeDimension) &&
      postMatchesSentiment(p, activeSentiment)
    )
    .sort((a, b) => b.posted_at.localeCompare(a.posted_at))

  const safeDimension: DimensionFilter = activeDimension === 'all' || allDimensions.includes(activeDimension)
    ? activeDimension
    : 'all'

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const safePage = Math.min(page, Math.max(totalPages - 1, 0))
  const paged = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  return (
    <div className="rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Header + filters */}
      <div className="px-6 pt-6 pb-4 space-y-4">
        <h2
          className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]/60"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Recent Posts
        </h2>

        {/* Dimension filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setActiveDimension('all'); setPage(0) }}
            className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              backgroundColor: safeDimension === 'all' ? '#0e0e0e' : '#f0f0f0',
              color: safeDimension === 'all' ? '#fff' : '#6b6b6b',
              fontFamily: 'var(--font-heading)',
            }}
          >
            All Dimensions
          </button>
          {allDimensions.map((dim) => {
            const isActive = safeDimension === dim
            const color = dimensionColor(dim)
            return (
              <button
                key={dim}
                onClick={() => { setActiveDimension(dim); setPage(0) }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors capitalize"
                style={{
                  backgroundColor: isActive ? color : '#f0f0f0',
                  color: isActive ? '#fff' : '#6b6b6b',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.7)' : color }}
                />
                {dim.replace(/_/g, ' ')}
              </button>
            )
          })}
        </div>

        {/* Sentiment filter + result count */}
        <div className="flex gap-2 items-center">
          {(['all', 'positive', 'neutral', 'negative'] as SentimentFilter[]).map((s) => {
            const isActive = activeSentiment === s
            const color = s === 'all' ? '#0e0e0e' : SENTIMENT_COLORS[s]
            return (
              <button
                key={s}
                onClick={() => { setActiveSentiment(s); setPage(0) }}
                className="rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors"
                style={{
                  backgroundColor: isActive ? color : '#f0f0f0',
                  color: isActive ? '#fff' : '#6b6b6b',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {s === 'all' ? 'All' : s}
              </button>
            )
          })}
          <span className="ml-auto text-xs text-[#6b6b6b]">
            {filtered.length} post{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        {analysisStatus === 'loading' && <RecentPostsSkeleton />}

        {analysisStatus === 'failed' && (
          <p className="px-6 py-8 text-sm text-center text-[#e55a2b]">{analysisError}</p>
        )}

        {analysisStatus === 'succeeded' && filtered.length === 0 && (
          <p className="px-6 py-10 text-sm text-center text-[#6b6b6b]">
            No posts match the selected filters.
          </p>
        )}

        {analysisStatus === 'succeeded' && filtered.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.05]">
              {paged.map((post) => (
                <div key={post.post_id} className="bg-white px-6 py-5 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-[#f0f0f0] text-[#6b6b6b]"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {post.source_type}
                    </span>
                    <span className="ml-auto text-[10px] text-[#6b6b6b]/60 shrink-0">
                      {new Date(post.posted_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="relative max-h-20 overflow-hidden">
                    <p className="text-sm text-[#0e0e0e] leading-relaxed">{post.content}</p>
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {evaluativeDims(post).map((dim) => {
                      const color = dimensionColor(dim.dimension)
                      const sentColor = SENTIMENT_COLORS[dim.overall_sentiment]
                      return (
                        <span
                          key={dim.dimension}
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize"
                          style={{
                            backgroundColor: `${color}12`,
                            color,
                            fontFamily: 'var(--font-heading)',
                          }}
                        >
                          {dim.dimension.replace(/_/g, ' ')}
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: sentColor }}
                          />
                        </span>
                      )
                    })}
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-[10px] text-[#4664ff] hover:underline shrink-0 self-center"
                    >
                      View post →
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div
                className="flex items-center justify-between px-6 py-3"
                style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
              >
                <span className="text-[11px] text-[#6b6b6b]" style={{ fontFamily: 'var(--font-heading)' }}>
                  {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex gap-1">
                  <button
                    disabled={safePage === 0}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-30"
                    style={{ fontFamily: 'var(--font-heading)', backgroundColor: '#f0f0f0', color: '#6b6b6b' }}
                  >
                    ← Prev
                  </button>
                  <button
                    disabled={safePage === totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-30"
                    style={{ fontFamily: 'var(--font-heading)', backgroundColor: '#f0f0f0', color: '#6b6b6b' }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
