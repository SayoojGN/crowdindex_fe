'use client'

import { useState } from 'react'
import { useAppSelector } from '@/store'
import type { DimensionScore } from '@/store/slices/entitySlice'

const PAGE_SIZE = 20

function SideEffectRow({ item, hasSeverity }: { item: DimensionScore; hasSeverity: boolean }) {
  const showBadge = item.severity != null && item.severity !== 'null'
  return (
    <div className="flex items-start justify-between gap-3 px-5 py-3 text-sm">
      <span className="text-[#0e0e0e] leading-snug">{item.evidence}</span>
      {hasSeverity && (
        showBadge ? (
          <span
            className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: '#ff572218',
              color: '#ff5722',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {item.severity}
          </span>
        ) : (
          <span className="shrink-0 text-[#6b6b6b]/40 text-xs">—</span>
        )
      )}
    </div>
  )
}

export default function EvidenceTable() {
  const { scores, scoresStatus } = useAppSelector((s) => s.entities)
  const [page, setPage] = useState(0)
  const [query, setQuery] = useState('')

  if (scoresStatus !== 'succeeded') return null

  const allItems = scores.filter((s) => s.dimension === 'side_effects')
  if (allItems.length === 0) return null

  const q = query.trim().toLowerCase()
  const items = q
    ? allItems.filter(
        (s) =>
          s.evidence.toLowerCase().includes(q) ||
          (s.item_name ?? '').toLowerCase().includes(q)
      )
    : allItems

  const totalPages = Math.ceil(items.length / PAGE_SIZE)
  const safePage = Math.min(page, Math.max(totalPages - 1, 0))
  const paged = items.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)
  const left = paged.slice(0, 10)
  const right = paged.slice(10, 20)
  const hasSeverity = items.some((s) => s.severity != null && s.severity !== 'null')

  const start = safePage * PAGE_SIZE + 1
  const end = Math.min((safePage + 1) * PAGE_SIZE, items.length)

  return (
    <div className="rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between gap-4 px-6 py-4"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        <span
          className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]/60 shrink-0"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Side Effects
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(0) }}
          placeholder="Search side effects…"
          className="w-56 rounded-lg bg-[#f5f5f5] px-3 py-1.5 text-xs text-[#0e0e0e] outline-none placeholder:text-[#6b6b6b]/50 focus:ring-1 focus:ring-[#4664ff]/30"
          style={{ fontFamily: 'var(--font-heading)' }}
        />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-2">
        <div style={{ borderRight: '1px solid rgba(0,0,0,0.06)' }}>
          {left.map((item, i) => (
            <div
              key={item.id}
              style={{ borderBottom: i < left.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
            >
              <SideEffectRow item={item} hasSeverity={hasSeverity} />
            </div>
          ))}
        </div>
        <div>
          {right.map((item, i) => (
            <div
              key={item.id}
              style={{ borderBottom: i < right.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
            >
              <SideEffectRow item={item} hasSeverity={hasSeverity} />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination footer */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between px-6 py-3"
          style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
        >
          <span
            className="text-[11px] text-[#6b6b6b]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {start}–{end} of {items.length}
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
  )
}
