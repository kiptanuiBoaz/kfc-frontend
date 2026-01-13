import { AxiosRequestConfig } from "axios";

export type TApiClient = {
    get: <T>(url: string, config?: AxiosRequestConfig) => Promise<T | undefined>;
    post: <T  >(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T | undefined>;
    patch: <T  >(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T | undefined>;
    put: <T  >(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T | undefined>;
    delete: <T  >(url: string, config?: AxiosRequestConfig) => Promise<T | undefined>;
};