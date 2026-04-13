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
    <div className="flex flex-col gap-6 p-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight capitalize">
          {canonical_name.replace(/-/g, ' ')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Entity details and scores</p>
      </div>

      <EntityDetail />
    </div>
  )
}
