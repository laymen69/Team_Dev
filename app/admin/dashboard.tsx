
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../../components/ui/BottomNav';
import { ActionCard, StatCard } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { SettingsDrawer, SettingsItemType } from '../../components/ui/SettingsDrawer';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { ADMIN_NAV_ITEMS } from '../../constants/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { GMSService } from '../../services/gms.service';
import { ReportService } from '../../services/report.service';
import { UserService } from '../../services/user.service';


export default function AdminDashboard() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [stats, setStats] = useState({
    users: 0,
    visits: 0,
    reports: 0,
    alerts: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const colors = getColors(theme);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    if (!refreshing) setLoading(true);
    try {
      const [users, reports, stores] = await Promise.all([
        UserService.getAll(),
        ReportService.getAll(),
        GMSService.getAll()
      ]);

      const pendingReports = reports.filter(r => r.status === 'pending').length;

      setStats({
        users: users.length,
        visits: stores.length,
        reports: reports.length,
        alerts: pendingReports
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardStats();
  };

  const adminName = user ? `${user.firstName} ${user.lastName}` : 'Admin';

  const settingsItems: SettingsItemType[] = [
    {
      icon: 'image-outline',
      label: 'Before/After Reports',
      color: colors.success,
      onPress: () => { setSettingsVisible(false); router.push('/admin/before-after'); }
    },
    {
      icon: 'calendar-outline',
      label: 'Leave Requests',
      color: colors.secondary,
      onPress: () => { setSettingsVisible(false); router.push('/admin/leave'); }
    },
    {
      icon: theme === 'dark' ? 'moon' : 'sunny',
      label: 'Dark Mode',
      color: colors.warning,
      onPress: () => toggleTheme(),
      rightElement: <View style={{ opacity: 0.8 }} />
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
        title={adminName}
        subtitle="System Overview"
        avatar={user?.profileImage ? { uri: user.profileImage } : require('../../assets/images/profile.png')}
        secondRightIcon="notifications-outline"
        onSecondRightIconPress={() => router.push('/admin/notifications')}
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
        <View style={styles.statsGrid}>
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                label="Total Users"
                value={stats.users}
                icon="people"
                color={colors.primary}
                trend="Active users"
                trendUp
              />
              <StatCard
                label="Locations"
                value={stats.visits}
                icon="map"
                color={colors.success}
              />
              <StatCard
                label="Reports"
                value={stats.reports}
                icon="document-text"
                color={colors.secondary}
              />
              <StatCard
                label="Alerts"
                value={stats.alerts}
                icon="warning"
                color={colors.warning}
                trend="Pending review"
              />
            </>
          )}
        </View>

        <SectionHeader title="Management" />

        <View style={styles.actionGrid}>
          <ActionCard
            title="Manage Users"
            subtitle="Add, edit, or remove system users"
            icon="people-circle-outline"
            color={colors.primary}
            onPress={() => router.push('/admin/users')}
          />
          <ActionCard
            title="View Reports"
            subtitle="Access field reports and analytics"
            icon="bar-chart-outline"
            color={colors.secondary}
            onPress={() => router.push('/admin/before-after')}
          />
          <ActionCard
            title="Documents"
            subtitle="Manage contracts and guidelines"
            icon="document-text-outline"
            color={colors.success}
            onPress={() => router.push('/admin/documents')}
          />
        </View>
      </ScrollView>

      <BottomNav items={ADMIN_NAV_ITEMS} activeRoute="/admin/dashboard" />

      <SettingsDrawer
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        items={settingsItems}
      />
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
    justifyContent: 'space-between',
  },
  actionGrid: {
    paddingHorizontal: DesignTokens.spacing.lg,
  },
});
