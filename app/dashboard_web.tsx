import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts } from '../hooks/useFonts';

// ─── Color palette (exact match to screenshot) ────────────────────────────────
const C = {
    // backgrounds — the screenshot shows a sand/azure/cool-grey shifting gradient
    bgFrom: '#E8E2D9',   // warm grey-sand (top-left of screenshot bg)
    bgMid: '#C8D8DB',   // cool azure-grey (mid)
    bgTo: '#B8CBCe',   // muted teal-grey (bottom)
    sand: '#F9E3B2',   // Desert Yellow – buttons, accents
    sandMid: '#D4B483',   // golden – "With Precision" text
    sandDark: '#C8A96E',   // deep gold
    brown: '#4F3A1B',   // Deep Brown – primary text, brand
    brownBtn: '#C8A96E',   // CTA button fill (matches screenshot sand button)
    azure: '#A2DFF7',   // Azure Blue – brand gradient, glows
    azureDark: '#4071A0',
    green: '#10B981',
    amber: '#F59E0B',
    text: '#1C1C1E',   // dark near-black (matches screenshot heading)
    textSub: '#4B5563',
    textMuted: '#6B7280',
    surface: 'rgba(255,255,255,0.55)',
    surfaceBorder: 'rgba(255,255,255,0.45)',
    navBg: 'rgba(240,234,222,0.88)',
} as const;

const { width: W } = Dimensions.get('window');
const CARD_W = (W - 48 - 10) / 2; // 2 cards per row, 24px side padding × 2, 10px gap

// ─── Animated Gradient Background ────────────────────────────────────────────
function AnimatedBg({ children }: { children: React.ReactNode }) {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
                Animated.timing(anim, { toValue: 0, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
            ])
        ).start();
    }, []);

    // Interpolate between two gradient color states mirroring the screenshot
    const color0 = anim.interpolate({ inputRange: [0, 1], outputRange: [C.bgFrom, '#D9E5E8'] });
    const color1 = anim.interpolate({ inputRange: [0, 1], outputRange: [C.bgMid, '#CBE0C8'] });
    const color2 = anim.interpolate({ inputRange: [0, 1], outputRange: [C.bgTo, '#BFD4D8'] });

    return (
        <View style={{ flex: 1 }}>
            {/* We simulate the animated gradient using 3 blurred colored views */}
            <View style={StyleSheet.absoluteFill}>
                <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: color0, opacity: 0.9 }]} />
                <Animated.View style={[blobStyle(280, -60, -60), { backgroundColor: C.azure, opacity: 0.2 }]} />
                <Animated.View style={[blobStyle(240, -40, undefined, -60), { backgroundColor: C.sand, opacity: 0.18 }]} />
                <Animated.View style={[blobStyle(180, 160, undefined, undefined, '35%'), { backgroundColor: C.azure, opacity: 0.12 }]} />
            </View>
            {children}
        </View>
    );
}

function blobStyle(size: number, top?: number, right?: number, bottom?: number, left?: any) {
    return {
        position: 'absolute' as const,
        width: size, height: size, borderRadius: size / 2,
        top, right, bottom, left,
    };
}

// ─── Fade-up entrance animation ───────────────────────────────────────────────
function FadeUp({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(28)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 600, delay, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 600, delay, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
            {children}
        </Animated.View>
    );
}

// ─── Feature Card (2-per-row) ─────────────────────────────────────────────────
function FeatureCard({
    icon, title, body, accent,
}: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string; accent: string }) {
    const scale = useRef(new Animated.Value(1)).current;
    const onIn = () => Animated.spring(scale, { toValue: 1.04, useNativeDriver: true, speed: 30 }).start();
    const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

    return (
        <Animated.View style={[fc.card, { transform: [{ scale }] }]}>
            <TouchableOpacity activeOpacity={1} onPressIn={onIn} onPressOut={onOut} style={fc.inner}>
                <View style={[fc.iconWrap, { backgroundColor: accent + '1A', borderColor: accent + '40' }]}>
                    <Ionicons name={icon} size={22} color={accent} />
                </View>
                <Text style={fc.title}>{title}</Text>
                <Text style={fc.body}>{body}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}
const fc = StyleSheet.create({
    card: { width: CARD_W, backgroundColor: C.surface, borderRadius: 18, borderWidth: 1, borderColor: C.surfaceBorder, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
    inner: { padding: 18 },
    iconWrap: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1 },
    title: { fontFamily: Fonts.headingSemiBold, fontSize: 14, color: C.text, marginBottom: 6 },
    body: { fontFamily: Fonts.body, fontSize: 12, color: C.textSub, lineHeight: 17 },
});

// ─── Capability row ───────────────────────────────────────────────────────────
function CapRow({ icon, title, body, color }: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string; color: string }) {
    return (
        <View style={cr.row}>
            <View style={[cr.iconBox, { backgroundColor: color + '1A' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={cr.title}>{title}</Text>
                <Text style={cr.body}>{body}</Text>
            </View>
        </View>
    );
}
const cr = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
    iconBox: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    title: { fontFamily: Fonts.headingSemiBold, fontSize: 14, color: C.text, marginBottom: 3 },
    body: { fontFamily: Fonts.body, fontSize: 12, color: C.textSub, lineHeight: 17 },
});

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ value, label }: { value: string; label: string }) {
    return (
        <View style={sp.pill}>
            <Text style={sp.value}>{value}</Text>
            <Text style={sp.label}>{label}</Text>
        </View>
    );
}
const sp = StyleSheet.create({
    pill: { flex: 1, alignItems: 'center', backgroundColor: C.surface, borderRadius: 16, paddingVertical: 14, borderWidth: 1, borderColor: C.surfaceBorder },
    value: { fontFamily: Fonts.heading, fontSize: 22, color: C.brown },
    label: { fontFamily: Fonts.body, fontSize: 11, color: C.textMuted, marginTop: 2 },
});

// ─── Testimonial card ─────────────────────────────────────────────────────────
function TestCard({ quote, author, role }: { quote: string; author: string; role: string }) {
    return (
        <View style={tst.card}>
            <Text style={tst.quote}>"{quote}"</Text>
            <View style={tst.row}>
                <View style={tst.avatar}><Text style={tst.avatarLetter}>{author[0]}</Text></View>
                <View>
                    <Text style={tst.name}>{author}</Text>
                    <Text style={tst.role}>{role}</Text>
                </View>
            </View>
        </View>
    );
}
const tst = StyleSheet.create({
    card: { backgroundColor: C.surface, borderRadius: 18, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: C.surfaceBorder, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
    quote: { fontFamily: Fonts.subheading, fontSize: 14, color: C.text, lineHeight: 21, marginBottom: 14, fontStyle: 'italic' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.brown, justifyContent: 'center', alignItems: 'center' },
    avatarLetter: { fontFamily: Fonts.heading, fontSize: 15, color: '#fff' },
    name: { fontFamily: Fonts.headingSemiBold, fontSize: 13, color: C.text },
    role: { fontFamily: Fonts.body, fontSize: 11, color: C.textMuted },
});

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
    const router = useRouter();

    // Redirect mobile users back to the native splash
    if (Platform.OS !== 'web') {
        // eslint-disable-next-line react-hooks/rules-of-hooks — safe because condition is static
        useEffect(() => { router.replace('/'); }, []);
        return null;
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <AnimatedBg>

                {/* ── STICKY NAV ─────────────────────────────────────── */}
                <View style={s.nav}>
                    {/* Brand */}
                    <View style={s.navBrand}>
                        <LinearGradient colors={[C.brown, C.azure]} style={s.navDot} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
                        <Text style={s.navBrandText}>MerchandisingTeam</Text>
                    </View>

                    {/* Links */}
                    <View style={s.navLinks}>
                        {['Features', 'Capabilities', 'Pricing'].map(l => (
                            <Text key={l} style={s.navLink}>{l}</Text>
                        ))}
                    </View>

                    {/* Actions */}
                    <View style={s.navActions}>
                        <TouchableOpacity style={s.navSignIn} onPress={() => router.push('/login')}>
                            <Text style={s.navSignInText}>Sign In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.navGetStarted} onPress={() => router.push('/login')}>
                            <Text style={s.navGetStartedText}>Get Started</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

                    {/* ── HERO ───────────────────────────────────────── */}
                    <View style={s.hero}>
                        <FadeUp>
                            <Text style={s.heroH1}>Manage Field Operations</Text>
                            <Text style={s.heroH1Gold}>With Precision</Text>
                        </FadeUp>

                        <FadeUp delay={120}>
                            <Text style={s.heroSub}>
                                Real-time merchandising coordination, GPS tracking, and instant event{'\n'}
                                reporting. Empower your teams with intelligent operations management.
                            </Text>
                        </FadeUp>

                        <FadeUp delay={230} style={s.heroBtns}>
                            {/* Primary CTA — sand/gold fill (matches screenshot) */}
                            <TouchableOpacity
                                style={s.ctaPrimary}
                                onPress={() => router.push('/login')}
                                activeOpacity={0.85}
                            >
                                <Text style={s.ctaPrimaryText}>Start Free Trial</Text>
                                <Ionicons name="arrow-forward" size={16} color={C.brown} />
                            </TouchableOpacity>

                            {/* Secondary CTA — outlined (matches screenshot) */}
                            <TouchableOpacity
                                style={s.ctaSecondary}
                                onPress={() => router.push('/about')}
                                activeOpacity={0.85}
                            >
                                <Text style={s.ctaSecondaryText}>Watch Demo</Text>
                            </TouchableOpacity>
                        </FadeUp>

                        {/* Stats row */}
                        <FadeUp delay={360} style={s.statsRow}>
                            <StatPill value="500+" label="Active Users" />
                            <View style={{ width: 8 }} />
                            <StatPill value="99.9%" label="Uptime" />
                            <View style={{ width: 8 }} />
                            <StatPill value="24/7" label="Support" />
                            <View style={{ width: 8 }} />
                            <StatPill value="3×" label="Productivity" />
                        </FadeUp>
                    </View>

                    {/* ── FEATURES — 2 CARDS PER ROW ─────────────────── */}
                    <View style={s.section}>
                        <FadeUp>
                            <Text style={s.sectionEyebrow}>WHAT WE OFFER</Text>
                            <Text style={s.sectionTitle}>Powerful Features</Text>
                            <Text style={s.sectionSub}>Everything you need to streamline field merchandising operations</Text>
                        </FadeUp>

                        <FadeUp delay={150}>
                            {/* Row 1 */}
                            <View style={s.cardRow}>
                                <FeatureCard icon="map" title="GPS Tracking" body="Real-time location tracking with geofencing and automated store check-ins." accent={C.brown} />
                                <FeatureCard icon="bar-chart" title="Analytics" body="Weekly & monthly dashboards with insights, KPIs, and performance metrics." accent={C.azureDark} />
                            </View>
                            {/* Row 2 */}
                            <View style={s.cardRow}>
                                <FeatureCard icon="people" title="Team Management" body="Role-based access for admins, supervisors, and merchandisers with full RBAC." accent={C.green} />
                                <FeatureCard icon="flash" title="Instant Reporting" body="Before/after photo reports with automated notifications and instant escalation." accent={C.amber} />
                            </View>
                            {/* Row 3 */}
                            <View style={s.cardRow}>
                                <FeatureCard icon="document-text" title="Smart Documents" body="Manage contracts, guidelines, and formal documents in one secure location." accent={C.azureDark} />
                                <FeatureCard icon="notifications" title="Smart Alerts" body="Push notifications for pending reports, new GMS requests, and important events." accent={C.brown} />
                            </View>
                        </FadeUp>
                    </View>

                    {/* ── CAPABILITIES ───────────────────────────────── */}
                    <View style={[s.section, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                        <FadeUp>
                            <Text style={s.sectionEyebrow}>WHY CHOOSE US</Text>
                            <Text style={s.sectionTitle}>Built for Modern Operations</Text>
                            <Text style={s.sectionSub}>Designed from the ground up for field teams that need reliability and speed.</Text>
                        </FadeUp>

                        <FadeUp delay={150}>
                            <View style={s.capLayout}>
                                {/* Left list */}
                                <View style={{ flex: 1, paddingRight: 16 }}>
                                    <CapRow icon="shield-checkmark" title="Enterprise Security" body="Bank-level JWT auth, role-based access control, and secure token storage." color={C.brown} />
                                    <CapRow icon="flash" title="Lightning Fast" body="Optimised API calls and local caching for smooth performance anywhere." color={C.azure} />
                                    <CapRow icon="people" title="Collaborative" body="Real-time coordination between admins, supervisors, and merchandisers." color={C.green} />
                                    <CapRow icon="map" title="Geofencing" body="Automated store check-in / check-out with GPS boundary enforcement." color={C.amber} />
                                </View>

                                {/* Right: decorative dashboard card */}
                                <View style={s.capDecoCard}>
                                    <LinearGradient colors={[C.brown, '#8B6914']} style={s.capDecoGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                        <Ionicons name="bar-chart" size={40} color="rgba(255,255,255,0.9)" />
                                        <Text style={s.capDecoTitle}>Live Dashboard</Text>
                                        <Text style={s.capDecoSub}>Real-time analytics for your entire field operation</Text>
                                        <View style={s.barRow}>
                                            {[[0.5, C.sand], [0.85, C.azure], [0.62, C.green]].map(([flex, color], i) => (
                                                <View key={i} style={[s.bar, { flex: flex as number, backgroundColor: color as string }]} />
                                            ))}
                                        </View>
                                    </LinearGradient>
                                    {/* floating badges */}
                                    <View style={[s.badge, { top: -12, right: 14, backgroundColor: C.green }]}>
                                        <Text style={s.badgeText}>✓  Report Approved</Text>
                                    </View>
                                    <View style={[s.badge, { bottom: -12, left: 14, backgroundColor: C.azure }]}>
                                        <Text style={[s.badgeText, { color: C.brown }]}>📍 New GMS Request</Text>
                                    </View>
                                </View>
                            </View>
                        </FadeUp>
                    </View>

                    {/* ── TESTIMONIALS ───────────────────────────────── */}
                    <View style={s.section}>
                        <FadeUp>
                            <Text style={s.sectionEyebrow}>WHAT TEAMS SAY</Text>
                            <Text style={s.sectionTitle}>Trusted by Field Teams</Text>
                        </FadeUp>
                        <FadeUp delay={150}>
                            <View style={s.cardRow}>
                                <View style={{ flex: 1 }}>
                                    <TestCard
                                        quote="MerchandisingTeam transformed how we manage our 40-person crew. GPS tracking and instant reports saved us hours every week."
                                        author="Karim B." role="Operations Supervisor"
                                    />
                                </View>
                                <View style={{ width: 10 }} />
                                <View style={{ flex: 1 }}>
                                    <TestCard
                                        quote="The analytics dashboard gives me a real-time view of every store visit. I spot issues before they become problems."
                                        author="Amira L." role="Regional Admin"
                                    />
                                </View>
                            </View>
                            <TestCard
                                quote="Before/after photo reports and instant notifications make approvals so much faster. I used to spend 2 hours a day on this task alone."
                                author="Youssef M." role="Merchandiser"
                            />
                        </FadeUp>
                    </View>

                    {/* ── CTA BANNER ─────────────────────────────────── */}
                    <LinearGradient colors={[C.brown, '#2C1A0A']} style={s.ctaBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        {/* glows */}
                        <View style={[blobStyle(180, -50, -30), { backgroundColor: C.sand, opacity: 0.15, position: 'absolute' }]} />
                        <View style={[blobStyle(140, undefined, undefined, -30, 10), { backgroundColor: C.azure, opacity: 0.12, position: 'absolute' }]} />

                        <FadeUp>
                            <Text style={s.ctaBannerTitle}>Ready to Transform Your Operations?</Text>
                            <Text style={s.ctaBannerSub}>Join hundreds of organizations managing their field operations more effectively.</Text>
                            <View style={s.ctaBannerBtns}>
                                <TouchableOpacity style={s.ctaBannerPrimary} onPress={() => router.push('/login')}>
                                    <Text style={s.ctaBannerPrimaryText}>Start Free Trial</Text>
                                    <Ionicons name="arrow-forward-circle" size={18} color={C.brown} />
                                </TouchableOpacity>
                                <TouchableOpacity style={s.ctaBannerSecondary} onPress={() => router.push('/about')}>
                                    <Text style={s.ctaBannerSecondaryText}>Learn More</Text>
                                </TouchableOpacity>
                            </View>
                        </FadeUp>
                    </LinearGradient>

                    {/* ── FOOTER ─────────────────────────────────────── */}
                    <View style={s.footer}>
                        <View style={s.footerTop}>
                            <View style={s.footerBrand}>
                                <LinearGradient colors={[C.brown, C.azure]} style={s.footerDot} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
                                <Text style={s.footerBrandName}>MerchandisingTeam</Text>
                            </View>
                            <Text style={s.footerTagline}>Empowering field operations{'\n'}with intelligent tools.</Text>
                        </View>
                        <View style={s.footerDivider} />
                        <View style={s.footerGrid}>
                            {[
                                { h: 'Product', ls: ['Features', 'Pricing', 'Security'] },
                                { h: 'Company', ls: ['About', 'Blog', 'Careers'] },
                                { h: 'Resources', ls: ['Docs', 'API', 'Support'] },
                                { h: 'Legal', ls: ['Privacy', 'Terms', 'Contact'] },
                            ].map(col => (
                                <View key={col.h} style={{ flex: 1 }}>
                                    <Text style={s.footerColHead}>{col.h}</Text>
                                    {col.ls.map(l => <Text key={l} style={s.footerLink}>{l}</Text>)}
                                </View>
                            ))}
                        </View>
                        <View style={s.footerDivider} />
                        <Text style={s.copyright}>© 2024 MerchandisingTeam. All rights reserved.</Text>
                    </View>

                </ScrollView>
            </AnimatedBg>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    // nav
    nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12, backgroundColor: C.navBg, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
    navBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    navDot: { width: 28, height: 28, borderRadius: 8 },
    navBrandText: { fontFamily: Fonts.heading, fontSize: 16, color: C.brown },
    navLinks: { flexDirection: 'row', gap: 24 },
    navLink: { fontFamily: Fonts.secondary, fontSize: 14, color: C.textSub },
    navActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    navSignIn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(79,58,27,0.35)' },
    navSignInText: { fontFamily: Fonts.secondaryBold, fontSize: 14, color: C.brown },
    navGetStarted: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 10, backgroundColor: C.brownBtn },
    navGetStartedText: { fontFamily: Fonts.secondaryBold, fontSize: 14, color: '#fff' },

    // hero
    hero: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 48, alignItems: 'center', overflow: 'hidden' },
    heroH1: { fontFamily: Fonts.heading, fontSize: 48, color: C.text, textAlign: 'center', lineHeight: 56 },
    heroH1Gold: { fontFamily: Fonts.heading, fontSize: 48, color: C.sandMid, textAlign: 'center', lineHeight: 58, marginBottom: 18 },
    heroSub: { fontFamily: Fonts.body, fontSize: 16, color: C.textSub, textAlign: 'center', lineHeight: 26, marginBottom: 32 },
    heroBtns: { flexDirection: 'row', gap: 12, marginBottom: 40, flexWrap: 'wrap', justifyContent: 'center' },

    // hero CTAs (match screenshot exactly)
    ctaPrimary: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.brownBtn, paddingHorizontal: 28, paddingVertical: 15, borderRadius: 12 },
    ctaPrimaryText: { fontFamily: Fonts.headingSemiBold, fontSize: 16, color: C.brown },
    ctaSecondary: { paddingHorizontal: 26, paddingVertical: 15, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(79,58,27,0.35)', backgroundColor: 'rgba(255,255,255,0.4)' },
    ctaSecondaryText: { fontFamily: Fonts.headingSemiBold, fontSize: 16, color: C.brown },

    statsRow: { flexDirection: 'row', width: '100%' },

    // section
    section: { paddingHorizontal: 24, paddingVertical: 48 },
    sectionEyebrow: { fontFamily: Fonts.secondaryBold, fontSize: 11, color: C.azureDark, letterSpacing: 2, marginBottom: 8, textAlign: 'center' },
    sectionTitle: { fontFamily: Fonts.heading, fontSize: 28, color: C.text, marginBottom: 8, textAlign: 'center' },
    sectionSub: { fontFamily: Fonts.body, fontSize: 14, color: C.textSub, textAlign: 'center', lineHeight: 21, marginBottom: 24 },

    // 2-per-row card grid
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },

    // capabilities
    capLayout: { flexDirection: 'row', alignItems: 'flex-start' },
    capDecoCard: { width: 220, position: 'relative', marginLeft: 20 },
    capDecoGrad: { borderRadius: 20, padding: 22, alignItems: 'center' },
    capDecoTitle: { fontFamily: Fonts.heading, fontSize: 15, color: '#fff', marginTop: 10 },
    capDecoSub: { fontFamily: Fonts.body, fontSize: 11, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 5, marginBottom: 14 },
    barRow: { flexDirection: 'row', gap: 5, width: '100%' },
    bar: { height: 6, borderRadius: 3 },
    badge: { position: 'absolute', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 6 },
    badgeText: { fontFamily: Fonts.secondaryBold, fontSize: 11, color: '#fff' },

    // CTA banner
    ctaBanner: { marginHorizontal: 24, marginBottom: 0, borderRadius: 24, padding: 32, alignItems: 'center', overflow: 'hidden' },
    ctaBannerTitle: { fontFamily: Fonts.heading, fontSize: 26, color: '#fff', textAlign: 'center', marginBottom: 10 },
    ctaBannerSub: { fontFamily: Fonts.body, fontSize: 14, color: 'rgba(255,255,255,0.72)', textAlign: 'center', lineHeight: 21, marginBottom: 24 },
    ctaBannerBtns: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
    ctaBannerPrimary: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.sand, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 12 },
    ctaBannerPrimaryText: { fontFamily: Fonts.headingSemiBold, fontSize: 15, color: C.brown },
    ctaBannerSecondary: { paddingHorizontal: 22, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)' },
    ctaBannerSecondaryText: { fontFamily: Fonts.headingSemiBold, fontSize: 15, color: 'rgba(255,255,255,0.85)' },

    // footer
    footer: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 30, backgroundColor: 'rgba(240,234,222,0.7)' },
    footerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    footerBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    footerDot: { width: 28, height: 28, borderRadius: 8 },
    footerBrandName: { fontFamily: Fonts.heading, fontSize: 15, color: C.brown },
    footerTagline: { fontFamily: Fonts.body, fontSize: 12, color: C.textMuted, lineHeight: 18, textAlign: 'right' },
    footerDivider: { height: 1, backgroundColor: 'rgba(79,58,27,0.15)', marginVertical: 16 },
    footerGrid: { flexDirection: 'row', gap: 8 },
    footerColHead: { fontFamily: Fonts.headingSemiBold, fontSize: 12, color: C.text, marginBottom: 10 },
    footerLink: { fontFamily: Fonts.body, fontSize: 12, color: C.textMuted, marginBottom: 7 },
    copyright: { fontFamily: Fonts.body, fontSize: 11, color: C.textMuted, textAlign: 'center' },
});
