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

        {rowsStatus !== 'loading' && (() => {
          const scoreKeys = rows.length > 0 ? Object.keys(rows[0].scores) : []
          const colCount = 2 + scoreKeys.length
          return (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    {['Entity Name', 'Synonyms', ...scoreKeys.map((k) => `${k} Score`)].map((col) => (
                      <th
                        key={col}
                        className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]/60"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && rowsStatus === 'succeeded' && (
                    <tr>
                      <td colSpan={colCount} className="px-6 py-8 text-center text-[#6b6b6b]">
                        No entities found.
                      </td>
                    </tr>
                  )}
                  {rows.map((row, i) => (
                    <tr
                      key={row.entity.id}
                      style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
                    >
                      <td className="px-6 py-4 font-medium text-[#0e0e0e] capitalize">
                        {row.entity.canonical_name}
                      </td>
                      <td className="px-6 py-4 text-[#6b6b6b]">
                        {row.entity.synonyms?.length > 0
                          ? row.entity.synonyms.join(', ')
                          : <span className="text-[#6b6b6b]/40">—</span>}
                      </td>
                      {scoreKeys.map((key) => (
                        <td
                          key={key}
                          className="px-6 py-4 tabular-nums font-semibold text-[#4664ff]"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          {(row.scores[key] ?? 0).toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })()}
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

