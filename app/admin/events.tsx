import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminWebLayout } from '../../components/admin/WebLayout';
import { Badge } from '../../components/ui/Badge';
import { BottomNav } from '../../components/ui/BottomNav';
import { Card, StatCard } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { ADMIN_NAV_ITEMS } from '../../constants/navigation';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../hooks/useFonts';

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

    if (Platform.OS === 'web') {
        return (
            <AdminWebLayout title="Events & Training">
                <View style={{ flexDirection: 'row', gap: 24, marginBottom: 32 }}>
                    <StatCard
                        label="UPCOMING EVENTS"
                        value={eventsData.length}
                        icon="calendar"
                        color={colors.primary}
                        style={{ flex: 1, height: 120 }}
                    />
                    <StatCard
                        label="SCHEDULED THIS WEEK"
                        value="2"
                        icon="time"
                        color={colors.success}
                        style={{ flex: 1, height: 120 }}
                    />
                    <Card style={{ flex: 2, height: 120, justifyContent: 'center', padding: 24, borderRadius: 20 }}>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '700', letterSpacing: 1 }}>NEXT EVENT</Text>
                        <Text style={{ fontSize: 20, color: colors.text, marginTop: 4, fontFamily: Fonts.headingSemiBold }}>Monthly Team Meeting • Feb 10, 09:00</Text>
                    </Card>
                </View>

                <View style={{ marginBottom: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 16, padding: 4, alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border }}>
                        {filters.map(filter => (
                            <TouchableOpacity
                                key={filter.id}
                                onPress={() => setSelectedFilter(filter.id)}
                                style={{
                                    paddingHorizontal: 24,
                                    paddingVertical: 10,
                                    borderRadius: 12,
                                    backgroundColor: selectedFilter === filter.id ? colors.primary : 'transparent',
                                }}
                            >
                                <Text style={{
                                    color: selectedFilter === filter.id ? '#fff' : colors.textSecondary,
                                    fontWeight: '700',
                                    fontSize: 14
                                }}>
                                    {filter.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={{ backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 }}
                    >
                        <Ionicons name="add" size={20} color="#fff" />
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Schedule Event</Text>
                    </TouchableOpacity>
                </View>

                <View>
                    <Text style={{ fontSize: 20, fontFamily: Fonts.headingSemiBold, color: colors.text, marginBottom: 20 }}>Staff Events</Text>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                        {filteredEvents.map(event => {
                            const config = getTypeConfig(event.type);
                            return (
                                <Card key={event.id} style={{ width: '32%', padding: 24, borderRadius: 24 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                        <View style={[styles.eventIcon, { backgroundColor: config.color + '15', width: 56, height: 56, borderRadius: 16 }]}>
                                            <Ionicons name={config.icon as any} size={28} color={config.color} />
                                        </View>
                                        <Badge label={config.label} variant={config.variant === 'secondary' ? 'primary' : config.variant} size="md" />
                                    </View>

                                    <Text style={{ fontSize: 18, fontFamily: Fonts.headingSemiBold, color: colors.text }} numberOfLines={1}>{event.title}</Text>

                                    <View style={{ gap: 12, marginTop: 20 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
                                                <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                                            </View>
                                            <Text style={{ fontSize: 14, color: colors.text }}>{event.date}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
                                                <Ionicons name="time-outline" size={16} color={colors.primary} />
                                            </View>
                                            <Text style={{ fontSize: 14, color: colors.text }}>{event.time}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
                                                <Ionicons name="location-outline" size={16} color={colors.primary} />
                                            </View>
                                            <Text style={{ fontSize: 14, color: colors.text }} numberOfLines={1}>{event.location}</Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={{ marginTop: 24, backgroundColor: colors.surfaceSecondary, paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
                                    >
                                        <Text style={{ fontWeight: '600', color: colors.primary }}>Manage Participants ({event.participants})</Text>
                                    </TouchableOpacity>
                                </Card>
                            );
                        })}
                    </View>
                </View>
            </AdminWebLayout>
        );
    }

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
