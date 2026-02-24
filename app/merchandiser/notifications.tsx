
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../../components/ui/BottomNav';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Header } from '../../components/ui/Header';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { MERCHANDISER_NAV_ITEMS } from '../../constants/navigation';
import { useTheme } from '../../context/ThemeContext';
import { Notification, NotificationService } from '../../services/notification.service';

export default function MerchandiserNotifications() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = getColors(theme);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadNotifications = async () => {
        if (!refreshing) setLoading(true);
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

    useEffect(() => {
        loadNotifications();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadNotifications();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'alert': return { name: 'warning', color: colors.danger };
            case 'success': return { name: 'checkmark-circle', color: colors.success };
            case 'warning': return { name: 'alert-circle', color: colors.warning };
            default: return { name: 'notifications', color: colors.primary };
        }
    };

    const handleMarkAsRead = async (id: number) => {
        const updated = await NotificationService.markAsRead(id);
        if (updated) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        }
    };

    const handleMarkAllAsRead = async () => {
        const success = await NotificationService.markAllAsRead();
        if (success) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleNotificationPress = async (item: Notification) => {
        if (!item.is_read) {
            handleMarkAsRead(item.id);
        }

        if (item.action_link) {
            router.push(item.action_link as any);
            return;
        }

        // Default navigation based on type
        switch (item.type) {
            case 'alert':
            case 'warning':
                router.push('/merchandiser/gms');
                break;
            case 'success':
                router.push('/merchandiser/leave');
                break;
            case 'info':
            default:
                router.push('/merchandiser/documents');
                break;
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
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header
                title="Notifications"
                subtitle={`${unreadCount} Unread`}
                rightIcon="checkmark-done-outline"
                onRightIconPress={handleMarkAllAsRead}
                showBack
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <View key={i} style={{ marginBottom: 12 }}>
                            <CardSkeleton />
                        </View>
                    ))
                ) : notifications.length === 0 ? (
                    <EmptyState
                        icon="notifications-off-outline"
                        title="All Caught Up!"
                        description="You don't have any new notifications at the moment."
                        actionTitle="Check Again"
                        onAction={onRefresh}
                    />
                ) : (
                    notifications.map((notification) => {
                        const icon = getIcon(notification.type);
                        return (
                            <Card
                                key={notification.id}
                                onPress={() => handleNotificationPress(notification)}
                                style={[
                                    styles.notifCard,
                                    !notification.is_read && { borderLeftWidth: 4, borderLeftColor: colors.primary }
                                ]}
                            >
                                <View style={[styles.iconBox, { backgroundColor: icon.color + '15' }]}>
                                    <Ionicons name={icon.name as any} size={22} color={icon.color} />
                                </View>
                                <View style={styles.notifBody}>
                                    <View style={styles.notifHeader}>
                                        <Text style={[styles.notifTitle, { color: colors.text }]}>{notification.title}</Text>
                                        {!notification.is_read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                                    </View>
                                    <Text style={[styles.notifMessage, { color: colors.textSecondary }]}>{notification.message}</Text>
                                    <Text style={[styles.notifTime, { color: colors.textSecondary }]}>
                                        {formatTime(notification.created_at)}
                                    </Text>
                                </View>
                            </Card>
                        );
                    })
                )}
            </ScrollView>

            <BottomNav items={MERCHANDISER_NAV_ITEMS} activeRoute="/merchandiser/profile" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: DesignTokens.spacing.lg, paddingBottom: 100 },
    notifCard: {
        flexDirection: 'row',
        gap: DesignTokens.spacing.md,
        padding: DesignTokens.spacing.lg,
        marginBottom: DesignTokens.spacing.md,
    },
    iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    notifBody: { flex: 1, gap: 4 },
    notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    notifTitle: { ...DesignTokens.typography.bodyBold },
    notifMessage: { ...DesignTokens.typography.body, fontSize: 14, opacity: 0.9 },
    notifTime: { ...DesignTokens.typography.caption, marginTop: 4, opacity: 0.7 },
    unreadDot: { width: 8, height: 8, borderRadius: 4 },
});
