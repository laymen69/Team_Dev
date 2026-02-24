import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ExpoLocation from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { BottomNav } from '../../components/ui/BottomNav';
import { getColors } from '../../constants/designSystem';
import { SUPERVISOR_NAV_ITEMS } from '../../constants/navigation';
import { ButtonStyles, CommonStyles, HeaderStyles, MapOffsets, MapStyles } from '../../constants/styles';
import { useTheme } from '../../context/ThemeContext';
import { GMS, GMSService } from '../../services/gms.service';

// Generate Leaflet HTML with OpenStreetMap
const generateMapHTML = (
    stores: GMS[],
    isDark: boolean,
    centerLat?: number,
    centerLng?: number,
    centerZoom?: number,
    highlightName?: string
) => {
    const lat = centerLat || (stores.length > 0 ? stores[0].latitude : 35.84578);
    const lng = centerLng || (stores.length > 0 ? stores[0].longitude : 10.61174);
    const zoom = centerZoom || 13;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        * { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
        .highlighted-popup .leaflet-popup-content-wrapper {
            background: #135bec;
            color: white;
            border-radius: 12px;
            font-weight: bold;
        }
        .highlighted-popup .leaflet-popup-tip {
            background: #135bec;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        var map = L.map('map').setView([${lat}, ${lng}], ${zoom});
        
        var tileLayers = {
          relief: L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: 'Google Maps'
          }),
          satellite: L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: 'Google Maps'
          }),
          traffic: L.tileLayer('http://{s}.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: 'Google Maps'
          })
        };

        var currentLayer = tileLayers.relief;
        currentLayer.addTo(map);

        function setMapLayer(type) {
          if (tileLayers[type]) {
            map.removeLayer(currentLayer);
            currentLayer = tileLayers[type];
            currentLayer.addTo(map);
          }
        }

        var stores = ${JSON.stringify(stores)};
        var highlightName = ${JSON.stringify(highlightName || '')};
        
        var userMarker = null;

        function updateUserLocation(lat, lng) {
          if (userMarker) {
            userMarker.setLatLng([lat, lng]);
          } else {
            userMarker = L.marker([lat, lng], {
              icon: L.divIcon({
                className: 'user-marker',
                html: '<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59,130,246,0.5);"></div>',
                iconSize: [22, 22],
                iconAnchor: [11, 11]
              })
            }).addTo(map);
          }
          map.setView([lat, lng], 15);
        }

        stores.forEach(function(store) {
            var marker = L.marker([store.latitude, store.longitude]).addTo(map);
            
            var popupContent = '<b>' + store.name + '</b>';
            if (store.address) popupContent += '<br><small>' + store.address + '</small>';
            if (store.city) popupContent += '<br><small>' + store.city + '</small>';
            
            var isHighlighted = store.name === highlightName;
            
            marker.bindPopup(popupContent, {
                className: isHighlighted ? 'highlighted-popup' : ''
            });
            
            if (isHighlighted) {
                marker.openPopup();
            }
        });
    </script>
</body>
</html>
`;
};

export default function MapPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const params = useLocalSearchParams<{
        lat?: string;
        lng?: string;
        storeName?: string;
        zoom?: string;
    }>();

    const [stores, setStores] = useState<GMS[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLocating, setIsLocating] = useState(false);
    const [isLayerMenuVisible, setIsLayerMenuVisible] = useState(false);
    const [currentLayer, setCurrentLayer] = useState<'relief' | 'satellite' | 'traffic'>('relief');
    const webViewRef = useRef<WebView>(null);

    const isDark = theme === 'dark';
    const colors = getColors(theme);
    const bgColor = colors.background;
    const cardColor = colors.surface;
    const textColor = colors.text;

    const locateUser = async () => {
        try {
            setIsLocating(true);
            const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required to find your position.');
                return;
            }

            // Try to get current position with a timeout
            let location;
            try {
                location = await Promise.race([
                    ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.Balanced }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Location timeout')), 5000))
                ]) as ExpoLocation.LocationObject;
            } catch (err) {
                console.log('[Location] Timeout or error getting current position, trying last known...');
                location = await ExpoLocation.getLastKnownPositionAsync();
            }

            if (!location) {
                throw new Error('Could not verify current location. Please ensure GPS is enabled.');
            }

            const { latitude, longitude } = location.coords;
            console.log('[Map] User location:', latitude, longitude);

            const jsCode = `updateUserLocation(${latitude}, ${longitude})`;
            webViewRef.current?.injectJavaScript(jsCode);
        } catch (error: any) {
            console.error('Error getting location:', error);
            Alert.alert('Location Error', error.message || 'Could not get your current location.');
        } finally {
            setIsLocating(false);
        }
    };

    const setLayer = (type: 'relief' | 'satellite' | 'traffic') => {
        setCurrentLayer(type);
        setIsLayerMenuVisible(false);
        webViewRef.current?.injectJavaScript(`setMapLayer('${type}')`);
    };

    useEffect(() => {
        loadStores();
    }, []);

    const loadStores = async () => {
        try {
            const data = await GMSService.getAll();
            setStores(data);
        } catch (error) {
            console.error('Failed to load stores:', error);
        } finally {
            setLoading(false);
        }
    };

    const centerLat = params.lat ? parseFloat(params.lat) : undefined;
    const centerLng = params.lng ? parseFloat(params.lng) : undefined;
    const centerZoom = params.zoom ? parseInt(params.zoom) : (centerLat ? 16 : undefined);
    const storeName = params.storeName || undefined;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: cardColor }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>
                    {storeName ? storeName : 'Map View'}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Map using WebView + OpenStreetMap */}
            <View style={styles.mapContainer}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#135bec" />
                        <Text style={{ color: textColor, marginTop: 12 }}>Loading stores...</Text>
                    </View>
                ) : (
                    <>
                        <WebView
                            ref={webViewRef}
                            source={{ html: generateMapHTML(stores, isDark, centerLat, centerLng, centerZoom, storeName) }}
                            style={styles.map}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            startInLoadingState={true}
                            scalesPageToFit={true}
                        />

                        {/* Layer Selection Menu */}
                        {isLayerMenuVisible && (
                            <View style={[styles.layerMenu, { backgroundColor: cardColor, borderColor: isDark ? '#475569' : '#e2e8f0' }]}>
                                <TouchableOpacity
                                    style={[styles.layerOption, currentLayer === 'relief' && styles.activeLayerOption]}
                                    onPress={() => setLayer('relief')}
                                >
                                    <MaterialIcons name="terrain" size={20} color={currentLayer === 'relief' ? '#fff' : textColor} />
                                    <Text style={[styles.layerOptionText, { color: currentLayer === 'relief' ? '#fff' : textColor }]}>Relief</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.layerOption, currentLayer === 'satellite' && styles.activeLayerOption]}
                                    onPress={() => setLayer('satellite')}
                                >
                                    <MaterialIcons name="satellite" size={20} color={currentLayer === 'satellite' ? '#fff' : textColor} />
                                    <Text style={[styles.layerOptionText, { color: currentLayer === 'satellite' ? '#fff' : textColor }]}>Satellite</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.layerOption, currentLayer === 'traffic' && styles.activeLayerOption]}
                                    onPress={() => setLayer('traffic')}
                                >
                                    <MaterialIcons name="traffic" size={20} color={currentLayer === 'traffic' ? '#fff' : textColor} />
                                    <Text style={[styles.layerOptionText, { color: currentLayer === 'traffic' ? '#fff' : textColor }]}>Traffic</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.layerButton, { backgroundColor: cardColor }]}
                            onPress={() => setIsLayerMenuVisible(!isLayerMenuVisible)}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name="layers" size={24} color="#135bec" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.locateButton, { backgroundColor: cardColor }]}
                            onPress={locateUser}
                            activeOpacity={0.7}
                            disabled={isLocating}
                        >
                            {isLocating ? (
                                <ActivityIndicator size="small" color="#135bec" />
                            ) : (
                                <MaterialIcons name="my-location" size={24} color="#135bec" />
                            )}
                        </TouchableOpacity>
                    </>
                )}
            </View>

            <BottomNav items={SUPERVISOR_NAV_ITEMS} activeRoute="/supervisor/map" />
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    safeArea: CommonStyles.safeArea,
    header: HeaderStyles.header,
    headerTitle: HeaderStyles.headerTitle,
    mapContainer: MapStyles.container,
    map: MapStyles.map,
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locateButton: {
        ...ButtonStyles.fab,
        bottom: MapOffsets.fabBottomSecondary,
        right: 16,
    },
    layerButton: {
        ...ButtonStyles.fab,
        bottom: MapOffsets.fabBottomPrimary,
        right: 16,
    },
    layerMenu: {
        ...MapStyles.menu,
        bottom: MapOffsets.fabBottomPrimary,
    },
    layerOption: MapStyles.menuOption,
    activeLayerOption: {
        backgroundColor: '#135bec',
    },
    layerOptionText: MapStyles.optionText,
});
