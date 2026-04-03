import apiClient from './apiClient';

import { createCrudService } from './serviceFactory';

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
    ...createCrudService<Report>('/api/reports'),

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
