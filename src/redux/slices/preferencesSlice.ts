import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface PreferencesState {
    primaryColor: string
    secondaryColor: string
}

const initialState: PreferencesState = {
    // Dark green primary, light green secondary (matches design)
    primaryColor: '#0B5E2E',
    secondaryColor: '#DFF6E4',
}

const preferencesSlice = createSlice({
    name: 'preferences',
    initialState,
    reducers: {
        setPrimaryColor(state, action: PayloadAction<string>) {
            state.primaryColor = action.payload
        },
        setSecondaryColor(state, action: PayloadAction<string>) {
            state.secondaryColor = action.payload
        },
    },
})

export const { setPrimaryColor, setSecondaryColor } = preferencesSlice.actions
export const selectThemePreferences = (state: any) => state.preferences || initialState

export default preferencesSlice.reducer
