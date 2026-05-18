'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppSelector } from '@/store'
import type { DimensionScore } from '@/store/slices/entitySlice'

const PAGE_SIZE = 20

/** Bucketing key so "Side Effects" and side_effects share one section. */
function normalizedDimensionKey(dimension: string): string {
  return dimension
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

function formatDimensionTitle(dim: string): string {
  const s = dim.trim().replace(/_/g, ' ')
  if (!s) return dim.trim()
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

function EvidenceTableSkeleton() {
  const col = Array.from({ length: 10 })
  return (
    <div className="rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden animate-pulse">
      {/* Header */}
      <div
        className="flex items-center justify-between gap-4 px-6 py-4"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div className="h-2 w-20 rounded-full bg-[#f0f0f0]" />
        <div className="h-6 w-56 rounded-lg bg-[#f0f0f0]" />
      </div>
      {/* Two-column grid */}
      <div className="grid grid-cols-2">
        <div style={{ borderRight: '1px solid rgba(0,0,0,0.06)' }}>
          {col.map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: i < 9 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
            >
              <div className="h-3 w-32 rounded-full bg-[#f0f0f0]" />
              <div className="h-4 w-14 rounded-full bg-[#f0f0f0]" />
            </div>
          ))}
        </div>
        <div>
          {col.map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: i < 9 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
            >
              <div className="h-3 w-32 rounded-full bg-[#f0f0f0]" />
              <div className="h-4 w-14 rounded-full bg-[#f0f0f0]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface GroupedItem {
  item_name: string
  entries: DimensionScore[]
  hasSeverity: boolean
  topSeverity: string | null
}

function EvidenceModal({
  group,
  dimensionTitle,
  onClose,
}: {
  group: GroupedItem
  dimensionTitle: string
  onClose: () => void
}) {
  const overlayRef = useRef<HTMLDivElement>(null)

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
      <div
        className="relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl bg-white shadow-[0_16px_48px_rgba(0,0,0,0.16)] overflow-hidden"
      >
        {/* Modal header */}
        <div
          className="flex items-start justify-between gap-3 px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}
        >
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]/60 mb-0.5"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {dimensionTitle}
            </p>
            <h2 className="text-[15px] font-semibold text-[#0e0e0e] leading-snug">
              {group.item_name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 shrink-0 rounded-full w-7 h-7 flex items-center justify-center text-[#6b6b6b] hover:bg-[#f0f0f0] transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Evidence list */}
        <div className="overflow-y-auto">
          {group.entries.map((entry, i) => {
            const showBadge = entry.severity != null && entry.severity !== 'null'
            return (
              <div
                key={entry.id}
                className="px-6 py-4"
                style={{ borderBottom: i < group.entries.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
              >
                {showBadge && (
                  <span
                    className="inline-block mb-2 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    style={{
                      backgroundColor: '#ff572218',
                      color: '#ff5722',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {entry.severity}
                  </span>
                )}
                <p className="text-sm text-[#3a3a3a] leading-relaxed">{entry.evidence}</p>
              </div>
            )
          })}
        </div>

        {/* Footer count */}
        <div
          className="shrink-0 px-6 py-3 flex items-center justify-end"
          style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
        >
          <span
            className="text-[11px] text-[#6b6b6b]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {group.entries.length} {group.entries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </div>
    </div>
  )
}

function GroupRow({ group, onClick, hasSeverityCol }: { group: GroupedItem; onClick: () => void; hasSeverityCol: boolean }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start justify-between gap-3 px-5 py-3 text-sm text-left hover:bg-[#f7f7f7] transition-colors"
    >
      <span className="text-[#0e0e0e] leading-snug">{group.item_name}</span>
      <div className="flex items-center gap-2 shrink-0">
        {hasSeverityCol && (
          group.topSeverity ? (
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{
                backgroundColor: '#ff572218',
                color: '#ff5722',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {group.topSeverity}
            </span>
          ) : (
            <span className="text-[#6b6b6b]/40 text-xs">—</span>
          )
        )}
        {group.entries.length > 1 && (
          <span
            className="rounded-full bg-[#4664ff]/10 text-[#4664ff] text-[10px] font-semibold px-1.5 py-0.5"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {group.entries.length}
          </span>
        )}
      </div>
    </button>
  )
}

function groupItemsByName(allItems: DimensionScore[]): GroupedItem[] {
  const grouped: GroupedItem[] = []
  const seen = new Map<string, GroupedItem>()
  for (const entry of allItems) {
    const key = entry.item_name ?? ''
    if (!seen.has(key)) {
      const g: GroupedItem = { item_name: key, entries: [], hasSeverity: false, topSeverity: null }
      seen.set(key, g)
      grouped.push(g)
    }
    const g = seen.get(key)!
    g.entries.push(entry)
    if (entry.severity != null && entry.severity !== 'null') {
      g.hasSeverity = true
      if (!g.topSeverity) g.topSeverity = entry.severity
    }
  }
  return grouped
}

function EnumerativeEvidenceSection({
  bucketKey,
  displayTitle,
  items,
}: {
  bucketKey: string
  displayTitle: string
  items: DimensionScore[]
}) {
  const [page, setPage] = useState(0)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<GroupedItem | null>(null)

  const grouped = groupItemsByName(items)
  const hasSeverityCol = grouped.some((g) => g.hasSeverity)

  const q = query.trim().toLowerCase()
  const filtered = q
    ? grouped.filter((g) => g.item_name.toLowerCase().includes(q))
    : grouped

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const safePage = Math.min(page, Math.max(totalPages - 1, 0))
  const paged = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)
  const left = paged.slice(0, 10)
  const right = paged.slice(10, 20)

  const start = safePage * PAGE_SIZE + 1
  const end = Math.min((safePage + 1) * PAGE_SIZE, filtered.length)

  const searchPlaceholder = `Search ${displayTitle.toLowerCase()}…`

  return (
    <>
      <div className="rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
        <div
          className="flex items-center justify-between gap-4 px-6 py-4"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]/60 shrink-0"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {displayTitle}
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0) }}
            placeholder={searchPlaceholder}
            className="w-56 rounded-lg bg-[#f5f5f5] px-3 py-1.5 text-xs text-[#0e0e0e] outline-none placeholder:text-[#6b6b6b]/50 focus:ring-1 focus:ring-[#4664ff]/30"
            style={{ fontFamily: 'var(--font-heading)' }}
          />
        </div>

        <div className="grid grid-cols-2">
          <div style={{ borderRight: '1px solid rgba(0,0,0,0.06)' }}>
            {left.map((group, i) => (
              <div
                key={`${bucketKey}-${group.item_name}`}
                style={{ borderBottom: i < left.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
              >
                <GroupRow group={group} onClick={() => setSelected(group)} hasSeverityCol={hasSeverityCol} />
              </div>
            ))}
          </div>
          <div>
            {right.map((group, i) => (
              <div
                key={`${bucketKey}-${group.item_name}`}
                style={{ borderBottom: i < right.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
              >
                <GroupRow group={group} onClick={() => setSelected(group)} hasSeverityCol={hasSeverityCol} />
              </div>
            ))}
          </div>
        </div>

        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-6 py-3"
            style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
          >
            <span
              className="text-[11px] text-[#6b6b6b]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {start}–{end} of {filtered.length}
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
      </div>

      {selected && (
        <EvidenceModal
          group={selected}
          dimensionTitle={displayTitle}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}

export default function EvidenceTable() {
  const { scores, scoresStatus } = useAppSelector((s) => s.entities)

  if (scoresStatus === 'loading') return <EvidenceTableSkeleton />
  if (scoresStatus !== 'succeeded') return null

  const enumerative = scores.filter((s) => s.dimension_type === 'enumerative')
  if (enumerative.length === 0) return null

  const buckets = new Map<string, { displayTitle: string; items: DimensionScore[] }>()
  for (const row of enumerative) {
    const nk = normalizedDimensionKey(row.dimension)
    let bucket = buckets.get(nk)
    if (!bucket) {
      bucket = { displayTitle: formatDimensionTitle(row.dimension), items: [] }
      buckets.set(nk, bucket)
    }
    bucket.items.push(row)
  }

  const sections = [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="flex flex-col gap-8 w-full">
      {sections.map(([key, { displayTitle, items }]) => (
        <EnumerativeEvidenceSection
          key={key}
          bucketKey={key}
          displayTitle={displayTitle}
          items={items}
        />
      ))}
    </div>
  )
}
