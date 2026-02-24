import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../../components/ui/BottomNav';
import { Card } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { ADMIN_NAV_ITEMS } from '../../constants/navigation';
import { useTheme } from '../../context/ThemeContext';
import { Notification, NotificationService } from '../../services/notification.service';

export default function NotificationsPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const colors = getColors(theme);

    const loadNotifications = async () => {
        try {
            const data = await NotificationService.getNotifications();
            setNotifications(Array.isArray(data) ? data : []);
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

    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'alert': return { icon: 'warning', color: colors.warning };
            case 'success': return { icon: 'checkmark-circle', color: colors.success };
            case 'warning': return { icon: 'alert-circle', color: colors.warning };
            default: return { icon: 'information-circle', color: colors.primary };
        }
    };

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'unread', label: 'Unread' },
        { id: 'alert', label: 'Alerts' },
        { id: 'success', label: 'Success' },
    ];

    const filteredNotifications = notifications.filter(notif => {
        if (selectedFilter === 'all') return true;
        if (selectedFilter === 'unread') return !notif.is_read;
        return notif.type === selectedFilter;
    });

    const handleMarkAsRead = async (id: number) => {
        const updated = await NotificationService.markAsRead(id);
        if (updated) {
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
        }
    };

    const handleMarkAllAsRead = async () => {
        const success = await NotificationService.markAllAsRead();
        if (success) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        }
    };

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
                router.push('/admin/before-after');
                break;
            case 'success':
                router.push('/admin/users');
                break;
            case 'warning':
                router.push('/admin/leave');
                break;
            case 'info':
            default:
                router.push('/admin/dashboard');
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
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <Header
                title="Notifications"
                showBack
                rightIcon="checkmark-done"
                onRightIconPress={handleMarkAllAsRead}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                <View style={styles.filterBar}>
                    {filters.map(filter => (
                        <TouchableOpacity
                            key={filter.id}
                            style={[
                                styles.filterBtn,
                                { backgroundColor: selectedFilter === filter.id ? colors.primary : colors.surfaceSecondary }
                            ]}
                            onPress={() => setSelectedFilter(filter.id)}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: selectedFilter === filter.id ? '#fff' : colors.textSecondary }
                            ]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <SectionHeader title="Staff Alerts" />

                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                ) : filteredNotifications.length === 0 ? (
                    <View style={styles.empty}>
                        <Ionicons name="notifications-off-outline" size={64} color={colors.textMuted} />
                        <Text style={{ color: colors.textSecondary, marginTop: 16 }}>No notifications</Text>
                    </View>
                ) : (
                    <View style={styles.notificationsList}>
                        {filteredNotifications.map(item => {
                            const config = getTypeConfig(item.type);
                            return (
                                <Card
                                    key={item.id}
                                    style={[styles.notifCard, !item.is_read && { borderLeftWidth: 4, borderLeftColor: colors.primary }]}
                                    onPress={() => handleNotificationPress(item)}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: config.color + '15' }]}>
                                        <Ionicons name={config.icon as any} size={24} color={config.color} />
                                    </View>
                                    <View style={styles.notifInfo}>
                                        <Text style={[styles.notifTitle, { color: colors.text }]}>{item.title}</Text>
                                        <Text style={[styles.notifBody, { color: colors.textSecondary }]}>{item.message}</Text>
                                        <Text style={[styles.notifTime, { color: colors.textMuted }]}>{formatTime(item.created_at)}</Text>
                                    </View>
                                    {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                                </Card>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            <BottomNav items={ADMIN_NAV_ITEMS} activeRoute="/admin/notifications" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    filterBar: {
        flexDirection: 'row',
        padding: DesignTokens.spacing.lg,
        gap: DesignTokens.spacing.sm,
    },
    filterBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    filterText: {
        ...DesignTokens.typography.caption,
        fontWeight: 'bold',
    },
    notificationsList: {
        padding: DesignTokens.spacing.lg,
        gap: DesignTokens.spacing.md,
    },
    notifCard: {
        flexDirection: 'row',
        padding: DesignTokens.spacing.md,
        gap: DesignTokens.spacing.md,
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifInfo: {
        flex: 1,
        gap: 2,
    },
    notifTitle: {
        ...DesignTokens.typography.body,
    },
    notifBody: {
        ...DesignTokens.typography.caption,
    },
    notifTime: {
        ...DesignTokens.typography.tiny,
        marginTop: 4,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    empty: {
        alignItems: 'center',
        marginTop: 60,
    },
});
