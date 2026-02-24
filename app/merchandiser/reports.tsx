
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../components/ui/Badge';
import { BottomNav } from '../../components/ui/BottomNav';
import { Button } from '../../components/ui/Button';
import { Card, StatCard } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../hooks/useFonts';

import { MERCHANDISER_NAV_ITEMS } from '../../constants/navigation';

const dailyReports = [
    { id: '1', merchandiser: 'Sara Khelifi', date: '2026-02-07', visitsPlanned: 8, visitsCompleted: 5, eventsReported: 3, status: 'in_progress' },
    { id: '2', merchandiser: 'Youssef Amrani', date: '2026-02-07', visitsPlanned: 6, visitsCompleted: 6, eventsReported: 2, status: 'completed' },
    { id: '3', merchandiser: 'Mohamed Cherif', date: '2026-02-07', visitsPlanned: 7, visitsCompleted: 4, eventsReported: 1, status: 'in_progress' },
];

const eventSummary = [
    { type: 'Out of Stock', count: 12, color: '#ef4444', icon: 'alert-circle' },
    { type: 'Before/After', count: 8, color: '#3b82f6', icon: 'camera' },
    { type: 'Facing Change', count: 5, color: '#f59e0b', icon: 'swap-horizontal' },
    { type: 'New Product', count: 3, color: '#10b981', icon: 'add-circle' },
];

export default function ReportsPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = getColors(theme);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header
                title="Reports"
                subtitle="Performance & Analytics"
                rightIcon="calendar-outline"
                onRightIconPress={() => { }}
                showBack
            />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.statsGrid}>
                    <StatCard label="TOTAL VISITS" value="156" icon="location" color={colors.primary} />
                    <StatCard label="COMPLETION" value="87%" icon="checkmark-circle" color={colors.success} />
                    <StatCard label="EVENTS" value="42" icon="flash" color={colors.warning} />
                    <StatCard label="AVG TIME" value="45m" icon="time" color={colors.secondary} />
                </View>

                <SectionHeader title="Event Summary" />
                <Card style={styles.eventCard}>
                    {eventSummary.map((event, index) => (
                        <View
                            key={event.type}
                            style={[
                                styles.eventRow,
                                index < eventSummary.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                            ]}
                        >
                            <View style={[styles.eventIcon, { backgroundColor: event.color + '20' }]}>
                                <Ionicons name={event.icon as any} size={18} color={event.color} />
                            </View>
                            <Text style={[styles.eventType, { color: colors.text }]}>{event.type}</Text>
                            <Badge label={event.count.toString()} variant="neutral" />
                        </View>
                    ))}
                </Card>

                <SectionHeader
                    title="Today's Reports"
                    actionLabel="Export PDF"
                    onAction={() => { }}
                />

                {dailyReports.map((report) => (
                    <Card key={report.id} style={styles.reportCard}>
                        <View style={styles.reportHeader}>
                            <View style={[styles.avatar, { backgroundColor: colors.surfaceSecondary }]}>
                                <Text style={[styles.avatarText, { color: colors.primary }]}>{report.merchandiser.charAt(0)}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.reportName, { color: colors.text }]}>{report.merchandiser}</Text>
                                <View style={styles.statusRow}>
                                    <View style={[styles.statusDot, { backgroundColor: report.status === 'completed' ? colors.success : colors.warning }]} />
                                    <Text style={[styles.statusText, { color: report.status === 'completed' ? colors.success : colors.warning }]}>
                                        {report.status === 'completed' ? 'Completed' : 'In Progress'}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={[styles.visitCount, { color: colors.primary }]}>
                                    {report.visitsCompleted}/{report.visitsPlanned}
                                </Text>
                                <Text style={[styles.visitLabel, { color: colors.textSecondary }]}>visits</Text>
                            </View>
                        </View>

                        <ProgressBar
                            progress={report.visitsCompleted / report.visitsPlanned}
                            style={styles.progress}
                        />

                        <View style={styles.reportFooter}>
                            <View style={styles.footerInfo}>
                                <Ionicons name="flash-outline" size={14} color={colors.textSecondary} />
                                <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                                    {report.eventsReported} events reported
                                </Text>
                            </View>
                            <Button
                                title="View Details"
                                variant="ghost"
                                size="sm"
                                onPress={() => { }}
                            />
                        </View>
                    </Card>
                ))}
            </ScrollView>

            <BottomNav items={MERCHANDISER_NAV_ITEMS} activeRoute="/merchandiser/reports" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        paddingBottom: 100,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: DesignTokens.spacing.sm,
        gap: DesignTokens.spacing.sm,
    },
    eventCard: {
        marginHorizontal: DesignTokens.spacing.lg,
        padding: DesignTokens.spacing.sm,
    },
    eventRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: DesignTokens.spacing.md,
        gap: DesignTokens.spacing.md,
    },
    eventIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    eventType: {
        ...DesignTokens.typography.bodyBold,
        flex: 1,
    },
    reportCard: {
        marginHorizontal: DesignTokens.spacing.lg,
        padding: DesignTokens.spacing.lg,
        marginBottom: DesignTokens.spacing.sm,
    },
    reportHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: DesignTokens.spacing.md,
        marginBottom: DesignTokens.spacing.md,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        ...DesignTokens.typography.bodyBold,
        fontSize: 18,
    },
    reportName: {
        ...DesignTokens.typography.bodyBold,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        ...DesignTokens.typography.caption,
        fontFamily: Fonts.bodySemiBold,
    },
    visitCount: {
        ...DesignTokens.typography.h3,
        lineHeight: 22,
    },
    visitLabel: {
        ...DesignTokens.typography.caption,
        fontSize: 10,
    },
    progress: {
        marginBottom: DesignTokens.spacing.md,
    },
    reportFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerText: {
        ...DesignTokens.typography.caption,
    },
});
