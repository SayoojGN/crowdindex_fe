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
    <div className="flex flex-col gap-8 p-8 max-w-xl">
      <div>
        <h1
          className="text-3xl font-semibold tracking-tight text-[#0e0e0e]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Add Entity
        </h1>
        <p className="text-sm text-[#6b6b6b] mt-1">Create a new entity to track.</p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl bg-white p-6 space-y-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="canonical_name"
              className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Name <span className="text-[#e55a2b]">*</span>
            </label>
            <input
              id="canonical_name"
              type="text"
              required
              value={canonicalName}
              onChange={(e) => setCanonicalName(e.target.value)}
              placeholder="e.g. paracetamol"
              className="w-full bg-[#f0f0f0] rounded-lg px-4 py-3 text-sm text-[#0e0e0e] placeholder:text-[#6b6b6b]/40 border-0 border-b-2 border-b-transparent focus:border-b-[#4664ff] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="synonyms"
              className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Synonyms
            </label>
            <input
              id="synonyms"
              type="text"
              value={synonymsInput}
              onChange={(e) => setSynonymsInput(e.target.value)}
              placeholder="e.g. acetaminophen, tylenol, panadol"
              className="w-full bg-[#f0f0f0] rounded-lg px-4 py-3 text-sm text-[#0e0e0e] placeholder:text-[#6b6b6b]/40 border-0 border-b-2 border-b-transparent focus:border-b-[#4664ff] focus:outline-none transition-colors"
            />
            <p className="text-xs text-[#6b6b6b]/60">Separate multiple synonyms with commas.</p>
          </div>

          {createError && (
            <p className="text-xs text-[#e55a2b] bg-[#e55a2b]/10 rounded-lg px-3 py-2">
              {createError}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-[#4664ff] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#3355ee] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {isPending ? 'Adding…' : 'Add Entity'}
            </button>
            {selected && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-full bg-[#f0f0f0] px-6 py-2.5 text-sm font-medium text-[#6b6b6b] hover:text-[#0e0e0e] hover:bg-[#e8e8e8] transition-colors"
              >
                Add another
              </button>
            )}
          </div>
        </form>
      </div>

      {selected && <EntityDetail />}
    </div>
  )
}
