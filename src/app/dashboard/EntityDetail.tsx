'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppSelector, useAppDispatch } from '@/store'
import {
  fetchDimensionScores,
  fetchEntityAnalysis,
  fetchEntityMetrics,
} from '@/store/slices/entitySlice'
import apiClient from '@/lib/axios/client'
import { RefreshCw, Check } from 'lucide-react'

interface PollResponse {
  task_id: string
  entity_name: string
  phase: string
  progress: { total: number; completed: number; failed: number }
  scrape: { posts_found: number; posts_new: number }
  started_at: string
  completed_at: string | null
  error: string | null
}

type AnalyzeState =
  | { status: 'idle' }
  | { status: 'triggering' }
  | { status: 'polling'; taskId: string; phase: string; progress: { total: number; completed: number; failed: number } }
  | { status: 'succeeded' }
  | { status: 'failed'; error: string }

export default function EntityDetail() {
  const dispatch = useAppDispatch()
  const { selected } = useAppSelector((s) => s.entities)

  const [analyzeState, setAnalyzeState] = useState<AnalyzeState>({ status: 'idle' })
  const [taskId, setTaskId] = useState<string | null>(null)
  const canonicalNameRef = useRef<string | null>(null)

  async function handleRunAnalysis() {
    if (!selected) return
    canonicalNameRef.current = selected.canonical_name
    setAnalyzeState({ status: 'triggering' })
    try {
      const res = await apiClient.post<{ task_id: string; status: string; entity_name: string }>(
        '/analyze/trigger',
        { entity_name: selected.canonical_name }
      )
      setAnalyzeState({
        status: 'polling',
        taskId: res.data.task_id,
        phase: 'queued',
        progress: { total: 0, completed: 0, failed: 0 },
      })
      setTaskId(res.data.task_id)
    } catch (err: unknown) {
      const error = err as { message: string }
      setAnalyzeState({ status: 'failed', error: error.message ?? 'Failed to start analysis' })
    }
  }

  useEffect(() => {
    if (!taskId) return

    let cancelled = false
    let pollTimeout: ReturnType<typeof setTimeout> | null = null

    const poll = async () => {
      if (cancelled) return
      try {
        const res = await apiClient.get<PollResponse>(`/analyze/status/${taskId}`)
        if (cancelled) return
        const data = res.data

        if (data.phase === 'completed') {
          setTaskId(null)
          setAnalyzeState({ status: 'succeeded' })
          if (canonicalNameRef.current) {
            dispatch(fetchDimensionScores(canonicalNameRef.current))
            dispatch(fetchEntityAnalysis(canonicalNameRef.current))
            dispatch(fetchEntityMetrics(canonicalNameRef.current))
          }
        } else if (data.phase === 'failed' || data.error) {
          setTaskId(null)
          setAnalyzeState({ status: 'failed', error: data.error ?? 'Analysis failed' })
        } else {
          setAnalyzeState({
            status: 'polling',
            taskId,
            phase: data.phase,
            progress: data.progress,
          })
          pollTimeout = setTimeout(poll, 3000)
        }
      } catch (err: unknown) {
        if (cancelled) return
        const error = err as { message: string }
        setTaskId(null)
        setAnalyzeState({ status: 'failed', error: error.message ?? 'Polling failed' })
      }
    }

    pollTimeout = setTimeout(poll, 3000)

    return () => {
      cancelled = true
      if (pollTimeout) clearTimeout(pollTimeout)
    }
  }, [taskId, dispatch])

  useEffect(() => {
    if (analyzeState.status !== 'succeeded') return
    const t = setTimeout(() => setAnalyzeState({ status: 'idle' }), 2000)
    return () => clearTimeout(t)
  }, [analyzeState.status])

  if (!selected) return null

  const isBusy = analyzeState.status === 'triggering' || analyzeState.status === 'polling'
  const isPolling = analyzeState.status === 'polling'
  const isSucceeded = analyzeState.status === 'succeeded'
  const isFailed = analyzeState.status === 'failed'

  const buttonLabel = isBusy
    ? analyzeState.status === 'triggering'
      ? 'Starting…'
      : 'Analyzing…'
    : isSucceeded
    ? 'Updated!'
    : 'Run Analysis'

  const progress = isPolling ? analyzeState.progress : null
  const progressPct =
    progress && progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : null

  const phaseLabel = isPolling
    ? analyzeState.phase.charAt(0).toUpperCase() + analyzeState.phase.slice(1).replace(/_/g, ' ')
    : null

  return (
    <div className="rounded-2xl bg-white overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <div className="flex justify-between">
        {/* Entity info */}
        <div className="p-6 space-y-4">
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

          {/* Run Analysis section */}
        </div>

        {/* Scores column (currently commented out, preserved) */}
        {/* <div className="p-6 space-y-4 border-t border-black/5 md:border-t-0"> ... </div> */}
        {/* Run Analysis section */}
          <div className="pt-2 pr-6 space-y-3">
            <div className="h-px bg-black/5" />

            <button
              onClick={handleRunAnalysis}
              disabled={isBusy}
              className={[
                'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors',
                isSucceeded
                  ? 'bg-[#2d7d28]/10 text-[#2d7d28] cursor-default'
                  : isBusy
                  ? 'bg-[#4664ff]/40 text-white cursor-not-allowed'
                  : 'bg-[#4664ff] text-white hover:bg-[#3355ee]',
              ].join(' ')}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {isSucceeded ? (
                <Check className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <RefreshCw className={['h-3.5 w-3.5 shrink-0', isBusy ? 'animate-spin' : ''].join(' ')} />
              )}
              {buttonLabel}
            </button>

            {isPolling && phaseLabel && (
              <p className="text-xs text-[#6b6b6b]" style={{ fontFamily: 'var(--font-heading)' }}>
                {phaseLabel}…
              </p>
            )}

            {isPolling && progressPct !== null && (
              <div className="space-y-1">
                <div className="h-1.5 w-full rounded-full bg-[#f0f0f0] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#4664ff] transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#6b6b6b]/60" style={{ fontFamily: 'var(--font-heading)' }}>
                  {progress!.completed} / {progress!.total} posts
                </p>
              </div>
            )}

            {isFailed && (
              <p className="text-xs text-[#e55a2b] bg-[#e55a2b]/10 rounded-lg px-3 py-2">
                {analyzeState.error}
              </p>
            )}
          </div>
      </div>
    </div>
  )
}
