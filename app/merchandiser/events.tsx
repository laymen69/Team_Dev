
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../components/ui/Badge';
import { BottomNav } from '../../components/ui/BottomNav';
import { Card, StatCard } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { useTheme } from '../../context/ThemeContext';

import { MERCHANDISER_NAV_ITEMS } from '../../constants/navigation';

const eventTypes = [
    {
        id: 'out-of-stock',
        title: 'Out of Stock',
        icon: 'alert-circle',
        color: '#ef4444',
        description: 'Report unavailable products',
        route: '/merchandiser/events/out-of-stock',
    },
    {
        id: 'before-after',
        title: 'Before/After',
        icon: 'camera',
        color: '#3b82f6',
        description: 'Document shelf changes',
        route: '/merchandiser/events/before-after',
    },
    {
        id: 'facing-change',
        title: 'Facing Change',
        icon: 'swap-horizontal',
        color: '#f59e0b',
        description: 'Report product placement',
        route: '/merchandiser/events/facing-change',
    },
    {
        id: 'product-competitor',
        title: 'Product vs Competitor',
        icon: 'git-compare',
        color: '#8b5cf6',
        description: 'Market comparison',
        route: '/merchandiser/events/product-competitor',
    },
    {
        id: 'new-product',
        title: 'New Product',
        icon: 'add-circle',
        color: '#10b981',
        description: 'Add new items',
        route: '/merchandiser/events/new-product',
    },
    {
        id: 'competitive-event',
        title: 'Competitive Event',
        icon: 'trophy',
        color: '#f97316',
        description: 'Competitor activities',
        route: '/merchandiser/events/competitive-event',
    },
];

const recentEvents = [
    { id: '1', type: 'Out of Stock', store: 'Walmart Supercenter', time: '2 hours ago', status: 'pending' },
    { id: '2', type: 'Before/After', store: 'Target North', time: '5 hours ago', status: 'approved' },
    { id: '3', type: 'Facing Change', store: 'Walgreens', time: '1 day ago', status: 'approved' },
];

export default function MerchandiserEvents() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = getColors(theme);

    const getBadgeVariant = (status: string) => {
        switch (status) {
            case 'approved': return 'success';
            case 'pending': return 'warning';
            case 'rejected': return 'danger';
            default: return 'neutral';
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header
                title="Visit Events"
                subtitle="Report store activities"
                showBack
            />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.statsRow}>
                    <StatCard
                        label="THIS WEEK"
                        value="24"
                        icon="calendar"
                        color={colors.primary}
                    />
                    <StatCard
                        label="THIS MONTH"
                        value="156"
                        icon="bar-chart"
                        color={colors.secondary}
                    />
                </View>

                <SectionHeader title="Event Types" />
                <View style={{ gap: DesignTokens.spacing.sm }}>
                    {[0, 3].map((startIndex) => (
                        <ScrollView
                            key={startIndex}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalScroll}
                        >
                            {eventTypes.slice(startIndex, startIndex + 3).map((event) => (
                                <StatCard
                                    key={event.id}
                                    label="Action"
                                    value={event.title}
                                    icon={event.icon as any}
                                    color={event.color}
                                    onPress={() => router.push(event.route as any)}
                                    style={styles.horizontalCard}
                                    valueStyle={{ fontSize: 12 }}
                                />
                            ))}
                        </ScrollView>
                    ))}
                </View>

                <SectionHeader
                    title="Recent Activity"
                    actionLabel="View All"
                    onAction={() => { }}
                />
                <View style={styles.recentList}>
                    {recentEvents.map((event) => (
                        <Card key={event.id} style={styles.recentItem}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.recentType, { color: colors.text }]}>{event.type}</Text>
                                <Text style={[styles.recentStore, { color: colors.textSecondary }]}>{event.store}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end', gap: 4 }}>
                                <Badge
                                    label={event.status}
                                    variant={getBadgeVariant(event.status) as any}
                                />
                                <Text style={[styles.recentTime, { color: colors.textSecondary }]}>{event.time}</Text>
                            </View>
                        </Card>
                    ))}
                </View>
            </ScrollView>

            <BottomNav items={MERCHANDISER_NAV_ITEMS} activeRoute="/merchandiser/events" />
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
    statsRow: {
        flexDirection: 'row',
        paddingVertical: DesignTokens.spacing.xs,
        gap: DesignTokens.spacing.sm,
    },
    horizontalScroll: {
        paddingHorizontal: DesignTokens.spacing.sm,
        gap: DesignTokens.spacing.sm,
        paddingVertical: DesignTokens.spacing.xs,
    },
    horizontalCard: {
        width: 140,
        minWidth: 140,
    },
    recentList: {
        paddingHorizontal: DesignTokens.spacing.lg,
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: DesignTokens.spacing.md,
        marginBottom: DesignTokens.spacing.sm,
    },
    recentType: {
        ...DesignTokens.typography.bodyBold,
    },
    recentStore: {
        ...DesignTokens.typography.caption,
    },
    recentTime: {
        fontSize: 10,
    },
});
