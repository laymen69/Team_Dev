import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../../components/ui/BottomNav';
import { ActionCard, Card } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { PremiumPressable } from '../../components/ui/PremiumPressable';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { SUPERVISOR_NAV_ITEMS } from '../../constants/navigation';
import { useTheme } from '../../context/ThemeContext';
import { GMS, GMSService } from '../../services/gms.service';

export default function PlanningPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getColors(theme);
  const [stores, setStores] = useState<GMS[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    if (!refreshing) setLoading(true);
    try {
      const data = await GMSService.getAll();
      setStores(data);
    } catch (error) {
      console.error('Failed to load stores:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStores();
  };

  const navigateToStore = (store: GMS) => {
    router.push({
      pathname: '/supervisor/map',
      params: {
        lat: store.latitude.toString(),
        lng: store.longitude.toString(),
        storeName: store.name,
        zoom: '16',
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Planning"
        subtitle="Manage routes & visit progress"
        showBack
        rightIcon="calendar-outline"
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <SectionHeader title="Today's Overview" />

        <Card style={styles.progressCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Visit Progress</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                156 / 240 Visits Completed
              </Text>
            </View>
            <View style={[styles.percentBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.percentText, { color: colors.primary }]}>65%</Text>
            </View>
          </View>

          <ProgressBar
            progress={0.65}
            style={styles.progressBar}
            color={colors.primary}
          />

          <View style={styles.cardFooter}>
            <View style={styles.footerRow}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.footerMuted, { color: colors.textSecondary }]}>Estimated finish: 6:00 PM</Text>
            </View>
          </View>
        </Card>

        <SectionHeader title="Quick Management" />
        <View style={styles.actionGrid}>
          <ActionCard
            icon="people"
            title="Attendance"
            subtitle="View status"
            color={colors.primary}
            onPress={() => { }}
          />
          <ActionCard
            icon="document-text"
            title="Visit Logs"
            subtitle="Today's data"
            color={colors.secondary}
            onPress={() => { }}
          />
        </View>

        <SectionHeader
          title="Scheduled Visits"
          actionLabel="Manage"
          onAction={() => { }}
        />

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : stores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ color: colors.textSecondary }}>No stores found</Text>
          </View>
        ) : (
          <View style={styles.storeList}>
            {stores.slice(0, 5).map((store) => (
              <Card
                key={store.id}
                style={styles.storeCard}
                onPress={() => navigateToStore(store)}
              >
                <View style={[styles.storeIconWrap, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="storefront" size={20} color={colors.primary} />
                </View>
                <View style={styles.storeInfo}>
                  <Text style={[styles.storeName, { color: colors.text }]}>{store.name}</Text>
                  <Text style={[styles.storeAddr, { color: colors.textSecondary }]} numberOfLines={1}>
                    {store.address || store.city}
                  </Text>
                </View>
                <Ionicons name="navigate-circle" size={24} color={colors.primary} />
              </Card>
            ))}
          </View>
        )}

        <SectionHeader title="Route Map" />
        <PremiumPressable onPress={() => router.push('/supervisor/map')} style={styles.mapPressable}>
          <Card style={styles.mapCard}>
            <Image
              source={require('../../assets/images/map.png')}
              style={styles.mapImage}
            />
            <View style={[styles.mapOverlay, { backgroundColor: colors.surface + 'CC' }]}>
              <Ionicons name="map-outline" size={18} color={colors.primary} />
              <Text style={[styles.mapOverlayText, { color: colors.text }]}>Open Interactive Map</Text>
            </View>
          </Card>
        </PremiumPressable>
      </ScrollView>

      <BottomNav items={SUPERVISOR_NAV_ITEMS} activeRoute="/supervisor/planning" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 120 },
  progressCard: { marginHorizontal: DesignTokens.spacing.lg, padding: DesignTokens.spacing.lg },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { ...DesignTokens.typography.bodyBold, fontSize: 17 },
  cardSubtitle: { ...DesignTokens.typography.caption, marginTop: 2 },
  percentBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  percentText: { fontSize: 12, fontWeight: '800' },
  progressBar: { marginVertical: 8 },
  cardFooter: { marginTop: 12 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerMuted: { ...DesignTokens.typography.tiny },
  actionGrid: { flexDirection: 'column', gap: DesignTokens.spacing.md, paddingHorizontal: DesignTokens.spacing.lg },
  storeList: { paddingHorizontal: DesignTokens.spacing.lg, gap: DesignTokens.spacing.sm },
  storeCard: { flexDirection: 'row', alignItems: 'center', padding: DesignTokens.spacing.md, gap: 12 },
  storeIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  storeInfo: { flex: 1 },
  storeName: { ...DesignTokens.typography.bodyBold, fontSize: 15 },
  storeAddr: { ...DesignTokens.typography.caption },
  mapPressable: { marginHorizontal: DesignTokens.spacing.lg, borderRadius: 16, overflow: 'hidden' },
  mapCard: { height: 200, overflow: 'hidden', padding: 0, marginHorizontal: 0 },
  mapImage: { width: '100%', height: '100%' },
  mapOverlay: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  mapOverlayText: { fontSize: 13, fontWeight: '700' },
  loadingContainer: { padding: 40, alignItems: 'center' },
  emptyContainer: { padding: 40, alignItems: 'center' },
});
