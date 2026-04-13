'use client'

import { use, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  fetchEntities,
  fetchEntityScores,
  setSelectedEntity,
} from '@/store/slices/entitySlice'
import EntityDetail from '../../EntityDetail'

export default function EntityViewPage({
  params,
}: {
  params: Promise<{ canonical_name: string }>
}) {
  const { canonical_name } = use(params)
  const dispatch = useAppDispatch()
  const { list, status } = useAppSelector((s) => s.entities)

  useEffect(() => {
    const load = async () => {
      let entities = list

      if (entities.length === 0 && status !== 'loading') {
        const result = await dispatch(fetchEntities())
        if (fetchEntities.fulfilled.match(result)) {
          entities = result.payload
        }
      }

      const entity = entities.find((e) => e.canonical_name === canonical_name)
      if (entity) {
        dispatch(setSelectedEntity(entity))
        dispatch(fetchEntityScores(canonical_name))
      }
    }

    load()
  }, [canonical_name]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-8 p-8 max-w-xl">
      <div>
        <p
          className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]/60 mb-1"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Entity
        </p>
        <h1
          className="text-3xl font-semibold tracking-tight text-[#0e0e0e] capitalize"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {canonical_name.replace(/-/g, ' ')}
        </h1>
        <p className="text-sm text-[#6b6b6b] mt-1">Details and scores</p>
      </div>

      <EntityDetail />
    </div>
  )
}
