
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../../components/ui/BottomNav';
import { ActionCard, Card, StatCard } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { SettingsDrawer, SettingsItemType } from '../../components/ui/SettingsDrawer';
import { getFullImageUrl } from '../../constants/api';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { SUPERVISOR_NAV_ITEMS } from '../../constants/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function SupervisorDashboard() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const colors = getColors(theme);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!refreshing) setLoading(true);
    // Simulate data fetch
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const supervisorName = user ? `${user.firstName} ${user.lastName}` : 'Supervisor';

  const settingsItems: SettingsItemType[] = [
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      color: colors.primary,
      onPress: () => { setSettingsVisible(false); router.push('/supervisor/notifications'); }
    },
    {
      icon: 'newspaper-outline',
      label: 'Articles',
      color: colors.primary,
      onPress: () => { setSettingsVisible(false); router.push('/supervisor/articles'); }
    },
    {
      icon: 'chatbubbles-outline',
      label: 'Complaints',
      color: colors.warning,
      onPress: () => { setSettingsVisible(false); router.push('/supervisor/complaints'); }
    },
    {
      icon: 'calendar-outline',
      label: 'Leave Requests',
      color: colors.success,
      onPress: () => { setSettingsVisible(false); router.push('/supervisor/leave'); }
    },
    {
      icon: 'bar-chart-outline',
      label: 'Reports',
      color: colors.secondary,
      onPress: () => { setSettingsVisible(false); router.push('/supervisor/reports'); }
    },
    {
      icon: theme === 'dark' ? 'moon' : 'sunny',
      label: 'Dark Mode',
      color: colors.warning,
      onPress: () => toggleTheme(),
    },
    {
      icon: 'log-out-outline',
      label: 'Sign Out',
      color: colors.danger,
      isDestructive: true,
      onPress: () => { setSettingsVisible(false); signOut(); }
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={supervisorName}
        subtitle="Team Command Center"
        avatar={user?.profileImage ? { uri: getFullImageUrl(user.profileImage) } : null}
        onAvatarPress={() => router.push('/supervisor/profile')}
        secondRightIcon="notifications-outline"
        onSecondRightIconPress={() => router.push('/supervisor/notifications')}
        rightIcon="settings-outline"
        onRightIconPress={() => setSettingsVisible(true)}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <SectionHeader title="Team Status" />

        <View style={styles.statsGrid}>
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                label="ACTIVE NOW"
                value="12"
                icon="people"
                color={colors.primary}
                trend="85% of Team"
                trendUp
              />
              <StatCard
                label="ALERTS"
                value="03"
                icon="warning"
                color={colors.danger}
                trend="Needs Action"
                onPress={() => router.push('/supervisor/notifications')}
              />
            </>
          )}
        </View>

        <SectionHeader title="Operational Progress" />

        <Card style={styles.progressCard} elevation="md">
          <ProgressBar
            progress={0.65}
            label="Total Daily Visit Completion"
            showPercentage
          />
          <View style={styles.progressStats}>
            <View style={styles.progressStatItem}>
              <Ionicons name="storefront-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.progressStatText, { color: colors.textSecondary }]}>
                156 / 240 Stores Visited
              </Text>
            </View>
            <View style={styles.progressStatItem}>
              <Ionicons name="documents-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.progressStatText, { color: colors.textSecondary }]}>
                84 Pending Reports
              </Text>
            </View>
          </View>
        </Card>

        <SectionHeader title="Quick Actions" />

        <View style={styles.actionGrid}>
          <View style={styles.actionItem}>
            <ActionCard
              title="Team Map"
              subtitle="Live tracking"
              icon="map"
              vertical
              color={colors.primary}
              onPress={() => router.push('/supervisor/map')}
            />
          </View>
          <View style={styles.actionItem}>
            <ActionCard
              title="Approve Reports"
              subtitle="24 pending"
              icon="checkmark-done"
              vertical
              color={colors.success}
              onPress={() => router.push('/supervisor/reports')}
            />
          </View>
          <View style={styles.actionItem}>
            <ActionCard
              title="Articles"
              subtitle="Knowledge base"
              icon="newspaper-outline"
              vertical
              color={colors.secondary}
              onPress={() => router.push('/supervisor/articles')}
            />
          </View>
          <View style={styles.actionItem}>
            <ActionCard
              title="Complaints"
              subtitle="Review issues"
              icon="chatbubbles-outline"
              vertical
              color={colors.warning}
              onPress={() => router.push('/supervisor/complaints')}
            />
          </View>
          <View style={styles.actionItem}>
            <ActionCard
              title="Planning"
              subtitle="Manage routes"
              icon="calendar"
              vertical
              color={colors.secondary}
              onPress={() => router.push('/supervisor/planning')}
            />
          </View>
          <View style={styles.actionItem}>
            <ActionCard
              title="Objectives"
              subtitle="Team goals"
              icon="flag-outline"
              vertical
              color={colors.warning}
              onPress={() => router.push('/supervisor/objectives')}
            />
          </View>
        </View>
      </ScrollView>

      <BottomNav items={SUPERVISOR_NAV_ITEMS} activeRoute="/supervisor/dashboard" />

      <SettingsDrawer
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        items={settingsItems}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 120 },
  statsGrid: { flexDirection: 'row', padding: DesignTokens.spacing.sm, gap: DesignTokens.spacing.sm },
  progressCard: { marginHorizontal: DesignTokens.spacing.lg, padding: DesignTokens.spacing.lg },
  progressStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: DesignTokens.spacing.md },
  progressStatItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressStatText: { ...DesignTokens.typography.caption, fontSize: 11 },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: DesignTokens.spacing.sm,
    gap: DesignTokens.spacing.sm
  },
  actionItem: {
    width: '48.5%', // Slightly less than 50% to account for gap
  },
});
