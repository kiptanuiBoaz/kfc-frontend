
import axiosInstance from "@/api/axios";
import { TApiClient } from "@/types/api.types";
import type { AxiosRequestConfig } from "axios";



export const apiClient: TApiClient = {
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T | undefined> {
        const response = await axiosInstance.get(url, config);
        return response.data as T | undefined;
    },

    async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T | undefined> {
        const response = await axiosInstance.post(url, data, config);
        return response.data as T | undefined;
    },

    async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T | undefined> {
        const response = await axiosInstance.patch(url, data, config);
        return response.data as T | undefined;
    },

    async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T | undefined> {
        const response = await axiosInstance.put(url, data, config);
        return response.data as T | undefined;
    },

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T | undefined> {
        const response = await axiosInstance.delete(url, config);
        return response.data as T | undefined;
    },
};
