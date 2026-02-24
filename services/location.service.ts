import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import apiClient from './apiClient';

export interface LocationPoint {
    latitude: number;
    longitude: number;
    timestamp: number;
    type: 'start' | 'end' | 'checkpoint';
}

export interface WorkdaySession {
    id: string; // Server DB ID
    startTime: number;
    endTime: number | null;
    startLocation: LocationPoint;
    endLocation: LocationPoint | null;
    status: 'active' | 'completed';
}

export interface VisitSession {
    id: string; // Server DB ID
    gmsId: number;
    startTime: number;
    status: 'in_progress' | 'completed';
}

const ACTIVE_WORKDAY_ID = 'active_workday_id';
const ACTIVE_VISIT_ID = 'active_visit_id';

export const LocationService = {
    requestPermissions: async (): Promise<boolean> => {
        try {
            const { status: foreground } = await Location.requestForegroundPermissionsAsync();
            if (foreground !== 'granted') {
                console.log('[GPS] Foreground permission denied');
                return false;
            }
            return true;
        } catch (error) {
            console.error('[GPS] Permission error:', error);
            return false;
        }
    },
    getCurrentLocation: async (): Promise<LocationPoint | null> => {
        try {
            const hasPermission = await LocationService.requestPermissions();
            if (!hasPermission) return null;

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            return {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                timestamp: location.timestamp,
                type: 'checkpoint',
            };
        } catch (error) {
            console.error('[GPS] Location error:', error);
            return null;
        }
    },
    startWorkday: async (): Promise<WorkdaySession | null> => {
        try {
            const location = await LocationService.getCurrentLocation();
            if (!location) return null;

            const response = await apiClient.post('/api/tracking/workday/start', {
                start_lat: location.latitude,
                start_lng: location.longitude
            });

            const dbWorkday = response.data;
            await AsyncStorage.setItem(ACTIVE_WORKDAY_ID, dbWorkday.id.toString());

            return {
                id: dbWorkday.id.toString(),
                startTime: new Date(dbWorkday.start_time).getTime(),
                endTime: null,
                startLocation: { ...location, type: 'start' },
                endLocation: null,
                status: 'active',
            };
        } catch (error) {
            console.error('[GPS] Start workday error:', error);
            return null;
        }
    },
    endWorkday: async (): Promise<boolean> => {
        try {
            const location = await LocationService.getCurrentLocation();
            if (!location) return false;

            await apiClient.post('/api/tracking/workday/end', {
                end_lat: location.latitude,
                end_lng: location.longitude
            });

            await AsyncStorage.removeItem(ACTIVE_WORKDAY_ID);
            await AsyncStorage.removeItem(ACTIVE_VISIT_ID);
            return true;
        } catch (error: any) {
            console.error('[GPS] End workday error:', error.response?.data?.detail || error.message);
            throw error;
        }
    },
    startVisit: async (gmsId: number): Promise<VisitSession | null> => {
        try {
            const workdayId = await AsyncStorage.getItem(ACTIVE_WORKDAY_ID);
            if (!workdayId) throw new Error("No active workday");

            const location = await LocationService.getCurrentLocation();
            if (!location) return null;

            const response = await apiClient.post('/api/tracking/visit/start', {
                workday_id: parseInt(workdayId),
                gms_id: gmsId,
                start_lat: location.latitude,
                start_lng: location.longitude
            });

            const dbVisit = response.data;
            await AsyncStorage.setItem(ACTIVE_VISIT_ID, dbVisit.id.toString());

            return {
                id: dbVisit.id.toString(),
                gmsId: dbVisit.gms_id,
                startTime: new Date(dbVisit.start_time).getTime(),
                status: 'in_progress'
            };
        } catch (error: any) {
            const msg = error.response?.data?.detail || error.message;
            console.error('[Visit] Start error:', msg);
            throw new Error(msg);
        }
    },
    endVisit: async (): Promise<boolean> => {
        try {
            const visitId = await AsyncStorage.getItem(ACTIVE_VISIT_ID);
            if (!visitId) return false;

            const location = await LocationService.getCurrentLocation();

            await apiClient.post('/api/tracking/visit/end', {
                visit_id: parseInt(visitId),
                end_lat: location?.latitude,
                end_lng: location?.longitude
            });

            await AsyncStorage.removeItem(ACTIVE_VISIT_ID);
            return true;
        } catch (error) {
            console.error('[Visit] End error:', error);
            return false;
        }
    },
    addCheckpoint: async (): Promise<boolean> => {
        try {
            const workdayId = await AsyncStorage.getItem(ACTIVE_WORKDAY_ID);
            if (!workdayId) return false;

            const location = await LocationService.getCurrentLocation();
            if (!location) return false;

            await apiClient.post('/api/tracking/logs/sync', [{
                workday_id: parseInt(workdayId),
                latitude: location.latitude,
                longitude: location.longitude,
                log_type: 'checkpoint'
            }]);

            return true;
        } catch (error) {
            console.error('[GPS] Checkpoint sync error:', error);
            return false;
        }
    },
    getActiveSession: async (): Promise<{ workday: WorkdaySession | null, visit: VisitSession | null }> => {
        try {
            const response = await apiClient.get('/api/tracking/active-session');
            const { workday, visit } = response.data;

            if (workday) {
                await AsyncStorage.setItem(ACTIVE_WORKDAY_ID, workday.id.toString());
            } else {
                await AsyncStorage.removeItem(ACTIVE_WORKDAY_ID);
            }

            if (visit) {
                await AsyncStorage.setItem(ACTIVE_VISIT_ID, visit.id.toString());
            } else {
                await AsyncStorage.removeItem(ACTIVE_VISIT_ID);
            }

            return {
                workday: workday ? {
                    id: workday.id.toString(),
                    startTime: new Date(workday.start_time).getTime(),
                    endTime: null,
                    startLocation: { latitude: workday.start_lat, longitude: workday.start_lng, type: 'start', timestamp: 0 },
                    endLocation: null,
                    status: 'active'
                } : null,
                visit: visit ? {
                    id: visit.id.toString(),
                    gmsId: visit.gms_id,
                    startTime: new Date(visit.start_time).getTime(),
                    status: 'in_progress'
                } : null
            };
        } catch (error) {
            return { workday: null, visit: null };
        }
    },

    getSessionDuration: (session: WorkdaySession | VisitSession): number => {
        const start = 'startTime' in session ? session.startTime : (session as any).start_time;
        return Math.round((Date.now() - new Date(start).getTime()) / 60000);
    },

    formatDuration: (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}m`;
        return `${hours}h ${mins}m`;
    },
};
