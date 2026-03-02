import apiClient from './apiClient';

export interface Article {
    id: number;
    name: string;
    reference?: string;
    category?: string;
    brand?: string;
    unit?: string;
    description?: string;
    is_active: boolean;
    gms_id?: number;
    created_at: string;
}

export const ArticleService = {
    getAll: async (gmsId?: number, category?: string): Promise<Article[]> => {
        try {
            const params: any = {};
            if (gmsId) params.gms_id = gmsId;
            if (category) params.category = category;
            const res = await apiClient.get('/api/articles/', { params });
            return res.data;
        } catch (e) {
            console.error('[Articles] GetAll:', e);
            return [];
        }
    },

    create: async (data: Partial<Article>): Promise<Article | null> => {
        try {
            const res = await apiClient.post('/api/articles/', data);
            return res.data;
        } catch (e) {
            console.error('[Articles] Create:', e);
            return null;
        }
    },

    update: async (id: number, data: Partial<Article>): Promise<Article | null> => {
        try {
            const res = await apiClient.put(`/api/articles/${id}`, data);
            return res.data;
        } catch (e) {
            console.error('[Articles] Update:', e);
            return null;
        }
    },

    delete: async (id: number): Promise<boolean> => {
        try {
            await apiClient.delete(`/api/articles/${id}`);
            return true;
        } catch (e) {
            console.error('[Articles] Delete:', e);
            return false;
        }
    },
};
