
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { useTheme } from '../../context/ThemeContext';

import { PremiumPressable } from './PremiumPressable';

export interface NavItemType {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    route: string;
}

interface BottomNavProps {
    items: NavItemType[];
    activeRoute: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ items, activeRoute }) => {
    const { theme } = useTheme();
    const colors = getColors(theme);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    height: 65 + insets.bottom,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 0,
                },
            ]}
        >
            {items.map((item) => {
                const isActive = activeRoute === item.route;
                const color = isActive ? colors.primary : colors.textMuted;

                return (
                    <PremiumPressable
                        key={item.route}
                        style={styles.navItem}
                        enableScale
                        onPress={() => router.replace(item.route as any)}
                    >
                        <Ionicons name={item.icon} size={24} color={color} />
                        <Text style={[styles.navText, { color }]}>{item.label}</Text>
                    </PremiumPressable>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        paddingHorizontal: 10,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    navText: {
        ...DesignTokens.typography.tiny,
        marginTop: 4,
    },
});
