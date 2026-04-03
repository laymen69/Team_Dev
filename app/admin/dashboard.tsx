import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminWebLayout } from '../../components/admin/WebLayout';
import { BottomNav } from '../../components/ui/BottomNav';
import { ActionCard, StatCard as MobileStatCard } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { SettingsDrawer, SettingsItemType } from '../../components/ui/SettingsDrawer';
import { getFullImageUrl } from '../../constants/api';
import { getColors } from '../../constants/designSystem';
import { ADMIN_NAV_ITEMS } from '../../constants/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../hooks/useFonts';
import { ExportService } from '../../services/export.service';
import { GMSService } from '../../services/gms.service';
import { Report, ReportService } from '../../services/report.service';
import { UserService } from '../../services/user.service';
import { User } from '../../types/auth';
import PremiumGlowButton from '../button';

// ── Helpers ──────────────────────────────────────────────────────────────────
function isWithinDays(dateStr: string, days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return new Date(dateStr) >= cutoff;
}

function getRelativeTime(dateStr: string) {
  const h = Math.round((Date.now() - new Date(dateStr).getTime()) / 3_600_000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Yesterday';
  return d < 7 ? `${d} days ago` : new Date(dateStr).toLocaleDateString();
}

// Build chart buckets for Weekly (7 days) or Monthly (last 6 months) grouped by GMS
function buildChartData(reports: Report[], stores: any[], period: 'weekly' | 'monthly') {
  const topStores = stores.slice(0, 4); // Max 4 stores for grouped bars
  const colors = ['#818cf8', '#22c55e', '#eab308', '#ef4444'];

  if (period === 'weekly') {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const label = d.toLocaleDateString('en', { weekday: 'short' });
      const dayStr = d.toISOString().slice(0, 10);
      const dayReports = reports.filter(r => r.created_at?.slice(0, 10) === dayStr);
      
      const bars = topStores.map((s, j) => ({
        value: dayReports.filter(r => r.gms_id === s.id).length,
        color: colors[j],
        id: s.id,
        name: s.name
      }));
      return { label, bars };
    });
  }

  // monthly: last 6 calendar months
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const label = d.toLocaleDateString('en', { month: 'short' });
    const yr = d.getFullYear(), mo = d.getMonth();
    const moReports = reports.filter(r => {
      const rd = new Date(r.created_at);
      return rd.getFullYear() === yr && rd.getMonth() === mo;
    });

    const bars = topStores.map((s, j) => ({
      value: moReports.filter(r => r.gms_id === s.id).length,
      color: colors[j],
      id: s.id,
      name: s.name
    }));
    return { label, bars };
  });
}

// ── Animated helpers ──────────────────────────────────────────────────────────
const AnimatedBar = ({ value, maxValue, color, delay }: { value: number; maxValue: number; color: string; delay: number }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(anim, { toValue: maxValue > 0 ? (value / maxValue) * 100 : 0, friction: 8, tension: 45, useNativeDriver: false }),
    ]).start();
  }, [value, maxValue]);
  return (
    <Animated.View style={{
      width: 14, borderRadius: 4,
      backgroundColor: color,
      height: anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
    }} />
  );
};

const AnimatedProgressBar = ({ pct, color }: { pct: number; color: string }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 700, useNativeDriver: false }).start();
  }, [pct]);
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: color + '25', overflow: 'hidden', marginTop: 6 }}>
      <Animated.View style={{
        height: '100%', borderRadius: 3, backgroundColor: color,
        width: anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
      }} />
    </View>
  );
};

// Hoverable stat card for web
const HoverStatCard = ({ title, value, icon, trend, trendUp, C, onPress }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const hoverIn = () => Animated.spring(scale, { toValue: 1.025, friction: 7, tension: 40, useNativeDriver: true }).start();
  const hoverOut = () => Animated.spring(scale, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true }).start();
  return (
    <View
      style={{ flex: 1, cursor: 'pointer' } as any}
      // @ts-ignore
      onMouseEnter={hoverIn} onMouseLeave={hoverOut}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={{ flex: 1 }}>
        <Animated.View style={[wSt.statCard, { backgroundColor: C.card, borderColor: C.border, transform: [{ scale }] }]}>
          <View style={wSt.statRow}>
            <Text style={[wSt.statTitle, { color: C.textMuted }]}>{title}</Text>
            <View style={[wSt.iconBox, { backgroundColor: C.surface }]}>
              <Ionicons name={icon} size={15} color={C.textMuted} />
            </View>
          </View>
          <Text style={[wSt.statValue, { color: C.text }]}>{value}</Text>
          <View style={[wSt.trendBadge, { backgroundColor: trendUp ? C.success + '22' : C.warning + '22' }]}>
            <Ionicons name={trendUp ? 'trending-up' : 'trending-down'} size={12} color={trendUp ? C.success : C.warning} />
            <Text style={[wSt.trendTxt, { color: trendUp ? C.success : C.warning }]}>{trend}</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

// HoverRow for table
const HoverRow = ({ children, C }: any) => {
  const bg = useRef(new Animated.Value(0)).current;
  return (
    <View
      // @ts-ignore
      onMouseEnter={() => Animated.timing(bg, { toValue: 1, duration: 150, useNativeDriver: false }).start()}
      onMouseLeave={() => Animated.timing(bg, { toValue: 0, duration: 150, useNativeDriver: false }).start()}
    >
      <Animated.View style={[
        wSt.tableRow, { borderBottomColor: C.border },
        { backgroundColor: bg.interpolate({ inputRange: [0, 1], outputRange: ['transparent', C.surface + '80'] }) }
      ]}>
        {children}
      </Animated.View>
    </View>
  );
};

const ActionMenu = ({ u, router, C, onDelete }: any) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ position: 'relative', zIndex: 999 }}>
      <TouchableOpacity
        style={[wSt.moreBtn, { borderColor: C.border, backgroundColor: open ? C.primary + '20' : 'transparent' }]}
        onPress={() => setOpen(!open)}
      >
        <Ionicons name="ellipsis-horizontal" size={16} color={open ? C.primary : C.textMuted} />
      </TouchableOpacity>
      {open && (
        <View style={{
          position: 'absolute', right: 0, top: 32, width: 140,
          backgroundColor: C.card, borderRadius: 8, borderWidth: 1, borderColor: C.border,
          shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
        }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderBottomWidth: 1, borderBottomColor: C.border }}
            onPress={() => { setOpen(false); router.push(`/admin/users?edit=${u.id}`); }}
          >
            <Ionicons name="pencil-outline" size={14} color={C.primary} />
            <Text style={{ color: C.text, fontSize: 13, fontFamily: Fonts.body }}>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10 }}
            onPress={() => { setOpen(false); onDelete(); }}
          >
            <Ionicons name="trash-outline" size={14} color={C.danger} />
            <Text style={{ color: C.danger, fontSize: 13, fontFamily: Fonts.body }}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const colors = getColors(theme);
  const isDark = theme === 'dark';

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [allGms, setAllGms] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, visits: 0, reports: 0, alerts: 0 });

  // Chart & analytics period
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  // Table filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tablePage, setTablePage] = useState(1);
  const PAGE_SIZE = 8;

  const mounted = useRef(true);
  useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  const loadData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const [users, reports, stores] = await Promise.all([
        UserService.getAll({ skip: 0, limit: 200 }),
        ReportService.getAll({ skip: 0, limit: 200 }),
        GMSService.getAll({ skip: 0, limit: 500 }),
      ]);
      if (!mounted.current) return;
      setAllUsers(users as unknown as User[]);
      setAllReports(reports);
      setAllGms(stores);
      setStats({
        users: users.length,
        visits: stores.length,
        reports: reports.length,
        alerts: reports.filter(r => r.status === 'pending').length,
      });
    } catch (e) {
      console.error(e);
    } finally {
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => { loadData(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); loadData(true); }, []);

  const chartData = buildChartData(allReports, allGms, period);
  let topMax = 10;
  chartData.forEach(d => d.bars.forEach(b => { if (b.value > topMax) topMax = b.value; }));
  const chartMax = topMax;

  // Analytics (weekly/monthly matching chart period)
  const periodDays = period === 'weekly' ? 7 : 30;
  const periodReports = allReports.filter(r => isWithinDays(r.created_at, periodDays));
  const approved = periodReports.filter(r => r.status === 'approved').length;
  const pending = periodReports.filter(r => r.status === 'pending').length;
  const rejected = periodReports.filter(r => r.status === 'rejected').length;
  const total = periodReports.length;
  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;

  // Table data
  const filteredUsers = allUsers.filter((u: any) => {
    const fn = u.first_name || u.firstName || '';
    const ln = u.last_name || u.lastName || '';
    const name = `${fn} ${ln}`.toLowerCase();
    const matchSearch = name.includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role.toLowerCase() === roleFilter.toLowerCase();
    const userStatus = u.status || 'active';
    const matchStatus = statusFilter === 'All' || userStatus.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchRole && matchStatus;
  });
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(tablePage, totalPages);
  const pageUsers = filteredUsers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const adminName = user ? `${(user as any).first_name || user.firstName || ''} ${(user as any).last_name || user.lastName || ''}`.trim() || 'Admin' : 'Admin';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Mobile settings items
  const settingsItems: SettingsItemType[] = [
    { icon: 'image-outline', label: 'Reports', color: colors.success, onPress: () => { setSettingsVisible(false); router.push('/admin/before-after'); } },
    { icon: 'newspaper-outline', label: 'Articles', color: colors.primary, onPress: () => { setSettingsVisible(false); router.push('/admin/articles'); } },
    { icon: 'chatbubbles-outline', label: 'Complaints', color: colors.warning, onPress: () => { setSettingsVisible(false); router.push('/admin/complaints'); } },
    { icon: isDark ? 'sunny' : 'moon', label: 'Toggle Dark Mode', color: colors.warning, onPress: () => toggleTheme() },
    { icon: 'log-out-outline', label: 'Sign Out', color: colors.danger, isDestructive: true, onPress: () => { setSettingsVisible(false); signOut(); } },
  ];

  // ─────────────── WEB LAYOUT ────────────────────────────────────────────────
  if (Platform.OS === 'web') {
    // Derive a set of rich web colors from theme
    const C = {
      bg: isDark ? '#09090b' : '#f4f4f5',
      card: isDark ? '#0f0f12' : '#ffffff',
      surface: isDark ? '#27272a' : '#f4f4f5',
      border: isDark ? '#27272a' : '#e4e4e7',
      text: isDark ? '#fafafa' : '#09090b',
      textMuted: isDark ? '#a1a1aa' : '#71717a',
      primary: '#818cf8',
      success: '#22c55e',
      warning: '#eab308',
      danger: '#ef4444',
      secondary: '#a78bfa',
    };

    return (
      <AdminWebLayout title="Dashboard">
        <View>
          {/* ── Page Header ─────────────────────────────────── */}
          <View style={wSt.pageHeader}>
            <View>
              <Text style={[wSt.greeting, { color: C.text }]}>{greeting}, {adminName} 👋</Text>
              <Text style={[wSt.greetingSub, { color: C.textMuted }]}>
                {new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              {/* Dark mode toggle */}
              <TouchableOpacity
                style={[wSt.iconActionBtn, { borderColor: C.border, backgroundColor: C.card }]}
                onPress={toggleTheme}
              >
                <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color={C.text} />
              </TouchableOpacity>

              <PremiumGlowButton
                title="Export"
                onPress={() => ExportService.downloadDailyReport(new Date().toISOString().slice(0, 10))}
                icon="download-outline"
                variant="glass"
                style={{ minWidth: 100, height: 40 }}
                pulse={false}
              />

              <PremiumGlowButton
                title="Add User"
                onPress={() => router.push('/admin/users')}
                icon="add"
                variant="primary"
                style={{ minWidth: 120, height: 40 }}
                pulse={true}
              />
            </View>
          </View>

          {/* ── KPI Row ─────────────────────────────────────── */}
          <View style={wSt.kpiRow}>
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <View key={i} style={[wSt.statCard, { backgroundColor: C.card, borderColor: C.border, flex: 1, minHeight: 80, justifyContent: 'center', opacity: 0.5 }]} />
              ))
            ) : (
              <>
                <HoverStatCard C={C} title="Total Staff" value={stats.users} icon="people-outline" trend="+12% this month" trendUp onPress={() => router.push('/admin/users')} />
                <HoverStatCard C={C} title="Locations" value={stats.visits} icon="map-outline" trend="All time" trendUp onPress={() => router.push('/admin/gms')} />
                <HoverStatCard C={C} title="Total Events" value={stats.reports} icon="document-text-outline" trend="+18% this week" trendUp onPress={() => router.push('/admin/before-after')} />
                <HoverStatCard C={C} title="Pending Alerts" value={stats.alerts} icon="warning-outline" trend={`${pct(pending)}% of total`} trendUp={false} onPress={() => router.push('/admin/before-after')} />
              </>
            )}
          </View>

          {/* ── Middle Row: Chart + Recent Reports ─────────── */}
          <View style={[wSt.midRow, { gap: 20, marginBottom: 20 }]}>

            {/* Activity Chart */}
            <View style={[wSt.card, { flex: 1.6, backgroundColor: C.card, borderColor: C.border }]}>
              <View style={wSt.cardHeader}>
                <Text style={[wSt.cardTitle, { color: C.text }]}>Activity Trends</Text>
                {/* Period toggle */}
                <View style={[wSt.pillToggle, { backgroundColor: C.surface, borderColor: C.border }]}>
                  {(['weekly', 'monthly'] as const).map(p => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setPeriod(p)}
                      style={[wSt.pillBtn, period === p && { backgroundColor: C.primary }]}
                    >
                      <Text style={[wSt.pillTxt, { color: period === p ? '#fff' : C.textMuted }]}>
                        {p === 'weekly' ? 'Weekly' : 'Monthly'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Legend map */}
              <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                {allGms.slice(0, 4).map((s: any, i: number) => (
                  <View key={s.id || i} style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: ['#818cf8', '#22c55e', '#eab308', '#ef4444'][i] }} />
                    <Text style={{ fontSize: 12, color: C.textMuted, fontFamily: Fonts.body }}>{s.name || `Store ${s.id}`}</Text>
                  </View>
                ))}
              </View>

              {/* Chart canvas */}
              <View style={{ height: 200, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingLeft: 36, position: 'relative' }}>
                {/* Grid lines */}
                <View style={{ position: 'absolute', top: 0, bottom: 24, left: 0, right: 0, justifyContent: 'space-between' }}>
                  {[100, 75, 50, 25, 0].map(v => (
                    <View key={v} style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ width: 28, fontSize: 10, color: C.textMuted, textAlign: 'right', marginRight: 6 }}>
                        {Math.round(v * chartMax / 100)}
                      </Text>
                      <View style={{ flex: 1, height: 1, backgroundColor: isDark ? '#ffffff0a' : '#00000008' }} />
                    </View>
                  ))}
                </View>

                {/* Bar groups */}
                {chartData.map((d, i) => (
                  <View key={d.label + i} style={{ alignItems: 'center', flex: 1, height: '100%' }}>
                    <TouchableOpacity 
                      style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 2, paddingBottom: 24, paddingHorizontal: 2 }}
                      onPress={() => router.push('/admin/before-after')}
                      activeOpacity={0.7}
                    >
                      {d.bars.map((b: any, j: number) => (
                        <AnimatedBar key={b.id || j} value={b.value} maxValue={chartMax} color={b.color} delay={i * 80 + j * 20} />
                      ))}
                    </TouchableOpacity>
                    <Text style={{ position: 'absolute', bottom: 2, fontSize: 10, color: C.textMuted, fontFamily: Fonts.body }}>{d.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Recent Reports */}
            <View style={[wSt.card, { flex: 1, backgroundColor: C.card, borderColor: C.border }]}>
              <View style={[wSt.cardHeader, { marginBottom: 12 }]}>
                <Text style={[wSt.cardTitle, { color: C.text }]}>Recent Reports</Text>
                <TouchableOpacity onPress={() => router.push('/admin/before-after')}>
                  <Text style={{ fontSize: 13, color: C.primary, fontFamily: Fonts.bodyBold }}>View All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {allReports.slice(0, 8).map(r => (
                  <TouchableOpacity key={r.id} onPress={() => router.push(`/admin/before-after?id=${r.id}`)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border + '50' }}>
                      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: r.status === 'approved' ? C.success + '22' : r.status === 'rejected' ? C.danger + '22' : C.warning + '22', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                      <Ionicons
                        name={r.status === 'approved' ? 'checkmark-circle' : r.status === 'rejected' ? 'close-circle' : 'time'}
                        size={18}
                        color={r.status === 'approved' ? C.success : r.status === 'rejected' ? C.danger : C.warning}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: C.text, fontSize: 13, fontFamily: Fonts.headingSemiBold }} numberOfLines={1}>{r.name}</Text>
                      <Text style={{ color: C.textMuted, fontSize: 11, fontFamily: Fonts.body }}>{r.type} · {getRelativeTime(r.created_at)}</Text>
                    </View>
                    <View style={{ borderWidth: 1, borderColor: r.status === 'approved' ? C.success : r.status === 'rejected' ? C.danger : C.warning, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: r.status === 'approved' ? C.success + '22' : r.status === 'rejected' ? C.danger + '22' : C.warning + '22' }}>
                      <Text style={{ fontSize: 10, color: r.status === 'approved' ? C.success : r.status === 'rejected' ? C.danger : C.warning, fontFamily: Fonts.secondaryBold, textTransform: 'capitalize' }}>{r.status}</Text>
                    </View>
                  </View>
                  </TouchableOpacity>
                ))}
                {!loading && allReports.length === 0 && (
                  <Text style={{ color: C.textMuted, textAlign: 'center', marginTop: 32, fontFamily: Fonts.body }}>No reports yet.</Text>
                )}
              </ScrollView>
            </View>
          </View>

          {/* ── Analytics Row ───────────────────────────────── */}
          <View style={[wSt.midRow, { gap: 20, marginBottom: 20 }]}>
            {/* Report Status */}
            <View style={[wSt.card, { flex: 1, backgroundColor: C.card, borderColor: C.border }]}>
              <View style={[wSt.cardHeader, { marginBottom: 16 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="bar-chart-outline" size={18} color={C.primary} />
                  <Text style={[wSt.cardTitle, { color: C.text }]}>
                    Report Status <Text style={{ color: C.textMuted, fontFamily: Fonts.body, fontSize: 13 }}>({total} total)</Text>
                  </Text>
                </View>
              </View>
              {[{ label: 'Approved', value: approved, max: total, color: C.success }, { label: 'Pending', value: pending, max: total, color: C.warning }, { label: 'Rejected', value: rejected, max: total, color: C.danger }].map(row => (
                <View key={row.label} style={{ marginBottom: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: C.textMuted, fontSize: 13, fontFamily: Fonts.body }}>{row.label}</Text>
                    <Text style={{ color: C.text, fontSize: 13, fontFamily: Fonts.headingSemiBold }}>{row.value} ({pct(row.value)}%)</Text>
                  </View>
                  <AnimatedProgressBar pct={pct(row.value)} color={row.color} />
                </View>
              ))}
            </View>

            {/* Team Breakdown */}
            <View style={[wSt.card, { flex: 1, backgroundColor: C.card, borderColor: C.border }]}>
              <View style={[wSt.cardHeader, { marginBottom: 16 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="people-outline" size={18} color={C.secondary} />
                  <Text style={[wSt.cardTitle, { color: C.text }]}>Team Breakdown</Text>
                </View>
              </View>
              {[
                { role: 'Supervisor', color: C.secondary, count: allUsers.filter(u => u.role === 'supervisor').length },
                { role: 'Merchandiser', color: C.primary, count: allUsers.filter(u => u.role === 'merchandiser').length },
              ].map(t => (
                <View key={t.role} style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, backgroundColor: t.color + '12', borderWidth: 1, borderColor: t.color + '30', marginBottom: 12 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: t.color + '25', justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
                    <Ionicons name={t.role === 'Supervisor' ? 'briefcase-outline' : 'person-outline'} size={20} color={t.color} />
                  </View>
                  <Text style={{ flex: 1, color: C.text, fontSize: 14, fontFamily: Fonts.headingSemiBold }}>{t.role}</Text>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: t.color, fontSize: 22, fontFamily: Fonts.heading }}>{t.count}</Text>
                    <Text style={{ color: C.textMuted, fontSize: 11 }}>members</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={[wSt.card, { backgroundColor: C.card, borderColor: C.border, padding: 0, overflow: 'hidden' }]}>
            {/* Toolbar */}
            <View style={[wSt.toolbar, { borderBottomColor: C.border }]}>
              <View style={[wSt.searchBox, { backgroundColor: isDark ? '#18181b' : '#f4f4f5', borderColor: C.border }]}>
                <Ionicons name="search" size={15} color={C.textMuted} />
                <TextInput
                  style={[wSt.searchInput, { color: C.text, outlineStyle: 'none' } as any]}
                  placeholder="Search members..."
                  placeholderTextColor={C.textMuted}
                  value={searchQuery}
                  onChangeText={t => { setSearchQuery(t); setTablePage(1); }}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => { setSearchQuery(''); setTablePage(1); }}>
                    <Ionicons name="close-circle" size={16} color={C.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                {(['All', 'Supervisor', 'Merchandiser']).map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[wSt.chip, { borderColor: C.border }, roleFilter === r && { backgroundColor: C.text, borderColor: C.text }]}
                    onPress={() => { setRoleFilter(r); setTablePage(1); }}
                  >
                    <Text style={[wSt.chipTxt, { color: roleFilter === r ? (isDark ? C.bg : '#fff') : C.textMuted }]}>{r}</Text>
                  </TouchableOpacity>
                ))}
                <View style={{ width: 1, height: 20, backgroundColor: C.border, marginHorizontal: 4 }} />
                {(['All', 'Active', 'Inactive']).map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[wSt.chip, { borderColor: C.border }, statusFilter === s && { backgroundColor: C.surface }]}
                    onPress={() => { setStatusFilter(s); setTablePage(1); }}
                  >
                    <Text style={[wSt.chipTxt, { color: statusFilter === s ? C.text : C.textMuted }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Table Header */}
            <View style={[wSt.tableHeader, { borderBottomColor: C.border, backgroundColor: isDark ? '#ffffff03' : '#00000003' }]}>
              <Text style={[wSt.th, { color: C.textMuted, width: 220 }]}>Member</Text>
              <Text style={[wSt.th, { color: C.textMuted, width: 120 }]}>Role</Text>
              <Text style={[wSt.th, { color: C.textMuted, width: 120 }]}>Status</Text>
              <Text style={[wSt.th, { color: C.textMuted, width: 140 }]}>Phone</Text>
              <Text style={[wSt.th, { color: C.textMuted, width: 140 }]}>Tags</Text>
              <Text style={[wSt.th, { color: C.textMuted, flex: 1 }]}>Address</Text>
              <Text style={[wSt.th, { color: C.textMuted, width: 80, textAlign: 'right' }]}>Actions</Text>
            </View>

            {/* Rows */}
            {pageUsers.map((u, i) => {
              const firstName = (u as any).first_name || u.firstName || '';
              const lastName = (u as any).last_name || u.lastName || '';
              const status = (u as any).status || 'active';
              const statusColor = status === 'active' ? C.success : status === 'inactive' ? C.danger : C.warning;
              return (
                <HoverRow key={u.id ?? i} C={C}>
                  <View style={{ width: 220, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: C.primary + '30', borderWidth: 1, borderColor: C.primary + '50', justifyContent: 'center', alignItems: 'center', marginRight: 10, overflow: 'hidden' }}>
                      {u.profileImage ? (
                        <Image source={{ uri: getFullImageUrl(u.profileImage) || '' }} style={{ width: 28, height: 28 }} />
                      ) : (
                        <Text style={{ color: C.primary, fontSize: 12, fontFamily: Fonts.headingSemiBold }}>{firstName?.[0] || '?'}</Text>
                      )}
                    </View>
                    <Text style={{ color: C.text, fontSize: 13, fontFamily: Fonts.headingSemiBold }} numberOfLines={1}>{firstName} {lastName}</Text>
                  </View>
                  <Text style={{ width: 120, color: C.textMuted, fontSize: 13, fontFamily: Fonts.body, textTransform: 'capitalize' }}>{u.role}</Text>
                  <View style={{ width: 120, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusColor, marginRight: 8 }} />
                    <Text style={{ color: C.textMuted, fontSize: 13, fontFamily: Fonts.body, textTransform: 'capitalize' }}>{status}</Text>
                  </View>
                  <Text style={{ width: 140, color: C.textMuted, fontSize: 13, fontFamily: Fonts.body }} numberOfLines={1}>{(u as any).phone || '-'}</Text>
                  <View style={{ width: 140, flexDirection: 'row', gap: 4 }}>
                    {((u as any).tags || '').split(',').filter(Boolean).slice(0, 2).map((tag: string, idx: number) => (
                      <View key={idx} style={{ backgroundColor: C.surface, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ fontSize: 10, color: C.textMuted }}>{tag.trim()}</Text>
                      </View>
                    ))}
                    {!((u as any).tags) && <Text style={{ color: C.textMuted, fontSize: 13 }}>-</Text>}
                  </View>
                  <Text style={{ flex: 1, color: C.textMuted, fontSize: 13, fontFamily: Fonts.body }} numberOfLines={1}>{(u as any).address || '-'}</Text>
                  <View style={{ width: 80, alignItems: 'flex-end', position: 'relative' }}>
                    <ActionMenu u={{ ...u, firstName, lastName }} router={router} C={C} onDelete={() => {
                        if (window.confirm(`Delete ${firstName} ${lastName}?`)) {
                            UserService.delete(u.id as unknown as number).then(() => loadData(true));
                        }
                    }} />
                  </View>
                </HoverRow>
              );
            })}

            {pageUsers.length === 0 && (
              <View style={{ padding: 48, alignItems: 'center' }}>
                <Ionicons name="people-outline" size={40} color={C.textMuted} style={{ marginBottom: 12 }} />
                <Text style={{ color: C.textMuted, fontFamily: Fonts.body }}>No members match your filters.</Text>
              </View>
            )}

            {/* Pagination */}
            <View style={[wSt.paginator, { borderTopColor: C.border }]}>
              <Text style={{ color: C.textMuted, fontSize: 13, fontFamily: Fonts.body }}>
                {pageUsers.length > 0 ? `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filteredUsers.length)}` : '0'} of {filteredUsers.length} results
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={[wSt.btnOutline, { borderColor: C.border, opacity: safePage <= 1 ? 0.4 : 1 }]}
                  disabled={safePage <= 1}
                  onPress={() => setTablePage(p => p - 1)}
                >
                  <Text style={[wSt.btnTxt, { color: C.text }]}>Previous</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[wSt.btnOutline, { borderColor: C.border, opacity: safePage >= totalPages ? 0.4 : 1 }]}
                  disabled={safePage >= totalPages}
                  onPress={() => setTablePage(p => p + 1)}
                >
                  <Text style={[wSt.btnTxt, { color: C.text }]}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </AdminWebLayout>
    );
  }

  // ─────────────── MOBILE LAYOUT ─────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={user?.firstName ?? 'Admin'}
        subtitle="Dashboard"
        avatar={user?.profileImage ? { uri: getFullImageUrl(user.profileImage) } : null}
        onAvatarPress={() => router.push('/admin/profile')}
        secondRightIcon="notifications-outline"
        onSecondRightIconPress={() => router.push('/admin/notifications')}
        rightIcon="settings-outline"
        onRightIconPress={() => setSettingsVisible(true)}
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 8 }}>
          <MobileStatCard label="Users" value={stats.users} icon="people" color={colors.primary} trend="Active" trendUp />
          <MobileStatCard label="Reports" value={stats.reports} icon="document-text" color={colors.secondary} />
          <MobileStatCard label="Alerts" value={stats.alerts} icon="warning" color={colors.warning} />
        </View>
        <SectionHeader title="Management" />
        <View style={{ paddingHorizontal: 16 }}>
          <ActionCard title="Manage Users" subtitle="Add, edit users" icon="people-circle-outline" color={colors.primary} onPress={() => router.push('/admin/users')} />
          <ActionCard title="View Reports" subtitle="Field analytics" icon="bar-chart-outline" color={colors.secondary} onPress={() => router.push('/admin/before-after')} />
          <ActionCard title="Articles" subtitle="Manage products" icon="cube-outline" color={colors.warning} onPress={() => router.push('/admin/articles')} />
          <ActionCard title="Planning" subtitle="Schedules" icon="calendar-outline" color={colors.success} onPress={() => router.push('/admin/planning')} />
        </View>
      </ScrollView>
      <BottomNav items={ADMIN_NAV_ITEMS} activeRoute="/admin/dashboard" />
      <SettingsDrawer visible={settingsVisible} onClose={() => setSettingsVisible(false)} items={settingsItems} />
    </SafeAreaView>
  );
}

// ── Web Styles (scoped, no global stylesheet pollution) ────────────────────
const wSt = StyleSheet.create({
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  greeting: { fontSize: 26, fontFamily: Fonts.heading, marginBottom: 4 },
  greetingSub: { fontSize: 13, fontFamily: Fonts.body },
  iconActionBtn: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  btnOutline: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 9, flexDirection: 'row', alignItems: 'center' },
  btnSolid: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 9, flexDirection: 'row', alignItems: 'center' },
  btnTxt: { fontSize: 13, fontFamily: Fonts.headingSemiBold },
  kpiRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  statCard: { borderWidth: 1, borderRadius: 16, padding: 20, flex: 1 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  statTitle: { fontSize: 13, fontFamily: Fonts.body },
  iconBox: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 30, fontFamily: Fonts.heading, marginBottom: 10 },
  trendBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  trendTxt: { fontSize: 12, fontFamily: Fonts.secondaryBold },
  midRow: { flexDirection: 'row' },
  card: { borderWidth: 1, borderRadius: 16, padding: 22 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontFamily: Fonts.headingSemiBold },
  pillToggle: { flexDirection: 'row', borderWidth: 1, borderRadius: 20, overflow: 'hidden', padding: 3 },
  pillBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, alignItems: 'center' },
  pillTxt: { fontSize: 12, fontFamily: Fonts.headingSemiBold },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, width: 240, gap: 8 },
  searchInput: { flex: 1, fontSize: 13, fontFamily: Fonts.body, padding: 0 },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  chipTxt: { fontSize: 12, fontFamily: Fonts.headingSemiBold },
  tableHeader: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 },
  th: { fontSize: 11, fontFamily: Fonts.secondaryBold, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  moreBtn: { padding: 6, borderRadius: 8, borderWidth: 1 },
  paginator: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderTopWidth: 1 },
});
