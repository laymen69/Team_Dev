
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './Button';

type ModalVariant = 'warning' | 'danger' | 'info';

interface ConfirmModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: ModalVariant;
    loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    visible,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'info',
    loading = false,
}) => {
    const { theme } = useTheme();
    const colors = getColors(theme);

    const getVariantColor = () => {
        switch (variant) {
            case 'warning': return colors.warning;
            case 'danger': return colors.danger;
            case 'info':
            default: return colors.primary;
        }
    };

    const iconName = variant === 'danger' ? 'alert-circle' : variant === 'warning' ? 'warning' : 'information-circle';
    const accentColor = getVariantColor();

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.content, { backgroundColor: colors.surface }]}>
                            <View style={[styles.iconBox, { backgroundColor: `${accentColor}20` }]}>
                                <Ionicons name={iconName} size={32} color={accentColor} />
                            </View>

                            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                            <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

                            <View style={styles.footer}>
                                <Button
                                    title={cancelLabel}
                                    onPress={onClose}
                                    variant="ghost"
                                    style={styles.button}
                                />
                                <Button
                                    title={confirmLabel}
                                    onPress={onConfirm}
                                    variant={variant === 'danger' ? 'danger' : 'primary'}
                                    loading={loading}
                                    style={styles.button}
                                />
                            </View>
                        </View>
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
        justifyContent: 'center',
        alignItems: 'center',
        padding: DesignTokens.spacing.xl,
    },
    content: {
        width: '100%',
        borderRadius: DesignTokens.borderRadius.xl,
        padding: DesignTokens.spacing.xl,
        alignItems: 'center',
    },
    iconBox: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: DesignTokens.spacing.lg,
    },
    title: {
        ...DesignTokens.typography.h2,
        textAlign: 'center',
        marginBottom: DesignTokens.spacing.sm,
    },
    message: {
        ...DesignTokens.typography.body,
        textAlign: 'center',
        marginBottom: DesignTokens.spacing.xl,
    },
    footer: {
        flexDirection: 'row',
        gap: DesignTokens.spacing.md,
        width: '100%',
    },
    button: {
        flex: 1,
    },
});
