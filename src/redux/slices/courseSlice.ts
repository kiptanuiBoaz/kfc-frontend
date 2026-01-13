import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CourseState {
    currentModule: string | null;
    currentTopic: string | null;
}

const initialState: CourseState = {
    currentModule: null,
    currentTopic: null,
};

const courseSlice = createSlice({
    name: 'course',
    initialState,
    reducers: {
        setCurrentModule: (state, action: PayloadAction<string>) => {
            state.currentModule = action.payload;
        },
        setCurrentTopic: (state, action: PayloadAction<string>) => {
            state.currentTopic = action.payload;
        },
        resetCourseState: (state) => {
            state.currentModule = null;
            state.currentTopic = null;
        },
    },
});

export const { setCurrentModule, setCurrentTopic, resetCourseState } = courseSlice.actions;
export const getCurrentModule = (state: CourseState) => state.currentModule;
export const getCurrentTopic = (state: CourseState) => state.currentTopic;
export default courseSlice.reducer;