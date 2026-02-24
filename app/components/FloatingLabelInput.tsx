import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { APP_COLORS } from '../../constants/appColors';
import { Fonts } from '../../hooks/useFonts';

interface FloatingLabelInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    icon: keyof typeof Ionicons.glyphMap;
    /** @deprecated — ignored, component always uses the dark auth palette */
    theme?: object;
}

const FloatingLabelInput = ({
    label, value, onChangeText, secureTextEntry,
    keyboardType = 'default', autoCapitalize = 'none', icon,
}: FloatingLabelInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hiddenPassword, setHiddenPassword] = useState(secureTextEntry);
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: (isFocused || value) ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused, value]);

    const labelStyle = {
        position: 'absolute' as const,
        left: 40,
        top: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [18, -10],
        }),
        fontSize: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 13],
        }),
        color: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [APP_COLORS.textSecondary, APP_COLORS.accent],
        }),
        backgroundColor: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['transparent', 'white'],
        }),
        paddingHorizontal: 2,
        zIndex: 1,
        fontFamily: Fonts.bodySemiBold,
    };

    return (
        <View style={[styles.inputContainer, {
            borderColor: isFocused ? APP_COLORS.accent : APP_COLORS.inputBorder,
            borderWidth: isFocused ? 1.5 : 1,
        }]}>
            {/* Icon */}
            <View style={{ marginRight: 12, justifyContent: 'center' }}>
                <Ionicons
                    name={icon}
                    size={20}
                    color={isFocused ? APP_COLORS.accent : APP_COLORS.textSecondary}
                />
            </View>

            {/* Floating label */}
            <Animated.Text style={labelStyle}>{label}</Animated.Text>

            {/* Text input */}
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                secureTextEntry={hiddenPassword}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                placeholderTextColor="rgba(255,255,255,0.25)"
            />

            {/* Show/hide password toggle */}
            {secureTextEntry && (
                <TouchableOpacity onPress={() => setHiddenPassword(!hiddenPassword)} style={{ padding: 5 }}>
                    <Ionicons
                        name={hiddenPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color={APP_COLORS.textSecondary}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        paddingHorizontal: 16,
        marginBottom: 20,
        height: 64,
        position: 'relative',
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
        paddingTop: 18,
        paddingBottom: 4,
        color: APP_COLORS.textPrimary,
        fontFamily: Fonts.body,
    },
});

export default FloatingLabelInput;
