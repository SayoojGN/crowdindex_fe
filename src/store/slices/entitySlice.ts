import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import apiClient from '@/lib/axios/client'

export interface Entity {
  id: string
  canonical_name: string
  external_id: string
  metadata: Record<string, unknown>
  created_at: string
  synonyms: string[] | null
  user_id: string
}

export interface DimensionScore {
  id: string
  extraction_id: string
  dimension: string
  score: number | null
  severity: string | null
  dimension_type: 'evaluative' | 'enumerative'
  item_name: string | null
  evidence: string
}

export interface AnalysisDimension {
  dimension: string
  dimension_type: 'evaluative' | 'enumerative'
  overall_sentiment: 'positive' | 'neutral' | 'negative'
  overall_score: number | null
  items: Record<string, unknown>
}

export interface AnalysisPost {
  post_id: string
  content: string
  posted_at: string
  url: string
  source_type: string
  extraction_id: string
  dimensions: AnalysisDimension[]
}

interface AnalysisResponse {
  data: AnalysisPost[]
}

export interface ExtractionMention {
  id: string
  dimension: string
  score: number | null
  severity: string | null
  dimension_type: 'evaluative' | 'enumerative'
  item_name: string | null
  evidence: string
}

export interface PostForDate {
  id: string
  source_id: string
  source_type: string
  entity_id: string
  content: string
  author_hash: string
  url: string
  source_meta: Record<string, unknown>
  posted_at: string
  ingested_at: string
  analysis_status: string
  updated_at: string
  batch_id: string | null
  extraction_mentions: ExtractionMention[]
}

export interface MetricDataPoint {
  date: string
  scores: Record<string, number | string[]>
}

interface MetricsResponse {
  data: MetricDataPoint[]
}

interface EntitiesResponse {
  data: Entity[]
}

interface CreateEntityPayload {
  canonical_name: string
  external_id?: string
  metadata?: Record<string, unknown>
  synonyms?: string[]
}

interface EntityState {
  list: Entity[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  createStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  createError: string | null
  selected: Entity | null
  scores: DimensionScore[]
  scoresStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  scoresError: string | null
  analysis: AnalysisPost[]
  analysisStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  analysisError: string | null
  metrics: MetricDataPoint[]
  metricsStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  metricsError: string | null
  postsForDate: PostForDate[]
  postsForDateStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  postsForDateError: string | null
}

const initialState: EntityState = {
  list: [],
  status: 'idle',
  error: null,
  createStatus: 'idle',
  createError: null,
  selected: null,
  scores: [],
  scoresStatus: 'idle',
  scoresError: null,
  analysis: [],
  analysisStatus: 'idle',
  analysisError: null,
  metrics: [],
  metricsStatus: 'idle',
  metricsError: null,
  postsForDate: [],
  postsForDateStatus: 'idle',
  postsForDateError: null,
}

export const fetchEntities = createAsyncThunk<
  Entity[],
  void,
  { rejectValue: string }
>('entities/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<EntitiesResponse>('/entities')
    return response.data.data
  } catch (err: unknown) {
    const error = err as { message: string }
    return rejectWithValue(error.message ?? 'Failed to fetch entities')
  }
})

export const createEntity = createAsyncThunk<
  Entity,
  CreateEntityPayload,
  { rejectValue: string }
>('entities/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<Entity>('/entity', payload)
    return response.data
  } catch (err: unknown) {
    const error = err as { message: string }
    return rejectWithValue(error.message ?? 'Failed to create entity')
  }
})

export const fetchEntityAnalysis = createAsyncThunk<
  AnalysisPost[],
  string,
  { rejectValue: string }
>('entities/fetchAnalysis', async (canonicalName, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<AnalysisResponse>(
      `/entity/${encodeURIComponent(canonicalName)}/post-analysis`
    )
    return response.data.data
  } catch (err: unknown) {
    const error = err as { message: string }
    return rejectWithValue(error.message ?? 'Failed to fetch analysis')
  }
})

export const fetchEntityMetrics = createAsyncThunk<
  MetricDataPoint[],
  string,
  { rejectValue: string }
>('entities/fetchMetrics', async (canonicalName, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<MetricsResponse>(
      `/entity/${encodeURIComponent(canonicalName)}/daily-metrics`
    )
    return response.data.data
  } catch (err: unknown) {
    const error = err as { message: string }
    return rejectWithValue(error.message ?? 'Failed to fetch metrics')
  }
})

export const fetchPostsForDate = createAsyncThunk<
  PostForDate[],
  { canonicalName: string; date: string },
  { rejectValue: string }
>('entities/fetchPostsForDate', async ({ canonicalName, date }, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<{ data: PostForDate[] }>(
      `/entity/${encodeURIComponent(canonicalName)}/postForEntityDate`,
      { date }
    )
    return response.data.data
  } catch (err: unknown) {
    const error = err as { message: string }
    return rejectWithValue(error.message ?? 'Failed to fetch posts')
  }
})

export const fetchDimensionScores = createAsyncThunk<
  DimensionScore[],
  string,
  { rejectValue: string }
>('entities/fetchScores', async (canonicalName, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<{ data: DimensionScore[] }>(
      `/entity/${encodeURIComponent(canonicalName)}/dimension-scores`
    )
    return response.data.data
  } catch (err: unknown) {
    const error = err as { message: string }
    return rejectWithValue(error.message ?? 'Failed to fetch scores')
  }
})

const entitySlice = createSlice({
  name: 'entities',
  initialState,
  reducers: {
    resetCreateStatus(state) {
      state.createStatus = 'idle'
      state.createError = null
    },
    setSelectedEntity(state, action: PayloadAction<Entity>) {
      state.selected = action.payload
      state.scores = []
      state.scoresStatus = 'idle'
      state.scoresError = null
      state.analysis = []
      state.analysisStatus = 'idle'
      state.analysisError = null
      state.metrics = []
      state.metricsStatus = 'idle'
      state.metricsError = null
      state.postsForDate = []
      state.postsForDateStatus = 'idle'
      state.postsForDateError = null
    },
    clearSelected(state) {
      state.selected = null
      state.scores = []
      state.scoresStatus = 'idle'
      state.scoresError = null
      state.analysis = []
      state.analysisStatus = 'idle'
      state.analysisError = null
      state.metrics = []
      state.metricsStatus = 'idle'
      state.metricsError = null
      state.postsForDate = []
      state.postsForDateStatus = 'idle'
      state.postsForDateError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEntities.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchEntities.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.list = action.payload
      })
      .addCase(fetchEntities.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Unknown error'
      })
      .addCase(createEntity.pending, (state) => {
        state.createStatus = 'loading'
        state.createError = null
      })
      .addCase(createEntity.fulfilled, (state, action) => {
        state.createStatus = 'succeeded'
        state.list.unshift(action.payload)
        state.selected = action.payload
      })
      .addCase(createEntity.rejected, (state, action) => {
        state.createStatus = 'failed'
        state.createError = action.payload ?? 'Unknown error'
      })
      .addCase(fetchEntityAnalysis.pending, (state) => {
        state.analysisStatus = 'loading'
        state.analysisError = null
      })
      .addCase(fetchEntityAnalysis.fulfilled, (state, action) => {
        state.analysisStatus = 'succeeded'
        state.analysis = action.payload
      })
      .addCase(fetchEntityAnalysis.rejected, (state, action) => {
        state.analysisStatus = 'failed'
        state.analysisError = action.payload ?? 'Unknown error'
      })
      .addCase(fetchEntityMetrics.pending, (state) => {
        state.metricsStatus = 'loading'
        state.metricsError = null
      })
      .addCase(fetchEntityMetrics.fulfilled, (state, action) => {
        state.metricsStatus = 'succeeded'
        state.metrics = action.payload
      })
      .addCase(fetchEntityMetrics.rejected, (state, action) => {
        state.metricsStatus = 'failed'
        state.metricsError = action.payload ?? 'Unknown error'
      })
      .addCase(fetchPostsForDate.pending, (state) => {
        state.postsForDateStatus = 'loading'
        state.postsForDateError = null
        state.postsForDate = []
      })
      .addCase(fetchPostsForDate.fulfilled, (state, action) => {
        state.postsForDateStatus = 'succeeded'
        state.postsForDate = action.payload
      })
      .addCase(fetchPostsForDate.rejected, (state, action) => {
        state.postsForDateStatus = 'failed'
        state.postsForDateError = action.payload ?? 'Unknown error'
      })
      .addCase(fetchDimensionScores.pending, (state) => {
        state.scoresStatus = 'loading'
        state.scoresError = null
      })
      .addCase(fetchDimensionScores.fulfilled, (state, action) => {
        state.scoresStatus = 'succeeded'
        state.scores = action.payload
      })
      .addCase(fetchDimensionScores.rejected, (state, action) => {
        state.scoresStatus = 'failed'
        state.scoresError = action.payload ?? 'Unknown error'
      })
  },
})

export const { resetCreateStatus, setSelectedEntity, clearSelected } = entitySlice.actions
export default entitySlice.reducer
