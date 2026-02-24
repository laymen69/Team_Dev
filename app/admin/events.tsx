import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../components/ui/Badge';
import { BottomNav } from '../../components/ui/BottomNav';
import { Card, StatCard } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { ADMIN_NAV_ITEMS } from '../../constants/navigation';
import { useTheme } from '../../context/ThemeContext';

const eventsData = [
    { id: '1', title: 'Monthly Team Meeting', date: '2026-02-10', time: '09:00', location: 'Head Office', type: 'meeting', participants: 12 },
    { id: '2', title: 'New Product Training', date: '2026-02-15', time: '14:00', location: 'Training Center', type: 'training', participants: 8 },
    { id: '3', title: 'Store Opening - Cheraga', date: '2026-02-20', time: '10:00', location: 'Cheraga Mall', type: 'event', participants: 5 },
    { id: '4', title: 'Q1 Review', date: '2026-03-01', time: '11:00', location: 'Conference Room A', type: 'meeting', participants: 6 },
    { id: '5', title: 'Safety Workshop', date: '2026-03-05', time: '09:30', location: 'Training Center', type: 'training', participants: 15 },
];

export default function EventsPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const [selectedFilter, setSelectedFilter] = useState('all');

    const colors = getColors(theme);

    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'meeting': return { icon: 'people', color: colors.primary, label: 'Meeting', variant: 'primary' as const };
            case 'training': return { icon: 'school', color: colors.secondary, label: 'Training', variant: 'secondary' as const };
            case 'event': return { icon: 'calendar', color: colors.success, label: 'Event', variant: 'success' as const };
            default: return { icon: 'ellipse', color: colors.textSecondary, label: 'Other', variant: 'neutral' as const };
        }
    };

    const filters = [
        { id: 'all', label: 'All Events' },
        { id: 'meeting', label: 'Meetings' },
        { id: 'training', label: 'Training' },
        { id: 'event', label: 'Events' },
    ];

    const filteredEvents = eventsData.filter(event =>
        selectedFilter === 'all' || event.type === selectedFilter
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <Header
                title="Events"
                showBack
                rightIcon="add"
                onRightIconPress={() => { }}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.statsRow}>
                    <StatCard
                        label="UPCOMING"
                        value={eventsData.length}
                        icon="calendar"
                        color={colors.primary}
                    />
                    <StatCard
                        label="THIS WEEK"
                        value="2"
                        icon="time"
                        color={colors.success}
                    />
                </View>

                <View style={styles.filterBar}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterContainer}
                    >
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
                    </ScrollView>
                </View>

                <SectionHeader title="Staff Events" />

                <View style={styles.eventsList}>
                    {filteredEvents.map(event => {
                        const config = getTypeConfig(event.type);
                        return (
                            <Card key={event.id} style={styles.eventCard}>
                                <View style={[styles.eventIcon, { backgroundColor: config.color + '15' }]}>
                                    <Ionicons name={config.icon as any} size={24} color={config.color} />
                                </View>
                                <View style={styles.eventInfo}>
                                    <View style={styles.eventTop}>
                                        <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                                        <Badge label={config.label} variant={config.variant === 'secondary' ? 'primary' : config.variant} size="sm" />
                                    </View>
                                    <View style={styles.eventMeta}>
                                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>{event.date} • {event.time}</Text>
                                    </View>
                                    <View style={styles.eventMeta}>
                                        <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>{event.location}</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                            </Card>
                        );
                    })}
                </View>
            </ScrollView>

            <BottomNav items={ADMIN_NAV_ITEMS} activeRoute="/admin/events" />
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
    statsRow: {
        flexDirection: 'row',
        padding: DesignTokens.spacing.lg,
        gap: DesignTokens.spacing.md,
    },
    filterBar: {
        marginBottom: DesignTokens.spacing.md,
    },
    filterContainer: {
        paddingHorizontal: DesignTokens.spacing.lg,
        gap: DesignTokens.spacing.sm,
    },
    filterBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    filterText: {
        ...DesignTokens.typography.caption,
        fontWeight: 'bold',
    },
    eventsList: {
        padding: DesignTokens.spacing.lg,
        gap: DesignTokens.spacing.md,
    },
    eventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: DesignTokens.spacing.md,
        gap: DesignTokens.spacing.md,
    },
    eventIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    eventInfo: {
        flex: 1,
        gap: 4,
    },
    eventTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    eventTitle: {
        ...DesignTokens.typography.bodyBold,
    },
    eventMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        ...DesignTokens.typography.tiny,
    },
});
