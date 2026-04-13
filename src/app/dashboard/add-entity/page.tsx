'use client'

import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  createEntity,
  fetchEntities,
  fetchEntityScores,
  resetCreateStatus,
  clearSelected,
} from '@/store/slices/entitySlice'
import EntityDetail from '../EntityDetail'

export default function AddEntityPage() {
  const dispatch = useAppDispatch()
  const { createStatus, createError, selected } = useAppSelector((s) => s.entities)

  const [canonicalName, setCanonicalName] = useState('')
  const [synonymsInput, setSynonymsInput] = useState('')

  useEffect(() => {
    if (createStatus === 'succeeded') {
      dispatch(fetchEntityScores(canonicalName))
      dispatch(fetchEntities())
      dispatch(resetCreateStatus())
    }
  }, [createStatus, canonicalName, dispatch])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const synonyms = synonymsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    dispatch(
      createEntity({
        canonical_name: canonicalName.trim(),
        ...(synonyms.length > 0 && { synonyms }),
      })
    )
  }

  function handleClear() {
    setCanonicalName('')
    setSynonymsInput('')
    dispatch(clearSelected())
  }

  const isPending = createStatus === 'loading'

  return (
    <div className="flex flex-col gap-6 p-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Entity</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create a new entity to track.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <label htmlFor="canonical_name" className="text-sm font-medium">
            Name <span className="text-destructive">*</span>
          </label>
          <input
            id="canonical_name"
            type="text"
            required
            value={canonicalName}
            onChange={(e) => setCanonicalName(e.target.value)}
            placeholder="e.g. paracetamol"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="synonyms" className="text-sm font-medium">
            Synonyms
          </label>
          <input
            id="synonyms"
            type="text"
            value={synonymsInput}
            onChange={(e) => setSynonymsInput(e.target.value)}
            placeholder="e.g. acetaminophen, tylenol, panadol"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">
            Separate multiple synonyms with commas.
          </p>
        </div>

        {createError && (
          <p className="text-sm text-destructive">{createError}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Adding…' : 'Add Entity'}
          </button>
          {selected && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-md border border-border px-5 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              Add another
            </button>
          )}
        </div>
      </form>

      {selected && <EntityDetail />}
    </div>
  )
}
