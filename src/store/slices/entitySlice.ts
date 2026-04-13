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

export interface EntityScore {
  score: number
  label: string
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
  scores: EntityScore[]
  scoresStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  scoresError: string | null
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

export const fetchEntityScores = createAsyncThunk<
  EntityScore[],
  string,
  { rejectValue: string }
>('entities/fetchScores', async (canonicalName, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<EntityScore[]>(
      `/entity/${encodeURIComponent(canonicalName)}/dimension-scores`
    )
    return response.data
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
    },
    clearSelected(state) {
      state.selected = null
      state.scores = []
      state.scoresStatus = 'idle'
      state.scoresError = null
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
      .addCase(fetchEntityScores.pending, (state) => {
        state.scoresStatus = 'loading'
        state.scoresError = null
      })
      .addCase(fetchEntityScores.fulfilled, (state, action) => {
        state.scoresStatus = 'succeeded'
        state.scores = action.payload
      })
      .addCase(fetchEntityScores.rejected, (state, action) => {
        state.scoresStatus = 'failed'
        state.scoresError = action.payload ?? 'Unknown error'
      })
  },
})

export const { resetCreateStatus, setSelectedEntity, clearSelected } = entitySlice.actions
export default entitySlice.reducer
