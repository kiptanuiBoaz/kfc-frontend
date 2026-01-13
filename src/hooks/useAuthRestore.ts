import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { restoreAuth } from '@/redux/slices/authSlice';
import { AppDispatch } from '@/redux/store';

export const useAuthRestore = () => {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(restoreAuth());
    }, [dispatch]);
};