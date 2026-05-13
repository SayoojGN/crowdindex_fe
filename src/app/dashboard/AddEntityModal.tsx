'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  createEntity,
  fetchEntities,
  fetchDimensionScores,
  resetCreateStatus,
} from '@/store/slices/entitySlice'
import { X } from 'lucide-react'
import PRODUCT_TYPES from '@/lib/productTypeSuggestions.json'

type DimensionType = 'evaluative' | 'enumerative'

interface DimensionRow {
  name: string
  type: DimensionType
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function AddEntityModal({ isOpen, onClose }: Props) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const overlayRef = useRef<HTMLDivElement>(null)
  const { createStatus, createError } = useAppSelector((s) => s.entities)

  const [canonicalName, setCanonicalName] = useState('')
  const [synonymsInput, setSynonymsInput] = useState('')
  const [dimensions, setDimensions] = useState<DimensionRow[]>([])
  const [productType, setProductType] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setCanonicalName('')
      setSynonymsInput('')
      setDimensions([])
      setProductType('')
    }
  }, [isOpen])

  useEffect(() => {
    if (createStatus === 'succeeded') {
      dispatch(fetchDimensionScores(canonicalName))
      dispatch(fetchEntities())
      dispatch(resetCreateStatus())
      onClose()
      router.push(`/dashboard/entity/${canonicalName}`)
    }
  }, [createStatus, canonicalName, dispatch, onClose, router])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  function addDimension() {
    setDimensions((prev) => [...prev, { name: '', type: 'evaluative' }])
  }

  function updateDimension(index: number, field: keyof DimensionRow, value: string) {
    setDimensions((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    )
  }

  function removeDimension(index: number) {
    setDimensions((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const synonyms = synonymsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const validDimensions = dimensions.filter((d) => d.name.trim())

    dispatch(
      createEntity({
        canonical_name: canonicalName.trim(),
        ...(synonyms.length > 0 && { synonyms }),
        ...(productType && { metadata: { product_type: productType } }),
        ...(validDimensions.length > 0 && {
          dimensions: validDimensions.map((d) => ({ name: d.name.trim(), type: d.type })),
        }),
      })
    )
  }

  if (!isOpen) return null

  const isPending = createStatus === 'loading'

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-[0_16px_48px_rgba(0,0,0,0.16)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2
              className="text-xl font-semibold tracking-tight text-[#0e0e0e]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Add Entity
            </h2>
            <p className="text-sm text-[#6b6b6b] mt-0.5">Create a new entity to track.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6b6b6b] hover:bg-[#f0f0f0] hover:text-[#0e0e0e] transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-black/5" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="modal_canonical_name"
              className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Name <span className="text-[#e55a2b]">*</span>
            </label>
            <input
              id="modal_canonical_name"
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
              htmlFor="modal_synonyms"
              className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Synonyms
            </label>
            <input
              id="modal_synonyms"
              type="text"
              value={synonymsInput}
              onChange={(e) => setSynonymsInput(e.target.value)}
              placeholder="e.g. acetaminophen, tylenol, panadol"
              className="w-full bg-[#f0f0f0] rounded-lg px-4 py-3 text-sm text-[#0e0e0e] placeholder:text-[#6b6b6b]/40 border-0 border-b-2 border-b-transparent focus:border-b-[#4664ff] focus:outline-none transition-colors"
            />
            <p className="text-xs text-[#6b6b6b]/60">Separate multiple synonyms with commas.</p>
          </div>

          {/* Product Type */}
          <div className="space-y-1.5">
            <label
              htmlFor="modal_product_type"
              className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Product Type
            </label>
            <select
              id="modal_product_type"
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="w-full bg-[#f0f0f0] rounded-lg px-4 py-3 text-sm text-[#0e0e0e] border-0 border-b-2 border-b-transparent focus:border-b-[#4664ff] focus:outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="">Select a product type (optional)</option>
              {PRODUCT_TYPES.map((pt) => (
                <option key={pt.id} value={pt.id}>{pt.label}</option>
              ))}
            </select>
          </div>

          {/* Suggested Dimensions */}
          {productType !== '' && (() => {
            const suggestions = PRODUCT_TYPES.find((p) => p.id === productType)?.suggested_dimensions ?? []
            const available = suggestions.filter(
              (s) => !dimensions.some((d) => d.name.toLowerCase() === s.name.toLowerCase())
            )
            return available.length > 0 ? (
              <div className="space-y-1.5">
                <label
                  className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Suggested Dimensions
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    const pick = available.find((s) => s.name === e.target.value)
                    if (pick) setDimensions((prev) => [...prev, { name: pick.name, type: pick.type as DimensionType }])
                  }}
                  className="w-full bg-[#f0f0f0] rounded-lg px-4 py-3 text-sm text-[#0e0e0e] border-0 border-b-2 border-b-transparent focus:border-b-[#4664ff] focus:outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="">+ Add suggested dimension…</option>
                  {available.map((s) => (
                    <option key={s.name} value={s.name}>{s.name} ({s.type})</option>
                  ))}
                </select>
              </div>
            ) : null
          })()}

          {/* Dimensions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Dimensions
              </span>
              <button
                type="button"
                onClick={addDimension}
                className="text-xs font-semibold text-[#4664ff] hover:text-[#3355ee] transition-colors"
              >
                + Add Dimension
              </button>
            </div>

            {dimensions.length > 0 && (
              <div className="space-y-2">
                {dimensions.map((dim, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={dim.name}
                      onChange={(e) => updateDimension(i, 'name', e.target.value)}
                      placeholder="Dimension name"
                      className="flex-1 bg-[#f0f0f0] rounded-lg px-4 py-2.5 text-sm text-[#0e0e0e] placeholder:text-[#6b6b6b]/40 border-0 border-b-2 border-b-transparent focus:border-b-[#4664ff] focus:outline-none transition-colors"
                    />
                    <select
                      value={dim.type}
                      onChange={(e) => updateDimension(i, 'type', e.target.value)}
                      className="bg-[#f0f0f0] rounded-lg px-3 py-2.5 text-sm text-[#0e0e0e] border-0 border-b-2 border-b-transparent focus:border-b-[#4664ff] focus:outline-none transition-colors appearance-none cursor-pointer min-w-[130px]"
                    >
                      <option value="evaluative">Evaluative</option>
                      <option value="enumerative">Enumerative</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeDimension(i)}
                      className="text-[#6b6b6b] hover:text-[#e55a2b] transition-colors px-1"
                      aria-label="Remove dimension"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {dimensions.length === 0 && (
              <p className="text-xs text-[#6b6b6b]/60">No dimensions added yet.</p>
            )}
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
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[#f0f0f0] px-6 py-2.5 text-sm font-medium text-[#6b6b6b] hover:text-[#0e0e0e] hover:bg-[#e8e8e8] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
