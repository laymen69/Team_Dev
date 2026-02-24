import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../../components/ui/BottomNav';
import { Card } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { ADMIN_NAV_ITEMS } from '../../constants/navigation';
import { useTheme } from '../../context/ThemeContext';

export default function PrivacyPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = getColors(theme);

    const [biometric, setBiometric] = useState(true);
    const [twoFactor, setTwoFactor] = useState(false);
    const [locationTracking, setLocationTracking] = useState(true);
    const [analytics, setAnalytics] = useState(true);

    const renderToggle = (label: string, value: boolean, onValueChange: (val: boolean) => void, icon: string) => (
        <View style={[styles.toggleRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={styles.toggleLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSecondary }]}>
                    <Ionicons name={icon as any} size={20} color={colors.textSecondary} />
                </View>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>{label}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={"#fff"}
            />
        </View>
    );

    const renderAction = (label: string, icon: string, onPress: () => void, color?: string, isLast?: boolean) => (
        <TouchableOpacity style={[styles.actionRow, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]} onPress={onPress}>
            <View style={styles.toggleLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSecondary }]}>
                    <Ionicons name={icon as any} size={20} color={color || colors.textSecondary} />
                </View>
                <Text style={[styles.toggleLabel, { color: color || colors.text }]}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <Header
                title="Privacy & Security"
                showBack
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <SectionHeader title="SECURITY" />
                    <Card style={styles.card}>
                        {renderToggle('Biometric Login', biometric, setBiometric, 'finger-print')}
                        {renderToggle('Two-Factor Auth', twoFactor, setTwoFactor, 'shield-checkmark')}
                        {renderAction('Change Password', 'key', () => { }, colors.text, true)}
                    </Card>
                </View>

                <View style={styles.section}>
                    <SectionHeader title="DATA & PRIVACY" />
                    <Card style={styles.card}>
                        {renderToggle('Location Tracking', locationTracking, setLocationTracking, 'location')}
                        {renderToggle('Share Analytics', analytics, setAnalytics, 'bar-chart')}
                        {renderAction('Download My Data', 'download', () => { }, colors.text, true)}
                    </Card>
                </View>

                <View style={styles.section}>
                    <SectionHeader title="ACCOUNT" />
                    <Card style={styles.card}>
                        {renderAction('Deactivate Account', 'trash', () => { }, colors.danger, true)}
                    </Card>
                </View>

                <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
                    Read our Privacy Policy and Terms of Service for more information about how we protect your data.
                </Text>
            </ScrollView>

            <BottomNav items={ADMIN_NAV_ITEMS} activeRoute="/admin/privacy" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    content: {
        paddingHorizontal: DesignTokens.spacing.lg,
        paddingBottom: 100,
        gap: DesignTokens.spacing.lg,
    },
    section: {
        gap: DesignTokens.spacing.sm,
    },
    card: {
        padding: 0,
        overflow: 'hidden',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: DesignTokens.spacing.md,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: DesignTokens.spacing.md,
    },
    toggleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: DesignTokens.spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toggleLabel: {
        ...DesignTokens.typography.body,
        fontWeight: '500',
    },
    disclaimer: {
        ...DesignTokens.typography.tiny,
        textAlign: 'center',
        paddingHorizontal: 30,
        lineHeight: 18,
        marginTop: DesignTokens.spacing.md,
    },
});
