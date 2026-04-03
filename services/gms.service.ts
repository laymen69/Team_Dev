import apiClient from './apiClient';

export interface GMS {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    city: string;
    type: string;
    distance_km?: number;
}

export const GMSService = {
    getAll: async (params?: { skip?: number; limit?: number }): Promise<GMS[]> => {
        try {
            const response = await apiClient.get('/api/gms/', {
                params: {
                    skip: params?.skip ?? 0,
                    limit: params?.limit ?? 50,
                },
            });
            return response.data;
        } catch (error) {
            console.error('[GMS] GetAll error:', error);
            return [];
        }
    },

    assignMerchandiser: async (gmsId: number, userId: number): Promise<boolean> => {
        try {
            const response = await apiClient.post('/api/gms/assign', {
                user_id: userId,
                gms_id: gmsId
            });
            return response.status === 200 || response.status === 201;
        } catch (error) {
            console.error('[GMS] Assign error:', error);
            return false;
        }
    },

    create: async (store: Partial<GMS>): Promise<GMS | null> => {
        try {
            const response = await apiClient.post('/api/gms/', store);
            return response.data;
        } catch (error) {
            console.error('[GMS] Create error:', error);
            return null;
        }
    },

    delete: async (gmsId: number): Promise<boolean> => {
        try {
            const response = await apiClient.delete(`/api/gms/${gmsId}/`);
            return response.status === 200 || response.status === 204;
        } catch (error) {
            console.error('[GMS] Delete error:', error);
            throw error;
        }
    }
};
