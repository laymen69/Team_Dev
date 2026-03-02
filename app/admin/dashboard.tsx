
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../../components/ui/BottomNav';
import { ActionCard, StatCard } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { BannerSkeleton, CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { SettingsDrawer, SettingsItemType } from '../../components/ui/SettingsDrawer';
import { getFullImageUrl } from '../../constants/api';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { ADMIN_NAV_ITEMS } from '../../constants/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ExportService } from '../../services/export.service';
import { GMSService } from '../../services/gms.service';
import { Report, ReportService } from '../../services/report.service';
import { UserService } from '../../services/user.service';
import { User } from '../../types/auth';

function isWithinDays(dateStr: string, days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return new Date(dateStr) >= cutoff;
}

function buildAnalytics(users: User[], reports: Report[], period: 'weekly' | 'monthly') {
  const days = period === 'weekly' ? 7 : 30;

  const supervisors = users.filter(u => u.role === 'supervisor');
  const merchandisers = users.filter(u => u.role === 'merchandiser');

  const periodReports = reports.filter(r => isWithinDays(r.created_at, days));

  const approved = periodReports.filter(r => r.status === 'approved').length;
  const pending = periodReports.filter(r => r.status === 'pending').length;
  const rejected = periodReports.filter(r => r.status === 'rejected').length;
  const total = periodReports.length;

  const visitsPlanned = periodReports.reduce((s, r) => s + (r.visits_planned ?? 0), 0);
  const visitsCompleted = periodReports.reduce((s, r) => s + (r.visits_completed ?? 0), 0);
  const visitRate = visitsPlanned > 0 ? Math.round((visitsCompleted / visitsPlanned) * 100) : 0;

  const activeMerchandisers = new Set(periodReports.map(r => r.user_id)).size;
  const avgReportsPerMerch = merchandisers.length > 0
    ? (total / merchandisers.length).toFixed(1)
    : '0';

  return {
    supervisors: supervisors.length,
    merchandisers: merchandisers.length,
    activeMerchandisers,
    total, approved, pending, rejected,
    visitsPlanned, visitsCompleted, visitRate,
    avgReportsPerMerch,
    approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
    pendingRate: total > 0 ? Math.round((pending / total) * 100) : 0,
  };
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 700, useNativeDriver: false }).start();
  }, [pct]);
  return (
    <View style={pbarStyles.track}>
      <Animated.View
        style={[pbarStyles.fill, {
          backgroundColor: color,
          width: anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] })
        }]}
      />
    </View>
  );
}
const pbarStyles = StyleSheet.create({
  track: { height: 7, borderRadius: 4, backgroundColor: '#00000015', overflow: 'hidden', flex: 1 },
  fill: { height: '100%', borderRadius: 4 },
});

function MetricRow({
  label, value, pct, color, colors
}: { label: string; value: string | number; pct: number; color: string; colors: any }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
        <Text style={{ ...DesignTokens.typography.caption, color: colors.textSecondary }}>{label}</Text>
        <Text style={{ ...DesignTokens.typography.caption, color: colors.text, fontWeight: '700' }}>
          {value}
        </Text>
      </View>
      <ProgressBar value={pct} max={100} color={color} />
    </View>
  );
}

function RoleCard({
  icon, role, count, active, detail, color, colors
}: { icon: keyof typeof Ionicons.glyphMap; role: string; count: number; active: number; detail: string; color: string; colors: any }) {
  return (
    <View style={[roleStyles.card, { backgroundColor: colors.surface, borderLeftColor: color }]}>
      <View style={[roleStyles.iconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ ...DesignTokens.typography.tiny, color: colors.textMuted }}>{role}</Text>
        <Text style={{ ...DesignTokens.typography.h3, color: colors.text, marginVertical: 1 }}>{count}</Text>
        <Text style={{ ...DesignTokens.typography.caption, color: colors.textSecondary }}>{detail}</Text>
      </View>
      <View style={[roleStyles.badge, { backgroundColor: color + '18' }]}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: color }}>{active} active</Text>
      </View>
    </View>
  );
}
const roleStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.sm,
    borderLeftWidth: 4,
    ...DesignTokens.shadows.sm,
  },
  iconWrap: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
});

export default function AdminDashboard() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [stats, setStats] = useState({ users: 0, visits: 0, reports: 0, alerts: 0 });
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const colors = getColors(theme);



  const loadDashboardStats = async () => {
    if (!refreshing) setLoading(true);
    try {
      const [users, reports, stores] = await Promise.all([
        UserService.getAll(),
        ReportService.getAll(),
        GMSService.getAll()
      ]);

      const pendingReports = reports.filter(r => r.status === 'pending').length;
      setAllUsers(users as unknown as User[]);
      setAllReports(reports);
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

  useEffect(() => { loadDashboardStats(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardStats();
  }, []);

  const analytics = buildAnalytics(allUsers, allReports, period);
  const adminName = user ? `${user.firstName} ${user.lastName}` : 'Admin';

  const settingsItems: SettingsItemType[] = [
    {
      icon: 'image-outline',
      label: 'Before/After Reports',
      color: colors.success,
      onPress: () => { setSettingsVisible(false); router.push('/admin/before-after'); }
    },
    {
      icon: 'newspaper-outline',
      label: 'Articles',
      color: colors.primary,
      onPress: () => { setSettingsVisible(false); router.push('/admin/articles'); }
    },
    {
      icon: 'chatbubbles-outline',
      label: 'Complaints',
      color: colors.warning,
      onPress: () => { setSettingsVisible(false); router.push('/admin/complaints'); }
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
        avatar={user?.profileImage ? { uri: getFullImageUrl(user.profileImage) } : null}
        onAvatarPress={() => router.push('/admin/profile')}
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
              <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
            </>
          ) : (
            <>
              <StatCard label="Total Users" value={stats.users} icon="people" color={colors.primary} trend="Active users" trendUp />
              <StatCard label="Locations" value={stats.visits} icon="map" color={colors.success} />
              <StatCard label="Reports" value={stats.reports} icon="document-text" color={colors.secondary} />
              <StatCard label="Alerts" value={stats.alerts} icon="warning" color={colors.warning} trend="Pending review" />
            </>
          )}
        </View>
        <SectionHeader
          title="Analytics"
          actionLabel="Export PDF"
          onAction={async () => {
            const date = new Date().toISOString().split('T')[0];
            await ExportService.downloadDailyReport(date);
          }}
        />

        {/* Period toggle */}
        <View style={[styles.periodToggle, { backgroundColor: colors.surfaceSecondary }]}>
          {(['weekly', 'monthly'] as const).map(p => (
            <TouchableOpacity
              key={p}
              style={[
                styles.periodBtn,
                p === period && { backgroundColor: colors.primary, ...DesignTokens.shadows.sm }
              ]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[
                styles.periodLabel,
                { color: p === period ? '#fff' : colors.textSecondary }
              ]}>
                {p === 'weekly' ? '7 Days' : '30 Days'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={{ paddingHorizontal: DesignTokens.spacing.lg, gap: DesignTokens.spacing.md }}>
            <BannerSkeleton />
            <View style={styles.statsGrid}>
              <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
            </View>
            <BannerSkeleton />
          </View>
        ) : (
          <>
            {/* Workforce cards */}
            <View style={styles.section}>
              <RoleCard
                icon="briefcase-outline"
                role="SUPERVISORS"
                count={analytics.supervisors}
                active={analytics.supervisors}
                detail={`Managing ${analytics.merchandisers} merchandisers`}
                color={colors.secondary}
                colors={colors}
              />
              <RoleCard
                icon="person-outline"
                role="MERCHANDISERS"
                count={analytics.merchandisers}
                active={analytics.activeMerchandisers}
                detail={`Avg ${analytics.avgReportsPerMerch} reports / member (${period})`}
                color={colors.primary}
                colors={colors}
              />
            </View>

            {/* Report breakdown */}
            <View style={[styles.analyticsCard, { backgroundColor: colors.surface }]}>
              <View style={styles.analyticsTitleRow}>
                <Ionicons name="bar-chart-outline" size={18} color={colors.primary} />
                <Text style={[styles.analyticsTitle, { color: colors.text }]}>
                  Report Status  <Text style={{ color: colors.textMuted, fontWeight: '400' }}>
                    ({analytics.total} total)
                  </Text>
                </Text>
              </View>

              <MetricRow
                label="✅ Approved"
                value={`${analytics.approved}  (${analytics.approvalRate}%)`}
                pct={analytics.approvalRate}
                color={colors.success}
                colors={colors}
              />
              <MetricRow
                label="⏳ Pending"
                value={`${analytics.pending}  (${analytics.pendingRate}%)`}
                pct={analytics.pendingRate}
                color={colors.warning}
                colors={colors}
              />
              <MetricRow
                label="❌ Rejected"
                value={analytics.rejected}
                pct={analytics.total > 0 ? Math.round((analytics.rejected / analytics.total) * 100) : 0}
                color={colors.danger}
                colors={colors}
              />
            </View>

            {/* Visit completion */}
            <View style={[styles.analyticsCard, { backgroundColor: colors.surface }]}>
              <View style={styles.analyticsTitleRow}>
                <Ionicons name="checkmark-done-circle-outline" size={18} color={colors.success} />
                <Text style={[styles.analyticsTitle, { color: colors.text }]}>Visit Completion</Text>
              </View>

              <View style={styles.visitRow}>
                <View style={styles.visitStat}>
                  <Text style={[styles.visitValue, { color: colors.text }]}>{analytics.visitsCompleted}</Text>
                  <Text style={[styles.visitLabel, { color: colors.textMuted }]}>Completed</Text>
                </View>
                <View style={[styles.ratePill, { backgroundColor: colors.success + '20' }]}>
                  <Text style={[styles.rateText, { color: colors.success }]}>{analytics.visitRate}%</Text>
                </View>
                <View style={styles.visitStat}>
                  <Text style={[styles.visitValue, { color: colors.text }]}>{analytics.visitsPlanned}</Text>
                  <Text style={[styles.visitLabel, { color: colors.textMuted }]}>Planned</Text>
                </View>
              </View>

              <ProgressBar value={analytics.visitRate} max={100} color={colors.success} />
            </View>
          </>
        )}

        {/* ── Management quick-actions ───────────────────────────────── */}
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
          <ActionCard
            title="Articles"
            subtitle="Manage products"
            icon="cube-outline"
            color={colors.warning}
            onPress={() => router.push('/admin/articles')}
          />
          <ActionCard
            title="Complaints"
            subtitle="Manage feedback"
            icon="chatbubbles-outline"
            color={colors.danger}
            onPress={() => router.push('/admin/complaints')}
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
  container: { flex: 1 },
  scroll: { paddingBottom: 100 },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: DesignTokens.spacing.sm,
    justifyContent: 'space-between',
  },

  /* period toggle */
  periodToggle: {
    flexDirection: 'row',
    marginHorizontal: DesignTokens.spacing.lg,
    marginBottom: DesignTokens.spacing.md,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: 4,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: DesignTokens.borderRadius.lg - 2,
    alignItems: 'center',
  },
  periodLabel: {
    ...DesignTokens.typography.caption,
    fontWeight: '700',
  },

  /* analytics card */
  analyticsCard: {
    marginHorizontal: DesignTokens.spacing.lg,
    marginBottom: DesignTokens.spacing.md,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing.lg,
    ...DesignTokens.shadows.sm,
  },
  analyticsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: DesignTokens.spacing.md,
  },
  analyticsTitle: {
    ...DesignTokens.typography.bodyBold,
  },

  /* visit row */
  visitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.md,
  },
  visitStat: { alignItems: 'center' },
  visitValue: { ...DesignTokens.typography.h3 },
  visitLabel: { ...DesignTokens.typography.caption },
  ratePill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  rateText: { fontSize: 18, fontWeight: '800' },

  section: { paddingHorizontal: DesignTokens.spacing.lg, marginBottom: DesignTokens.spacing.sm },
  actionGrid: { paddingHorizontal: DesignTokens.spacing.lg },
});
