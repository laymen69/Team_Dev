import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../components/ui/Badge';
import { BottomNav } from '../../components/ui/BottomNav';
import { Button } from '../../components/ui/Button';
import { Card, StatCard } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { ListSkeleton } from '../../components/ui/LoadingSkeleton';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { getFullImageUrl } from '../../constants/api';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { SUPERVISOR_NAV_ITEMS } from '../../constants/navigation';
import { useTheme } from '../../context/ThemeContext';
import { UserService } from '../../services/user.service';
import { User } from '../../types/auth';

// Data is now fetched from the database

export default function TeamPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = getColors(theme);
    const [loading, setLoading] = useState(true);
    const [merchandisers, setMerchandisers] = useState<User[]>([]);

    const loadTeam = async () => {
        setLoading(true);
        try {
            const allUsers = await UserService.getAll({ limit: 100 });
            const filtered = allUsers.filter(u => u.role === 'merchandiser');
            setMerchandisers(filtered);
        } catch (error) {
            console.error('Failed to load team:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTeam();
    }, []);

    const handleCall = (phone: string) => Linking.openURL(`tel:${phone}`);
    const handleEmail = (email: string) => Linking.openURL(`mailto:${email}`);

    const stats = {
        total: merchandisers.length,
        active: merchandisers.filter(m => m.status === 'active').length,
        alerts: merchandisers.filter(m => m.status === 'inactive').length, // Simplification for now
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

            {loading ? (
                <View style={styles.content}>
                    <ListSkeleton count={4} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {merchandisers.map((item) => (
                        <Card key={item.id} style={styles.userCard}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.avatar, { backgroundColor: colors.primary + '15', overflow: 'hidden' }]}>
                                    {item.profileImage ? (
                                        <Image
                                            source={{ uri: getFullImageUrl(item.profileImage) || '' }}
                                            style={styles.avatarImg}
                                        />
                                    ) : (
                                        <Text style={[styles.avatarText, { color: colors.primary }]}>
                                            {item.firstName?.charAt(0) || item.email.charAt(0).toUpperCase()}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.userInfo}>
                                    <Text style={[styles.userName, { color: colors.text }]}>
                                        {item.firstName} {item.lastName}
                                    </Text>
                                    <View style={styles.statusBadgeRow}>
                                        <Badge
                                            label={item.status?.toUpperCase() || 'ACTIVE'}
                                            variant={item.status === 'active' ? 'success' : 'neutral'}
                                            size="sm"
                                        />
                                    </View>
                                </View>
                                <View style={styles.progressCol}>
                                    <Text style={[styles.progressVal, { color: colors.primary }]}>
                                        0%
                                    </Text>
                                    <Text style={[styles.progressLab, { color: colors.textSecondary }]}>Visits</Text>
                                </View>
                            </View>

                            <View style={[styles.locationBox, { backgroundColor: colors.surfaceSecondary }]}>
                                <Ionicons name="mail-outline" size={14} color={colors.primary} />
                                <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
                                    {item.email}
                                </Text>
                            </View>

                            <View style={[styles.divider, { backgroundColor: colors.border }]} />

                            <View style={styles.actions}>
                                <Button
                                    title="Call"
                                    variant="ghost"
                                    size="sm"
                                    icon="call-outline"
                                    onPress={() => handleCall(item.phone || '')}
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
            )}

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
    avatarImg: { width: '100%', height: '100%' },
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
