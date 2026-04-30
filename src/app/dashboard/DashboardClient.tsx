'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  fetchDashboardStats,
  fetchDashboardActivities,
  fetchDashboardData,
  type DashboardRow,
} from '@/store/slices/dashboardSlice'
import { Spinner } from '@/components/Spinner'

export default function DashboardClient() {
  const dispatch = useAppDispatch()
  const {
    stats,
    activities,
    rows,
    statsStatus,
    activitiesStatus,
    rowsStatus,
    statsError,
    activitiesError,
    rowsError,
  } = useAppSelector((s) => s.dashboard)

  useEffect(() => {
    dispatch(fetchDashboardStats())
    dispatch(fetchDashboardActivities())
    dispatch(fetchDashboardData())
  }, [dispatch])

  const isLoading = statsStatus === 'loading' || activitiesStatus === 'loading'

  if (isLoading) {
    return <Spinner className="py-20" />
  }

  return (
    <>

      {/* {rowsStatus === 'succeeded' && rows.length > 0 && (() => {
        const ranked = rankByOverall(rows)
        const top = ranked.slice(0, 3)
        const bottom = [...ranked].reverse().slice(0, 3)
        return (
          <div className="grid grid-cols-2 gap-4">
            <PerformersCard title="Top Performers" rows={top} bg="#4CAF50" />
            <PerformersCard title="Bottom Performers" rows={bottom} bg="#FF5722" />
          </div>
        )
      })()} */}

      <div className="rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-6 py-5">
          <h2
            className="text-sm font-semibold uppercase tracking-widest text-[#6b6b6b]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Entities
          </h2>
        </div>

        {rowsError && (
          <div className="px-6 pb-5">
            <ErrorBanner message={rowsError} />
          </div>
        )}

        {rowsStatus === 'loading' && <Spinner />}

        {rowsStatus !== 'loading' && (
          <>
            {rows.length === 0 && rowsStatus === 'succeeded' && (
              <div className="px-6 pb-8 text-center text-sm text-[#6b6b6b]">
                No entities found.
              </div>
            )}
            {rows.length > 0 && (
              <div className="grid grid-cols-1 gap-5 px-6 pb-6 sm:grid-cols-2">
                {rows.map((row) => (
                  <EntityScoreCard key={row.entity.id} row={row} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* {rowsStatus === 'succeeded' && rows.length > 0 && (() => {
        const ranked = rankByOverall(rows)
        const top = ranked.slice(0, 3)
        const bottom = [...ranked].reverse().slice(0, 3)
        return (
          <div className="grid grid-cols-2 gap-4">
            <PerformersCard title="Top Performers" rows={top} />
            <PerformersCard title="Bottom Performers" rows={bottom} />
          </div>
        )
      })()} */}
    </>
  )
}

function StatCard({ label, value, change }: { label: string; value: string; change: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      <p
        className="text-xs font-semibold uppercase tracking-widest text-[#6b6b6b]"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {label}
      </p>
      <p
        className="mt-3 text-4xl font-semibold text-[#0e0e0e] tabular-nums"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {value}
      </p>
      <p className="mt-2 text-xs text-[#2d7d28]">{change} from last month</p>
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-[#e55a2b]/10 px-4 py-3 text-sm text-[#e55a2b]">
      {message}
    </div>
  )
}

function EntityScoreCard({ row }: { row: DashboardRow }) {
  const dimensions = Object.entries(row.scores).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div
      className="rounded-2xl border-2 border-[#d8d8d8] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
      style={{ fontFamily: 'var(--font-heading)' }}
    >
      <h3 className="text-base font-semibold capitalize tracking-tight text-[#0e0e0e]">
        {row.entity.canonical_name}
      </h3>
      <p className="mt-1 text-xs uppercase tracking-widest text-[#6b6b6b]/70">
        Synonyms
      </p>
      <p className="mt-0.5 text-sm text-[#6b6b6b] leading-snug">
        {row.entity.synonyms?.length > 0 ? row.entity.synonyms.join(', ') : '—'}
      </p>

      <p className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]/60">
        Dimension scores
      </p>
      {dimensions.length === 0 ? (
        <p className="mt-2 text-sm text-[#6b6b6b]/50">No scores for this entity.</p>
      ) : (
        <dl className="mt-2 space-y-1.5">
          {dimensions.map(([key, value]) => (
            <div key={key} className="flex items-baseline justify-between gap-3 text-sm">
              <dt className="text-[#6b6b6b] capitalize">{key.replace(/_/g, ' ')}</dt>
              <dd className="shrink-0 tabular-nums font-semibold text-[#4664ff]">
                {value.toFixed(2)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

function overallScore(row: DashboardRow): number {
  const vals = Object.values(row.scores)
  if (vals.length === 0) return 0
  return vals.reduce((sum, v) => sum + v, 0) / vals.length
}

function rankByOverall(rows: DashboardRow[]) {
  return [...rows].sort((a, b) => overallScore(b) - overallScore(a))
}

function PerformersCard({
  title,
  rows,
  bg,
}: {
  title: string
  rows: DashboardRow[]
  bg: string
}) {
  return (
    <div className="rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.08)]" style={{ backgroundColor: bg }}>
      <h2
        className="text-[10px] font-semibold uppercase tracking-widest text-white/70 mb-4"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {title}
      </h2>
      <ul className="space-y-0">
        {rows.map((row, i) => {
          const overall = overallScore(row)
          return (
            <li
              key={row.entity.id}
              className="flex items-center justify-between py-3 text-sm"
              style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.12)' : 'none' }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="text-xs font-semibold tabular-nums w-5 text-white/50"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  #{i + 1}
                </span>
                <span className="capitalize font-medium text-white">
                  {row.entity.canonical_name}
                </span>
              </div>
              <span
                className="tabular-nums font-semibold text-sm text-white"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {overall.toFixed(2)}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

