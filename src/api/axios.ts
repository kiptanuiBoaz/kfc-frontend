import { isAuthEndPoint } from '@/utils/isAuth';
import { RootState, store } from '@/redux/store';
import { logout, updateTokens } from '@/redux/slices/authSlice';
import axios, { AxiosRequestHeaders } from 'axios';
import { PATHS } from '@/navigation/paths';
import { jwtDecode } from 'jwt-decode';


const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL;

// Create a separate axios instance for refresh requests to avoid infinite loops
const refreshAxios = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add authorization header and handle token refresh
axiosInstance.interceptors.request.use(
    async (config) => {
        const state: RootState = store.getState();

        const accessToken = state.auth.tokens?.access;
        const refreshToken = state.auth.tokens?.refresh;
        const tokenType = state.auth.tokens?.type ?? 'Bearer';
        const expiresIn = state.auth.tokens?.expires_in ?? 0;

        const setAuthHeader = (token: string) => {
            if (!config.headers) {
                config.headers = {} as AxiosRequestHeaders;
            }
            (config.headers as AxiosRequestHeaders).Authorization = `${tokenType} ${token}`;
        };

        if (accessToken) {
            try {
                const decoded = jwtDecode<{ exp?: number }>(accessToken);

                if (decoded?.exp) {
                    const expMs = decoded.exp * 1000;
                    const now = Date.now();
                    const willExpireSoon = expMs - now < 5 * 60 * 1000;
                    const isExpired = expMs < now;

                    if ((isExpired || willExpireSoon) && refreshToken) {
                        try {
                            const res = await refreshAxios.post('/auth/refresh/', {
                                refresh: refreshToken,
                            });

                            const newAccessToken: string = res.data.access;
                            const newRefreshToken: string = res.data.refresh ?? refreshToken;
                            const newExpiresIn: number = res.data.expires_in ?? expiresIn;

                            store.dispatch(
                                updateTokens({
                                    access: newAccessToken,
                                    refresh: newRefreshToken,
                                    type: tokenType,
                                    expires_in: newExpiresIn,
                                })
                            );

                            setAuthHeader(newAccessToken);
                        } catch (e) {
                            setAuthHeader(accessToken);
                        }
                    } else {
                        setAuthHeader(accessToken);
                    }
                } else {
                    setAuthHeader(accessToken);
                }
            } catch (e) {
                setAuthHeader(accessToken);
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors and logout on authentication failures
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const requestUrl = error?.config?.url || "";

        // Avoid redirect loops for auth endpoints (adjust paths if needed)
        const isAuthEndpoint = isAuthEndPoint(requestUrl);

        if ((status === 401 || status === 403) && !isAuthEndpoint) {
            // Dispatch logout action to clear Redux state and localStorage
            store.dispatch(logout());

            try {
                // Replace location to avoid adding a history entry
                window.location.replace(PATHS.LOGIN);
            } catch (e) {
                // fallback
                window.location.href = (PATHS.LOGIN);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;