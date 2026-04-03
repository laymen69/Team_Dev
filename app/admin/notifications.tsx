import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminWebLayout } from '../../components/admin/WebLayout';
import { BottomNav } from '../../components/ui/BottomNav';
import { Card } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { ListSkeleton } from '../../components/ui/LoadingSkeleton';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { ADMIN_NAV_ITEMS } from '../../constants/navigation';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../hooks/useFonts';
import { Notification, NotificationService } from '../../services/notification.service';

export default function NotificationsPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const [selectedFilter, setSelectedFilter] = useState('unread');
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

    useFocusEffect(
        useCallback(() => {
            loadNotifications();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadNotifications();
    }, []);

    const getTypeConfig = (type: string) => {
        const t = type.toLowerCase().trim();
        switch (t) {
            case 'alert': return { icon: 'warning', color: colors.warning };
            case 'success': return { icon: 'checkmark-circle', color: colors.success };
            case 'warning': return { icon: 'alert-circle', color: colors.warning };
            case 'new_gms': return { icon: 'hourglass', color: colors.secondary };
            case 'report': return { icon: 'document-text', color: colors.warning };
            default: return { icon: 'information-circle', color: colors.primary };
        }
    };

    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    // --- filter helpers ---
    const filterNotifs = (id: string) =>
        notifications.filter(n => {
            const type = n.type.toLowerCase().trim();
            if (id === 'all') return true;
            if (id === 'unread') return !n.is_read;
            if (id === 'report') return type === 'report' || type === 'alert';
            if (id === 'new_gms') return type === 'new_gms';
            return type === id;
        });

    const filters = [
        { id: 'all', label: 'All', count: notifications.length },
        { id: 'unread', label: 'Unread', count: filterNotifs('unread').length },
        { id: 'report', label: 'Reports', count: filterNotifs('report').length },
        { id: 'new_gms', label: 'New GMS', count: filterNotifs('new_gms').length },
    ];

    const sectionTitles: Record<string, string> = {
        all: 'All Notifications',
        unread: 'Unread',
        report: 'Reports & Alerts',
        new_gms: 'New GMS Requests',
    };

    const filteredNotifications = filterNotifs(selectedFilter)
        .sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

    const { decrementUnread, resetUnread } = useNotifications();

    const handleMarkAsRead = async (id: number) => {
        const updated = await NotificationService.markAsRead(id);
        if (updated) {
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
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

    const handleNotificationPress = (item: Notification) => {
        if (!item.is_read) {
            handleMarkAsRead(item.id);
        }
        // Navigate to details page as requested
        router.push(`/admin/notification/${item.id}`);
    };

    const formatTime = (dateStr: string) => {
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
        } catch (e) {
            return dateStr;
        }
    };

    if (Platform.OS === 'web') {
        return (
            <AdminWebLayout title="Notifications Center">
                <View style={{ marginBottom: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 16, padding: 4, alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border }}>
                        {filters.map(filter => (
                            <TouchableOpacity
                                key={filter.id}
                                onPress={() => setSelectedFilter(filter.id)}
                                style={{
                                    paddingHorizontal: 20,
                                    paddingVertical: 10,
                                    borderRadius: 12,
                                    backgroundColor: selectedFilter === filter.id ? colors.primary : 'transparent',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8
                                }}
                            >
                                <Text style={{
                                    color: selectedFilter === filter.id ? '#fff' : colors.textSecondary,
                                    fontWeight: '700',
                                    fontSize: 14
                                }}>
                                    {filter.label}
                                </Text>
                                {filter.count > 0 && (
                                    <View style={{ backgroundColor: selectedFilter === filter.id ? 'rgba(255,255,255,0.2)' : colors.primary + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                                        <Text style={{ fontSize: 11, fontWeight: '700', color: selectedFilter === filter.id ? '#fff' : colors.primary }}>{filter.count}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={handleMarkAllAsRead}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.primary + '30' }}
                    >
                        <Ionicons name="checkmark-done" size={18} color={colors.primary} />
                        <Text style={{ color: colors.primary, fontWeight: '700' }}>Mark all as read</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ListSkeleton count={8} />
                ) : (
                    <View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 20, fontFamily: Fonts.headingSemiBold, color: colors.text }}>{sectionTitles[selectedFilter] ?? 'Notifications'}</Text>
                            <TouchableOpacity
                                onPress={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                            >
                                <Ionicons name="swap-vertical" size={16} color={colors.textSecondary} />
                                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>{sortOrder === 'newest' ? "Newest First" : "Oldest First"}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ gap: 16 }}>
                            {filteredNotifications.length === 0 ? (
                                <View style={[styles.empty, { padding: 80, backgroundColor: colors.surface, borderRadius: 24 }]}>
                                    <Ionicons name="notifications-off-outline" size={64} color={colors.textMuted} />
                                    <Text style={{ color: colors.textSecondary, marginTop: 16, fontSize: 18, fontWeight: '600' }}>No notifications found</Text>
                                    <Text style={{ color: colors.textMuted, marginTop: 8 }}>You're all caught up!</Text>
                                </View>
                            ) : (
                                filteredNotifications.map(item => {
                                    const config = getTypeConfig(item.type);
                                    return (
                                        <Card
                                            key={item.id}
                                            style={{
                                                flexDirection: 'row',
                                                padding: 20,
                                                gap: 20,
                                                alignItems: 'center',
                                                borderRadius: 20,
                                                borderLeftWidth: item.is_read ? 0 : 6,
                                                borderLeftColor: colors.primary
                                            }}
                                            onPress={() => handleNotificationPress(item)}
                                        >
                                            <View style={[styles.iconContainer, { width: 56, height: 56, borderRadius: 16, backgroundColor: config.color + '15' }]}>
                                                <Ionicons name={config.icon as any} size={28} color={config.color} />
                                            </View>
                                            <View style={{ flex: 1, gap: 4 }}>
                                                <Text style={{ fontSize: 17, fontFamily: Fonts.headingSemiBold, color: colors.text }}>{item.title}</Text>
                                                <Text style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 22 }}>{item.message}</Text>
                                                <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>{formatTime(item.created_at)}</Text>
                                            </View>
                                            {!item.is_read && (
                                                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary }} />
                                            )}
                                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                                        </Card>
                                    );
                                })
                            )}
                        </View>
                    </View>
                )}
            </AdminWebLayout>
        );
    }

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
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterBar}
                >
                    {filters.map(filter => {
                        const active = selectedFilter === filter.id;
                        return (
                            <TouchableOpacity
                                key={filter.id}
                                style={[
                                    styles.filterBtn,
                                    { backgroundColor: active ? colors.primary : colors.surfaceSecondary }
                                ]}
                                onPress={() => setSelectedFilter(filter.id)}
                            >
                                <Text style={[
                                    styles.filterText,
                                    { color: active ? '#fff' : colors.textSecondary }
                                ]}>
                                    {filter.label}
                                </Text>
                                {filter.count > 0 && (
                                    <View style={[
                                        styles.badge,
                                        { backgroundColor: active ? 'rgba(255,255,255,0.3)' : colors.primary + '22' }
                                    ]}>
                                        <Text style={[
                                            styles.badgeText,
                                            { color: active ? '#fff' : colors.primary }
                                        ]}>
                                            {filter.count}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <SectionHeader
                    title={sectionTitles[selectedFilter] ?? 'Notifications'}
                    actionLabel={sortOrder === 'newest' ? "Oldest First" : "Newest First"}
                    onAction={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                />

                {loading ? (
                    <ListSkeleton count={6} />
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
        paddingHorizontal: DesignTokens.spacing.lg,
        paddingVertical: DesignTokens.spacing.md,
        gap: DesignTokens.spacing.sm,
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    badge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
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
        ...DesignTokens.typography.bodyBold,
    },
    notifBody: {
        ...DesignTokens.typography.caption,
        lineHeight: 18,
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
