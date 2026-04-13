'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchEntities } from '@/store/slices/entitySlice'

export default function EntityHistory() {
  const dispatch = useAppDispatch()
  const { list, status, error } = useAppSelector((s) => s.entities)

  useEffect(() => {
    dispatch(fetchEntities())
  }, [dispatch])

  return (
    <div className="flex flex-col h-full">
      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Entity History
      </p>

      {status === 'loading' && (
        <div className="flex flex-col gap-2 px-3 pb-2 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-32 rounded bg-sidebar-accent" />
              <div className="h-2 w-20 rounded bg-sidebar-accent" />
            </div>
          ))}
        </div>
      )}

      {status === 'failed' && (
        <p className="px-3 text-xs text-muted-foreground">{error}</p>
      )}

      {status === 'succeeded' && list.length === 0 && (
        <p className="px-3 text-xs text-muted-foreground">No entities yet.</p>
      )}

      {status === 'succeeded' && list.length > 0 && (
        <ul className="flex flex-col gap-0.5 px-2 pb-2">
          {list.map((entity) => (
            <li key={entity.id}>
              <Link
                href={`/dashboard/entity/${entity.canonical_name}`}
                className="block rounded-md px-2 py-1.5 hover:bg-sidebar-accent transition-colors"
              >
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {entity.canonical_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(entity.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
