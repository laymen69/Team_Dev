import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../constants/api';
import { emitToast, emitUnauthorized } from './eventEmitter';

type TimedAxiosConfig = AxiosRequestConfig & {
    metadata?: {
        startTime: number;
    };
};

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

let memoryToken: string | null = null;

export const setAuthTokenCache = (token: string | null) => {
    memoryToken = token;
};

// Request interceptor
apiClient.interceptors.request.use(
    async (config) => {
        // Log request start time
        const typedConfig = config as any as TimedAxiosConfig;
        typedConfig.metadata = { startTime: Date.now() };

        // Attempt memory cache first
        if (!memoryToken) {
            memoryToken = await AsyncStorage.getItem('userToken');
        }

        if (memoryToken) {
            config.headers.Authorization = `Bearer ${memoryToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const logResponseTime = (responseOrError: AxiosResponse | any) => {
    try {
        const cfg = (responseOrError.config || {}) as TimedAxiosConfig;
        const start = cfg.metadata?.startTime;
        if (!start) return;
        const duration = Date.now() - start;
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
            const method = (cfg.method || 'GET').toString().toUpperCase();
            const url = cfg.url || '';
            // Lightweight console timing to help baseline and regressions
            // eslint-disable-next-line no-console
            console.log(`[API] ${method} ${url} - ${duration}ms`);
        }
    } catch {
        // Best-effort only; never break requests due to logging
    }
};

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        logResponseTime(response);
        return response;
    },
    async (error) => {
        logResponseTime(error);

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            if (error.config?.url?.includes('/api/auth/token')) {
                return Promise.reject(error);
            }
            console.log('[API] 401 Unauthorized detected - triggering global logout');
            memoryToken = null;
            emitUnauthorized();
            return Promise.reject(error); // EARLY EXIT
        }

        // Handle 422 Validation Error
        if (error.response?.status === 422) {
            console.error('[API] Validation error:', error.response.data);
            const detail = error.response.data?.detail;
            const message = typeof detail === 'string'
                ? detail
                : (Array.isArray(detail) ? detail[0]?.msg : 'Validation error occurred');
            emitToast(message, 'error');
            return Promise.reject(error); // EARLY EXIT
        }

        // Handle other server responses (5xx)
        if (error.response?.status >= 500) {
            const config = error.config;
            if (config && config.method === 'get' && !config._isRetry) {
                config._isRetry = true;
                console.log(`[API] 5xx error on ${config.url}, retrying in 1s...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return apiClient(config);
            }
            emitToast('Server error. Please try again later.', 'error');
        }
        // Handle network timeouts
        else if (error.code === 'ECONNABORTED') {
            emitToast('Request timed out. Check your connection.', 'warning');
        }
        // Handle generic network errors (no internet connection, CORS, etc.)
        else if (!error.response) {
            emitToast('Network error. Please check your internet connection.', 'error');
        }

        return Promise.reject(error);
    }
);

const originalGet = apiClient.get;
const pendingGetRequests = new Map<string, Promise<any>>();

apiClient.get = function (url: string, config?: AxiosRequestConfig) {
    const key = url + (config?.params ? JSON.stringify(config.params) : '');
    if (pendingGetRequests.has(key)) {
        console.log(`[API] Deduplicating GET request to ${key}`);
        return pendingGetRequests.get(key) as Promise<any>;
    }
    const promise = originalGet.call(this, url, config).finally(() => {
        pendingGetRequests.delete(key);
    });
    pendingGetRequests.set(key, promise);
    return promise;
};

export default apiClient;
