import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

interface PremiumPressableProps extends PressableProps {
    enableScale?: boolean;
    scaleTo?: number;
    containerStyle?: StyleProp<ViewStyle>;
}

export const PremiumPressable: React.FC<PremiumPressableProps> = ({
    children,
    style,
    enableScale = true,
    scaleTo = 0.96,
    onPressIn,
    onPressOut,
    containerStyle,
    ...props
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = (event: any) => {
        if (enableScale) {
            Animated.spring(scaleAnim, {
                toValue: scaleTo,
                useNativeDriver: true,
                speed: 20,
                bounciness: 10,
            }).start();
        }
        onPressIn && onPressIn(event);
    };

    const handlePressOut = (event: any) => {
        if (enableScale) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                speed: 20,
                bounciness: 10,
            }).start();
        }
        onPressOut && onPressOut(event);
    };

    // Extract layout styles to apply to the container
    const getLayoutStyles = () => {
        if (!style) return null;
        let s = typeof style === 'function' ? style({
            pressed: false,
            focused: false,
            hovered: false
        } as any) : style;

        if (!s) return null;
        if (Array.isArray(s)) {
            s = Object.assign({}, ...s.filter(Boolean));
        }

        const layout: any = {};
        const layoutKeys = [
            'flex', 'flexGrow', 'flexShrink', 'flexBasis',
            'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
            'margin', 'marginHorizontal', 'marginVertical',
            'marginLeft', 'marginRight', 'marginTop', 'marginBottom',
            'position', 'top', 'bottom', 'left', 'right', 'zIndex',
            'alignSelf'
        ];

        layoutKeys.forEach(key => {
            const val = (s as any)[key];
            if (val !== undefined) layout[key] = val;
        });

        return layout;
    };

    return (
        <Animated.View style={[
            { transform: [{ scale: scaleAnim }] },
            getLayoutStyles(),
            containerStyle
        ]}>
            <Pressable
                {...props}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={style}
            >
                {children}
            </Pressable>
        </Animated.View>
    );
};
