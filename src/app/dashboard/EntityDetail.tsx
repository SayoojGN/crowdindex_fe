'use client'

import { useAppSelector } from '@/store'

export default function EntityDetail() {
  const { selected, scores, scoresStatus, scoresError } = useAppSelector(
    (s) => s.entities
  )

  if (!selected) return null

  return (
    <div className="rounded-lg border border-border bg-card divide-y divide-border">
      {/* Entity info */}
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold">{selected.canonical_name}</span>
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">External ID</dt>
          <dd className="font-mono">{selected.external_id}</dd>

          <dt className="text-muted-foreground">Created</dt>
          <dd>
            {new Date(selected.created_at).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </dd>

          {selected.synonyms && selected.synonyms.length > 0 && (
            <>
              <dt className="text-muted-foreground">Synonyms</dt>
              <dd className="flex flex-wrap gap-1">
                {selected.synonyms.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-muted px-2 py-0.5 text-xs"
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
      <div className="p-5 space-y-3">
        <h3 className="text-sm font-medium">Scores</h3>

        {scoresStatus === 'loading' && (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="h-3 w-10 rounded bg-muted" />
              </div>
            ))}
          </div>
        )}

        {scoresStatus === 'failed' && (
          <p className="text-sm text-destructive">{scoresError}</p>
        )}

        {scoresStatus === 'succeeded' && scores.length === 0 && (
          <p className="text-sm text-muted-foreground">No scores available.</p>
        )}

        {scoresStatus === 'succeeded' && scores.length > 0 && (
          <ul className="space-y-2">
            {scores.map((s, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{s.label}</span>
                <span className="tabular-nums font-medium">
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
