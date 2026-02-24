import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../components/ui/Badge';
import { BottomNav } from '../../components/ui/BottomNav';
import { Card, StatCard } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Header } from '../../components/ui/Header';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { MERCHANDISER_NAV_ITEMS } from '../../constants/navigation';
import { useTheme } from '../../context/ThemeContext';
import { Report, ReportService } from '../../services/report.service';

export default function EventHistory() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = getColors(theme);

    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        if (!refreshing) setLoading(true);
        try {
            const data = await ReportService.getAll();
            setReports(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        } catch (error) {
            console.error('Failed to load event history:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadHistory();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'success';
            case 'rejected': return 'danger';
            default: return 'warning';
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header
                title="Event History"
                subtitle={`${reports.length} Recorded Interventions`}
                rightIcon="filter-outline"
                onRightIconPress={() => { }}
                showBack
            />

            <View style={styles.statsGrid}>
                <StatCard
                    label="TOTAL EVENTS"
                    value={reports.length.toString()}
                    icon="flash"
                    color={colors.primary}
                />
                <StatCard
                    label="APPROVED"
                    value={reports.filter(r => r.status === 'approved').length.toString()}
                    icon="checkmark-done"
                    color={colors.success}
                />
            </View>

            <SectionHeader title="Recent Interventions" />

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
                ) : reports.length > 0 ? (
                    reports.map((report) => (
                        <Card key={report.id} style={styles.eventCard} onPress={() => { }}>
                            <View style={[styles.eventIcon, { backgroundColor: colors.surfaceSecondary }]}>
                                <Ionicons name="document-text" size={24} color={colors.primary} />
                            </View>
                            <View style={styles.eventInfo}>
                                <Text style={[styles.eventName, { color: colors.text }]}>{report.name || 'Store Visit'}</Text>
                                <Text style={[styles.eventDate, { color: colors.textSecondary }]}>
                                    {new Date(report.created_at).toLocaleDateString()} at {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                                <View style={styles.detailRow}>
                                    <Ionicons name="business-outline" size={14} color={colors.textSecondary} />
                                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>{report.merchandiser_name}</Text>
                                </View>
                            </View>
                            <Badge label={report.status.toUpperCase()} variant={getStatusColor(report.status)} />
                        </Card>
                    ))
                ) : (
                    <EmptyState
                        icon="calendar-outline"
                        title="No History Yet"
                        description="You haven't submitted any reports or interventions yet."
                        actionTitle="Refresh History"
                        onAction={onRefresh}
                    />
                )}
            </ScrollView>

            <BottomNav items={MERCHANDISER_NAV_ITEMS} activeRoute="/merchandiser/gms" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    statsGrid: { flexDirection: 'row', gap: DesignTokens.spacing.sm, padding: DesignTokens.spacing.sm },
    content: { padding: DesignTokens.spacing.lg, paddingBottom: 100 },
    eventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: DesignTokens.spacing.md,
        padding: DesignTokens.spacing.md,
        marginBottom: DesignTokens.spacing.md,
    },
    eventIcon: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    eventInfo: { flex: 1, gap: 2 },
    eventName: { ...DesignTokens.typography.bodyBold },
    input: { padding: 14, borderWidth: 1, borderRadius: 12, fontSize: 15 },
    saveBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    eventDate: { ...DesignTokens.typography.caption, fontSize: 11 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    detailText: { ...DesignTokens.typography.caption, fontSize: 10 },
});
