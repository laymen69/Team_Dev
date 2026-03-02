import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_COLORS } from '../constants/appColors';
import { Fonts } from '../hooks/useFonts';
import MeshGradient from './components/MeshGradient';

const FEATURES = [
    {
        icon: 'analytics-outline' as const,
        title: 'Real-Time Analytics',
        desc: 'Live dashboards and KPI tracking for every field team member.',
    },
    {
        icon: 'location-outline' as const,
        title: 'GPS Tracking',
        desc: 'Accurate location check-in and store visit verification.',
    },
    {
        icon: 'people-outline' as const,
        title: 'Team Sync',
        desc: 'Keep supervisors and merchandisers aligned in real time.',
    },
    {
        icon: 'document-text-outline' as const,
        title: 'Smart Reports',
        desc: 'Before/after photos, competitive events, and more — all in one tap.',
    },
    {
        icon: 'notifications-outline' as const,
        title: 'Push Notifications',
        desc: 'Instant alerts for assignments, targets, and store updates.',
    },
    {
        icon: 'shield-checkmark-outline' as const,
        title: 'Role-Based Access',
        desc: 'Admin, Supervisor, and Merchandiser views tailored to each role.',
    },
];

export default function AboutScreen() {
    const router = useRouter();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Same background as index */}
            <MeshGradient />
            <View style={styles.overlay} />

            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                    {/* Back button */}
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={22} color={APP_COLORS.textPrimary} />
                    </TouchableOpacity>

                    {/* Header */}
                    <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={styles.iconRing}>
                            <Ionicons name="layers-outline" size={36} color={APP_COLORS.accent} />
                        </View>
                        <Text style={styles.title}>MerchandisingTeam</Text>
                        <Text style={styles.tagline}>DIGITAL FIELD OPERATIONS PLATFORM</Text>
                        <Text style={styles.version}>v1.0.0</Text>
                    </Animated.View>

                    {/* Description */}
                    <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <Text style={styles.cardTitle}>What We Do</Text>
                        <Text style={styles.cardBody}>
                            MerchandisingTeam is an end-to-end field operations platform that connects
                            administrators, supervisors, and merchandisers in a unified workflow — from
                            assigning daily objectives to capturing real-time store evidence.
                        </Text>
                    </Animated.View>

                    {/* Features grid */}
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <Text style={styles.sectionTitle}>Key Features</Text>
                        <View style={styles.grid}>
                            {FEATURES.map((f, i) => (
                                <View key={i} style={styles.featureCard}>
                                    <View style={styles.featureIconWrap}>
                                        <Ionicons name={f.icon} size={24} color={APP_COLORS.accent} />
                                    </View>
                                    <Text style={styles.featureName}>{f.title}</Text>
                                    <Text style={styles.featureDesc}>{f.desc}</Text>
                                </View>
                            ))}
                        </View>
                    </Animated.View>

                    {/* Built by */}
                    <Animated.View style={[styles.card, { opacity: fadeAnim, marginBottom: 8 }]}>
                        <Text style={styles.cardTitle}>Built By</Text>
                        <Text style={styles.cardBody}>
                            Crafted with ❤️ by <Text style={{ color: APP_COLORS.accent, fontWeight: '600' }}>TeamDev</Text> —
                            a passionate team focused on empowering field sales and merchandising operations
                            through smart, mobile-first technology.
                        </Text>
                    </Animated.View>

                    {/* CTA */}
                    <Animated.View style={{ opacity: fadeAnim, paddingVertical: 12 }}>
                        <TouchableOpacity onPress={() => router.push('/login')} activeOpacity={0.85}>
                            <LinearGradient
                                colors={[APP_COLORS.accent, APP_COLORS.accentDark]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.ctaBtn}
                            >
                                <Text style={styles.ctaBtnText}>Get Started</Text>
                                <Ionicons name="arrow-forward" size={18} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: APP_COLORS.overlay },
    safeArea: { flex: 1 },

    scroll: {
        paddingHorizontal: 24,
        paddingTop: Platform.select({ ios: 8, android: 20 }),
        paddingBottom: 40,
    },

    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: APP_COLORS.backButtonBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },

    header: {
        alignItems: 'center',
        marginBottom: 28,
    },
    iconRing: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 1.5,
        borderColor: APP_COLORS.cardBorder,
        backgroundColor: APP_COLORS.cardBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 26,
        fontFamily: Fonts.heading,
        color: APP_COLORS.textPrimary,
        letterSpacing: 0.3,
    },
    tagline: {
        fontSize: 10,
        fontFamily: Fonts.bodyMedium,
        color: APP_COLORS.textSecondary,
        letterSpacing: 3,
        marginTop: 6,
    },
    version: {
        marginTop: 8,
        fontSize: 12,
        fontFamily: Fonts.body,
        color: APP_COLORS.textMuted,
        backgroundColor: APP_COLORS.cardBg,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: APP_COLORS.cardBorder,
        overflow: 'hidden',
    },

    card: {
        backgroundColor: APP_COLORS.cardBg,
        borderWidth: 1,
        borderColor: APP_COLORS.cardBorder,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 14,
        fontFamily: Fonts.heading,
        color: APP_COLORS.accent,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 10,
    },
    cardBody: {
        fontSize: 15,
        fontFamily: Fonts.secondary,
        color: APP_COLORS.textSecondary,
        lineHeight: 24,
    },

    sectionTitle: {
        fontSize: 14,
        fontFamily: Fonts.heading,
        color: APP_COLORS.accent,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 14,
    },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    featureCard: {
        width: '47%',
        backgroundColor: APP_COLORS.cardBg,
        borderWidth: 1,
        borderColor: APP_COLORS.cardBorder,
        borderRadius: 16,
        padding: 16,
    },
    featureIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: APP_COLORS.accentGlow,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    featureName: {
        fontSize: 13,
        fontFamily: Fonts.headingSemiBold,
        color: APP_COLORS.textPrimary,
        marginBottom: 4,
    },
    featureDesc: {
        fontSize: 12,
        fontFamily: Fonts.secondary,
        color: APP_COLORS.textSecondary,
        lineHeight: 18,
    },

    ctaBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 17,
        borderRadius: 16,
        gap: 10,
    },
    ctaBtnText: {
        color: '#fff',
        fontSize: 20,
        fontFamily: Fonts.cta,
        letterSpacing: 1,
    },
});
