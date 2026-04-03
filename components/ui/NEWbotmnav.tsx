import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Platform,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface NavItemType {
    icon: keyof typeof Ionicons.glyphMap;
    route: string;
}

interface BottomNavProps {
    items: NavItemType[];
    activeRoute: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ items, activeRoute }) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.wrapper, { bottom: Math.max(insets.bottom, 16) }]}>
            
            {/* Glass container */}
            <BlurView intensity={60} tint="dark" style={styles.container}>
                
                {items.map((item) => {
                    const isActive = activeRoute === item.route;

                    return (
                        <TouchableOpacity
                            key={item.route}
                            onPress={() => router.replace(item.route as any)}
                            activeOpacity={0.8}
                            style={styles.item}
                        >
                            <View style={styles.iconWrapper}>
                                
                                {/* Active Circle */}
                                {isActive && (
                                    <View style={styles.activeCircle} />
                                )}

                                <Ionicons
                                    name={item.icon}
                                    size={22}
                                    color={isActive ? '#fff' : 'rgba(255,255,255,0.6)'}
                                    style={{ zIndex: 2 }}
                                />
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 20,
        right: 20,
        zIndex: 1000,

        ...(Platform.OS === 'ios'
            ? {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 25,
            }
            : {
                elevation: 20,
            }),
    },

    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        paddingHorizontal: 18,
        height: 64,

        borderRadius: 28,
        overflow: 'hidden',

        backgroundColor: 'rgba(255,255,255,0.08)',

        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },

    item: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    iconWrapper: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },

    activeCircle: {
        position: 'absolute',
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#1DA1F2', // blue like your image

        // subtle glow
        shadowColor: '#1DA1F2',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,

        elevation: 8,
    },
});