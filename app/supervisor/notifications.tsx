import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../../components/ui/BottomNav';
import { Header } from '../../components/ui/Header';
import { ListSkeleton } from '../../components/ui/LoadingSkeleton';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { getColors } from '../../constants/designSystem';
import { SUPERVISOR_NAV_ITEMS } from '../../constants/navigation';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../hooks/useFonts';
import { Notification, NotificationService } from '../../services/notification.service';

export default function NotificationsPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = getColors(theme);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadNotifications = async () => {
        try {
            const data = await NotificationService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Load notifications error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadNotifications();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadNotifications();
    }, []);

    const { decrementUnread, resetUnread } = useNotifications();

    const handleMarkAsRead = async (id: number) => {
        const updated = await NotificationService.markAsRead(id);
        if (updated) {
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            decrementUnread(1);
        }
    };

    const handleMarkAllAsRead = async () => {
        const success = await NotificationService.markAllAsRead();
        if (success) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            resetUnread();
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'success': return colors.success;
            case 'warning': return colors.warning;
            case 'alert': return colors.danger;
            default: return colors.primary; // info
        }
    };

    const formatTime = (dateStr: string) => {
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <Header
                title="Notifications"
                showBack
                rightIcon="checkmark-done"
                onRightIconPress={handleMarkAllAsRead}
            />

            {loading ? (
                <View style={styles.scroll}>
                    <ListSkeleton count={6} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    <SectionHeader title="Staff Alerts" />
                    {notifications.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="notifications-off-outline" size={48} color={colors.textSecondary} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                No notifications yet
                            </Text>
                        </View>
                    ) : (
                        notifications.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => {
                                    if (!item.is_read) handleMarkAsRead(item.id);
                                    router.push(`/supervisor/notification/${item.id}`);
                                }}
                                style={[
                                    styles.notificationCard,
                                    {
                                        backgroundColor: item.is_read ? colors.background : colors.surface,
                                        borderColor: colors.border
                                    }
                                ]}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: getIconColor(item.type) + '20' }]}>
                                    <Ionicons name={item.icon as any} size={24} color={getIconColor(item.type)} />
                                </View>
                                <View style={styles.contentContainer}>
                                    <View style={styles.topRow}>
                                        <Text style={[styles.title, { color: colors.text, opacity: item.is_read ? 0.7 : 1 }]}>
                                            {item.title}
                                        </Text>
                                        <Text style={[styles.time, { color: colors.textSecondary }]}>
                                            {formatTime(item.created_at)}
                                        </Text>
                                    </View>
                                    <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={2}>
                                        {item.message}
                                    </Text>
                                </View>
                                {!item.is_read && (
                                    <View style={[styles.dot, { backgroundColor: colors.danger }]} />
                                )}
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            )}

            <BottomNav items={SUPERVISOR_NAV_ITEMS} activeRoute="/supervisor/notifications" />
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    safeArea: { flex: 1 },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100, gap: 12 },
    emptyText: { fontSize: 16, fontFamily: Fonts.bodySemiBold },
    scroll: { padding: 16, paddingBottom: 100, gap: 12 },
    notificationCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: { flex: 1, gap: 4 },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: { fontSize: 15, fontFamily: Fonts.bodySemiBold },
    time: { fontSize: 11, fontFamily: Fonts.body },
    message: { fontSize: 13, lineHeight: 18, fontFamily: Fonts.body },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});
