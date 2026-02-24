
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { useTheme } from '../../context/ThemeContext';
import { PremiumPressable } from './PremiumPressable';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

export interface SettingsItemType {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    color?: string;
    isDestructive?: boolean;
    rightElement?: React.ReactNode;
}

interface SettingsDrawerProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    items: SettingsItemType[];
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
    visible,
    onClose,
    title = 'Settings',
    items,
}) => {
    const { theme } = useTheme();
    const colors = getColors(theme);
    const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: SCREEN_WIDTH - DRAWER_WIDTH,
                useNativeDriver: true,
                tension: 50,
                friction: 10,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: SCREEN_WIDTH,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.drawer,
                                {
                                    backgroundColor: colors.surface,
                                    transform: [{ translateX: slideAnim }],
                                    width: DRAWER_WIDTH,
                                },
                            ]}
                        >
                            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                                <PremiumPressable onPress={onClose} enableScale>
                                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                                </PremiumPressable>
                            </View>

                            <View style={styles.content}>
                                {items.map((item, index) => (
                                    <PremiumPressable
                                        key={index}
                                        style={[
                                            styles.item,
                                            { backgroundColor: colors.surfaceSecondary },
                                        ]}
                                        onPress={item.onPress}
                                        enableScale
                                    >
                                        <View
                                            style={[
                                                styles.iconBox,
                                                { backgroundColor: `${item.color || colors.primary}20` },
                                            ]}
                                        >
                                            <Ionicons
                                                name={item.icon}
                                                size={20}
                                                color={item.isDestructive ? colors.danger : item.color || colors.primary}
                                            />
                                        </View>
                                        <Text
                                            style={[
                                                styles.label,
                                                { color: item.isDestructive ? colors.danger : colors.text },
                                            ]}
                                        >
                                            {item.label}
                                        </Text>
                                        {item.rightElement || (
                                            <Ionicons
                                                name="chevron-forward"
                                                size={18}
                                                color={colors.textMuted}
                                            />
                                        )}
                                    </PremiumPressable>
                                ))}
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    drawer: {
        height: '100%',
        paddingTop: 60,
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: DesignTokens.spacing.xl,
        paddingBottom: DesignTokens.spacing.lg,
        borderBottomWidth: 1,
    },
    title: {
        ...DesignTokens.typography.h2,
    },
    content: {
        padding: DesignTokens.spacing.lg,
        gap: DesignTokens.spacing.sm,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: DesignTokens.spacing.md,
        borderRadius: DesignTokens.borderRadius.md,
        gap: DesignTokens.spacing.md,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: DesignTokens.borderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        flex: 1,
        ...DesignTokens.typography.bodyBold,
    },
});
