import apiClient from './apiClient';

export interface Objective {
    id: number;
    user_id: number;
    title: string;
    target: number;
    current: number;
    target_visits: number;
    month: number;
    year: number;
    created_at: string;
}

export const ObjectiveService = {
    getAll: async (): Promise<Objective[]> => {
        try {
            const response = await apiClient.get('/api/objectives/');
            return response.data;
        } catch (error) {
            console.error('[Objectives] GetAll error:', error);
            return [];
        }
    },

    create: async (objective: Partial<Objective>): Promise<Objective | null> => {
        try {
            const response = await apiClient.post('/api/objectives/', objective);
            return response.data;
        } catch (error) {
            console.error('[Objectives] Create error:', error);
            return null;
        }
    },

    delete: async (id: number): Promise<boolean> => {
        try {
            const response = await apiClient.delete(`/api/objectives/${id}`);
            return response.status === 200 || response.status === 204;
        } catch (error) {
            console.error('[Objectives] Delete error:', error);
            return false;
        }
    }
};
