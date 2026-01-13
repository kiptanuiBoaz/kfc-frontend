import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export const useAuth = () => {
    return useSelector((state: RootState) => state.auth);
};

export const useUser = () => {
    return useSelector((state: RootState) => state.auth.user);
};

export const useIsAuthenticated = () => {
    return useSelector((state: RootState) => state.auth.is_authenticated);
};

export const useIsAuthRestoring = () => {
    return useSelector((state: RootState) => state.auth.isRestoring);
};