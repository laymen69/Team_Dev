import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../components/ui/Badge';
import { BottomNav } from '../../components/ui/BottomNav';
import { Card } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { ADMIN_NAV_ITEMS } from '../../constants/navigation';
import { useTheme } from '../../context/ThemeContext';

const initialRequests = [
    {
        id: '1',
        name: 'Youssef El Amrani',
        role: 'Merchandiser',
        type: 'Leave Request',
        subType: 'Sick leave',
        startDate: '2026-02-12',
        endDate: '2026-02-15',
        reason: 'Severe flu and doctor recommended 3 days rest.',
        status: 'pending'
    },
    {
        id: '2',
        name: 'Karim Mansouri',
        role: 'Supervisor',
        type: 'Route Change',
        subType: 'Zone B Adjustment',
        startDate: '2026-02-10',
        endDate: '2026-02-10',
        reason: 'Request to modify Tuesday route to include new store in Bab Ezzouar.',
        status: 'pending'
    },
    {
        id: '3',
        name: 'Sara Tazi',
        role: 'Merchandiser',
        type: 'Schedule Update',
        subType: 'Early Shift',
        startDate: '2026-02-11',
        endDate: '2026-02-11',
        reason: 'Administrative appointment in the afternoon.',
        status: 'approved'
    },
    {
        id: '4',
        name: 'Ahmed Benali',
        role: 'Supervisor',
        type: 'Leave Request',
        subType: 'Annual leave',
        startDate: '2026-03-01',
        endDate: '2026-03-10',
        reason: 'Family vacation trip.',
        status: 'pending'
    }
];

export default function LeavePage() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = getColors(theme);
    const isDark = theme === 'dark';
    const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
    const [requests, setRequests] = useState(initialRequests);

    const filteredRequests = requests.filter(req =>
        selectedTab === 'all' || req.status === selectedTab
    );

    const handleProcessRequest = (id: string, action: 'approve' | 'reject') => {
        setRequests(prev => prev.map(req =>
            req.id === id ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' } : req
        ));
        Alert.alert('Success', `Request ${action}d successfully.`);
    };

    const getStatusVariant = (status: string): any => {
        switch (status) {
            case 'pending': return 'warning';
            case 'approved': return 'success';
            case 'rejected': return 'danger';
            default: return 'neutral';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Leave Request': return 'calendar';
            case 'Route Change': return 'navigate';
            case 'Schedule Update': return 'time';
            default: return 'document';
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <Card style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.avatar, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={[styles.avatarText, { color: colors.primary }]}>{item.name.charAt(0)}</Text>
                </View>
                <View style={styles.headerText}>
                    <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.role, { color: colors.textSecondary }]}>{item.role}</Text>
                </View>
                <Badge label={item.status.toUpperCase()} variant={getStatusVariant(item.status)} />
            </View>

            <View style={[styles.details, { backgroundColor: colors.surfaceSecondary }]}>
                <View style={styles.detailRow}>
                    <Ionicons name={getTypeIcon(item.type) as any} size={16} color={colors.primary} />
                    <Text style={[styles.typeText, { color: colors.text }]}>{item.type} • {item.subType}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                        {item.startDate === item.endDate ? item.startDate : `${item.startDate} to ${item.endDate}`}
                    </Text>
                </View>
                <Text style={[styles.reason, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.reason}
                </Text>
            </View>

            {item.status === 'pending' && (
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn, { borderColor: colors.danger }]}
                        onPress={() => handleProcessRequest(item.id, 'reject')}
                    >
                        <Ionicons name="close-circle-outline" size={18} color={colors.danger} />
                        <Text style={[styles.rejectText, { color: colors.danger }]}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.approveBtn, { backgroundColor: colors.primary }]}
                        onPress={() => handleProcessRequest(item.id, 'approve')}
                    >
                        <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                        <Text style={styles.approveText}>Approve</Text>
                    </TouchableOpacity>
                </View>
            )}
        </Card>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header
                title="Leaving Requests"
                showBack
            />

            <View style={[styles.tabBar, { backgroundColor: colors.surface }]}>
                {(['pending', 'approved', 'rejected', 'all'] as const).map(tab => (
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
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredRequests}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={<SectionHeader title="Staff Requests" />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="file-tray-outline" size={64} color={colors.textMuted} />
                        <Text style={{ color: colors.textSecondary, marginTop: DesignTokens.spacing.md, ...DesignTokens.typography.body }}>No requests in this category</Text>
                    </View>
                }
            />

            <BottomNav items={ADMIN_NAV_ITEMS} activeRoute="/admin/leave" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
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
    list: {
        padding: DesignTokens.spacing.lg,
        paddingBottom: 100,
        gap: DesignTokens.spacing.md,
    },
    card: {
        padding: DesignTokens.spacing.md,
        gap: DesignTokens.spacing.md,
        marginBottom: DesignTokens.spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        ...DesignTokens.typography.h3,
        lineHeight: 24,
    },
    headerText: {
        flex: 1,
        marginLeft: DesignTokens.spacing.md,
    },
    name: {
        ...DesignTokens.typography.bodyBold,
    },
    role: {
        ...DesignTokens.typography.tiny,
    },
    details: {
        padding: DesignTokens.spacing.md,
        borderRadius: 14,
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: DesignTokens.spacing.sm,
    },
    typeText: {
        ...DesignTokens.typography.caption,
        fontWeight: 'bold',
    },
    dateText: {
        ...DesignTokens.typography.tiny,
    },
    reason: {
        ...DesignTokens.typography.caption,
        lineHeight: 18,
    },
    actions: {
        flexDirection: 'row',
        gap: DesignTokens.spacing.md,
        marginTop: DesignTokens.spacing.sm,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: DesignTokens.spacing.sm,
    },
    rejectBtn: {
        borderWidth: 1.5,
    },
    rejectText: {
        ...DesignTokens.typography.caption,
        fontWeight: 'bold',
    },
    approveBtn: {},
    approveText: { 
        ...DesignTokens.typography.caption,
        fontWeight: 'bold',
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
});
