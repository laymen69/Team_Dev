
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav, NavItemType } from '../../components/ui/BottomNav';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { useTheme } from '../../context/ThemeContext';

const NAV_ITEMS: NavItemType[] = [
    { icon: 'grid', label: 'Overview', route: '/merchandiser/dashboard' },
    { icon: 'people', label: 'Team', route: '/merchandiser/team' },
    { icon: 'storefront', label: 'GMS', route: '/merchandiser/gms' },
    { icon: 'flash', label: 'Events', route: '/merchandiser/events' },
    { icon: 'person', label: 'Profile', route: '/merchandiser/profile' },
];

export default function PrivacyPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = getColors(theme);

    const [biometric, setBiometric] = useState(true);
    const [twoFactor, setTwoFactor] = useState(false);
    const [locationTracking, setLocationTracking] = useState(true);
    const [analytics, setAnalytics] = useState(true);

    const renderToggle = (label: string, value: boolean, onValueChange: (val: boolean) => void, icon: string) => (
        <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
            <View style={styles.toggleLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.surfaceSecondary }]}>
                    <Ionicons name={icon as any} size={20} color={colors.text} />
                </View>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>{label}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
            />
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title="Privacy & Security" subtitle="Manage your data & account" showBack />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <SectionHeader title="Security Settings" />
                <Card style={styles.menuCard}>
                    {renderToggle('Biometric Login', biometric, setBiometric, 'finger-print')}
                    {renderToggle('Two-Factor Auth', twoFactor, setTwoFactor, 'shield-checkmark')}
                    <Button
                        title="Change Password"
                        variant="ghost"
                        onPress={() => { }}
                        style={styles.actionBtn}
                        icon="key"
                        iconPosition="left"
                        rightIcon="chevron-forward"
                    />
                </Card>

                <SectionHeader title="Data & Activity" />
                <Card style={styles.menuCard}>
                    {renderToggle('Location Tracking', locationTracking, setLocationTracking, 'location')}
                    {renderToggle('Share Analytics', analytics, setAnalytics, 'bar-chart')}
                    <Button
                        title="Download My Data"
                        variant="ghost"
                        onPress={() => { }}
                        style={styles.actionBtn}
                        icon="download"
                        iconPosition="left"
                        rightIcon="chevron-forward"
                    />
                </Card>

                <SectionHeader title="Account Management" />
                <Card style={styles.menuCard}>
                    <Button
                        title="Deactivate Account"
                        variant="ghost"
                        onPress={() => { }}
                        style={styles.actionBtn}
                        icon="trash"
                        textStyle={{ color: colors.danger }}
                        iconPosition="left"
                        rightIcon="chevron-forward"
                    />
                </Card>

                <View style={styles.footer}>
                    <Ionicons name="lock-closed-outline" size={24} color={colors.success} style={{ marginBottom: 8 }} />
                    <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
                        Your data is encrypted and protected following the highest enterprise security standards.
                        Read our Privacy Policy for more details.
                    </Text>
                </View>
            </ScrollView>

            <BottomNav items={NAV_ITEMS} activeRoute="/merchandiser/profile" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingBottom: 100 },
    menuCard: { marginHorizontal: DesignTokens.spacing.lg, padding: 4 },
    toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: DesignTokens.spacing.md, borderBottomWidth: 1 },
    toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    toggleLabel: { ...DesignTokens.typography.bodyBold, fontSize: 14 },
    actionBtn: { justifyContent: 'flex-start', paddingVertical: DesignTokens.spacing.md },
    footer: { padding: DesignTokens.spacing.xxl, alignItems: 'center' },
    disclaimer: { ...DesignTokens.typography.caption, textAlign: 'center', lineHeight: 18, opacity: 0.7 },
});
