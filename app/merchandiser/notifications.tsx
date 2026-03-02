import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../../components/ui/BottomNav';
import { Card } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { ListSkeleton } from '../../components/ui/LoadingSkeleton';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { MERCHANDISER_NAV_ITEMS } from '../../constants/navigation';
import { useNotifications } from '../../context/NotificationContext';
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

    useFocusEffect(
        useCallback(() => {
            loadNotifications();
        }, [])
    );

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

    const { decrementUnread, resetUnread } = useNotifications();

    const handleMarkAsRead = async (id: number) => {
        const updated = await NotificationService.markAsRead(id);
        if (updated) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
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

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleNotificationPress = async (item: Notification) => {
        if (!item.is_read) {
            handleMarkAsRead(item.id);
        }
        router.push(`/merchandiser/notification/${item.id}`);
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
                rightIcon="checkmark-done"
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
                    <ListSkeleton count={6} />
                ) : notifications.length === 0 ? (
                    <View style={styles.empty}>
                        <Ionicons name="notifications-off-outline" size={64} color={colors.textMuted} />
                        <Text style={{ color: colors.textSecondary, marginTop: 16 }}>No notifications</Text>
                    </View>
                ) : (
                    <>
                        <SectionHeader title="Staff Alerts" />
                        <View style={styles.list}>
                            {notifications.map((notification) => {
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
                            })}
                        </View>
                    </>
                )}
            </ScrollView>

            <BottomNav items={MERCHANDISER_NAV_ITEMS} activeRoute="/merchandiser/profile" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: DesignTokens.spacing.lg, paddingBottom: 100 },
    list: { gap: DesignTokens.spacing.md, marginTop: DesignTokens.spacing.md },
    notifCard: {
        flexDirection: 'row',
        gap: DesignTokens.spacing.md,
        padding: DesignTokens.spacing.lg,
    },
    iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    notifBody: { flex: 1, gap: 4 },
    notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    notifTitle: { ...DesignTokens.typography.bodyBold },
    notifMessage: { ...DesignTokens.typography.body, fontSize: 14, opacity: 0.9 },
    notifTime: { ...DesignTokens.typography.caption, marginTop: 4, opacity: 0.7 },
    unreadDot: { width: 8, height: 8, borderRadius: 4 },
    empty: { alignItems: 'center', marginTop: 60 },
});
