import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

const AppMapView = forwardRef(({
    style,
    initialRegion,
    children,
    onRegionChangeComplete,
    scrollEnabled = true,
    zoomEnabled = true,
    dragging = true,
    mapType = 'standard'
}: any, ref) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const markers = useRef<maplibregl.Marker[]>([]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        animateToRegion: (region: any, duration: number = 1000) => {
            if (!map.current) return;
            const delta = Math.max(region.latitudeDelta, region.longitudeDelta);
            let zoomLevel = 13;
            if (delta > 0) {
                zoomLevel = Math.round(Math.log2(360 / delta));
            }
            map.current.flyTo({
                center: [region.longitude, region.latitude],
                zoom: zoomLevel,
                duration: duration,
                essential: true
            });
        }
    }));

    // Initialize Map
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: getMapStyle(mapType),
            center: [initialRegion?.longitude || 10.1815, initialRegion?.latitude || 36.8065],
            zoom: 13,
            attributionControl: false,
            interactive: dragging && (scrollEnabled || zoomEnabled)
        });

        // Add zoom controls if enabled
        if (zoomEnabled) {
            map.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
        }

        map.current.on('moveend', () => {
            if (!map.current || !onRegionChangeComplete) return;
            const center = map.current.getCenter();
            const bounds = map.current.getBounds();
            onRegionChangeComplete({
                latitude: center.lat,
                longitude: center.lng,
                latitudeDelta: Math.abs(bounds.getNorth() - bounds.getSouth()),
                longitudeDelta: Math.abs(bounds.getEast() - bounds.getWest()),
            });
        });

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // Update Style when mapType changes
    useEffect(() => {
        if (!map.current) return;
        map.current.setStyle(getMapStyle(mapType));
    }, [mapType]);

    // Handle initialRegion changes
    useEffect(() => {
        if (map.current && initialRegion) {
            map.current.jumpTo({
                center: [initialRegion.longitude, initialRegion.latitude]
            });
        }
    }, [initialRegion?.latitude, initialRegion?.longitude]);

    return (
        <View style={[styles.container, style]}>
            <div ref={mapContainer} style={{ width: '100%', height: '100%', position: 'absolute' }} />
            {/* Markers are handled via a separate effect or portal-like logic */}
            <MarkerManager map={map.current} children={children} />
        </View>
    );
});

// Helper to get professional map styles
function getMapStyle(type: string): maplibregl.StyleSpecification {
    if (type === 'satellite') {
        return {
            version: 8,
            sources: {
                'satellite': {
                    type: 'raster',
                    tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                    tileSize: 256
                }
            },
            layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }]
        } as maplibregl.StyleSpecification;
    }
    // Professional "Voyager" style from CartoDB (Modern, clean, enterprise-grade)
    return {
        version: 8,
        sources: {
            'voyager': {
                type: 'raster',
                tiles: ['https://basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png'],
                tileSize: 256,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            }
        },
        layers: [{ id: 'voyager', type: 'raster', source: 'voyager' }]
    } as maplibregl.StyleSpecification;
}

// Marker Manager to sync React children markers with MapLibre instance
function MarkerManager({ map, children }: { map: maplibregl.Map | null, children: any }) {
    const markersRef = useRef<Record<string, maplibregl.Marker>>({});
    const hasAutoFitted = useRef(false);


    useEffect(() => {
        if (!map) return;

        const childrenArray = Array.isArray(children) ? children : [children];
        const flatChildren = childrenArray.flat().filter(Boolean);
        const currentIds = new Set<string>();

        flatChildren.forEach((child, index) => {
            const props = (child as any).props;
            if (!props || !props.coordinate) return;

            const { coordinate, title, description, pinColor } = props;
            const id = `${coordinate.latitude}-${coordinate.longitude}-${title || index}`;
            currentIds.add(id);

            if (markersRef.current[id]) return;

            // Professional "Figure" Marker (Circle with Icon + Label)
            const el = document.createElement('div');
            el.className = 'professional-marker';
            el.style.display = 'flex';
            el.style.flexDirection = 'column';
            el.style.alignItems = 'center';

            // Determine icon and color
            const isUser = title === 'You are here' || pinColor === 'red';
            const color = isUser ? '#3b82f6' : (pinColor === 'green' ? '#10b981' : '#6366f1');

            // Icon SVG (Store or Person)
            const iconSvg = isUser
                ? `<svg viewBox="0 0 24 24" width="16" height="16" stroke="white" stroke-width="2.5" fill="none"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
                : `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;

            el.innerHTML = `
                <div class="marker-pin-wrapper" style="position: relative; display: flex; flex-direction: column; align-items: center;">
                    <div style="
                        background: ${color};
                        width: 36px;
                        height: 36px;
                        border-radius: 50% 50% 50% 0;
                        transform: rotate(-45deg);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: 2px solid white;
                        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                        cursor: pointer;
                        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    ">
                        <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
                            ${iconSvg}
                        </div>
                    </div>
                    ${!isUser && title ? `
                        <div class="marker-label" style="
                            background: white;
                            padding: 4px 10px;
                            border-radius: 20px;
                            font-family: 'Inter', system-ui, -apple-system, sans-serif;
                            font-size: 11px;
                            font-weight: 700;
                            color: #1e293b;
                            margin-top: 6px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                            white-space: nowrap;
                            pointer-events: none;
                            border: 1px solid #e2e8f0;
                            transition: all 0.2s ease;
                        ">
                            ${title}
                        </div>
                    ` : ''}
                </div>
            `;

            // Hover effects handled via JS for reliability on dynamic elements
            const inner = el.querySelector('.marker-pin-wrapper > div') as HTMLElement;
            const label = el.querySelector('.marker-label') as HTMLElement;

            el.onmouseenter = () => {
                inner.style.transform = 'rotate(-45deg) scale(1.15)';
                if (label) {
                    label.style.transform = 'translateY(2px)';
                    label.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }
            };
            el.onmouseleave = () => {
                inner.style.transform = 'rotate(-45deg) scale(1)';
                if (label) {
                    label.style.transform = 'translateY(0)';
                    label.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }
            };

            const popup = new maplibregl.Popup({
                offset: 25,
                closeButton: false,
                className: 'modern-popup'
            }).setHTML(`
                <div style="padding: 12px; font-family: 'Inter', sans-serif; min-width: 180px;">
                    <div style="font-weight: 700; font-size: 15px; margin-bottom: 4px; color: #0f172a;">${title || 'Location'}</div>
                    ${description ? `<div style="font-size: 12px; color: #64748b; line-height: 1.5;">${description}</div>` : ''}
                    <div style="margin-top: 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: ${color}; font-weight: 700;">
                        ${isUser ? 'Current Position' : 'Active Store'}
                    </div>
                </div>
            `);

            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([coordinate.longitude, coordinate.latitude])
                .setPopup(popup)
                .addTo(map);

            markersRef.current[id] = marker;
        });

        // Cleanup old markers
        Object.keys(markersRef.current).forEach(id => {
            if (!currentIds.has(id)) {
                markersRef.current[id].remove();
                delete markersRef.current[id];
            }
        });

        // Auto-fit bounds to stores if map exists and we have stores
        const storeCoords: [number, number][] = flatChildren
            .map((c: any) => c.props)
            .filter((p: any) => p && p.coordinate && p.title !== 'You are here')
            .map((p: any) => [p.coordinate.longitude, p.coordinate.latitude] as [number, number]);

        if (storeCoords.length > 0 && !hasAutoFitted.current) {
            const bounds = new maplibregl.LngLatBounds();
            storeCoords.forEach((coord) => {
                bounds.extend(coord);
            });

            map.fitBounds(bounds, {
                padding: { top: 70, bottom: 50, left: 50, right: 50 },
                maxZoom: 14,
                duration: 2000
            });
            hasAutoFitted.current = true;
        }
    }, [map, children]);

    return null;
}

export const MarkerWrapper = ({ coordinate, title, description, pinColor }: any) => {
    // This component is a placeholder; logic is handled by MarkerManager
    return null;
};

export { MarkerWrapper as Marker };
export const PROVIDER_DEFAULT = 'default';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
        overflow: 'hidden'
    }
});

export default AppMapView;
