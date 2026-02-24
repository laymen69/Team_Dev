import { useEffect } from 'react';
import {
    Dimensions,
    Pressable,
    StyleSheet,
    useColorScheme,
    View
} from 'react-native';
import AnimatedReanimated, {
    cancelAnimation,
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { Colors } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

/* ───────────────────────── Floating Background ───────────────────────── */

function FloatingBackground() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? Colors.dark : Colors.light;

    const progress = useSharedValue(0);

    const start = () => {
        progress.value = withRepeat(
            withTiming(1, {
                duration: 15000,
                easing: Easing.linear
            }),
            -1,
            false
        );
    };

    const stop = () => cancelAnimation(progress);

    useEffect(() => {
        start();
        return () => cancelAnimation(progress);
    }, []);

    const orb1Style = useAnimatedStyle(() => {
        const t = progress.value * Math.PI * 2;
        return {
            transform: [
                { translateX: Math.sin(t) * 60 },
                { translateY: Math.cos(t * 0.8) * 80 },
                { scale: 1.1 + Math.sin(t * 0.5) * 0.1 },
            ],
            backgroundColor: isDark ? 'rgba(96, 165, 250, 0.3)' : 'rgba(162, 223, 247, 0.4)', // Soft Sky Blue
        };
    });

    const orb2Style = useAnimatedStyle(() => {
        const t = progress.value * Math.PI * 2;
        return {
            transform: [
                { translateX: Math.cos(t * 1.2) * -70 },
                { translateY: Math.sin(t * 0.9) * 90 },
                { scale: 0.9 + Math.cos(t * 0.6) * 0.08 },
            ],
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(241, 210, 152, 0.3)', // Translucent Accent Blue
        };
    });

    const orb3Style = useAnimatedStyle(() => {
        const t = progress.value * Math.PI * 2;
        return {
            transform: [
                { translateX: Math.sin(t * 0.7) * 40 },
                { translateY: Math.cos(t * 1.1) * -80 },
                { scale: 1 + Math.sin(t * 0.4) * 0.05 },
            ],
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)', // Snowy White
        };
    });

    return (
        <Pressable
            style={StyleSheet.absoluteFill}
            onPressIn={stop}
            onPressOut={start}
        >
            <AnimatedReanimated.View style={[styles.orb, styles.orbPosition1, orb1Style]} />
            <AnimatedReanimated.View style={[styles.orb, styles.orbPosition2, orb2Style]} />
            <AnimatedReanimated.View style={[styles.orb, styles.orbPosition3, orb3Style]} />
        </Pressable>
    );
}

/* ───────────────────────── Main Decoration Component ───────────────────────── */

export default function AnimatedBackground() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <>
            <FloatingBackground />
            <View style={[styles.decorCircle1, { backgroundColor: isDark ? 'rgba(64,113,160,0.08)' : 'rgba(162,223,247,0.15)' }]} />
            <View style={[styles.decorCircle2, { backgroundColor: isDark ? 'rgba(64,113,160,0.06)' : 'rgba(162,223,247,0.1)' }]} />
            <View style={[styles.decorCircle3, { backgroundColor: isDark ? 'rgba(64,113,160,0.05)' : 'rgba(162,223,247,0.08)' }]} />
        </>
    );
}

const styles = StyleSheet.create({
    /* Floating orbs */
    orb: {
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: 130,
        opacity: 0.4,
    },
    orbPosition1: {
        top: '10%',
        left: '-10%',
    },
    orbPosition2: {
        top: '75%',
        right: '-15%',
    },
    orbPosition3: {
        bottom: '20%',
        left: '30%',
    },

    /* Decorative circles */
    decorCircle1: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        top: -100,
        right: -100,
    },
    decorCircle2: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        bottom: 100,
        left: -80,
    },
    decorCircle3: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        top: height * 0.4,
        right: -50,
    },
});
