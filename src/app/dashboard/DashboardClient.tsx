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
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-base font-medium mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {activities.map((activity, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-foreground">{activity.description}</span>
              <span className="text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function StatCard({ label, value, change }: { label: string; value: string; change: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{change} from last month</p>
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {message}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-5 animate-pulse">
            <div className="h-3 w-24 rounded bg-muted mb-3" />
            <div className="h-7 w-20 rounded bg-muted mb-2" />
            <div className="h-2 w-32 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-card p-6 animate-pulse">
        <div className="h-4 w-32 rounded bg-muted mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3 w-48 rounded bg-muted" />
              <div className="h-3 w-16 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
