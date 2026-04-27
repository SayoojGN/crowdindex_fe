'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchEntities } from '@/store/slices/entitySlice'
import { Spinner } from '@/components/Spinner'

export default function EntityHistory() {
  const dispatch = useAppDispatch()
  const { list, status, error } = useAppSelector((s) => s.entities)

  useEffect(() => {
    dispatch(fetchEntities())
  }, [dispatch])

  return (
    <div className="flex flex-col h-full py-2">
      <p
        className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]/60"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Entity History
      </p>

      {status === 'loading' && <Spinner className="py-6" />}

      {status === 'failed' && (
        <p className="px-4 text-xs text-[#e55a2b]/70">{error}</p>
      )}

      {status === 'succeeded' && list.length === 0 && (
        <p className="px-4 text-xs text-[#6b6b6b]/50">No entities yet.</p>
      )}

      {status === 'succeeded' && list.length > 0 && (
        <ul className="flex flex-col gap-0.5 px-3">
          {list.map((entity) => (
            <li key={entity.id}>
              <Link
                href={`/dashboard/entity/${entity.canonical_name}`}
                className="block rounded-xl px-3 py-2 hover:bg-[#f0f0f0] transition-colors group"
              >
                <p className="text-sm font-medium text-[#6b6b6b] group-hover:text-[#0e0e0e] truncate transition-colors">
                  {entity.canonical_name}
                </p>
                <p className="text-[10px] text-[#6b6b6b]/50 mt-0.5">
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
