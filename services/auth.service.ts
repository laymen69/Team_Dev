import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/auth';
import apiClient from './apiClient';

// JWT Helper Functions
const base64Decode = (str: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    str = str.replace(/=+$/, '');
    if (str.length % 4 === 1) throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
    for (let bc = 0, bs = 0, buffer, i = 0;
        buffer = str.charAt(i++);
        ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
            bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
        buffer = chars.indexOf(buffer);
    }
    return output;
};

const decodeJWT = (token: string) => {
    try {
        const payloadBase64 = token.split('.')[1];
        const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
        return JSON.parse(base64Decode(paddedBase64));
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
};

export const AuthService = {
    // Check if token is expired
    isTokenExpired: (token: string): boolean => {
        try {
            const payload = decodeJWT(token);
            if (!payload || !payload.exp) return true;

            const expirationTime = payload.exp * 1000;
            const currentTime = Date.now();
            const bufferTime = 30 * 1000; // 30 seconds (reduced from 5m to avoid premature logout)

            return expirationTime - currentTime < bufferTime;
        } catch (error) {
            return true;
        }
    },

    // Get token expiration time
    getTokenExpiration: (token: string): Date | null => {
        try {
            const payload = decodeJWT(token);
            if (!payload || !payload.exp) return null;
            return new Date(payload.exp * 1000);
        } catch (error) {
            return null;
        }
    },

    login: async (email: string, password: string): Promise<User | null> => {
        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await apiClient.post('/api/auth/token', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const data = response.data;
            const accessToken = data.access_token;

            const payload = decodeJWT(accessToken);
            if (!payload) throw new Error('Failed to decode token');

            const user: User = {
                id: payload.id || '0',
                email: email,
                firstName: payload.first_name || 'User',
                lastName: payload.last_name || '',
                role: payload.role || 'merchandiser',
                password: ''
            };

            await AsyncStorage.setItem('userToken', accessToken);
            return user;
        } catch (error: any) {
            console.error('[Auth] Login error:', error);
            const message = error.response?.data?.detail || error.message || 'Login failed';
            throw new Error(message);
        }
    },

    register: async (userData: any): Promise<any> => {
        try {
            const response = await apiClient.post('/api/users/', userData);
            return response.data;
        } catch (error: any) {
            console.error('[Auth] Registration error:', error);
            const message = error.response?.data?.detail || error.message || 'Registration failed';
            throw new Error(message);
        }
    }
};
