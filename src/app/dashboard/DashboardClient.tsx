'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchDashboardStats, fetchDashboardActivities } from '@/store/slices/dashboardSlice'

export default function DashboardClient() {
  const dispatch = useAppDispatch()
  const {
    stats,
    activities,
    statsStatus,
    activitiesStatus,
    statsError,
    activitiesError,
  } = useAppSelector((s) => s.dashboard)

  useEffect(() => {
    dispatch(fetchDashboardStats())
    dispatch(fetchDashboardActivities())
  }, [dispatch])

  const isLoading = statsStatus === 'loading' || activitiesStatus === 'loading'

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <>
      {statsError && <ErrorBanner message={statsError} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {activitiesError && <ErrorBanner message={activitiesError} />}

      <div className="rounded-2xl bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <h2
          className="text-sm font-semibold uppercase tracking-widest text-[#6b6b6b] mb-5"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Recent Activity
        </h2>
        <div className="space-y-0">
          {activities.map((activity, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 text-sm"
              style={{ borderBottom: i < activities.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
            >
              <span className="text-[#0e0e0e]">{activity.description}</span>
              <span className="text-[#6b6b6b] tabular-nums">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
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

function LoadingSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl bg-white p-6 animate-pulse">
            <div className="h-2.5 w-20 rounded-full bg-[#f0f0f0] mb-4" />
            <div className="h-9 w-24 rounded-lg bg-[#f0f0f0] mb-3" />
            <div className="h-2 w-28 rounded-full bg-[#f0f0f0]" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-6 animate-pulse">
        <div className="h-2.5 w-28 rounded-full bg-[#f0f0f0] mb-5" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-2.5 w-48 rounded-full bg-[#f0f0f0]" />
              <div className="h-2.5 w-16 rounded-full bg-[#f0f0f0]" />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
