import apiClient from './apiClient';

export interface Report {
    id: number;
    name: string;
    notes?: string;
    type: string;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string;
    visits_planned: number;
    visits_completed: number;
    before_image?: string;
    after_image?: string;
    user_id: number;
    merchandiser_name: string;
    gms_id?: number;
    created_at: string;
}

export const ReportService = {
    getAll: async (): Promise<Report[]> => {
        try {
            const response = await apiClient.get('/api/reports/');
            return response.data;
        } catch (error) {
            console.error('[Reports] GetAll error:', error);
            return [];
        }
    },

    getReportById: async (id: number): Promise<Report | null> => {
        try {
            const response = await apiClient.get(`/api/reports/${id}`);
            return response.data;
        } catch (error) {
            console.error('[Reports] GetById error:', error);
            return null;
        }
    },

    create: async (report: Partial<Report>): Promise<Report | null> => {
        try {
            const response = await apiClient.post('/api/reports/', report);
            return response.data;
        } catch (error) {
            console.error('[Reports] Create error:', error);
            return null;
        }
    },

    updateStatus: async (reportId: number, status: string, rejectionReason?: string): Promise<Report | null> => {
        try {
            const params: any = { status };
            if (rejectionReason) params.rejection_reason = rejectionReason;

            const response = await apiClient.patch(`/api/reports/${reportId}/status`, null, { params });
            return response.data;
        } catch (error) {
            console.error('[Reports] UpdateStatus error:', error);
            return null;
        }
    }
};
