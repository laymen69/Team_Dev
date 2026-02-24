import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { SERVER_IP } from './server-ip';

const getBaseUrl = () => {
    // 1. Web environment always uses localhost
    if (Platform.OS === 'web') {
        console.log('[API] Web environment detected, using localhost:8000');
        return 'http://localhost:8000';
    }

    // 2. Expo Go hostUri (Dynamic - Best for local dev on device)
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
        const ip = hostUri.split(':')[0];
        const url = `http://${ip}:8000`;
        console.log('[API] Using Expo hostUri:', url);
        return url;
    }

    // 3. Auto-Detected IP (Fallback from scripts/set-ip.js)
    if (SERVER_IP && SERVER_IP !== '127.0.0.1') {
        console.log('[API] Using auto-detected IP:', SERVER_IP);
        return `http://${SERVER_IP}:8000`;
    }

    // 4. Default Fallback
    const url = 'http://localhost:8000';
    console.log('[API] Using localhost fallback:', url);
    return url;
};

export const API_BASE_URL = getBaseUrl();
console.log('[API] Final API_BASE_URL:', API_BASE_URL);

export const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/api/auth/token`,
    REGISTER: `${API_BASE_URL}/api/users/`,
    USERS: `${API_BASE_URL}/api/users/`,
    GMS: `${API_BASE_URL}/api/gms/`,
    GMS_NEAREST: `${API_BASE_URL}/api/gms/nearest/`,
    GMS_WITHIN_RADIUS: `${API_BASE_URL}/api/gms/within-radius/`,
    NOTIFICATIONS: `${API_BASE_URL}/api/notifications/`,
    REPORTS: `${API_BASE_URL}/api/reports/`,
};
