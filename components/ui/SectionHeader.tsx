
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../hooks/useFonts';

interface SectionHeaderProps {
    title: string;
    actionLabel?: string;
    onAction?: () => void;
    style?: any;
    compact?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    actionLabel,
    onAction,
    style,
    compact,
}) => {
    const { theme } = useTheme();
    const colors = getColors(theme);

    return (
        <View style={[
            styles.container,
            compact && styles.containerCompact,
            style
        ]}>
            <Text style={[
                styles.title,
                compact && styles.titleCompact,
                { color: colors.text }
            ]}>
                {title}
            </Text>
            {actionLabel && onAction && (
                <TouchableOpacity onPress={onAction}>
                    <Text style={[styles.action, { color: colors.primary }]}>
                        {actionLabel}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: DesignTokens.spacing.xl,
        marginBottom: DesignTokens.spacing.md,
        paddingHorizontal: DesignTokens.spacing.lg,
    },
    containerCompact: {
        marginTop: DesignTokens.spacing.md,
        marginBottom: DesignTokens.spacing.sm,
    },
    title: {
        ...DesignTokens.typography.h3,
    },
    titleCompact: {
        fontSize: 14,
        letterSpacing: 1.2,
        fontFamily: Fonts.headingSemiBold,
    },
    action: {
        ...DesignTokens.typography.caption,
        fontFamily: Fonts.bodyBold,
    },
});
