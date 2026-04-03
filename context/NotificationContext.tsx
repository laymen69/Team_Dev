import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { NotificationService } from '../services/notification.service';
import { useAuth } from './AuthContext';

interface NotificationContextType {
    unreadCount: number;
    refreshUnreadCount: () => void;
    decrementUnread: (by?: number) => void;
    resetUnread: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
    unreadCount: 0,
    refreshUnreadCount: () => { },
    decrementUnread: () => { },
    resetUnread: () => { },
});

export const useNotifications = () => useContext(NotificationContext);

const POLL_INTERVAL_MS = 60_000; // re-fetch every 60 seconds

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchCount = useCallback(async () => {
        if (!user) return;
        try {
            const notifications = await NotificationService.getNotifications();
            const count = notifications.filter(n => !n.is_read).length;
            setUnreadCount(count);
        } catch {
            // silent fail — keep existing count
        }
    }, [user]);

    const startPolling = useCallback(() => {
        fetchCount();
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(fetchCount, POLL_INTERVAL_MS);
    }, [fetchCount]);

    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Start / stop polling when the user logs in / out
    useEffect(() => {
        if (user) {
            startPolling();
        } else {
            stopPolling();
            setUnreadCount(0);
        }
        return stopPolling;
    }, [user, startPolling, stopPolling]);

    // Re-fetch when the app comes back to the foreground (native only — AppState is not available on web)
    useEffect(() => {
        if (Platform.OS === 'web') return;
        const handleAppState = (state: AppStateStatus) => {
            if (state === 'active' && user) {
                fetchCount();
            }
        };
        const sub = AppState.addEventListener('change', handleAppState);
        return () => sub.remove();
    }, [user, fetchCount]);

    /** Call this after navigating away from the notifications page (all read) */
    const resetUnread = useCallback(() => setUnreadCount(0), []);

    /** Call this after marking a single notification as read */
    const decrementUnread = useCallback((by = 1) => {
        setUnreadCount(prev => Math.max(0, prev - by));
    }, []);

    return (
        <NotificationContext.Provider
            value={{ unreadCount, refreshUnreadCount: fetchCount, decrementUnread, resetUnread }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
