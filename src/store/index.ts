import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import dashboardReducer from './slices/dashboardSlice'
import entityReducer from './slices/entitySlice'

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    entities: entityReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
