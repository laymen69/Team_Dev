import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../../components/ui/BottomNav';
import { Button } from '../../components/ui/Button';
import { ActionCard, Card, StatCard } from '../../components/ui/Card';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Header } from '../../components/ui/Header';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { SettingsItemType, SettingsModal } from '../../components/ui/SettingsModal';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { MERCHANDISER_NAV_ITEMS } from '../../constants/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../hooks/useFonts';
import { GMS, GMSService } from '../../services/gms.service';
import { LocationService, WorkdaySession } from '../../services/location.service';
import { Objective, ObjectiveService } from '../../services/objective.service';

export default function MerchandiserDashboard() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [confirmEndVisible, setConfirmEndVisible] = useState(false);
  const [workday, setWorkday] = useState<WorkdaySession | null>(null);
  const [activeVisit, setActiveVisit] = useState<any>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [elapsed, setElapsed] = useState('0m');
  const [stores, setStores] = useState<GMS[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const colors = getColors(theme);

  const loadData = async () => {
    if (!refreshing) setLoading(true);
    try {
      const [gmsData, objData] = await Promise.all([
        GMSService.getAll(),
        ObjectiveService.getAll()
      ]);
      setStores(gmsData);
      setObjectives(objData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    LocationService.getActiveSession().then(session => {
      if (session.workday) setWorkday(session.workday);
      if (session.visit) setActiveVisit(session.visit);
    });
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  useEffect(() => {
    if (!workday || workday.status !== 'active') return;
    const update = () => {
      const mins = LocationService.getSessionDuration(workday);
      setElapsed(LocationService.formatDuration(mins));
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [workday]);

  const handleStartWorkday = async () => {
    setGpsLoading(true);
    try {
      const session = await LocationService.startWorkday();
      if (session) {
        setWorkday(session);
        Alert.alert('Workday Started', 'GPS tracking is now active on the server.');
      } else {
        Alert.alert('GPS Error', 'Please enable GPS and try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start workday');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleEndWorkday = async () => {
    setGpsLoading(true);
    try {
      const success = await LocationService.endWorkday();
      if (success) {
        setWorkday(null);
        setActiveVisit(null);
        Alert.alert('Workday Ended', `Your shift has been recorded.`);
      }
    } catch (error: any) {
      Alert.alert('Cannot End Day', error.response?.data?.detail || 'Failed to end workday');
    } finally {
      setGpsLoading(false);
      setConfirmEndVisible(false);
    }
  };

  const merchandiserName = user ? `${user.firstName} ${user.lastName}` : 'Merchandiser';
  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const settingsItems: SettingsItemType[] = [
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      color: colors.primary,
      onPress: () => { setSettingsVisible(false); router.push('/merchandiser/notifications'); }
    },
    {
      icon: 'people',
      label: 'Reach a supervisor',
      color: colors.success,
      onPress: () => { setSettingsVisible(false); router.push('/merchandiser/supervisor'); }
    },
    {
      icon: 'calendar-outline',
      label: 'Request Leave',
      color: colors.success,
      onPress: () => { setSettingsVisible(false); router.push('/merchandiser/leave'); }
    },

    {
      icon: 'document-text-outline',
      label: 'Documents',
      color: colors.secondary,
      onPress: () => { setSettingsVisible(false); router.push('/merchandiser/documents'); }
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

  const overallProgress = objectives.length > 0
    ? objectives.reduce((acc, obj) => acc + (obj.current / Math.max(1, obj.target)), 0) / objectives.length
    : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={merchandiserName}
        subtitle={todayStr}
        avatar={user?.profileImage ? { uri: user.profileImage } : require('../../assets/images/pic.jpg')}
        secondRightIcon="notifications-outline"
        onSecondRightIconPress={() => router.push('/merchandiser/notifications')}
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
        {/* KPI Overview */}
        <View style={styles.statsGrid}>
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                label="STORES"
                value={stores.length.toString()}
                icon="storefront"
                color={colors.primary}
              />
              <StatCard
                label="PROGRESS"
                value={`${Math.round(overallProgress * 100)}%`}
                icon="trending-up"
                color={colors.success}
                trend="Today"
                trendUp
              />
            </>
          )}
        </View>

        {/* GPS Control Card */}
        <Card style={styles.gpsCard} elevation="md">
          <View style={styles.gpsHeader}>
            <View style={[styles.gpsIconBox, { backgroundColor: workday ? colors.success + '20' : colors.primary + '20' }]}>
              <Ionicons name="location" size={24} color={workday ? colors.success : colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.gpsLabel, { color: colors.text }]}>Working Session</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: workday ? colors.success : colors.textSecondary }]} />
                <Text style={[styles.statusText, { color: workday ? colors.success : colors.textSecondary }]}>
                  {workday ? `Active (${elapsed})` : 'Not Started'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.gpsControls}>
            {workday ? (
              <View style={styles.activeWorkdayControls}>
                <Button
                  title="Checkpoint"
                  variant="outline"
                  size="sm"
                  onPress={async () => {
                    const cp = await LocationService.addCheckpoint();
                    if (cp) Alert.alert('Checkpoint', 'Location saved!');
                  }}
                  icon="flag"
                  style={{ flex: 1 }}
                />
                <Button
                  title="End Day"
                  variant="danger"
                  size="sm"
                  onPress={() => setConfirmEndVisible(true)}
                  loading={gpsLoading}
                  style={{ flex: 1 }}
                />
              </View>
            ) : (
              <Button
                title="Start My Workday"
                variant="primary"
                fullWidth
                onPress={handleStartWorkday}
                loading={gpsLoading}
                icon="play"
              />
            )}
          </View>
        </Card>

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <View style={styles.quickActions}>
          <ActionCard
            title="Add Event"
            subtitle="Field activity"
            icon="add-circle"
            vertical
            color={colors.success}
            onPress={() => router.push('/merchandiser/events')}
          />
          <ActionCard
            title="View Map"
            subtitle="GPS markers"
            icon="map"
            vertical
            color={colors.secondary}
            onPress={() => router.push('/merchandiser/map')}
          />
        </View>

        {/* Daily Progress */}
        <SectionHeader
          title="Daily Goal"
          actionLabel="Objectives"
          onAction={() => { }}
        />
        <Card style={styles.progressCard}>
          <ProgressBar
            progress={overallProgress}
            label={`${stores.length} Route Points`}
            showPercentage
          />
          {objectives.length > 0 && (
            <View style={styles.progressInfo}>
              <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.progressSubtitle, { color: colors.textSecondary }]}>
                Next: {objectives[0].title}
              </Text>
            </View>
          )}
        </Card>

        {/* Route List */}
        <SectionHeader
          title="Today's Route"
          actionLabel="View All"
          onAction={() => router.push('/merchandiser/gms')}
        />

        <View style={styles.routeList}>
          {loading ? (
            Array(2).fill(0).map((_, i) => (
              <View key={i} style={{ marginBottom: 12 }}>
                <CardSkeleton />
              </View>
            ))
          ) : (
            stores.slice(0, 3).map((store, idx) => {
              const isVisitingThis = activeVisit?.gmsId === store.id;

              return (
                <Card
                  key={store.id}
                  onPress={() => router.push({ pathname: '/merchandiser/gms', params: { selectedId: store.id } })}
                  style={[styles.routeItem, isVisitingThis && { borderLeftWidth: 4, borderLeftColor: colors.primary }]}
                >
                  <View style={[styles.storeIconBox, { backgroundColor: colors.surfaceSecondary }]}>
                    <MaterialIcons name="storefront" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.storeName, { color: colors.text }]}>{store.name}</Text>
                    <Text style={[styles.storeAddress, { color: colors.textSecondary }]} numberOfLines={1}>
                      {store.address || store.city}
                    </Text>
                  </View>

                  {workday && !activeVisit && (
                    <Button
                      title="Visit"
                      size="sm"
                      variant="outline"
                      onPress={async () => {
                        setGpsLoading(true);
                        try {
                          const v = await LocationService.startVisit(store.id);
                          if (v) {
                            setActiveVisit(v);
                            Alert.alert('Visit Started', `You are now logged into ${store.name}`);
                          }
                        } catch (e: any) {
                          Alert.alert('Proximity Lock', e.message);
                        } finally {
                          setGpsLoading(false);
                        }
                      }}
                    />
                  )}

                  {isVisitingThis && (
                    <Button
                      title="End"
                      size="sm"
                      variant="danger"
                      onPress={async () => {
                        setGpsLoading(true);
                        const success = await LocationService.endVisit();
                        if (success) setActiveVisit(null);
                        setGpsLoading(false);
                      }}
                    />
                  )}

                  {!isVisitingThis && activeVisit && (
                    <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
                  )}

                  {!activeVisit && !workday && (
                    <Ionicons name="chevron-forward" size={20} color={colors.border} />
                  )}
                </Card>
              );
            })
          )}

          {!loading && stores.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="map-outline" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No stores on today's route.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNav items={MERCHANDISER_NAV_ITEMS} activeRoute="/merchandiser/dashboard" />

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        items={settingsItems}
      />

      <ConfirmModal
        visible={confirmEndVisible}
        title="End Workday?"
        message={`You have worked for ${elapsed}. Are you sure you want to end your shift?`}
        onConfirm={handleEndWorkday}
        onClose={() => setConfirmEndVisible(false)}
        confirmLabel="End Workday"
        variant="danger"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 120,
  },
  statsGrid: {
    flexDirection: 'row',
    padding: DesignTokens.spacing.sm,
    gap: DesignTokens.spacing.sm,
  },
  gpsCard: {
    margin: DesignTokens.spacing.lg,
    padding: DesignTokens.spacing.lg,
  },
  gpsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.md,
  },
  gpsIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsLabel: {
    ...DesignTokens.typography.bodyBold,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...DesignTokens.typography.caption,
    fontFamily: Fonts.bodySemiBold,
  },
  gpsControls: {
    marginTop: DesignTokens.spacing.lg,
  },
  activeWorkdayControls: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: DesignTokens.spacing.lg,
    gap: DesignTokens.spacing.md,
  },
  progressCard: {
    marginHorizontal: DesignTokens.spacing.lg,
    padding: DesignTokens.spacing.lg,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: DesignTokens.spacing.sm,
  },
  progressSubtitle: {
    ...DesignTokens.typography.caption,
  },
  routeList: {
    paddingHorizontal: DesignTokens.spacing.lg,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.sm,
    gap: DesignTokens.spacing.md,
  },
  storeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeName: {
    ...DesignTokens.typography.bodyBold,
  },
  storeAddress: {
    ...DesignTokens.typography.caption,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  emptyText: {
    ...DesignTokens.typography.body,
    textAlign: 'center',
  },
});
