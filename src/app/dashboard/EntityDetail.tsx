'use client'

import { useAppSelector } from '@/store'

export default function EntityDetail() {
  const { selected, scores, scoresStatus, scoresError } = useAppSelector(
    (s) => s.entities
  )

  if (!selected) return null

  return (
    <div className="rounded-2xl bg-white overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Entity info */}
        <div className="p-6 space-y-4 md:border-r md:border-black/5">
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]/60 mb-1"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Entity Info
            </p>
          </div>

          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
            <dt className="text-[#6b6b6b]">Created</dt>
            <dd className="text-[#0e0e0e]">
              {new Date(selected.created_at).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </dd>

            {selected.synonyms && selected.synonyms.length > 0 && (
              <>
                <dt className="text-[#6b6b6b]">Synonyms</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {selected.synonyms.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-[#f0f0f0] px-2.5 py-0.5 text-xs text-[#0e0e0e]"
                    >
                      {s}
                    </span>
                  ))}
                </dd>
              </>
            )}
          </dl>
        </div>

        {/* Scores */}
        {/* <div className="p-6 space-y-4 border-t border-black/5 md:border-t-0">
          <h3
            className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]/60"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Scores
          </h3>

          {scoresStatus === 'loading' && (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-2.5 w-28 rounded-full bg-[#f0f0f0]" />
                  <div className="h-2.5 w-12 rounded-full bg-[#f0f0f0]" />
                </div>
              ))}
            </div>
          )}

          {scoresStatus === 'failed' && (
            <p className="text-sm text-[#e55a2b]">{scoresError}</p>
          )}

          {scoresStatus === 'succeeded' && scores.filter(s => s.dimension_type === 'evaluative').length === 0 && (
            <p className="text-sm text-[#6b6b6b]">No scores available.</p>
          )}

          {scoresStatus === 'succeeded' && scores.filter(s => s.dimension_type === 'evaluative').length > 0 && (() => {
            const evaluative = scores.filter(s => s.dimension_type === 'evaluative')
            return (
              <ul className="space-y-0">
                {evaluative.map((s, i) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between py-3 text-sm"
                    style={{ borderBottom: i < evaluative.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
                  >
                    <span className="text-[#6b6b6b] capitalize">{s.dimension.replace(/_/g, ' ')}</span>
                    <span
                      className="tabular-nums font-semibold text-[#4664ff]"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {s.score != null ? s.score.toFixed(2) : '—'}
                    </span>
                  </li>
                ))}
              </ul>
            )
          })()}
        </div> */}
      </div>
    </div>
  )
}
