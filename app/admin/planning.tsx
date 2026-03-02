import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
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
import { GMSService } from '../../services/gms.service';
import { Notification, NotificationService } from '../../services/notification.service';

export default function PlanningPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = getColors(theme);

    const [selectedTab, setSelectedTab] = useState<'pending' | 'all'>('pending');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadNotifications = async () => {
        try {
            const data = await NotificationService.getNotifications();
            setNotifications(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Load requests error:', error);
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

    // Filter to only show actionable types
    const requestsList = notifications.filter(notif =>
        ['new_gms', 'report', 'alert'].includes(notif.type)
    );

    const handleDeleteNotification = async (id: number) => {
        const success = await NotificationService.deleteNotification(id);
        if (success) {
            setNotifications(prev => prev.filter(n => n.id !== id));
        } else {
            Alert.alert('Error', 'Failed to delete notification');
        }
    };

    const handleActionOption = async (action: 'approve' | 'wait' | 'delete' | 'fixed', item: Notification) => {
        try {
            switch (action) {
                case 'approve':
                    if (item.action_link) {
                        const payload = JSON.parse(item.action_link);
                        const newGms = await GMSService.create(payload);

                        if (newGms) {
                            await NotificationService.sendNotification({
                                user_id: item.user_id,
                                title: 'New GMS Approved',
                                message: `Your request to add ${payload.name} has been approved.`,
                                type: 'success',
                                icon: 'checkmark-circle'
                            });
                            await handleDeleteNotification(item.id);
                            Alert.alert('Success', 'GMS approved and created.');
                        } else {
                            Alert.alert('Error', 'Failed to create GMS in database.');
                        }
                    }
                    break;
                case 'fixed':
                    await NotificationService.sendNotification({
                        user_id: item.user_id,
                        title: 'Report Fixed',
                        message: `The issue you reported has been resolved.`,
                        type: 'success',
                        icon: 'build'
                    });
                    await handleDeleteNotification(item.id);
                    Alert.alert('Success', 'Sender notified and report marked fixed.');
                    break;
                case 'wait':
                    Alert.alert('Pending', 'Request kept in pending state.');
                    if (!item.is_read) {
                        await NotificationService.markAsRead(item.id);
                        setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, is_read: true } : n));
                    }
                    break;
                case 'delete':
                    Alert.alert('Confirm', 'Are you sure you want to delete this request?', [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: () => handleDeleteNotification(item.id)
                        }
                    ]);
                    break;
            }
        } catch (error) {
            console.error('Action error', error);
            Alert.alert('Error', 'An error occurred while processing the action.');
        }
    };

    const formatTime = (dateStr: string) => {
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
        } catch (e) {
            return dateStr;
        }
    };

    const getIconConfig = (type: string) => {
        switch (type) {
            case 'new_gms': return { icon: 'storefront', color: colors.success };
            case 'report':
            case 'alert': return { icon: 'alert-circle', color: colors.danger };
            default: return { icon: 'document-text', color: colors.primary };
        }
    };

    const getRequestTypeLabel = (type: string) => {
        switch (type) {
            case 'new_gms': return 'New GMS Request';
            case 'report':
            case 'alert': return 'Field Report / Alert';
            default: return 'Request';
        }
    };

    const renderItem = ({ item }: { item: Notification }) => {
        const config = getIconConfig(item.type);

        return (
            <Card style={styles.requestCard}>
                <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
                    <View style={styles.headerRow}>
                        <View style={[styles.iconContainer, { backgroundColor: config.color + '15' }]}>
                            <Ionicons name={config.icon as any} size={20} color={config.color} />
                        </View>
                        <View style={styles.headerInfo}>
                            <Text style={[styles.typeText, { color: colors.text }]}>{getRequestTypeLabel(item.type)}</Text>
                            <Text style={[styles.timeText, { color: colors.textSecondary }]}>{formatTime(item.created_at)}</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.details, { backgroundColor: colors.surfaceSecondary }]}>
                    <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.message, { color: colors.textSecondary }]}>{item.message}</Text>
                </View>

                <View style={styles.actions}>
                    {item.type === 'new_gms' && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                            onPress={() => handleActionOption('approve', item)}
                        >
                            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                            <Text style={styles.actionBtnText}>Approve GMS</Text>
                        </TouchableOpacity>
                    )}

                    {(item.type === 'report' || item.type === 'alert') && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                            onPress={() => handleActionOption('fixed', item)}
                        >
                            <Ionicons name="build-outline" size={18} color="#fff" />
                            <Text style={styles.actionBtnText}>Mark Fixed</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.warning }]}
                        onPress={() => handleActionOption('wait', item)}
                    >
                        <Ionicons name="hourglass-outline" size={18} color="#fff" />
                        <Text style={styles.actionBtnText}>Pending</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.danger }]}
                        onPress={() => handleActionOption('delete', item)}
                    >
                        <Ionicons name="trash-outline" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </Card>
        );
    };
    const onBack = () => {
        router.replace('/admin');
    };
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header
                title="Management Requests"
                showBack
                onBack={onBack}
            />

            <View style={[styles.tabBar, { backgroundColor: colors.surface }]}>
                {(['pending', 'all'] as const).map(tab => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setSelectedTab(tab)}
                        style={[
                            styles.tab,
                            selectedTab === tab && { borderBottomColor: colors.primary }
                        ]}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: selectedTab === tab ? colors.primary : colors.textSecondary }
                        ]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)} Requests
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={requestsList}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                    ListHeaderComponent={<SectionHeader title="Actionable Notifications" />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="checkmark-done-circle-outline" size={64} color={colors.textMuted} />
                            <Text style={{ color: colors.textSecondary, marginTop: 16 }}>No pending requests at the moment</Text>
                        </View>
                    }
                />
            )}

            <BottomNav items={ADMIN_NAV_ITEMS} activeRoute="/admin/planning" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        paddingHorizontal: DesignTokens.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        ...DesignTokens.typography.caption,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: DesignTokens.spacing.lg,
        paddingBottom: 120,
        gap: DesignTokens.spacing.md,
    },
    requestCard: {
        padding: DesignTokens.spacing.md,
        gap: DesignTokens.spacing.md,
    },
    cardHeader: {
        borderBottomWidth: 1,
        paddingBottom: DesignTokens.spacing.sm,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: DesignTokens.spacing.sm,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
    },
    typeText: {
        ...DesignTokens.typography.bodyBold,
    },
    timeText: {
        ...DesignTokens.typography.tiny,
    },
    details: {
        padding: DesignTokens.spacing.md,
        borderRadius: 12,
        gap: 4,
    },
    title: {
        ...DesignTokens.typography.caption,
        fontWeight: 'bold',
    },
    message: {
        ...DesignTokens.typography.caption,
        lineHeight: 18,
    },
    actions: {
        flexDirection: 'row',
        gap: DesignTokens.spacing.sm,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        borderRadius: 10,
        gap: 4,
    },
    actionBtnText: {
        ...DesignTokens.typography.caption,
        color: '#fff',
        fontWeight: 'bold',
    },
    empty: {
        alignItems: 'center',
        marginTop: 60,
    },
});