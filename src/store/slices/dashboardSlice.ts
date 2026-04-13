import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import apiClient from '@/lib/axios/client'

interface Stat {
  label: string
  value: string
  change: string
}

interface Activity {
  description: string
  time: string
}

interface DashboardState {
  stats: Stat[]
  activities: Activity[]
  statsStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  activitiesStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  statsError: string | null
  activitiesError: string | null
}

const initialState: DashboardState = {
  stats: [],
  activities: [],
  statsStatus: 'idle',
  activitiesStatus: 'idle',
  statsError: null,
  activitiesError: null,
}

export const fetchDashboardStats = createAsyncThunk<
  Stat[],
  void,
  { rejectValue: string }
>('dashboard/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<Stat[]>('/dashboard/stats')
    return response.data
  } catch (err: unknown) {
    const error = err as { message: string }
    return rejectWithValue(error.message ?? 'Failed to fetch stats')
  }
})

export const fetchDashboardActivities = createAsyncThunk<
  Activity[],
  void,
  { rejectValue: string }
>('dashboard/fetchActivities', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<Activity[]>('/dashboard/activities')
    return response.data
  } catch (err: unknown) {
    const error = err as { message: string }
    return rejectWithValue(error.message ?? 'Failed to fetch activities')
  }
})

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.statsStatus = 'loading'
        state.statsError = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.statsStatus = 'succeeded'
        state.stats = action.payload
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.statsStatus = 'failed'
        state.statsError = action.payload ?? 'Unknown error'
      })
      .addCase(fetchDashboardActivities.pending, (state) => {
        state.activitiesStatus = 'loading'
        state.activitiesError = null
      })
      .addCase(fetchDashboardActivities.fulfilled, (state, action) => {
        state.activitiesStatus = 'succeeded'
        state.activities = action.payload
      })
      .addCase(fetchDashboardActivities.rejected, (state, action) => {
        state.activitiesStatus = 'failed'
        state.activitiesError = action.payload ?? 'Unknown error'
      })
  },
})

export default dashboardSlice.reducer
