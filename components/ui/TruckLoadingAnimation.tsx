import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

interface TruckLoadingAnimationProps {
    label?: string;
}

export const TruckLoadingAnimation: React.FC<TruckLoadingAnimationProps> = ({ label = 'Loading...' }) => {
    const boxTranslateX = useRef(new Animated.Value(-100)).current;
    const boxTranslateY = useRef(new Animated.Value(-10)).current;
    const boxOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                // Reset
                Animated.timing(boxTranslateX, { toValue: -80, duration: 0, useNativeDriver: true }),
                Animated.timing(boxTranslateY, { toValue: -10, duration: 0, useNativeDriver: true }),
                Animated.timing(boxOpacity, { toValue: 1, duration: 0, useNativeDriver: true }),

                // Slide box towards truck
                Animated.timing(boxTranslateX, {
                    toValue: -15,
                    duration: 1200,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),

                // Drop box onto bed
                Animated.timing(boxTranslateY, {
                    toValue: 2, // Drop down
                    duration: 200,
                    easing: Easing.bounce,
                    useNativeDriver: true,
                }),

                // Pause slightly
                Animated.delay(300),

                // Fade out box on truck
                Animated.timing(boxOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),

                // Reset delay
                Animated.delay(100),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.animationArea}>
                <Animated.View
                    style={[
                        styles.box,
                        {
                            opacity: boxOpacity,
                            transform: [
                                { translateX: boxTranslateX },
                                { translateY: boxTranslateY },
                            ],
                        },
                    ]}
                >
                    <View style={styles.boxTape} />
                </Animated.View>

                <View style={styles.truckGroup}>
                    <View style={styles.truckCabin}>
                        <View style={styles.truckWindow} />
                    </View>
                    <View style={styles.truckBed}>
                        <View style={[styles.wheel, { left: 4 }]} />
                        <View style={[styles.wheel, { right: 4 }]} />
                    </View>
                </View>
            </View>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    animationArea: {
        width: 120,
        height: 60,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        position: 'relative',
    },
    box: {
        width: 20,
        height: 20,
        backgroundColor: '#C8A96E', // Sand color representing a cardboard box
        borderRadius: 2,
        position: 'absolute',
        bottom: 12,
        left: '50%',
        zIndex: 10,
        borderWidth: 1,
        borderColor: '#8B6914',
    },
    boxTape: {
        width: '100%',
        height: 4,
        backgroundColor: '#D4B483', // Lighter tape
        position: 'absolute',
        top: 8,
    },
    truckGroup: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    truckBed: {
        width: 50,
        height: 6,
        backgroundColor: '#3b82f6', // Primary Blue
        borderRadius: 2,
        position: 'relative',
    },
    truckCabin: {
        width: 25,
        height: 25,
        backgroundColor: '#3b82f6',
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        borderBottomRightRadius: 2,
        borderBottomLeftRadius: 0,
        left: 2, // Connected to bed
    },
    truckWindow: {
        width: 10,
        height: 10,
        backgroundColor: '#a5f3fc', // Cyan tint for glass
        position: 'absolute',
        top: 4,
        right: 4,
        borderTopRightRadius: 3,
        borderBottomLeftRadius: 2,
    },
    wheel: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#1e293b',
        borderWidth: 2,
        borderColor: '#94a3b8',
        position: 'absolute',
        bottom: -6,
    },
    label: {
        fontSize: 14,
        color: '#64748b', // textMuted
        fontWeight: '600',
        marginTop: 16,
    },
});
