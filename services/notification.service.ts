import apiClient from './apiClient';

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'alert';
    icon?: string;
    is_read: boolean;
    created_at: string;
    user_id: number;
    action_link?: string;
}

export const NotificationService = {
    getNotifications: async (): Promise<Notification[]> => {
        try {
            const response = await apiClient.get('/api/notifications/');
            return response.data;
        } catch (error) {
            console.error('Fetch notifications error:', error);
            return [];
        }
    },

    markAsRead: async (id: number): Promise<Notification | null> => {
        try {
            const response = await apiClient.put(`/api/notifications/${id}/read/`);
            return response.data;
        } catch (error) {
            console.error('Mark as read error:', error);
            return null;
        }
    },

    markAllAsRead: async (): Promise<boolean> => {
        try {
            const response = await apiClient.put('/api/notifications/read-all/');
            return response.status === 200;
        } catch (error) {
            console.error('Mark all as read error:', error);
            return false;
        }
    }
};
