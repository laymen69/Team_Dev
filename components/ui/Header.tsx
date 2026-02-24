import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { useTheme } from '../../context/ThemeContext';
import { GlassView } from './GlassView';
import { PremiumPressable } from './PremiumPressable';

interface HeaderProps {
    title: string;
    subtitle?: string;
    avatar?: any;
    onAvatarPress?: () => void;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    secondRightIcon?: keyof typeof Ionicons.glyphMap;
    onSecondRightIconPress?: () => void;
    showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    title,
    subtitle,
    avatar,
    onAvatarPress,
    rightIcon,
    onRightIconPress,
    secondRightIcon,
    onSecondRightIconPress,
    showBack = false,
}) => {
    const { theme } = useTheme();
    const colors = getColors(theme);
    const router = useRouter();

    return (
        <View style={styles.outerContainer}>
            <GlassView
                style={styles.container}
                intensity={30}
                hasBorder={false}
                borderRadius={0}
            >
                <View style={styles.left}>
                    {showBack ? (
                        <PremiumPressable
                            onPress={() => router.back()}
                            style={styles.backBtn}
                            enableScale
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </PremiumPressable>
                    ) : avatar ? (
                        <PremiumPressable onPress={onAvatarPress} style={styles.avatarContainer} enableScale>
                            <Image source={avatar} style={styles.avatar} />
                        </PremiumPressable>
                    ) : null}

                    <View style={styles.titleContainer}>
                        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                        {subtitle && (
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                {subtitle}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.rightActions}>
                    {secondRightIcon && (
                        <PremiumPressable onPress={onSecondRightIconPress} style={styles.rightBtn} enableScale>
                            <Ionicons name={secondRightIcon} size={24} color={colors.text} />
                        </PremiumPressable>
                    )}
                    {rightIcon && (
                        <PremiumPressable onPress={onRightIconPress} style={styles.rightBtn} enableScale>
                            <Ionicons name={rightIcon} size={24} color={colors.text} />
                        </PremiumPressable>
                    )}
                </View>
            </GlassView>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        zIndex: 10,
        width: '100%',
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: DesignTokens.spacing.lg,
        paddingTop: DesignTokens.spacing.xl,
        paddingBottom: DesignTokens.spacing.md,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: DesignTokens.spacing.md,
    },
    avatarContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    backBtn: {
        padding: 4,
    },
    titleContainer: {
        justifyContent: 'center',
    },
    title: {
        ...DesignTokens.typography.h2,
    },
    subtitle: {
        ...DesignTokens.typography.caption,
    },
    rightBtn: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
    },
    rightActions: {
        flexDirection: 'row',
        gap: DesignTokens.spacing.sm,
    },
});
