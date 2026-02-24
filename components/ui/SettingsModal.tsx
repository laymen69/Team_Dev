
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { useTheme } from '../../context/ThemeContext';
import { PremiumPressable } from './PremiumPressable';

export interface SettingsItemType {
    icon?: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    color?: string;
    isDestructive?: boolean;
    rightElement?: React.ReactNode;
}

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    items: SettingsItemType[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    visible,
    onClose,
    title = 'Settings',
    items,
}) => {
    const { theme } = useTheme();
    const colors = getColors(theme);

    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 8,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 0.9,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.card,
                                {
                                    backgroundColor: colors.surface,
                                    opacity: opacityAnim,
                                    transform: [{ scale: scaleAnim }],
                                },
                            ]}
                        >
                            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                                <PremiumPressable onPress={onClose} enableScale>
                                    <Ionicons name="close" size={20} color={colors.textMuted} />
                                </PremiumPressable>
                            </View>

                            <View style={styles.content}>
                                {items.map((item, index) => (
                                    <PremiumPressable
                                        key={index}
                                        style={styles.item}
                                        onPress={item.onPress}
                                        enableScale
                                    >
                                        <Text
                                            style={[
                                                styles.label,
                                                {
                                                    color: item.isDestructive ? colors.danger : colors.text,
                                                    textAlign: 'center'
                                                },
                                            ]}
                                        >
                                            {item.label}
                                        </Text>
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
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    card: {
        width: '80%',
        maxWidth: 300,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    title: {
        ...DesignTokens.typography.bodyBold,
        fontSize: 16,
    },
    content: {
        padding: 12,
    },
    item: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginVertical: 2,
    },
    label: {
        ...DesignTokens.typography.body,
        fontSize: 15,
    },
});
