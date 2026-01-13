
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './slices/counterSlice'
import preferencesReducer from './slices/preferencesSlice'
import authReducer from './slices/authSlice'
import courseReducer from './slices/courseSlice'

export const store = configureStore({
    reducer: {
        counter: counterReducer,
        preferences: preferencesReducer,
        auth: authReducer,
        course: courseReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
