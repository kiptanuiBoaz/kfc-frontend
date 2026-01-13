import AuthState, { AuthTokens, AuthUser, LoginResponse } from '@/types/auth.types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: AuthState = {
    user: null,
    tokens: null,
    is_authenticated: false,
    isLoading: false,
    isRestoring: true,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart(state) {
            state.isLoading = true;
        },
        loginSuccess(state, action: PayloadAction<LoginResponse>) {
            state.isLoading = false;
            state.user = action.payload.user;
            state.tokens = {
                access: action.payload.access,
                refresh: action.payload.refresh,
                type: action.payload.type,
                expires_in: action.payload.expires_in,
            };
            state.is_authenticated = true;

            // Store tokens in localStorage for persistence
            localStorage.setItem('auth_tokens', JSON.stringify(state.tokens));
            localStorage.setItem('user', JSON.stringify(state.user));
        },
        loginFailure(state) {
            state.isLoading = false;
            state.user = null;
            state.tokens = null;
            state.is_authenticated = false;

            // Clear localStorage
            localStorage.removeItem('auth_tokens');
            localStorage.removeItem('user');
        },
        logout(state) {
            state.user = null;
            state.tokens = null;
            state.is_authenticated = false;
            state.isLoading = false;

            // Clear localStorage
            localStorage.removeItem('auth_tokens');
            localStorage.removeItem('user');
        },
        updateUser(state, action: PayloadAction<Partial<AuthUser>>) {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
                localStorage.setItem('user', JSON.stringify(state.user));
            }
        },
        updateUserImage(state, action: PayloadAction<string>) {
            if (state.user) {
                state.user = { ...state.user, image: action.payload };
                localStorage.setItem('user', JSON.stringify(state.user));
            }
        },
        restoreAuth(state) {
            // Restore auth state from localStorage on app initialization
            const storedTokens = localStorage.getItem('auth_tokens');
            const storedUser = localStorage.getItem('user');

            if (storedTokens && storedUser) {
                try {
                    state.tokens = JSON.parse(storedTokens);
                    state.user = JSON.parse(storedUser);
                    state.is_authenticated = true;
                } catch (error) {
                    // If parsing fails, clear invalid data
                    localStorage.removeItem('auth_tokens');
                    localStorage.removeItem('user');
                }
            }
            state.isRestoring = false;
        },
        updateTokens(state, action: PayloadAction<AuthTokens>) {
            state.tokens = action.payload;
            localStorage.setItem('auth_tokens', JSON.stringify(state.tokens));
        },
    },
});

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    updateUser,
    updateUserImage,
    restoreAuth,
    updateTokens,
} = authSlice.actions;

export default authSlice.reducer;