import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../../components/ui/BottomNav';
import { Card } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { MERCHANDISER_NAV_ITEMS } from '../../constants/navigation';
import { useTheme } from '../../context/ThemeContext';
import { GMS, GMSService } from '../../services/gms.service';

export default function MerchandiserPlanning() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = getColors(theme);

    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [stores, setStores] = useState<GMS[]>([]);
    const [loading, setLoading] = useState(true);

    const loadStores = async () => {
        setLoading(true);
        // In a real app, this would filter by date. 
        // For now, we simulate pulling today's planned stores.
        const data = await GMSService.getAll();
        setStores(data);
        setLoading(false);
    };

    useEffect(() => { loadStores(); }, []);

    return (
        <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>
            <Header title="Planning" subtitle="Your monthly schedule" showBack />

            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                <Card style={s.calendarCard}>
                    <Calendar
                        current={selectedDate}
                        onDayPress={(day: any) => setSelectedDate(day.dateString)}
                        markedDates={{
                            [selectedDate]: { selected: true, selectedColor: colors.primary }
                        }}
                        theme={{
                            calendarBackground: colors.surface,
                            textSectionTitleColor: colors.textSecondary,
                            dayTextColor: colors.text,
                            todayTextColor: colors.primary,
                            selectedDayBackgroundColor: colors.primary,
                            selectedDayTextColor: '#fff',
                            monthTextColor: colors.text,
                            indicatorColor: colors.primary,
                            textDisabledColor: colors.textSecondary + '50',
                            arrowColor: colors.primary,
                        }}
                    />
                </Card>

                <SectionHeader title={`Planned for ${selectedDate}`} />

                {loading ? (
                    <Text style={[s.loadingTxt, { color: colors.textSecondary }]}>Loading plan...</Text>
                ) : stores.length > 0 ? (
                    stores.map((store) => (
                        <Card key={store.id} style={s.storeCard} onPress={() => router.push('/merchandiser/gms')}>
                            <View style={[s.iconBox, { backgroundColor: colors.primary + '18' }]}>
                                <Ionicons name="storefront" size={20} color={colors.primary} />
                            </View>
                            <View style={s.storeInfo}>
                                <Text style={[s.storeName, { color: colors.text }]}>{store.name}</Text>
                                <Text style={[s.storeCity, { color: colors.textSecondary }]}>{store.address} • {store.city}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                        </Card>
                    ))
                ) : (
                    <View style={s.empty}>
                        <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
                        <Text style={{ ...DesignTokens.typography.body, color: colors.textSecondary, marginTop: 12 }}>
                            No visits planned for this date.
                        </Text>
                    </View>
                )}
            </ScrollView>

            <BottomNav items={MERCHANDISER_NAV_ITEMS} activeRoute="/merchandiser/planning" />
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingBottom: 100 },
    calendarCard: { margin: DesignTokens.spacing.lg, padding: 8 },
    storeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: DesignTokens.spacing.lg,
        marginBottom: DesignTokens.spacing.sm,
        padding: DesignTokens.spacing.md,
        gap: 12
    },
    iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    storeInfo: { flex: 1 },
    storeName: { ...DesignTokens.typography.bodyBold },
    storeCity: { ...DesignTokens.typography.caption, marginTop: 4 },
    empty: { alignItems: 'center', paddingTop: 40 },
    loadingTxt: { textAlign: 'center', marginTop: 20 },
});
