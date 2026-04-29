'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppSelector, useAppDispatch } from '@/store'
import {
  fetchDimensionScores,
  fetchEntityAnalysis,
  fetchEntityMetrics,
} from '@/store/slices/entitySlice'
import apiClient from '@/lib/axios/client'
import { RefreshCw, AlertCircle } from 'lucide-react'

interface PollResponse {
  task_id: string
  entity_name: string
  phase: string
  progress: { total: number; completed: number; failed: number }
  scrape: { posts_found: number; posts_new: number }
  analysis: { relevant_completed: number; relevant_failed: number; irrelevant: number }
  started_at: string
  completed_at: string | null
  error: string | null
}

type AnalyzeState =
  | { status: 'idle' }
  | { status: 'triggering' }
  | { status: 'polling'; taskId: string; phase: string; progress: { total: number; completed: number; failed: number }; scrape: { posts_found: number; posts_new: number }; analysis: { relevant_completed: number; relevant_failed: number; irrelevant: number } }
  | { status: 'succeeded'; scrape: { posts_found: number; posts_new: number }; analysis: { relevant_completed: number; relevant_failed: number; irrelevant: number } }
  | { status: 'failed'; error: string }

export default function EntityDetail() {
  const dispatch = useAppDispatch()
  const { selected } = useAppSelector((s) => s.entities)

  const [analyzeState, setAnalyzeState] = useState<AnalyzeState>({ status: 'idle' })
  const [taskId, setTaskId] = useState<string | null>(null)
  const [log, setLog] = useState<{ phase: string; timestamp: string }[]>([])
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
        scrape: { posts_found: 0, posts_new: 0 },
        analysis: { relevant_completed: 0, relevant_failed: 0, irrelevant: 0 },
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
          setAnalyzeState({ status: 'succeeded', scrape: data.scrape, analysis: data.analysis })
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
            scrape: data.scrape,
            analysis: data.analysis,
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
    if (analyzeState.status === 'polling') {
      setLog((prev) => {
        const last = prev[prev.length - 1]
        if (last?.phase === analyzeState.phase) return prev
        return [...prev, { phase: analyzeState.phase, timestamp: new Date().toLocaleTimeString() }]
      })
    }
    if (analyzeState.status === 'idle' || analyzeState.status === 'triggering') {
      setLog([])
    }
  }, [analyzeState])

  if (!selected) return null

  const isBusy = analyzeState.status === 'triggering' || analyzeState.status === 'polling'
  const isPolling = analyzeState.status === 'polling'
  const isSucceeded = analyzeState.status === 'succeeded'
  const isFailed = analyzeState.status === 'failed'

  const buttonLabel = isBusy
    ? analyzeState.status === 'triggering'
      ? 'Starting…'
      : 'Analyzing…'
    : 'Fetch and Analyze'

  const STEPS = [
    { key: 'queued',    label: 'Queued'    },
    { key: 'scraping',  label: 'Scraping'  },
    { key: 'analyzing', label: 'Analyzing' },
    { key: 'complete',  label: 'Complete'  },
  ]

  const completedPhaseKeys = new Set(log.slice(0, -1).map((e) => e.phase))
  const activePhaseKey = log[log.length - 1]?.phase ?? null
const getStepStatus = (stepKey: string): 'done' | 'active' | 'failed' | 'pending' => {
    if (stepKey === 'complete') return isSucceeded ? 'done' : 'pending'
    if (isSucceeded) return 'done'
    if (isFailed) {
      if (completedPhaseKeys.has(stepKey)) return 'done'
      if (stepKey === activePhaseKey) return 'failed'
      return 'pending'
    }
    if (completedPhaseKeys.has(stepKey)) return 'done'
    if (stepKey === activePhaseKey && isPolling) return 'active'
    return 'pending'
  }

  return (
    <div className="rounded-2xl bg-white overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <div className="p-4 space-y-3">

        <button
          onClick={handleRunAnalysis}
          disabled={isBusy}
          className={[
            'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors',
            isBusy
              ? 'bg-[#4664ff]/40 text-white cursor-not-allowed'
              : 'bg-[#4664ff] text-white hover:bg-[#3355ee]',
          ].join(' ')}
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          <RefreshCw className={['h-3.5 w-3.5 shrink-0', isBusy ? 'animate-spin' : ''].join(' ')} />
          {buttonLabel}
        </button>

        {(isBusy || isFailed || isSucceeded) && (
          <div className="w-full space-y-3 pb-1">
            {/* Horizontal step tracker */}
            <div className="space-y-1.5">
              {/* Dots + connectors row */}
              <div className="flex items-center">
                {STEPS.map((step, i) => {
                  const status = getStepStatus(step.key)
                  const segmentFilled = i < STEPS.length - 1 && (
                    isSucceeded || completedPhaseKeys.has(step.key)
                  )
                  return (
                    <div key={step.key} className="contents">
                      <span className="relative flex h-3.5 w-3.5 shrink-0">
                        {status === 'active' && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4664ff] opacity-50" />
                        )}
                        <span
                          className={[
                            'relative inline-flex h-3.5 w-3.5 rounded-full border',
                            status === 'done'    ? 'bg-[#2d7d28] border-[#2d7d28]'
                            : status === 'active' ? 'bg-[#4664ff] border-[#4664ff]'
                            : status === 'failed' ? 'bg-[#e55a2b] border-[#e55a2b]'
                            : 'bg-white border-[#d8d8d8]',
                          ].join(' ')}
                        />
                      </span>
                      {i < STEPS.length - 1 && (
                        <div className="flex-1 h-0.5 bg-[#f0f0f0] overflow-hidden">
                          <div
                            className={[
                              'h-full transition-all duration-500',
                              isFailed ? 'bg-[#e55a2b]' : 'bg-[#4664ff]',
                            ].join(' ')}
                            style={{ width: segmentFilled ? '100%' : '0%' }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Labels row */}
              <div className="flex justify-between">
                {STEPS.map((step) => {
                  const status = getStepStatus(step.key)
                  return (
                    <span
                      key={step.key}
                      className={[
                        'text-xs font-medium',
                        status === 'done'    ? 'text-[#2d7d28]'
                        : status === 'active' ? 'text-[#4664ff]'
                        : status === 'failed' ? 'text-[#e55a2b]'
                        : 'text-[#6b6b6b]/50',
                      ].join(' ')}
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {step.label}
                    </span>
                  )
                })}
              </div>
            </div>

            {(isSucceeded || (isPolling && completedPhaseKeys.has('scraping'))) && (
              <div className="space-y-1" style={{ fontFamily: 'var(--font-heading)' }}>
                <p className="text-sm text-[#6b6b6b]">
                  <span className="text-[#0e0e0e] font-medium">{analyzeState.scrape?.posts_new}</span>
                  {' '}new posts found
                  {analyzeState.scrape?.posts_found > 0 && (
                    <span className="text-[#6b6b6b]/50"> · {analyzeState.scrape?.posts_found} total scraped</span>
                  )}
                </p>
                <p className="text-sm text-[#6b6b6b]">
                  <span className="text-[#2d7d28] font-medium">{analyzeState.analysis?.relevant_completed}</span>
                  {' '}relevant posts analyzed
                </p>
              </div>
            )}

            {/* Error */}
            {isFailed && (
              <div className="flex items-start gap-2 rounded-lg bg-[#e55a2b]/10 px-3 py-2.5">
                <AlertCircle className="h-3.5 w-3.5 text-[#e55a2b] shrink-0 mt-0.5" />
                <p className="text-xs text-[#e55a2b]">{analyzeState.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
