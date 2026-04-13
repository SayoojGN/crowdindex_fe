'use client'

import { useAppSelector } from '@/store'

export default function EntityDetail() {
  const { selected, scores, scoresStatus, scoresError } = useAppSelector(
    (s) => s.entities
  )

  if (!selected) return null

  return (
    <div className="rounded-2xl bg-white overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      {/* Entity info */}
      <div className="p-6 space-y-4">
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]/60 mb-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Entity
          </p>
          <span
            className="text-2xl font-semibold text-[#0e0e0e]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {selected.canonical_name}
          </span>
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
          <dt className="text-[#6b6b6b]">External ID</dt>
          <dd className="font-mono text-[#4664ff] text-xs">{selected.external_id}</dd>

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

      {/* Divider */}
      <div className="h-px bg-black/5" />

      {/* Scores */}
      <div className="p-6 space-y-4">
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

        {scoresStatus === 'succeeded' && scores.length === 0 && (
          <p className="text-sm text-[#6b6b6b]">No scores available.</p>
        )}

        {scoresStatus === 'succeeded' && scores.length > 0 && (
          <ul className="space-y-0">
            {scores.map((s, i) => (
              <li
                key={i}
                className="flex items-center justify-between py-3 text-sm"
                style={{ borderBottom: i < scores.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
              >
                <span className="text-[#6b6b6b]">{s.label}</span>
                <span
                  className="tabular-nums font-semibold text-[#4664ff]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {s.score.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
