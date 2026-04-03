import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ExpoLocation from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Keyboard,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminWebLayout } from '../../components/admin/WebLayout';
import AppMapView, { Marker, PROVIDER_DEFAULT } from '../../components/AppMapView';
import { Badge } from '../../components/ui/Badge';
import { BottomNav } from '../../components/ui/BottomNav';
import { Card, StatCard } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { ADMIN_NAV_ITEMS } from '../../constants/navigation';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../hooks/useFonts';
import { GMS, GMSService } from '../../services/gms.service';
import { UserService } from '../../services/user.service';
import { User } from '../../types/auth';

const { width } = Dimensions.get('window');

// Default region (Tunisia)
const INITIAL_REGION = {
    latitude: 36.575,
    longitude: 10.05,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
};

export default function GSMPage() {
    const { theme } = useTheme();
    const colors = getColors(theme);
    const isDark = theme === 'dark';

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

    // Data State
    const [stores, setStores] = useState<GMS[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [mapType, setMapType] = useState<any>('terrain');
    const [showsTraffic, setShowsTraffic] = useState(false);
    const [isLayerMenuVisible, setIsLayerMenuVisible] = useState(false);
    const [isPickingLocation, setIsPickingLocation] = useState(false);
    const [tempLocation, setTempLocation] = useState({ latitude: 36.575, longitude: 10.05 });

    const mapRef = useRef<any>(null);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newGMS, setNewGMS] = useState<Partial<GMS>>({
        name: '',
        address: '',
        latitude: 36.575,
        longitude: 10.05,
        city: 'Tunisia',
        type: 'Supermarket'
    });

    // Assignment State
    const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
    const [selectedStore, setSelectedStore] = useState<GMS | null>(null);
    const [merchandisers, setMerchandisers] = useState<User[]>([]);
    const [isUsersLoading, setIsUsersLoading] = useState(false);
    const [assignments, setAssignments] = useState<Record<number, string[]>>({});

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await GMSService.getAll();
            setStores(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Fetch stores error:', err);
            setError(err.message || 'Failed to connect to the database. Please try again.');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchStores();
    }, []);

    const handleCreateGMS = async () => {
        if (!newGMS.name || !newGMS.city) {
            Alert.alert('Missing Info', 'Please provide a store name and city.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Use the picked coordinates
            const storeData = { ...newGMS, ...tempLocation } as GMS;
            await GMSService.create(storeData);
            Alert.alert('Success', 'Store added to registry successfully.');
            setModalVisible(false);
            setNewGMS({
                name: '',
                address: '',
                latitude: 36.575,
                longitude: 10.05,
                city: 'Tunisia',
                type: 'Supermarket'
            });
            fetchStores();
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to create point of sale.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchMerchandisers = async () => {
        setIsUsersLoading(true);
        try {
            const allUsers = await UserService.getAll();
            setMerchandisers(allUsers.filter(u => u.role === 'merchandiser'));
        } catch (err) {
            console.error('Fetch merchandisers error:', err);
        } finally {
            setIsUsersLoading(false);
        }
    };

    const openAssignModal = (store: GMS) => {
        setSelectedStore(store);
        setIsAssignModalVisible(true);
        fetchMerchandisers();
    };

    const toggleAssignment = (storeId: number, merchId: string | number) => {
        const merchIdStr = String(merchId);
        setAssignments(prev => {
            const current = prev[storeId] || [];
            if (current.includes(merchIdStr)) {
                return { ...prev, [storeId]: current.filter(id => id !== merchIdStr) };
            } else {
                return { ...prev, [storeId]: [...current, merchIdStr] };
            }
        });
    };

    const saveAssignments = () => {
        Alert.alert('Success', `Assignments saved for ${selectedStore?.name}`);
        setIsAssignModalVisible(false);
    };

    const handleDeleteGMS = (store: GMS) => {
        Alert.alert(
            'Delete Store',
            `Are you sure you want to delete ${store.name}? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await GMSService.delete(store.id);
                            Alert.alert('Success', 'Store deleted successfully.');
                            fetchStores();
                        } catch (err: any) {
                            Alert.alert('Error', err.message || 'Failed to delete store.');
                        }
                    }
                }
            ]
        );
    };

    const locateUser = async () => {
        setIsLocating(true);
        try {
            const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Permission to access location was denied');
            }

            let location;
            try {
                location = await ExpoLocation.getCurrentPositionAsync({
                    accuracy: ExpoLocation.Accuracy.Balanced,
                }) as ExpoLocation.LocationObject;
            } catch (err) {
                console.log('[Location] Timeout or error getting current position, trying last known...');
                location = await ExpoLocation.getLastKnownPositionAsync();
            }

            if (!location) {
                throw new Error('Could not verify current location. Please ensure GPS is enabled.');
            }

            const { latitude, longitude } = location.coords;
            setUserLocation({ latitude, longitude });

            mapRef.current?.animateToRegion({
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);

        } catch (error: any) {
            console.error('Error getting location:', error);
            Alert.alert('Location Error', error.message || 'Could not get your current location.');
        } finally {
            setIsLocating(false);
        }
    };

    const filteredStores = stores.filter(store => {
        const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (store.address || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    if (Platform.OS === 'web') {
        return (
            <AdminWebLayout title="Store Management">
                <View style={{ marginBottom: 32 }}>
                    <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
                        <StatCard label="STORES" value={stores.length} icon="storefront" color={colors.primary} />
                        <StatCard label="HYPERMARKETS" value={stores.filter(s => s.type === 'Hypermarket').length} icon="business" color={colors.success} />
                        <StatCard label="SUPERMARKETS" value={stores.filter(s => s.type === 'Supermarket').length} icon="cart" color={colors.secondary} />
                    </View>

                    <View style={{ flexDirection: 'row', gap: 20 }}>
                        <View style={[styles.searchBox, { flex: 1, marginHorizontal: 0, backgroundColor: colors.surfaceSecondary }]}>
                            <Ionicons name="search" size={20} color={colors.textMuted} />
                            <TextInput
                                style={[styles.searchInput, { color: colors.text }]}
                                placeholder="Search points of sale..."
                                placeholderTextColor={colors.textMuted}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                        <TouchableOpacity
                            style={{ backgroundColor: colors.primary, paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8 }}
                            onPress={() => setModalVisible(true)}
                        >
                            <Ionicons name="add-circle-outline" size={20} color="#fff" />
                            <Text style={{ color: '#fff', fontFamily: Fonts.headingSemiBold }}>Add New Store</Text>
                        </TouchableOpacity>
                    </View>

                    {/* View Toggle for Web */}
                    <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceSecondary, borderRadius: 12, padding: 4, marginTop: 16, width: 300 }}>
                        <TouchableOpacity
                            onPress={() => setViewMode('list')}
                            style={{ flex: 1, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: viewMode === 'list' ? colors.primary : 'transparent' }}
                        >
                            <Ionicons name="list" size={18} color={viewMode === 'list' ? '#fff' : colors.textSecondary} />
                            <Text style={{ color: viewMode === 'list' ? '#fff' : colors.textSecondary, fontWeight: '700' }}>List View</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setViewMode('map')}
                            style={{ flex: 1, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: viewMode === 'map' ? colors.primary : 'transparent' }}
                        >
                            <Ionicons name="map" size={18} color={viewMode === 'map' ? '#fff' : colors.textSecondary} />
                            <Text style={{ color: viewMode === 'map' ? '#fff' : colors.textSecondary, fontWeight: '700' }}>Map Explorer</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {error ? (
                    <View style={[styles.errorContainer, { backgroundColor: colors.surface, padding: 40, borderRadius: 24, alignItems: 'center' }]}>
                        <Ionicons name="alert-circle" size={64} color={colors.danger} />
                        <Text style={[styles.errorText, { color: colors.text, fontSize: 18, marginTop: 16 }]}>{error}</Text>
                        <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary, marginTop: 24, paddingHorizontal: 32 }]} onPress={fetchStores}>
                            <Text style={styles.retryBtnText}>Retry Connection</Text>
                        </TouchableOpacity>
                    </View>
                ) : isLoading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 100 }} />
                ) : viewMode === 'list' ? (
                    <View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 20, fontFamily: Fonts.headingSemiBold, color: colors.text }}>Registered Stores</Text>
                            <TouchableOpacity onPress={onRefresh} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons name="refresh" size={16} color={colors.primary} />
                                <Text style={{ color: colors.primary, fontWeight: '600' }}>Sync Data</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
                            {filteredStores.map(store => (
                                <View key={store.id} style={{ width: '31.5%' }}>
                                    <Card style={[styles.storeCard, { padding: 20, borderRadius: 20 }]}>
                                        <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                                            <View style={[styles.storeIcon, { backgroundColor: colors.primary + '10', width: 56, height: 56, borderRadius: 16 }]}>
                                                <MaterialIcons name="storefront" size={28} color={colors.primary} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.storeName, { fontSize: 18, color: colors.text }]} numberOfLines={1}>{store.name}</Text>
                                                <Badge label={store.type || 'STORE'} variant={store.type === 'Hypermarket' ? 'success' : 'primary'} size="sm" />
                                            </View>
                                        </View>

                                        <View style={{ gap: 8, marginBottom: 20 }}>
                                            <View style={styles.detailRow}>
                                                <Ionicons name="navigate-outline" size={14} color={colors.textSecondary} />
                                                <Text style={[styles.detailText, { fontSize: 13, color: colors.textSecondary }]} numberOfLines={1}>{store.address || 'No address'}</Text>
                                            </View>
                                            <View style={styles.detailRow}>
                                                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                                                <Text style={[styles.detailText, { fontSize: 13, color: colors.textSecondary }]}>{store.city || 'Unknown'}</Text>
                                            </View>
                                        </View>

                                        <View style={{ flexDirection: 'row', gap: 10 }}>
                                            <TouchableOpacity
                                                style={{ flex: 1, backgroundColor: colors.primary + '10', paddingVertical: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                                                onPress={() => openAssignModal(store)}
                                            >
                                                <Ionicons name="person-add" size={16} color={colors.primary} />
                                                <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>Assign</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={{ width: 44, height: 44, backgroundColor: colors.danger + '10', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}
                                                onPress={() => handleDeleteGMS(store)}
                                            >
                                                <Ionicons name="trash-outline" size={18} color={colors.danger} />
                                            </TouchableOpacity>
                                        </View>
                                    </Card>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={{ height: 600, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, position: 'relative' }}>
                        <AppMapView
                            ref={mapRef}
                            style={{ flex: 1 }}
                            initialRegion={INITIAL_REGION}
                            mapType={mapType}
                        >
                            {filteredStores.map(store => (
                                <Marker
                                    key={store.id}
                                    coordinate={{
                                        latitude: store.latitude,
                                        longitude: store.longitude
                                    }}
                                    title={store.name}
                                    description={store.address}
                                    pinColor={store.type === 'Hypermarket' ? 'green' : 'indigo'}
                                />
                            ))}
                            {userLocation && (
                                <Marker
                                    coordinate={userLocation}
                                    title="You are here"
                                    pinColor="red"
                                />
                            )}
                        </AppMapView>

                        {/* Floating Controls for Web */}
                        <View style={{ position: 'absolute', top: 20, right: 20, gap: 12, zIndex: 1000 }}>
                            <TouchableOpacity
                                style={{ backgroundColor: colors.surface, width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }}
                                onPress={() => setIsLayerMenuVisible(!isLayerMenuVisible)}
                            >
                                <MaterialIcons name="layers" size={24} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ backgroundColor: colors.surface, width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }}
                                onPress={locateUser}
                            >
                                {isLocating ? (
                                    <ActivityIndicator size="small" color={colors.primary} />
                                ) : (
                                    <MaterialIcons name="my-location" size={24} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Layer Selection Menu for Web */}
                        {isLayerMenuVisible && (
                            <View style={{ position: 'absolute', top: 80, right: 20, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 8, gap: 4, zIndex: 1000, width: 160, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 10 }}>
                                <TouchableOpacity
                                    style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, backgroundColor: mapType === 'terrain' ? colors.primary + '15' : 'transparent' }}
                                    onPress={() => { setMapType('terrain'); setIsLayerMenuVisible(false); }}
                                >
                                    <MaterialIcons name="terrain" size={20} color={mapType === 'terrain' ? colors.primary : colors.textSecondary} />
                                    <Text style={{ fontWeight: '700', color: mapType === 'terrain' ? colors.primary : colors.text, fontSize: 13 }}>Relief View</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, backgroundColor: mapType === 'satellite' ? colors.primary + '15' : 'transparent' }}
                                    onPress={() => { setMapType('satellite'); setIsLayerMenuVisible(false); }}
                                >
                                    <MaterialIcons name="satellite" size={20} color={mapType === 'satellite' ? colors.primary : colors.textSecondary} />
                                    <Text style={{ fontWeight: '700', color: mapType === 'satellite' ? colors.primary : colors.text, fontSize: 13 }}>Satellite</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {/* Modals for Web */}
                <Modal visible={modalVisible} transparent animationType="fade">
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={[styles.modalContent, { backgroundColor: colors.surface, width: '100%', maxWidth: 500, height: 'auto', borderRadius: 24, padding: 32 }]}>
                            <View style={[styles.modalHeader, { paddingHorizontal: 0, borderBottomWidth: 0, marginBottom: 24 }]}>
                                <Text style={[styles.modalTitle, { fontSize: 24, color: colors.text }]}>Add New Store</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={{ paddingHorizontal: 0 }}>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.text }]}>Store Name</Text>
                                    <TextInput
                                        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                                        value={newGMS.name}
                                        onChangeText={(t) => setNewGMS({ ...newGMS, name: t })}
                                        placeholder="Supermarket Name"
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.text }]}>Address</Text>
                                    <TextInput
                                        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                                        value={newGMS.address}
                                        onChangeText={(t) => setNewGMS({ ...newGMS, address: t })}
                                        placeholder="Full Address"
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', gap: 16 }}>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={[styles.label, { color: colors.text }]}>City</Text>
                                        <TextInput
                                            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                                            value={newGMS.city}
                                            onChangeText={(t) => setNewGMS({ ...newGMS, city: t })}
                                            placeholder="City"
                                        />
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={[styles.label, { color: colors.text }]}>Type</Text>
                                        <View style={{ flexDirection: 'row', gap: 4 }}>
                                            {['Supermarket', 'Hypermarket'].map(t => (
                                                <TouchableOpacity
                                                    key={t}
                                                    style={{ flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: newGMS.type === t ? colors.primary : colors.border, backgroundColor: newGMS.type === t ? colors.primary : 'transparent', alignItems: 'center' }}
                                                    onPress={() => setNewGMS({ ...newGMS, type: t as any })}
                                                >
                                                    <Text style={{ fontSize: 11, fontWeight: '700', color: newGMS.type === t ? '#fff' : colors.textSecondary }}>{t.toUpperCase()}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={{ backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 }}
                                    onPress={handleCreateGMS}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Register Store</Text>}
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                <Modal visible={isAssignModalVisible} transparent animationType="fade">
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={[styles.modalContent, { backgroundColor: colors.surface, width: '100%', maxWidth: 500, height: 'auto', borderRadius: 24, padding: 32 }]}>
                            <View style={[styles.modalHeader, { paddingHorizontal: 0, borderBottomWidth: 0, marginBottom: 8 }]}>
                                <View>
                                    <Text style={[styles.modalTitle, { fontSize: 24, color: colors.text }]}>Assign Staff</Text>
                                    <Text style={{ color: colors.textSecondary }}>To: {selectedStore?.name}</Text>
                                </View>
                                <TouchableOpacity onPress={() => setIsAssignModalVisible(false)}>
                                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={{ marginVertical: 20, maxHeight: 400 }}>
                                {merchandisers.map(merch => {
                                    const isAssigned = selectedStore ? (assignments[selectedStore.id] || []).includes(String(merch.id)) : false;
                                    return (
                                        <TouchableOpacity
                                            key={merch.id}
                                            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 }}
                                            onPress={() => selectedStore && toggleAssignment(selectedStore.id, merch.id)}
                                        >
                                            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ color: colors.primary, fontWeight: '700' }}>{merch.firstName?.[0]}{merch.lastName?.[0]}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontWeight: '700', color: colors.text }}>{merch.firstName} {merch.lastName}</Text>
                                                <Text style={{ fontSize: 12, color: colors.textSecondary }}>{merch.email}</Text>
                                            </View>
                                            <Ionicons name={isAssigned ? "checkmark-circle" : "ellipse-outline"} size={24} color={isAssigned ? colors.success : colors.textMuted} />
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            <TouchableOpacity
                                style={{ backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' }}
                                onPress={saveAssignments}
                            >
                                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </AdminWebLayout>
        );
    }


    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header
                title="Store Management"
                subtitle="System-wide GMS Registry"
                rightIcon="add-circle-outline"
                onRightIconPress={() => setModalVisible(true)}
                showBack
            />

            {/* View Mode Toggle */}
            <View style={[styles.toggleContainer, { backgroundColor: colors.surfaceSecondary }]}>
                <TouchableOpacity
                    style={[styles.toggleBtn, viewMode === 'list' && { backgroundColor: colors.primary }]}
                    onPress={() => setViewMode('list')}
                >
                    <Ionicons name="list" size={18} color={viewMode === 'list' ? '#fff' : colors.textSecondary} />
                    <Text style={[styles.toggleText, { color: viewMode === 'list' ? '#fff' : colors.textSecondary }]}>List View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleBtn, viewMode === 'map' && { backgroundColor: colors.primary }]}
                    onPress={() => setViewMode('map')}
                >
                    <Ionicons name="map" size={18} color={viewMode === 'map' ? '#fff' : colors.textSecondary} />
                    <Text style={[styles.toggleText, { color: viewMode === 'map' ? '#fff' : colors.textSecondary }]}>Map Explorer</Text>
                </TouchableOpacity>
            </View>

            {viewMode === 'list' ? (
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    <View style={styles.statsRow}>
                        <StatCard label="STORES" value={stores.length} icon="storefront" color={colors.primary} />
                        <StatCard label="HYPER" value={stores.filter(s => s.type === 'Hypermarket').length} icon="business" color={colors.success} />
                        <StatCard label="SUPER" value={stores.filter(s => s.type === 'Supermarket').length} icon="cart" color={colors.secondary} />
                    </View>

                    <View style={[styles.searchBox, { backgroundColor: colors.surfaceSecondary }]}>
                        <Ionicons name="search" size={20} color={colors.textMuted} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Search points of sale..."
                            placeholderTextColor={colors.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    <SectionHeader title="Points of Sale" />

                    {error ? (
                        <View style={[styles.errorContainer, { backgroundColor: colors.surface }]}>
                            <Ionicons name="alert-circle" size={48} color={colors.danger} />
                            <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
                            <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={fetchStores}>
                                <Text style={styles.retryBtnText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : isLoading ? (
                        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
                    ) : (
                        <View style={styles.storesList}>
                            {filteredStores.map(store => (
                                <TouchableOpacity
                                    key={store.id}
                                    onPress={() => handleDeleteGMS(store)}
                                    activeOpacity={0.7}
                                >
                                    <Card style={styles.storeCard}>
                                        <View style={[styles.storeIcon, { backgroundColor: colors.surfaceSecondary }]}>
                                            <MaterialIcons name="storefront" size={24} color={colors.primary} />
                                        </View>
                                        <View style={styles.storeInfo}>
                                            <View style={styles.storeHeader}>
                                                <Text style={[styles.storeName, { color: colors.text }]}>{store.name}</Text>
                                            </View>
                                            <Text style={[styles.storeAddress, { color: colors.textSecondary }]}>{store.address || 'No address'}</Text>
                                            <View style={styles.detailRow}>
                                                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                                                <Text style={[styles.detailText, { color: colors.textSecondary }]}>{store.city || 'Unknown'}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.storeActions}>
                                            <Badge label={store.type || 'STORE'} variant={store.type === 'Hypermarket' ? 'success' : 'primary'} />
                                            <TouchableOpacity
                                                style={[styles.assignBtn, { backgroundColor: colors.primary + '15' }]}
                                                onPress={() => openAssignModal(store)}
                                            >
                                                <Ionicons name="person-add" size={16} color={colors.primary} />
                                                <Text style={[styles.assignBtnText, { color: colors.primary }]}>Assign</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </Card>
                                </TouchableOpacity>
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
                        mapType={mapType}
                        showsTraffic={showsTraffic}
                        onRegionChangeComplete={(region: any) => {
                            if (isPickingLocation) {
                                setTempLocation({
                                    latitude: region.latitude,
                                    longitude: region.longitude
                                });
                            }
                        }}
                    >
                        {filteredStores.map(store => (
                            <Marker
                                key={store.id}
                                coordinate={{
                                    latitude: store.latitude,
                                    longitude: store.longitude
                                }}
                                title={store.name}
                                description={store.address}
                            />
                        ))}
                        {userLocation && (
                            <Marker
                                coordinate={userLocation}
                                title="You are here"
                                pinColor={colors.primary}
                            />
                        )}
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
                                        setModalVisible(true);
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
                                        setModalVisible(true);
                                    }}
                                >
                                    <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {/* Layer Selection Menu */}
                    {isLayerMenuVisible && (
                        <View style={[styles.layerMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <TouchableOpacity
                                style={[styles.layerOption, mapType === 'terrain' && [styles.activeLayerOption, { backgroundColor: colors.primary }]]}
                                onPress={() => { setMapType('terrain'); setIsLayerMenuVisible(false); }}
                            >
                                <MaterialIcons name="terrain" size={20} color={mapType === 'terrain' ? '#fff' : colors.text} />
                                <Text style={[styles.layerOptionText, { color: mapType === 'terrain' ? '#fff' : colors.text }]}>Relief</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.layerOption, mapType === 'satellite' && [styles.activeLayerOption, { backgroundColor: colors.primary }]]}
                                onPress={() => { setMapType('satellite'); setIsLayerMenuVisible(false); }}
                            >
                                <MaterialIcons name="satellite" size={20} color={mapType === 'satellite' ? '#fff' : colors.text} />
                                <Text style={[styles.layerOptionText, { color: mapType === 'satellite' ? '#fff' : colors.text }]}>Satellite</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.layerOption, showsTraffic && [styles.activeLayerOption, { backgroundColor: colors.primary }]]}
                                onPress={() => { setShowsTraffic(!showsTraffic); setIsLayerMenuVisible(false); }}
                            >
                                <MaterialIcons name="traffic" size={20} color={showsTraffic ? '#fff' : colors.text} />
                                <Text style={[styles.layerOptionText, { color: showsTraffic ? '#fff' : colors.text }]}>Traffic</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.layerButton, { backgroundColor: colors.surface }]}
                        onPress={() => setIsLayerMenuVisible(!isLayerMenuVisible)}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="layers" size={24} color={colors.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.locateButton, { backgroundColor: colors.surface }]}
                        onPress={locateUser}
                        activeOpacity={0.7}
                        disabled={isLocating}
                    >
                        {isLocating ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <MaterialIcons name="my-location" size={24} color={colors.primary} />
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* Create GMS Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    Keyboard.dismiss();
                    setModalVisible(false);
                }}
                accessibilityViewIsModal={true}
            >
                <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface, borderTopLeftRadius: DesignTokens.borderRadius.xl, borderTopRightRadius: DesignTokens.borderRadius.xl }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>New Store</Text>
                            <TouchableOpacity onPress={() => {
                                Keyboard.dismiss();
                                setModalVisible(false);
                            }}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Store Name</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                    value={newGMS.name}
                                    onChangeText={(t) => setNewGMS({ ...newGMS, name: t })}
                                    placeholder="Supermarket Name"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Address</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                    value={newGMS.address}
                                    onChangeText={(t) => setNewGMS({ ...newGMS, address: t })}
                                    placeholder="Full Address"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>City</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                    value={newGMS.city}
                                    onChangeText={(t) => setNewGMS({ ...newGMS, city: t })}
                                    placeholder="City"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Location</Text>
                                <TouchableOpacity
                                    style={[styles.mapSelectBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
                                    onPress={() => {
                                        setModalVisible(false);
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
                                {!isPickingLocation && (
                                    <Text style={[styles.hintText, { color: colors.textMuted }]}>
                                        Touch to drop a pin for the store location
                                    </Text>
                                )}
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Type</Text>
                                <View style={styles.roleSelector}>
                                    {['Supermarket', 'Hypermarket', 'Mall'].map((t) => (
                                        <TouchableOpacity
                                            key={t}
                                            style={[
                                                styles.roleOption,
                                                newGMS.type === t && { backgroundColor: colors.primary, borderColor: colors.primary },
                                                { borderColor: colors.border }
                                            ]}
                                            onPress={() => setNewGMS({ ...newGMS, type: t })}
                                        >
                                            <Text style={[
                                                styles.roleOptionText,
                                                { color: newGMS.type === t ? '#fff' : colors.textSecondary }
                                            ]}>
                                                {t}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                                onPress={handleCreateGMS}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Add Store</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Assignment Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isAssignModalVisible}
                onRequestClose={() => setIsAssignModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24 }]}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>Assign Merchandiser</Text>
                                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>{selectedStore?.name}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setIsAssignModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.modalBody, { maxHeight: 400 }]}>
                            {isUsersLoading ? (
                                <ActivityIndicator size="large" color={colors.primary} style={{ margin: 40 }} />
                            ) : merchandisers.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Ionicons name="people-outline" size={48} color={colors.textMuted} />
                                    <Text style={{ color: colors.textSecondary, marginTop: 12 }}>No merchandisers found.</Text>
                                </View>
                            ) : (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {merchandisers.map(merch => {
                                        const isAssigned = selectedStore ? (assignments[selectedStore.id] || []).includes(String(merch.id)) : false;
                                        return (
                                            <TouchableOpacity
                                                key={merch.id}
                                                style={[styles.merchItem, { borderBottomColor: colors.border }]}
                                                onPress={() => selectedStore && toggleAssignment(selectedStore.id, merch.id)}
                                            >
                                                <View style={[styles.merchAvatar, { backgroundColor: colors.primary + '20' }]}>
                                                    <Text style={{ color: colors.primary, fontWeight: '700' }}>
                                                        {merch.firstName?.[0]}{merch.lastName?.[0]}
                                                    </Text>
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.merchName, { color: colors.text }]}>{merch.firstName} {merch.lastName}</Text>
                                                    <Text style={[styles.merchEmail, { color: colors.textSecondary }]}>{merch.email}</Text>
                                                </View>
                                                <Ionicons
                                                    name={isAssigned ? "checkmark-circle" : "ellipse-outline"}
                                                    size={24}
                                                    color={isAssigned ? colors.success : colors.textMuted}
                                                />
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            )}
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                                onPress={saveAssignments}
                            >
                                <Text style={styles.submitBtnText}>Save Assignments</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <BottomNav items={ADMIN_NAV_ITEMS} activeRoute="/admin/gsm" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    toggleContainer: {
        flexDirection: 'row',
        marginHorizontal: DesignTokens.spacing.lg,
        marginVertical: DesignTokens.spacing.md,
        borderRadius: DesignTokens.borderRadius.lg,
        padding: 4,
    },
    toggleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: DesignTokens.borderRadius.md,
        gap: 8,
    },
    toggleText: {
        ...DesignTokens.typography.caption,
        fontWeight: 'bold',
    },
    scroll: {
        paddingBottom: 100,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: DesignTokens.spacing.lg,
        gap: DesignTokens.spacing.sm,
        marginBottom: DesignTokens.spacing.lg,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: DesignTokens.spacing.lg,
        paddingHorizontal: DesignTokens.spacing.md,
        height: 50,
        borderRadius: DesignTokens.borderRadius.md,
        gap: 10,
        marginBottom: DesignTokens.spacing.md,
    },
    searchInput: {
        flex: 1,
        ...DesignTokens.typography.body,
    },
    storesList: {
        paddingHorizontal: DesignTokens.spacing.lg,
        gap: DesignTokens.spacing.md,
    },
    storeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: DesignTokens.spacing.md,
        gap: DesignTokens.spacing.md,
    },
    storeIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    storeInfo: {
        flex: 1,
        gap: 2,
    },
    storeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    storeName: {
        ...DesignTokens.typography.bodyBold,
    },
    storeAddress: {
        ...DesignTokens.typography.caption,
        fontSize: 11,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    detailText: {
        ...DesignTokens.typography.caption,
        fontSize: 10,
    },
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
    hintText: {
        fontSize: 12,
        marginTop: 6,
        fontStyle: 'italic',
    },
    errorContainer: {
        padding: DesignTokens.spacing.xl,
        alignItems: 'center',
        gap: DesignTokens.spacing.md,
        marginHorizontal: DesignTokens.spacing.lg,
        borderRadius: DesignTokens.borderRadius.lg,
    },
    errorText: {
        textAlign: 'center',
        ...DesignTokens.typography.body,
    },
    retryBtn: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: DesignTokens.borderRadius.md,
    },
    retryBtnText: {
        color: '#fff',
        ...DesignTokens.typography.bodyBold,
    },
    layerButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    locateButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    layerMenu: {
        position: 'absolute',
        top: 74,
        right: 20,
        borderRadius: 12,
        padding: 8,
        elevation: 5,
        borderWidth: 1,
        gap: 4,
        minWidth: 120,
    },
    layerOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        gap: 10,
    },
    activeLayerOption: {
        backgroundColor: '#3b82f6',
    },
    layerOptionText: {
        ...DesignTokens.typography.caption,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: DesignTokens.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    modalTitle: {
        ...DesignTokens.typography.h3,
    },
    modalSubtitle: {
        ...DesignTokens.typography.caption,
        marginTop: 2,
    },
    modalBody: {
        padding: DesignTokens.spacing.lg,
    },
    inputGroup: {
        marginBottom: DesignTokens.spacing.md,
    },
    label: {
        ...DesignTokens.typography.caption,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        height: 52,
        borderRadius: DesignTokens.borderRadius.md,
        paddingHorizontal: DesignTokens.spacing.md,
        borderWidth: 1,
        ...DesignTokens.typography.body,
    },
    modalFooter: {
        padding: DesignTokens.spacing.lg,
        paddingBottom: 40,
    },
    submitBtn: {
        height: 56,
        borderRadius: DesignTokens.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtnText: {
        color: '#fff',
        ...DesignTokens.typography.bodyBold,
    },
    mapSelectBtn: {
        height: 52,
        borderRadius: DesignTokens.borderRadius.md,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: DesignTokens.spacing.md,
    },
    mapSelectBtnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    mapSelectBtnText: {
        ...DesignTokens.typography.body,
    },
    roleSelector: {
        flexDirection: 'row',
        gap: DesignTokens.spacing.sm,
        flexWrap: 'wrap',
    },
    roleOption: {
        paddingHorizontal: DesignTokens.spacing.md,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    roleOptionText: {
        ...DesignTokens.typography.caption,
        fontWeight: 'bold',
    },
    storeActions: {
        alignItems: 'flex-end',
        gap: 8,
    },
    assignBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    assignBtnText: {
        fontSize: 12,
        fontWeight: '700',
    },
    merchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        gap: 12,
    },
    merchAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    merchName: {
        ...DesignTokens.typography.bodyBold,
    },
    merchEmail: {
        ...DesignTokens.typography.caption,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
});
