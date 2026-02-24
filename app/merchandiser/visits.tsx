
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../components/ui/Badge';
import { BottomNav, NavItemType } from '../../components/ui/BottomNav';
import { Card, StatCard } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../hooks/useFonts';

const NAV_ITEMS: NavItemType[] = [
    { icon: 'grid', label: 'Overview', route: '/merchandiser/dashboard' },
    { icon: 'people', label: 'Team', route: '/merchandiser/team' },
    { icon: 'storefront', label: 'GMS', route: '/merchandiser/gms' },
    { icon: 'flash', label: 'Events', route: '/merchandiser/events' },
    { icon: 'person', label: 'Profile', route: '/merchandiser/profile' },
];

const visits = [
    { id: '1', store: 'Marjane Marrakech', time: '09:00 AM', duration: '45 min', status: 'completed', events: 2 },
    { id: '2', store: 'Carrefour Gueliz', time: '10:30 AM', duration: '30 min', status: 'completed', events: 1 },
    { id: '3', store: 'Acima Menara', time: '12:00 PM', duration: '1h', status: 'in_progress', events: 0 },
    { id: '4', store: 'BIM Daoudiate', time: '02:30 PM', duration: '45 min', status: 'pending', events: 0 },
    { id: '5', store: 'Label Vie Guéliz', time: '04:00 PM', duration: '30 min', status: 'pending', events: 0 },
];

export default function MerchandiserVisits() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = getColors(theme);

    const getStatusVariant = (status: string): any => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'info';
            default: return 'neutral';
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header
                title="Today's Visits"
                subtitle="Scheduled route for today"
                rightIcon="calendar-outline"
                onRightIconPress={() => { }}
                showBack
            />

            <View style={styles.statsRow}>
                <StatCard label="VISITED" value="12" icon="checkmark-circle" color={colors.success} />
                <StatCard label="UPCOMING" value="8" icon="radio" color={colors.primary} />
                <StatCard label="AVG TIME" value="1.5h" icon="time" color={colors.secondary} />
            </View>

            <SectionHeader title="Visit Schedule" />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {visits.map((visit) => (
                    <Card key={visit.id} style={styles.visitCard} onPress={() => { }}>
                        <View style={styles.visitHeader}>
                            <View style={[styles.timeTag, { backgroundColor: colors.surfaceSecondary }]}>
                                <Ionicons name="time-outline" size={14} color={colors.primary} />
                                <Text style={[styles.timeText, { color: colors.primary }]}>{visit.time}</Text>
                            </View>
                            <Badge
                                label={visit.status.replace('_', ' ').toUpperCase()}
                                variant={getStatusVariant(visit.status)}
                            />
                        </View>

                        <Text style={[styles.storeName, { color: colors.text }]}>{visit.store}</Text>

                        <View style={styles.visitFooter}>
                            <View style={styles.footerInfo}>
                                <Ionicons name="hourglass-outline" size={14} color={colors.textSecondary} />
                                <Text style={[styles.footerText, { color: colors.textSecondary }]}>{visit.duration}</Text>
                            </View>
                            {visit.events > 0 && (
                                <View style={styles.eventBadge}>
                                    <Ionicons name="flash" size={12} color={colors.warning} />
                                    <Text style={[styles.eventText, { color: colors.warning }]}>{visit.events} events</Text>
                                </View>
                            )}
                        </View>
                    </Card>
                ))}
            </ScrollView>

            <BottomNav items={NAV_ITEMS} activeRoute="/merchandiser/dashboard" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    statsRow: { flexDirection: 'row', gap: DesignTokens.spacing.sm, padding: DesignTokens.spacing.lg },
    scroll: { paddingHorizontal: DesignTokens.spacing.lg, paddingBottom: 100, gap: DesignTokens.spacing.md },
    visitCard: { padding: DesignTokens.spacing.lg, gap: DesignTokens.spacing.md },
    visitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    timeTag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    timeText: { ...DesignTokens.typography.caption, fontFamily: Fonts.bodyBold },
    storeName: { ...DesignTokens.typography.h3 },
    visitFooter: { flexDirection: 'row', gap: DesignTokens.spacing.lg, alignItems: 'center' },
    footerInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    footerText: { ...DesignTokens.typography.caption },
    eventBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f59e0b15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    eventText: { ...DesignTokens.typography.caption, fontFamily: Fonts.bodyBold, fontSize: 10 },
});
