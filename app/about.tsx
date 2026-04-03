import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
    ArrowLeft,
    ArrowRight,
    BarChart3,
    Command,
    FileText,
    Globe2,
    MapPin,
    Shield,
    Users
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Image,
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
import AnimatedBackground from './components/AnimatedBackground';
import MeshGradient from './components/MeshGradient';

/* ──────────────────────────────────────────
   PREMIUM ABOUT PAGE
   Web: Uses original Aurum theme HTML layout
   Mobile: Uses universal native layout with mesh gradient
────────────────────────────────────────── */

/* ================= WEB LAYOUT ================= */

const COLOR = {
    bg: '#09090b',
    gold: '#d4a84b',
    goldLight: '#f5d98c',
    white: '#ffffff',
    textMuted: 'rgba(255,255,255,0.40)',
    textSub: 'rgba(255,255,255,0.65)',
    border: 'rgba(255,255,255,0.07)',
};

const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { -webkit-font-smoothing: antialiased; background-color: ${COLOR.bg}; }

    .gold-text {
        background: linear-gradient(120deg, #d4a84b 0%, #f5d98c 40%, #d4a84b 70%, #b08c3c 100%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: goldShift 5s linear infinite;
    }
    @keyframes goldShift { to { background-position: 200% center; } }

    .reveal { animation: revealUp 0.9s cubic-bezier(0.16,1,0.3,1) both; }
    @keyframes revealUp {
        from { opacity: 0; transform: translateY(32px); }
        to   { opacity: 1; transform: translateY(0);    }
    }

    .nav-link {
        padding: 8px 20px; font-size: 13px; font-weight: 600;
        color: rgba(255,255,255,0.45); border-radius: 10px; cursor: pointer;
        border: none; background: transparent; transition: color 0.2s, background 0.2s;
        font-family: inherit;
    }
    .nav-link:hover { color: #fff; background: rgba(255,255,255,0.06); }

    .cta-btn {
        position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: 10px;
        padding: 16px 36px; border-radius: 18px; font-weight: 900; font-size: 16px;
        cursor: pointer; border: none; transition: transform 0.25s ease, box-shadow 0.25s ease;
        font-family: inherit;
    }
    .cta-btn-primary {
        background: linear-gradient(135deg, #d4a84b 0%, #f5d98c 50%, #d4a84b 100%);
        background-size: 200% auto; color: #000;
        box-shadow: 0 12px 40px rgba(212,168,75,0.4); animation: goldShift 4s linear infinite;
    }
    .cta-btn-primary:hover { transform: scale(1.04); box-shadow: 0 20px 50px rgba(212,168,75,0.5); }
    .cta-btn-secondary { background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); }
    .cta-btn-secondary:hover { background: rgba(255,255,255,0.10); }

    .about-card {
        background: linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 24px;
        padding: 40px;
        transition: transform 0.3s ease, border-color 0.3s ease;
    }
    .about-card:hover {
        transform: translateY(-4px);
        border-color: rgba(212,168,75,0.3);
    }
`;

const WEB_FEATURES = [
    { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Live dashboards and KPI tracking for every field asset.' },
    { icon: MapPin, title: 'GPS Tracking', desc: 'Accurate location check-in and route efficiency verification.' },
    { icon: Users, title: 'Team Sync', desc: 'Keep supervisors and field agents aligned in real time.' },
    { icon: FileText, title: 'Smart Reports', desc: 'Timestamped proof-of-presence and visual logs in one tap.' },
    { icon: Globe2, title: 'Push Notifications', desc: 'Instant alerts for assignments, targets, and live updates.' },
    { icon: Shield, title: 'Enterprise Access', desc: 'Robust hierarchies tailored to Administrator and Agent views.' },
];

function WebAbout() {
    const router = useRouter();

    const S = {
        page: { fontFamily: "'Inter', sans-serif", backgroundColor: COLOR.bg, color: COLOR.white, minHeight: '100vh', position: 'relative' as const, overflow: 'hidden' },
        bgTop: { position: 'absolute' as const, top: '-20%', left: '-10%', width: '70%', height: '70%', borderRadius: '50%', background: 'rgba(212,168,75,0.06)', filter: 'blur(140px)', zIndex: 0 },
        bgGrid: { position: 'absolute' as const, inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '60px 60px', zIndex: 0 },

        main: { position: 'relative' as const, zIndex: 10, maxWidth: 1000, margin: '0 auto', padding: '100px 40px 100px', width: '100%' },

        navTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 80 },
        backBtn: {
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 48, borderRadius: 24,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer', color: COLOR.white, transition: 'background 0.2s',
        },

        header: { textAlign: 'center' as const, marginBottom: 80 },
        logoBadge: { width: 64, height: 64, borderRadius: 20, margin: '0 auto 24px', background: 'linear-gradient(135deg, #d4a84b, #b08c3c)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(212,168,75,0.4)' },
        h1: { fontWeight: 900, fontSize: 'clamp(3rem, 6vw, 4.5rem)', letterSpacing: '-0.04em', marginBottom: 16 },
        italicH1: { fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: 'italic', fontWeight: 700 },
        subtitle: { color: COLOR.gold, fontSize: 11, fontWeight: 900, letterSpacing: '0.4em', textTransform: 'uppercase' as const, marginBottom: 24 },

        sectionTitle: { fontSize: 11, fontWeight: 900, letterSpacing: '0.35em', textTransform: 'uppercase' as const, color: COLOR.gold, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 },
        line: { height: 1, width: 40, background: COLOR.gold },

        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 80 },
    };

    return (
        <View style={S.page as any}>
            <style dangerouslySetInnerHTML={{ __html: CSS }} />

            <div style={S.bgTop} />
            <div style={S.bgGrid} />

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <div style={S.main}>

                        {/* Header Actions */}
                        <div className="reveal" style={S.navTop}>
                            <button style={S.backBtn} onClick={() => router.back()} title="Go Back">
                                <ArrowLeft size={20} />
                            </button>
                            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: COLOR.textMuted }}>v2.4.1 Enterprise</div>
                        </div>

                        {/* Title Section */}
                        <div className="reveal" style={{ ...S.header, animationDelay: '0.1s' }}>
                            <div style={S.logoBadge}><Command size={32} color="#000" strokeWidth={2.5} /></div>
                            <div style={S.subtitle}>Digital Field Operations Platform</div>
                            <h1 style={S.h1}>
                                About <span className="gold-text" style={S.italicH1}>FieldForce</span>
                            </h1>
                        </div>

                        {/* Mission */}
                        <div className="reveal about-card" style={{ animationDelay: '0.2s', marginBottom: 80 }}>
                            <div style={S.sectionTitle}><div style={S.line} /> The Mission</div>
                            <p style={{ color: COLOR.textSub, fontSize: 18, lineHeight: 1.8, fontWeight: 300 }}>
                                FieldForce provides architectural-grade infrastructure for elite field operations.
                                We connect administrators, supervisors, and agents in a unified, real-time workflow —
                                transforming complex logistics and disconnected teams into an agile, highly-coordinated
                                enterprise machine. We believe operational intelligence should be as sophisticated as the teams deploying it.
                            </p>
                        </div>

                        {/* Core Features */}
                        <div className="reveal" style={{ animationDelay: '0.3s' }}>
                            <div style={S.sectionTitle}><div style={S.line} /> Platform Capabilities</div>
                            <div style={S.grid}>
                                {WEB_FEATURES.map((f, i) => (
                                    <div key={i} className="about-card" style={{ padding: 32 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(212,168,75,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                                            <f.icon size={22} color={COLOR.gold} />
                                        </div>
                                        <h3 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>{f.title}</h3>
                                        <p style={{ color: COLOR.textMuted, fontSize: 15, lineHeight: 1.6, fontWeight: 400 }}>{f.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Development Signature */}
                        <div className="reveal about-card" style={{ animationDelay: '0.4s', textAlign: 'center', padding: '60px 40px' }}>
                            <Shield size={32} color={COLOR.gold} style={{ margin: '0 auto 24px' }} />
                            <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 16 }}>Built by Team_Dev</h3>
                            <p style={{ color: COLOR.textMuted, fontSize: 16, maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.6 }}>
                                Engineered by a dedicated team focused on empowering field sales and merchandising operations through state-of-the-art native technology and secure cloud architecture.
                            </p>
                            <button className="cta-btn cta-btn-primary" onClick={() => router.push('/login')}>
                                Access Dashboard <ArrowRight size={18} />
                            </button>
                        </div>

                    </div>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

/* ================= MOBILE LAYOUT ================= */

const { width } = Dimensions.get('window');

const MOBILE_FEATURES = [
    { icon: 'bar-chart-outline', title: 'Real-Time Analytics', desc: 'Live dashboards and KPI tracking for every field asset.' },
    { icon: 'location-outline', title: 'GPS Tracking', desc: 'Accurate location check-in and route efficiency verification.' },
    { icon: 'people-outline', title: 'Team Sync', desc: 'Keep supervisors and field agents aligned in real time.' },
    { icon: 'document-text-outline', title: 'Smart Reports', desc: 'Timestamped proof-of-presence and visual logs in one tap.' },
    { icon: 'globe-outline', title: 'Push Notifications', desc: 'Instant alerts for assignments, targets, and live updates.' },
    { icon: 'shield-checkmark-outline', title: 'Enterprise Access', desc: 'Robust hierarchies tailored to Administrator and Agent views.' },
];

function MobileAbout() {
    const router = useRouter();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <MeshGradient />
            <LinearGradient
                colors={['rgba(15, 23, 42, 0.8)', 'rgba(30, 58, 95, 0.8)', 'rgba(46, 56, 85, 0.8)']}
                style={StyleSheet.absoluteFill}
            >
                <StatusBar style="light" />
                <AnimatedBackground />

                <SafeAreaView style={{ flex: 1 }}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.navTop}>
                            <TouchableOpacity
                                style={[styles.backButton, { backgroundColor: APP_COLORS.backButtonBg }]}
                                onPress={() => router.back()}
                            >
                                <Ionicons name="arrow-back" size={24} color={APP_COLORS.textPrimary} />
                            </TouchableOpacity>
                            <Text style={styles.versionText}>v2.4.1 Enterprise</Text>
                        </View>

                        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                            <View style={styles.logoBadge}>
                                <Image
                                    source={require('../assets/images/login.png')}
                                    style={{ width: 120, height: 120, borderRadius: 24 }}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={styles.subtitle}>Digital Field Operations Platform</Text>
                            <Text style={styles.h1}>
                                About <Text style={styles.goldText}>FieldForce</Text>
                            </Text>
                        </Animated.View>

                        <Animated.View style={[styles.aboutCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                            <View style={styles.sectionTitleRow}>
                                <View style={styles.line} />
                                <Text style={styles.sectionTitle}>The Mission</Text>
                            </View>
                            <Text style={styles.paragraph}>
                                FieldForce provides architectural-grade infrastructure for elite field operations.
                                We connect administrators, supervisors, and agents in a unified, real-time workflow —
                                transforming complex logistics and disconnected teams into an agile, highly-coordinated
                                enterprise machine. We believe operational intelligence should be as sophisticated as the teams deploying it.
                            </Text>
                        </Animated.View>

                        <Animated.View style={[styles.featuresContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                            <View style={styles.sectionTitleRow}>
                                <View style={styles.line} />
                                <Text style={styles.sectionTitle}>Platform Capabilities</Text>
                            </View>

                            <View style={styles.grid}>
                                {MOBILE_FEATURES.map((f, i) => (
                                    <View key={i} style={styles.featureCard}>
                                        <View style={styles.iconWrap}>
                                            <Ionicons name={f.icon as any} size={24} color={APP_COLORS.accent} />
                                        </View>
                                        <Text style={styles.featureTitle}>{f.title}</Text>
                                        <Text style={styles.featureDesc}>{f.desc}</Text>
                                    </View>
                                ))}
                            </View>
                        </Animated.View>

                        <Animated.View style={[styles.aboutCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center', paddingVertical: 40 }]}>
                            <Ionicons name="shield-checkmark" size={40} color={APP_COLORS.accent} style={{ marginBottom: 16 }} />
                            <Text style={styles.devTitle}>Built by Team_Dev</Text>
                            <Text style={[styles.paragraph, { textAlign: 'center', marginBottom: 32 }]}>
                                Engineered by a dedicated team focused on empowering field sales and merchandising operations through state-of-the-art native technology and secure cloud architecture.
                            </Text>

                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() => router.push('/login')}
                            >
                                <Text style={styles.buttonText}>Access Dashboard</Text>
                                <Ionicons name="arrow-forward" size={20} color="#fff" />
                            </TouchableOpacity>
                        </Animated.View>

                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
}

/* ================= ENTRY POINT ================= */

export default function AboutScreen() {
    if (Platform.OS === 'web') {
        return <WebAbout />;
    }
    return <MobileAbout />;
}

/* ================= MOBILE STYLES ================= */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#09090b',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 60,
    },
    navTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    versionText: {
        fontSize: 13,
        fontFamily: Fonts.headingSemiBold,
        letterSpacing: 1,
        color: APP_COLORS.textSecondary,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoBadge: {
        marginBottom: 16,
        shadowColor: APP_COLORS.accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    subtitle: {
        color: APP_COLORS.accent,
        fontSize: 11,
        fontFamily: Fonts.headingXBold,
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    h1: {
        fontSize: 36,
        fontFamily: Fonts.heading,
        color: APP_COLORS.textPrimary,
        textAlign: 'center',
        letterSpacing: -1,
    },
    goldText: {
        color: APP_COLORS.accent,
    },
    aboutCard: {
        backgroundColor: APP_COLORS.cardBg,
        borderColor: APP_COLORS.cardBorder,
        borderWidth: 1,
        borderRadius: 24,
        padding: 32,
        marginBottom: 32,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    line: {
        height: 1,
        width: 40,
        backgroundColor: APP_COLORS.accent,
        marginRight: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: Fonts.headingXBold,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: APP_COLORS.accent,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 26,
        fontFamily: Fonts.body,
        color: APP_COLORS.textSecondary,
    },
    featuresContainer: {
        marginBottom: 32,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
    },
    featureCard: {
        backgroundColor: APP_COLORS.cardBg,
        borderColor: APP_COLORS.cardBorder,
        borderWidth: 1,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        marginBottom: 8,
    },
    iconWrap: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(212,168,75,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    featureTitle: {
        fontSize: 18,
        fontFamily: Fonts.headingSemiBold,
        color: APP_COLORS.textPrimary,
        marginBottom: 8,
    },
    featureDesc: {
        fontSize: 14,
        lineHeight: 22,
        fontFamily: Fonts.body,
        color: APP_COLORS.textSecondary,
    },
    devTitle: {
        fontSize: 24,
        fontFamily: Fonts.headingXBold,
        color: APP_COLORS.textPrimary,
        marginBottom: 12,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: APP_COLORS.accent,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        shadowColor: APP_COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        fontSize: 18,
        fontFamily: Fonts.cta,
        color: '#fff',
        marginRight: 8,
    },
});
