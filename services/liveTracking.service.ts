import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';
import * as Location from 'expo-location';

type LocationCallback = (data: any) => void;

class LiveTrackingService {
    private ws: WebSocket | null = null;
    private locationSubscription: Location.LocationSubscription | null = null;
    private userId: number | null = null;
    private callbacks: Set<LocationCallback> = new Set();
    private isConnected: boolean = false;

    // Optional utility to decode JWT for user ID extraction
    private decodeJWT(token: string) {
        try {
            const base64Decode = (str: string) => {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                let output = '';
                str = str.replace(/=+$/, '');
                for (let bc = 0, bs = 0, buffer, i = 0; buffer = str.charAt(i++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
                    buffer = chars.indexOf(buffer);
                }
                
                return output;
            };
            const payloadBase64 = token.split('.')[1];
            const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
            const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
            return JSON.parse(base64Decode(paddedBase64));
        } catch (error) {
            return null;
        }
    }

    async connect() {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            return;
        }

        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                console.error('[LiveTracking] No token found, cannot connect to WebSocket.');
                return;
            }

            // Extract user id from token
            const payload = this.decodeJWT(token);
            if (payload && payload.id) {
                this.userId = parseInt(payload.id);
            } else {
                // If ID is not in JWT payload, we can default to 0 or fetch it
                const userStr = await AsyncStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    this.userId = parseInt(user.id);
                } else {
                    this.userId = 1; // Fallback
                }
            }

            const wsUrl = API_BASE_URL.replace('http', 'ws') + `/api/tracking/ws/live-location?token=${token}`;
            
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('[LiveTracking] WebSocket Connected');
                this.isConnected = true;
            };

            this.ws.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);
                    // notify all listeners of received location (broadcasting to others)
                    this.callbacks.forEach(cb => cb(data));
                } catch (err) {
                    console.error('[LiveTracking] Messsage Parse Error', err);
                }
            };

            this.ws.onerror = (e: any) => {
                console.error('[LiveTracking] WebSocket Error: ', e.message);
            };

            this.ws.onclose = (e) => {
                console.log('[LiveTracking] WebSocket Closed: ', e.code, e.reason);
                this.isConnected = false;
                this.ws = null;
            };

        } catch (e) {
            console.error('[LiveTracking] Connection Setup Error: ', e);
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.isConnected = false;
        }
        this.stopBroadcasting();
    }

    async startBroadcasting() {
        await this.connect();

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.error('[LiveTracking] Permission to access location was denied');
            return;
        }

        if (this.locationSubscription) {
            return; // already broadcasting
        }

        this.locationSubscription = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 5000, // broadcast every 5 seconds
                distanceInterval: 10, // or every 10 meters
            },
            (location) => {
                if (this.ws && this.ws.readyState === WebSocket.OPEN && this.userId) {
                    const payload = {
                        user_id: this.userId,
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        timestamp: location.timestamp || Date.now()
                    };
                    this.ws.send(JSON.stringify(payload));
                }
            }
        );
    }

    stopBroadcasting() {
        if (this.locationSubscription) {
            this.locationSubscription.remove();
            this.locationSubscription = null;
        }
    }

    subscribe(callback: LocationCallback) {
        this.callbacks.add(callback);
        return () => {
            this.callbacks.delete(callback);
        };
    }
}

export const liveTrackingService = new LiveTrackingService();
