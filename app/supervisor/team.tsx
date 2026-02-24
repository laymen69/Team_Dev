import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../components/ui/Badge';
import { BottomNav } from '../../components/ui/BottomNav';
import { Button } from '../../components/ui/Button';
import { Card, StatCard } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { SUPERVISOR_NAV_ITEMS } from '../../constants/navigation';
import { useTheme } from '../../context/ThemeContext';

const merchandisers = [
    {
        id: '1',
        name: 'Sara Khelifi',
        email: 'sara.k@fieldforce.com',
        phone: '+212 600 123 456',
        status: 'active',
        gpsEnabled: true,
        currentLocation: 'Carrefour Market - Marrakech',
        visitsCompleted: 5,
        visitsPlanned: 8,
    },
    {
        id: '2',
        name: 'Youssef Amrani',
        email: 'youssef.a@fieldforce.com',
        phone: '+212 600 789 012',
        status: 'active',
        gpsEnabled: true,
        currentLocation: 'ASWAK ASSALAM - Safi',
        visitsCompleted: 3,
        visitsPlanned: 6,
    },
    {
        id: '3',
        name: 'Fatima Benali',
        email: 'fatima.b@fieldforce.com',
        phone: '+212 600 345 678',
        status: 'inactive',
        gpsEnabled: false,
        currentLocation: 'N/A',
        visitsCompleted: 0,
        visitsPlanned: 5,
    },
    {
        id: '4',
        name: 'Mohamed Cherif',
        email: 'mohamed.c@fieldforce.com',
        phone: '+212 600 901 234',
        status: 'active',
        gpsEnabled: false,
        currentLocation: 'GPS Disabled',
        visitsCompleted: 4,
        visitsPlanned: 7,
    },
];

export default function TeamPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = getColors(theme);

    const handleCall = (phone: string) => Linking.openURL(`tel:${phone}`);
    const handleEmail = (email: string) => Linking.openURL(`mailto:${email}`);

    const stats = {
        total: merchandisers.length,
        active: merchandisers.filter(m => m.status === 'active' && m.gpsEnabled).length,
        alerts: merchandisers.filter(m => !m.gpsEnabled && m.status === 'active').length,
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header
                title="My Team"
                subtitle="Manage and track field force"
                rightIcon="add-circle-outline"
                onRightIconPress={() => { }}
            />

            <View style={styles.statsGrid}>
                <StatCard label="TOTAL" value={stats.total} icon="people" color={colors.primary} />
                <StatCard label="ACTIVE" value={stats.active} icon="checkmark-circle" color={colors.success} />
                <StatCard label="ALERTS" value={stats.alerts} icon="warning" color={colors.danger} />
            </View>

            <SectionHeader
                title="Merchandisers"
                actionLabel="View Map"
                onAction={() => router.push('/supervisor/map')}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {merchandisers.map((item) => (
                    <Card key={item.id} style={styles.userCard}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.avatar, { backgroundColor: colors.primary + '15' }]}>
                                <Text style={[styles.avatarText, { color: colors.primary }]}>{item.name.charAt(0)}</Text>
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
                                <View style={styles.statusBadgeRow}>
                                    {!item.gpsEnabled && item.status === 'active' ? (
                                        <Badge label="GPS OFF" variant="danger" size="sm" />
                                    ) : (
                                        <Badge
                                            label={item.status.toUpperCase()}
                                            variant={item.status === 'active' ? 'success' : 'neutral'}
                                            size="sm"
                                        />
                                    )}
                                </View>
                            </View>
                            <View style={styles.progressCol}>
                                <Text style={[styles.progressVal, { color: colors.primary }]}>
                                    {Math.round((item.visitsCompleted / item.visitsPlanned) * 100)}%
                                </Text>
                                <Text style={[styles.progressLab, { color: colors.textSecondary }]}>Visits</Text>
                            </View>
                        </View>

                        {item.status === 'active' && (
                            <View style={[styles.locationBox, { backgroundColor: colors.surfaceSecondary }]}>
                                <Ionicons name="location" size={14} color={colors.primary} />
                                <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
                                    {item.currentLocation}
                                </Text>
                            </View>
                        )}

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <View style={styles.actions}>
                            <Button
                                title="Call"
                                variant="ghost"
                                size="sm"
                                icon="call-outline"
                                onPress={() => handleCall(item.phone)}
                                style={styles.actionBtn}
                            />
                            <Button
                                title="Track"
                                variant="ghost"
                                size="sm"
                                icon="navigate-outline"
                                onPress={() => router.push('/supervisor/map')}
                                style={styles.actionBtn}
                            />
                            <Button
                                title="Email"
                                variant="ghost"
                                size="sm"
                                icon="mail-outline"
                                onPress={() => handleEmail(item.email)}
                                style={styles.actionBtn}
                            />
                        </View>
                    </Card>
                ))}
            </ScrollView>

            <BottomNav items={SUPERVISOR_NAV_ITEMS} activeRoute="/supervisor/team" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    statsGrid: { flexDirection: 'row', padding: DesignTokens.spacing.sm, gap: DesignTokens.spacing.sm },
    content: { paddingHorizontal: DesignTokens.spacing.lg, paddingBottom: 100 },
    userCard: { padding: DesignTokens.spacing.md, marginBottom: DesignTokens.spacing.md },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: DesignTokens.spacing.md },
    avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
    avatarText: { ...DesignTokens.typography.h3, fontWeight: 'bold' },
    userInfo: { flex: 1, gap: 2 },
    userName: { ...DesignTokens.typography.bodyBold },
    statusBadgeRow: { flexDirection: 'row', marginTop: 2 },
    progressCol: { alignItems: 'flex-end', minWidth: 60 },
    progressVal: { ...DesignTokens.typography.h3, fontWeight: '700' },
    progressLab: { ...DesignTokens.typography.tiny, textTransform: 'uppercase' },
    locationBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: DesignTokens.spacing.md,
        padding: DesignTokens.spacing.sm,
        borderRadius: 8
    },
    locationText: { ...DesignTokens.typography.caption, flex: 1 },
    divider: { height: 1, marginVertical: DesignTokens.spacing.md, opacity: 0.5 },
    actions: { flexDirection: 'row', gap: DesignTokens.spacing.xs },
    actionBtn: { flex: 1, paddingVertical: 4 },
});
