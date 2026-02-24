
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../constants/api';
import { emitToast, emitUnauthorized } from './eventEmitter';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            console.log('[API] 401 Unauthorized detected - triggering global logout');
            emitUnauthorized();
        }

        // Handle 422 Validation Error
        if (error.response?.status === 422) {
            console.error('[API] Validation error:', error.response.data);
            const detail = error.response.data?.detail;
            const message = typeof detail === 'string'
                ? detail
                : (Array.isArray(detail) ? detail[0]?.msg : 'Validation error occurred');
            emitToast(message, 'error');
        }

        // Handle other errors
        if (error.response?.status >= 500) {
            emitToast('Server error. Please try again later.', 'error');
        } else if (error.code === 'ECONNABORTED') {
            emitToast('Request timed out. Check your connection.', 'warning');
        }

        return Promise.reject(error);
    }
);

export default apiClient;
