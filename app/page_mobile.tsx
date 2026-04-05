import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    ArrowRight,
    BarChart3,
    CheckCircle2,
    Command,
    Globe2,
    Layers,
    LineChart,
    Shield,
    Sparkles,
    Target,
    Users,
    Zap,
} from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts } from '../hooks/useFonts';

const { width: W, height: H } = Dimensions.get('window');

const COLOR = {
    bg: '#09090b',
    surface: '#111113',
    border: 'rgba(255,255,255,0.07)',
    gold: '#d4a84b',
    goldLight: '#f5d98c',
    goldDim: 'rgba(212,168,75,0.15)',
    white: '#ffffff',
    textMuted: 'rgba(255,255,255,0.40)',
    textSub: 'rgba(255,255,255,0.65)',
    violet: '#8b5cf6',
    sky: '#38bdf8',
    rose: '#fb7185',
    emerald: '#34d399',
};

/* ── Sub-components ──────────────────────── */

const GoldText = ({ children, style }: any) => {
    const shineAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shineAnim, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: false }),
                Animated.timing(shineAnim, { toValue: 0, duration: 0, useNativeDriver: false }),
            ])
        ).start();
    }, []);

    const translateX = shineAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, W],
    });

    return (
        <View style={[{ position: 'relative', overflow: 'hidden' }, style]}>
            <Text style={[style, { color: COLOR.gold }]}>{children}</Text>
            <Animated.View style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: 100,
                transform: [{ translateX }],
            }}>
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
};

const RevealView = React.memo(function RevealView({ children, delay = 0, style }: any) {
    const anim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(anim, { toValue: 1, duration: 800, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 800, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
    }, [anim, delay, translateY]);

    return (
        <Animated.View style={[style, { opacity: anim, transform: [{ translateY }] }]}>
            {children}
        </Animated.View>
    );
});

const FloatingIcon = React.memo(function FloatingIcon({ children }: any) {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                Animated.timing(anim, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            ])
        ).start();
    }, [anim]);

    const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -10],
    });

    return <Animated.View style={{ transform: [{ translateY }] }}>{children}</Animated.View>;
});

const GoldDivider = () => (
    <LinearGradient
        colors={['transparent', COLOR.gold, 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ height: 1, marginVertical: 40 }}
    />
);

/* ── Feature data ──────────────────────── */
const FEATURES = [
    { icon: Target, label: 'Precision GPS', copy: 'Sub-meter geofencing with intelligent battery management, keeping every agent perfectly connected.', ring: COLOR.gold, glow: 'rgba(212,168,75,0.12)' },
    { icon: BarChart3, label: 'Command Analytics', copy: 'Holistic dashboards delivering KPIs, trend forecasts, and executive-level performance summaries.', ring: COLOR.violet, glow: 'rgba(139,92,246,0.12)' },
    { icon: Users, label: 'Team Orchestration', copy: 'Role-stratified access hierarchies with real-time synchronisation across every organisational tier.', ring: COLOR.sky, glow: 'rgba(56,189,248,0.12)' },
    { icon: Zap, label: 'Instant Reporting', copy: 'Timestamped proof-of-presence with photo logs, automated notification chains, and priority protocols.', ring: COLOR.rose, glow: 'rgba(251,113,133,0.12)' },
    { icon: Shield, label: 'Enterprise Security', copy: 'Military-grade encryption, ISO-27001 compliance, and private-cloud deployment for sensitive ops.', ring: COLOR.emerald, glow: 'rgba(52,211,153,0.12)' },
    { icon: Layers, label: 'Modular Platform', copy: 'Composable microservice modules that integrate seamlessly into your existing enterprise software.', ring: '#fb923c', glow: 'rgba(251,146,60,0.12)' },
];

const METRICS = [
    { value: '500+', label: 'Active Teams' },
    { value: '99.99%', label: 'SLA Uptime' },
    { value: '2.4s', label: 'Avg Report Time' },
    { value: '5.2B', label: 'Data Points / Mo' },
];

const PROGRESS = [
    { label: 'Shelf Coverage', value: 94, color: COLOR.gold },
    { label: 'Team Presence', value: 78, color: COLOR.violet },
    { label: 'Report Accuracy', value: 99, color: COLOR.emerald },
    { label: 'Route Efficiency', value: 87, color: COLOR.sky },
];

export default function LandingPage() {
    const router = useRouter();

    return (
        <View style={S.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* ── HERO SECTION ──────────────────────── */}
                <View style={S.heroSection}>
                    {/* Background decorations */}
                    <View style={[S.glowBlob, { top: -100, left: -50, backgroundColor: 'rgba(212,168,75,0.12)' }]} />
                    <View style={[S.glowBlob, { bottom: 100, right: -50, backgroundColor: 'rgba(139,92,246,0.10)' }]} />
                    <View style={S.gridOverlay} />

                    <SafeAreaView style={S.heroContent}>
                        {/* Nav (simplified for mobile landing) */}
                        <View style={S.navHero}>
                            <View style={S.logo}>
                                <View style={S.logoBadge}>
                                    <Command size={18} color="#000" strokeWidth={2.5} />
                                </View>
                                <Text style={S.logoText}>Field<Text style={{ color: COLOR.gold }}>Force</Text></Text>
                            </View>
                            <TouchableOpacity style={S.navBtn} onPress={() => router.push('/login')}>
                                <Text style={S.navBtnText}>Sign In</Text>
                            </TouchableOpacity>
                        </View>

                        <RevealView delay={200} style={S.heroMain}>
                            <View style={S.badge}>
                                <Sparkles size={12} color={COLOR.gold} />
                                <Text style={S.badgeText}>Enterprise Field Intelligence</Text>
                            </View>

                            <Text style={S.heroH1}>
                                Orchestrate {'\n'}
                                <Text style={{ fontFamily: Fonts.subheading, fontStyle: 'italic', fontWeight: '700', color: COLOR.gold }}>Field Success</Text> {'\n'}
                                With Precision.
                            </Text>

                            <Text style={S.heroP}>
                                Real-time merchandising coordination, GPS-grade location intelligence, and instant event synthesis.
                            </Text>

                            <View style={S.heroCtas}>
                                <TouchableOpacity style={S.ctaPrimary} onPress={() => router.push('/login')}>
                                    <LinearGradient
                                        colors={[COLOR.gold, COLOR.goldLight, COLOR.gold]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={S.ctaGradient}
                                    >
                                        <Text style={S.ctaTextPrimary}>Launch Platform</Text>
                                        <ArrowRight size={18} color="#000" />
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity style={S.ctaSecondary} onPress={() => router.push('/about')}>
                                    <Text style={S.ctaTextSecondary}>Explore Capabilities</Text>
                                </TouchableOpacity>
                            </View>
                        </RevealView>

                        {/* Metrics Row */}
                        <RevealView delay={600} style={S.metricsGrid}>
                            {METRICS.map((m, i) => (
                                <View key={i} style={S.metricCard}>
                                    <Text style={S.metricValue}>{m.value}</Text>
                                    <Text style={S.metricLabel}>{m.label}</Text>
                                </View>
                            ))}
                        </RevealView>
                    </SafeAreaView>
                </View>

                {/* ── DIVIDER ── */}
                <GoldDivider />

                {/* ── FEATURES SECTION ──────────────────── */}
                <View style={S.section}>
                    <RevealView delay={100} style={S.sectionHeader}>
                        <View style={S.eyebrowRow}>
                            <View style={S.eyebrowLine} />
                            <Text style={S.eyebrow}>Core Capabilities</Text>
                        </View>
                        <Text style={S.sectionH2}>Built for <Text style={{ color: COLOR.gold }}>exceptional</Text> operations.</Text>
                        <Text style={S.sectionP}>Every module engineered around one principle: field intelligence should be as sophisticated as the teams deploying it.</Text>
                    </RevealView>

                    <View style={S.featGrid}>
                        {FEATURES.map((f, i) => (
                            <RevealView key={i} delay={200 + i * 100} style={S.featCard}>
                                <View style={[S.iconBox, { backgroundColor: f.glow, borderColor: f.ring + '30' }]}>
                                    <f.icon size={22} color={f.ring} />
                                </View>
                                <Text style={S.featLabel}>{f.label}</Text>
                                <Text style={S.featCopy}>{f.copy}</Text>
                            </RevealView>
                        ))}
                    </View>
                </View>

                {/* ── INTELLIGENCE SECTION ──────────────── */}
                <View style={[S.section, { backgroundColor: '#040405', marginVertical: 40 }]}>
                    <View style={S.intelContent}>
                        <RevealView delay={100} style={{ gap: 24 }}>
                            <View style={S.eyebrowRow}>
                                <View style={S.eyebrowLine} />
                                <Text style={S.eyebrow}>Intelligence Layer</Text>
                            </View>
                            <Text style={S.sectionH2}>Operational <Text style={{ color: COLOR.gold }}>intelligence,</Text> redefined.</Text>
                            <Text style={S.sectionP}>Our core analyzes store patterns, team dynamics, and route efficiency to surface insights no human eye could catch.</Text>

                            <View style={{ gap: 16, marginTop: 10 }}>
                                {[
                                    'Sub-meter GPS with adaptive battery.',
                                    'AI-driven route optimization.',
                                    'AES-256 enterprise-grade security.',
                                    'Real-time sync across all tiers.',
                                ].map((line, i) => (
                                    <View key={i} style={S.checkRow}>
                                        <CheckCircle2 color={COLOR.gold} size={18} />
                                        <Text style={S.checkText}>{line}</Text>
                                    </View>
                                ))}
                            </View>
                        </RevealView>

                        {/* Device Mockup */}
                        <RevealView delay={400} style={S.mockupContainer}>
                            <FloatingIcon>
                                <LinearGradient colors={[COLOR.gold + '40', COLOR.white + '05', COLOR.violet + '20']} style={S.mockupBorder}>
                                    <View style={S.mockupInner}>
                                        <View style={S.mockupHeader}>
                                            <View>
                                                <Text style={S.mockupEyebrow}>Live Operation</Text>
                                                <Text style={S.mockupTitle}>Store #4482</Text>
                                            </View>
                                            <View style={S.statusBadge}>
                                                <Text style={S.statusText}>● Active</Text>
                                            </View>
                                        </View>

                                        <View style={{ gap: 20 }}>
                                            {PROGRESS.map((row, idx) => (
                                                <View key={idx}>
                                                    <View style={S.progRow}>
                                                        <Text style={S.progLabel}>{row.label}</Text>
                                                        <Text style={[S.progValue, { color: row.color }]}>{row.value}%</Text>
                                                    </View>
                                                    <View style={S.progTrack}>
                                                        <View style={[S.progFill, { width: `${row.value}%`, backgroundColor: row.color }]} />
                                                    </View>
                                                </View>
                                            ))}
                                        </View>

                                        <View style={S.mockupFooter}>
                                            <Text style={S.mockupFooterText}>Ops: 124 Active</Text>
                                            <Text style={S.mockupLocation}>36.80°N</Text>
                                        </View>
                                    </View>
                                </LinearGradient>
                            </FloatingIcon>
                        </RevealView>
                    </View>
                </View>

                {/* ── FOOTER ────────────────────────────── */}
                <View style={S.footer}>
                    <View style={S.footerContent}>
                        <View style={S.footerBrand}>
                            <View style={S.logo}>
                                <View style={[S.logoBadge, { width: 34, height: 34 }]}>
                                    <Command size={16} color="#000" strokeWidth={2.5} />
                                </View>
                                <Text style={[S.logoText, { fontSize: 18 }]}>FieldForce</Text>
                            </View>
                            <Text style={S.footerTagline}>Architectural-grade infrastructure for elite field operations.</Text>

                            <View style={S.socialRow}>
                                {[Globe2, Shield, LineChart].map((Icon, i) => (
                                    <TouchableOpacity key={i} style={S.socialBtn}>
                                        <Icon size={16} color="rgba(255,255,255,0.3)" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <GoldDivider />

                        <View style={S.footerLinksGrid}>
                            {[
                                { title: 'Platform', links: ['Dashboard', 'GPS Engine', 'Reports'] },
                                { title: 'Services', links: ['Enterprise', 'Security', 'Consulting'] },
                                { title: 'Legal', links: ['Privacy', 'Terms', 'Compliance'] },
                            ].map((col, i) => (
                                <View key={i} style={S.footerCol}>
                                    <Text style={S.footerColTitle}>{col.title}</Text>
                                    {col.links.map((link, idx) => (
                                        <Text key={idx} style={S.footerLink}>{link}</Text>
                                    ))}
                                </View>
                            ))}
                        </View>

                        <Text style={S.bottomCopy}>© 2024 FIELDFORCE GLOBAL SYSTEMS. ALL RIGHTS RESERVED.</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const S = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLOR.bg },
    heroSection: { height: H * 0.9, position: 'relative' },
    glowBlob: { position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.2, filter: 'blur(80px)' } as any,
    gridOverlay: { ...StyleSheet.absoluteFillObject, opacity: 0.1, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)' },
    heroContent: { flex: 1, paddingHorizontal: 24 },

    /* NAV HERO */
    navHero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 60, marginTop: 10 },
    logo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    logoBadge: { width: 38, height: 38, borderRadius: 12, backgroundColor: COLOR.gold, justifyContent: 'center', alignItems: 'center' },
    logoText: { color: COLOR.white, fontSize: 20, fontFamily: Fonts.heading, fontWeight: '900', letterSpacing: -1 },
    navBtn: { paddingVertical: 6, paddingHorizontal: 12 },
    navBtnText: { color: COLOR.textMuted, fontSize: 13, fontFamily: Fonts.bodyBold },

    /* HERO CONTENT */
    heroMain: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 24 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, backgroundColor: 'rgba(212,168,75,0.1)', borderWidth: 1, borderColor: 'rgba(212,168,75,0.2)' },
    badgeText: { color: COLOR.goldLight, fontSize: 10, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' },
    heroH1: { fontSize: 42, color: COLOR.white, fontFamily: Fonts.heading, fontWeight: '900', textAlign: 'center', lineHeight: 46, letterSpacing: -1 },
    heroP: { color: COLOR.textMuted, fontSize: 16, fontFamily: Fonts.body, lineHeight: 24, textAlign: 'center', maxWidth: 300 },

    heroCtas: { flexDirection: 'row', gap: 12, marginTop: 10 },
    ctaPrimary: { borderRadius: 16, overflow: 'hidden', elevation: 8 },
    ctaGradient: { paddingVertical: 14, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 10 },
    ctaTextPrimary: { color: '#000', fontSize: 15, fontWeight: '900', fontFamily: Fonts.heading },
    ctaSecondary: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center' },
    ctaTextSecondary: { color: COLOR.white, fontSize: 14, fontWeight: '600' },

    metricsGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 40 },
    metricCard: { flex: 1, alignItems: 'center' },
    metricValue: { color: COLOR.gold, fontSize: 24, fontWeight: '900', fontFamily: Fonts.heading },
    metricLabel: { color: COLOR.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 },

    /* SECTION BASICS */
    section: { paddingHorizontal: 24, paddingVertical: 60 },
    eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    eyebrowLine: { width: 30, height: 1, backgroundColor: COLOR.gold },
    eyebrow: { color: COLOR.gold, fontSize: 10, fontWeight: '900', letterSpacing: 3, textTransform: 'uppercase' },
    sectionHeader: { marginBottom: 48 },
    sectionH2: { color: COLOR.white, fontSize: 32, fontWeight: '900', fontFamily: Fonts.heading, letterSpacing: -1, lineHeight: 38 },
    sectionP: { color: COLOR.textMuted, fontSize: 15, fontFamily: Fonts.body, lineHeight: 24, marginTop: 16 },

    featGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    featCard: { width: (W - 48 - 12) / 2, padding: 24, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    iconBox: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    featLabel: { color: COLOR.white, fontSize: 16, fontWeight: '800', marginBottom: 8, letterSpacing: -0.5 },
    featCopy: { color: COLOR.textMuted, fontSize: 12, lineHeight: 18, fontWeight: '300' },

    /* INTEL SECTION */
    intelContent: { gap: 60 },
    checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    checkText: { color: COLOR.textSub, fontSize: 15, fontWeight: '600' },

    mockupContainer: { alignItems: 'center' },
    mockupBorder: { borderRadius: 40, padding: 1 },
    mockupInner: { backgroundColor: '#0d0d0f', borderRadius: 39, padding: 32, width: W * 0.85, gap: 24 },
    mockupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 16 },
    mockupEyebrow: { color: COLOR.gold, fontSize: 9, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' },
    mockupTitle: { color: COLOR.white, fontSize: 18, fontWeight: '700', marginTop: 4 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100, backgroundColor: 'rgba(52,211,153,0.1)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.2)' },
    statusText: { color: COLOR.emerald, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },

    progRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progLabel: { color: COLOR.textMuted, fontSize: 12, fontWeight: '600' },
    progValue: { fontSize: 12, fontWeight: '800' },
    progTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 100, overflow: 'hidden' },
    progFill: { height: '100%', borderRadius: 100 },

    mockupFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)', paddingTop: 16 },
    mockupFooterText: { color: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
    mockupLocation: { color: COLOR.gold, fontSize: 9, fontWeight: '900' },

    /* FOOTER */
    footer: { paddingBottom: 60, backgroundColor: '#040405' },
    footerContent: { paddingHorizontal: 24 },
    footerBrand: { gap: 16 },
    footerTagline: { color: 'rgba(255,255,255,0.3)', fontSize: 14, lineHeight: 22, fontWeight: '300', maxWidth: W * 0.7 },
    socialRow: { flexDirection: 'row', gap: 12 },
    socialBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },

    footerLinksGrid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32 },
    footerCol: { minWidth: 100 },
    footerColTitle: { color: 'rgba(255,255,255,0.35)', fontSize: 9, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 },
    footerLink: { color: 'rgba(255,255,255,0.25)', fontSize: 13, marginBottom: 12 },
    bottomCopy: { color: 'rgba(255,255,255,0.1)', fontSize: 9, fontWeight: '700', letterSpacing: 2, marginTop: 40, textAlign: 'center' },
});
