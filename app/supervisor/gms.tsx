import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppMapView, { Marker, PROVIDER_DEFAULT } from '../../components/AppMapView';
import { BottomNav } from '../../components/ui/BottomNav';
import { Button } from '../../components/ui/Button';
import { Card, StatCard } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { SUPERVISOR_NAV_ITEMS } from '../../constants/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../hooks/useFonts';
import { GMS, GMSService } from '../../services/gms.service';
import { NotificationService } from '../../services/notification.service';

const INITIAL_REGION = {
    latitude: 36.575,
    longitude: 10.05,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
};

export default function GMSPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();
    const colors = getColors(theme);
    const [gmsLocations, setGmsLocations] = useState<GMS[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [isPickingLocation, setIsPickingLocation] = useState(false);
    const [tempLocation, setTempLocation] = useState({ latitude: 36.575, longitude: 10.05 });
    const [newGms, setNewGms] = useState({
        name: '',
        address: '',
        type: 'Supermarket',
        city: 'Tunisia'
    });

    const mapRef = useRef<any>(null);

    useEffect(() => {
        loadStores();
    }, []);

    const loadStores = async () => {
        if (!refreshing) setLoading(true);
        try {
            const data = await GMSService.getAll();
            setGmsLocations(data);
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

    const handleAddRequest = async () => {
        if (!newGms.name || !newGms.address) {
            Alert.alert('Required', 'Please fill in name and address');
            return;
        }

        // Include picked coordinates and requester ID in the request
        const finalData = { ...newGms, ...tempLocation, requester_id: user?.id };
        console.log('[Supervisor] Sending GMS Request:', finalData);

        const success = await NotificationService.notifyAdmins({
            title: 'New GMS Approval Request',
            message: `Supervisor requested to add ${newGms.name} in ${newGms.city}.`,
            type: 'new_gms' as any, // Using 'new_gms' type for the filter
            icon: 'storefront',
            action_link: JSON.stringify(finalData)
        });

        if (success) {
            Alert.alert('Success', 'Request sent to administrator for approval');
            setShowAddModal(false);
            setNewGms({ name: '', address: '', type: 'Supermarket', city: 'Tunisia' });
            setIsPickingLocation(false);
        } else {
            Alert.alert('Error', 'Failed to send request to admin');
        }
    };

    const filteredLocations = gmsLocations.filter(loc =>
        loc.name.toLowerCase().includes(searchText.toLowerCase()) ||
        loc.address?.toLowerCase().includes(searchText.toLowerCase()) ||
        loc.city?.toLowerCase().includes(searchText.toLowerCase())
    );

    const getTypeColor = (type?: string) => {
        if (!type) return colors.primary;
        return type.toLowerCase().includes('hyper') ? colors.secondary : colors.primary;
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

    const gmsStats = {
        total: gmsLocations.length,
        hypermarkets: gmsLocations.filter(g => g.type?.toLowerCase().includes('hyper')).length,
        supermarkets: gmsLocations.filter(g => !g.type?.toLowerCase().includes('hyper')).length,
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header
                title="GMS Locations"
                subtitle="Manage retail points of sale"
                showBack
                rightIcon="add-outline"
                onRightIconPress={() => setShowAddModal(true)}
                secondRightIcon="search-outline"
                onSecondRightIconPress={() => setIsSearchVisible(!isSearchVisible)}
            />

            {/* View Mode Toggle */}
            <View style={[styles.toggleContainer, { backgroundColor: colors.surfaceSecondary }]}>
                <TouchableOpacity
                    style={[styles.toggleBtn, viewMode === 'list' && { backgroundColor: colors.primary }]}
                    onPress={() => setViewMode('list')}
                >
                    <Ionicons name="list" size={18} color={viewMode === 'list' ? '#fff' : colors.textSecondary} />
                    <Text style={[styles.toggleText, { color: viewMode === 'list' ? '#fff' : colors.textSecondary }]}>List</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleBtn, viewMode === 'map' && { backgroundColor: colors.primary }]}
                    onPress={() => setViewMode('map')}
                >
                    <Ionicons name="map" size={18} color={viewMode === 'map' ? '#fff' : colors.textSecondary} />
                    <Text style={[styles.toggleText, { color: viewMode === 'map' ? '#fff' : colors.textSecondary }]}>Map</Text>
                </TouchableOpacity>
            </View>

            {isSearchVisible && (
                <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
                    <Ionicons name="search" size={20} color={colors.textMuted} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search locations..."
                        placeholderTextColor={colors.textMuted}
                        value={searchText}
                        onChangeText={setSearchText}
                        autoFocus
                    />
                    {searchText !== '' && (
                        <Ionicons
                            name="close-circle"
                            size={20}
                            color={colors.textMuted}
                            onPress={() => setSearchText('')}
                        />
                    )}
                </View>
            )}

            {viewMode === 'list' ? (
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                >
                    <View style={styles.statsRow}>
                        <StatCard
                            label="Total GMS"
                            value={gmsStats.total.toString()}
                            icon="storefront"
                            color={colors.primary}
                        />
                        <StatCard
                            label="Hypermarkets"
                            value={gmsStats.hypermarkets.toString()}
                            icon="cart"
                            color={colors.secondary}
                        />
                    </View>

                    <SectionHeader
                        title="All Locations"
                    />

                    {loading && !refreshing ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    ) : filteredLocations.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="storefront-outline" size={48} color={colors.textMuted} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                {searchText ? 'No matches found' : 'No stores found'}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.listContainer}>
                            {filteredLocations.map((item) => (
                                <Card
                                    key={item.id}
                                    style={styles.storeCard}
                                    onPress={() => navigateToStore(item)}
                                >
                                    <View style={styles.cardContent}>
                                        <View style={[styles.iconContainer, { backgroundColor: getTypeColor(item.type) + '15' }]}>
                                            <Ionicons name="storefront" size={24} color={getTypeColor(item.type)} />
                                        </View>
                                        <View style={styles.cardInfo}>
                                            <Text style={[styles.gmsName, { color: colors.text }]}>{item.name}</Text>
                                            <Text style={[styles.gmsAddress, { color: colors.textSecondary }]} numberOfLines={1}>
                                                {item.address}
                                            </Text>

                                            <View style={styles.tagRow}>
                                                <View style={[styles.tag, { backgroundColor: getTypeColor(item.type) + '10' }]}>
                                                    <Text style={[styles.tagText, { color: getTypeColor(item.type) }]}>{item.type || 'Store'}</Text>
                                                </View>
                                                {item.city && (
                                                    <View style={[styles.tag, { backgroundColor: colors.surfaceSecondary }]}>
                                                        <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
                                                        <Text style={[styles.tagText, { color: colors.textSecondary }]}>{item.city}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                                    </View>
                                </Card>
                            ))}
                        </View>
                    )}
                </ScrollView>
            ) : (
                <View style={styles.mapContainer}>
                    <AppMapView
                        ref={mapRef}
                        provider={PROVIDER_DEFAULT}
                        style={styles.map}
                        initialRegion={INITIAL_REGION}
                        onRegionChangeComplete={(region: any) => {
                            if (isPickingLocation) {
                                setTempLocation({
                                    latitude: region.latitude,
                                    longitude: region.longitude
                                });
                            }
                        }}
                    >
                        {!isPickingLocation && filteredLocations.map((item) => (
                            <Marker
                                key={item.id}
                                coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                                title={item.name}
                                description={item.address}
                            />
                        ))}
                    </AppMapView>

                    {isPickingLocation && (
                        <>
                            <View style={styles.pickerMarkerContainer} pointerEvents="none">
                                <Ionicons name="location" size={40} color={colors.primary} />
                                <View style={[styles.pickerDot, { backgroundColor: colors.primary }]} />
                            </View>

                            <View style={styles.pickerOverlay}>
                                <TouchableOpacity
                                    style={[styles.confirmLocationBtn, { backgroundColor: colors.primary }]}
                                    onPress={() => {
                                        setIsPickingLocation(false);
                                        setShowAddModal(true);
                                    }}
                                >
                                    <View style={styles.confirmContent}>
                                        <Ionicons name="checkmark-circle" size={24} color="#fff" />
                                        <Text style={styles.confirmText}>Confirm Position</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.cancelLocationBtn, { backgroundColor: colors.surface }]}
                                    onPress={() => {
                                        setIsPickingLocation(false);
                                        setShowAddModal(true);
                                    }}
                                >
                                    <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            )}

            {/* Add GMS Modal */}
            <Modal visible={showAddModal} transparent animationType="slide">
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Request New Location</Text>
                            <Ionicons name="close" size={24} color={colors.textSecondary} onPress={() => setShowAddModal(false)} />
                        </View>
                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>LOCATION NAME</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                                value={newGms.name}
                                onChangeText={(t) => setNewGms({ ...newGms, name: t })}
                                placeholder="Store name..."
                                placeholderTextColor={colors.textMuted}
                            />
                            <Text style={[styles.label, { color: colors.textSecondary }]}>FULL ADDRESS</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                                value={newGms.address}
                                onChangeText={(t) => setNewGms({ ...newGms, address: t })}
                                placeholder="Complete street address..."
                                placeholderTextColor={colors.textMuted}
                            />

                            <Text style={[styles.label, { color: colors.textSecondary }]}>GEOGRAPHIC POSITION</Text>
                            <TouchableOpacity
                                style={[styles.mapSelectBtn, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
                                onPress={() => {
                                    setShowAddModal(false);
                                    setViewMode('map');
                                    setIsPickingLocation(true);
                                }}
                            >
                                <View style={styles.mapSelectBtnContent}>
                                    <Ionicons name="map-outline" size={20} color={colors.primary} />
                                    <Text style={[styles.mapSelectBtnText, { color: colors.textSecondary }]}>
                                        {isPickingLocation ? "Position Selected" : "Select on the Map"}
                                    </Text>
                                </View>
                                {isPickingLocation && <Ionicons name="checkmark-circle" size={20} color={colors.success} />}
                            </TouchableOpacity>

                            <Text style={[styles.label, { color: colors.textSecondary }]}>TYPE</Text>
                            <View style={styles.typeRow}>
                                {['Supermarket', 'Hypermarket'].map((t) => (
                                    <Button
                                        key={t}
                                        title={t}
                                        variant={newGms.type === t ? 'primary' : 'ghost'}
                                        onPress={() => setNewGms({ ...newGms, type: t })}
                                        style={styles.typeBtn}
                                    />
                                ))}
                            </View>
                            <Button
                                title="Send Request to Admin"
                                variant="primary"
                                fullWidth
                                style={styles.submitBtn}
                                onPress={handleAddRequest}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <BottomNav items={SUPERVISOR_NAV_ITEMS} activeRoute="/supervisor/gms" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingBottom: 120 },
    toggleContainer: {
        flexDirection: 'row',
        marginHorizontal: DesignTokens.spacing.lg,
        marginVertical: DesignTokens.spacing.md,
        borderRadius: 12,
        padding: 4,
    },
    toggleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        gap: 8,
    },
    toggleText: {
        ...DesignTokens.typography.caption,
        fontFamily: Fonts.bodyBold,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: DesignTokens.spacing.lg,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        marginTop: 10,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    searchInput: { flex: 1, fontSize: 15, fontFamily: Fonts.bodyMedium },
    statsRow: { flexDirection: 'row', padding: DesignTokens.spacing.sm, gap: DesignTokens.spacing.sm },
    listContainer: { paddingHorizontal: DesignTokens.spacing.lg, gap: DesignTokens.spacing.md },
    storeCard: { padding: DesignTokens.spacing.md },
    cardContent: { flexDirection: 'row', alignItems: 'center' },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    cardInfo: { flex: 1 },
    gmsName: { ...DesignTokens.typography.bodyBold, fontSize: 16 },
    gmsAddress: { ...DesignTokens.typography.caption, marginTop: 2 },
    tagRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8
    },
    tagText: { ...DesignTokens.typography.tiny, fontFamily: Fonts.bodyBold },
    mapContainer: {
        flex: 1,
        marginBottom: 80,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    pickerMarkerContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -38,
        marginLeft: -20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pickerDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: -4,
    },
    pickerOverlay: {
        position: 'absolute',
        bottom: 120,
        left: 20,
        right: 20,
        gap: 10,
    },
    confirmLocationBtn: {
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    confirmContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    confirmText: {
        color: '#fff',
        ...DesignTokens.typography.bodyBold,
    },
    cancelLocationBtn: {
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    cancelText: {
        ...DesignTokens.typography.body,
    },
    loadingContainer: { padding: 60, alignItems: 'center' },
    emptyContainer: { padding: 60, alignItems: 'center', gap: 16 },
    emptyText: { ...DesignTokens.typography.body, textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { ...DesignTokens.typography.h2 },
    modalBody: { gap: 16 },
    label: { fontSize: 11, fontFamily: Fonts.bodyBold, marginBottom: -8 },
    input: { padding: 14, borderWidth: 1, borderRadius: 14, fontSize: 15 },
    mapSelectBtn: {
        height: 52,
        borderRadius: 14,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    mapSelectBtnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    mapSelectBtnText: {
        fontSize: 15,
        fontFamily: Fonts.bodyMedium,
    },
    typeRow: { flexDirection: 'row', gap: 12 },
    typeBtn: { flex: 1 },
    submitBtn: { marginTop: 12 },
});
