import { Redirect, useRouter } from 'expo-router';
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
    Zap
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { StatsService, PublicStats } from '../services/stats.service';
import { Platform } from 'react-native';

/* ──────────────────────────────────────────
   PREMIUM LANDING PAGE — "Aurum" Theme
   Universal Web Entry (app/index.tsx)
   Pure inline styles — no Tailwind needed
────────────────────────────────────────── */

const COLOR = {
    bg: '#09090b',
    border: 'rgba(255,255,255,0.07)',
    gold: '#d4a84b',
    goldLight: '#f5d98c',
    white: '#ffffff',
    textMuted: 'rgba(255,255,255,0.40)',
    textSub: 'rgba(255,255,255,0.65)',
    violet: '#8b5cf6',
    sky: '#38bdf8',
    rose: '#fb7185',
    emerald: '#34d399',
};

const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { -webkit-font-smoothing: antialiased; background-color: ${COLOR.bg}; }
    body::-webkit-scrollbar { display: none; }
    body { -ms-overflow-style: none; scrollbar-width: none; }

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

    .float { animation: floatY 6s ease-in-out infinite; }
    @keyframes floatY { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-14px);} }

    .feat-card { transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease; }
    .feat-card:hover { transform: translateY(-8px); }

    .icon-wrap { transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
    .feat-card:hover .icon-wrap { transform: scale(1.12) rotate(-4deg); }

    .nav-link {
        padding: 8px 20px; font-size: 13px; font-weight: 600;
        color: rgba(255,255,255,0.45); border-radius: 10px; cursor: pointer;
        border: none; background: transparent; transition: color 0.2s, background 0.2s;
        font-family: inherit;
    }
    .nav-link:hover { color: #fff; background: rgba(255,255,255,0.06); }

    .cta-btn {
        position: relative; overflow: hidden; display: inline-flex; alignItems: center; gap: 10px;
        padding: 16px 36px; border-radius: 18px; font-weight: 900; font-size: 16px;
        cursor: pointer; border: none; transition: transform 0.25s ease, box-shadow 0.25s ease;
        font-family: inherit;
    }
    .cta-btn:active { transform: scale(0.95) !important; }
    .cta-btn-primary {
        background: linear-gradient(135deg, #d4a84b 0%, #f5d98c 50%, #d4a84b 100%);
        background-size: 200% auto; color: #000;
        box-shadow: 0 12px 40px rgba(212,168,75,0.4); animation: goldShift 4s linear infinite;
    }
    .cta-btn-primary:hover { transform: scale(1.04); box-shadow: 0 20px 50px rgba(212,168,75,0.5); }
    .cta-btn-secondary {
        background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1);
    }
    .cta-btn-secondary:hover { background: rgba(255,255,255,0.10); }

    /* Custom Image Marquee */
    .marquee-track { display: flex; width: max-content; animation: marquee 35s linear infinite; }
    .marquee-track:hover { animation-play-state: paused; }
    @keyframes marquee { from { transform: translateX(0); } to { transform:translateX(-50%); } }

    .ghost-input {
        background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px; padding: 16px 24px; color: #fff; font-size: 15px;
        font-weight: 500; font-family: inherit; outline: none; transition: border 0.2s;
        flex: 1; min-width: 0;
    }
    .ghost-input::placeholder { color: rgba(255,255,255,0.25); }
    .ghost-input:focus { border-color: rgba(212,168,75,0.5); }

    .footer-link { color: rgba(255,255,255,0.25); font-size: 13px; font-weight: 500; text-decoration: none; transition: color 0.2s; }
    .footer-link:hover { color: #d4a84b; }

    .social-btn {
        width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: background 0.2s, border 0.2s;
    }
    .social-btn:hover { background: rgba(212,168,75,0.1); border-color: rgba(212,168,75,0.3); }

    /* Sprite Box */
    .sprite-box {
        display: inline-block;
        background-repeat: no-repeat;
        filter: grayscale(100%) brightness(200%) opacity(0.5);
        transition: filter 0.3s ease, transform 0.3s ease;
    }
    .sprite-box:hover {
        filter: grayscale(0%) brightness(100%) opacity(1);
        transform: scale(1.05);
    }
`;

function AnimatedNumber({ value }: { value: string | number }) {
    const valStr = String(value);
    const match = valStr.match(/(\d+\.?\d*)/);
    const numericPart = match ? parseFloat(match[0]) : 0;
    const suffix = valStr.replace(String(numericPart), '');
    const decimalPlaces = match?.[1].includes('.') ? match[1].split('.')[1].length : 0;

    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (Platform.OS !== 'web') {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.2 });

        if (elementRef.current) observer.observe(elementRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        let startTime: number | null = null;
        const duration = 2400; // Smooth 2.4s count

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // Premium easeOutExpo function
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = ease * numericPart;
            
            setCount(current);
            if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }, [isVisible, numericPart]);

    return (
        <div ref={elementRef}>
            {count.toFixed(decimalPlaces)}
            {suffix}
        </div>
    );
}

function GoldDivider() {
    return (
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #d4a84b 40%, transparent)' }} />
    );
}

function SectionEyebrow({ children }: { children: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ height: 1, width: 40, background: COLOR.gold }} />
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.35em', textTransform: 'uppercase', color: COLOR.gold }}>
                {children}
            </span>
        </div>
    );
}

/* ── Sprite Config for Marquee Logos ── */
// Native dimensions: 1536 x 1024. We scale this down to a fixed width of 120px for the UI.
const DISPLAY_WIDTH = 120;
const LOGO_COORDS = [
    { x: 90, y: 130, w: 319, h: 210 }, // Delice
    { x: 465, y: 165, w: 280, h: 165 }, // Vitalait
    { x: 790, y: 145, w: 250, h: 200 }, // Boga
    { x: 1080, y: 155, w: 285, h: 175 }, // Apla
    { x: 125, y: 405, w: 290, h: 170 }, // Samba
    { x: 475, y: 395, w: 285, h: 185 }, // Randa
    { x: 795, y: 385, w: 250, h: 200 }, // Triki
    { x: 1075, y: 400, w: 300, h: 185 }, // Diari
    { x: 135, y: 705, w: 275, h: 210 }, // Saida
    { x: 455, y: 730, w: 310, h: 145 }, // Biscri
    { x: 1090, y: 715, w: 285, h: 175 }, // Olio
];

function CustomMarqueeLogos() {
    const asset = require('../assets/images/Marques_Transparent.png');
    const bgUrl = typeof asset === 'string' ? asset : (asset.uri || asset.default || '');

    return (
        <section style={{ padding: '20px 0', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', overflow: 'hidden' }}>
            <div className="marquee-track" style={{ gap: 60, padding: '10px 0' }}>
                {[...Array(2)].flatMap((_, j) =>
                    LOGO_COORDS.map((coord, i) => {
                        const scale = DISPLAY_WIDTH / coord.w;
                        const targetHeight = coord.h * scale;
                        return (
                            <div key={`${j}-${i}`} style={{
                                width: DISPLAY_WIDTH,
                                height: 80, // fixed container height
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <div className="sprite-box" style={{
                                    width: DISPLAY_WIDTH,
                                    height: targetHeight,
                                    backgroundImage: `url(${bgUrl})`,
                                    backgroundSize: `${1536 * scale}px ${1024 * scale}px`,
                                    backgroundPosition: `-${coord.x * scale}px -${coord.y * scale}px`
                                }} />
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
}

const FEATURES = [
    { icon: Target, label: 'Precision GPS', copy: 'Sub-meter geofencing with intelligent battery management, keeping every agent perfectly connected at all times.', ring: COLOR.gold, glow: 'rgba(212,168,75,0.12)' },
    { icon: BarChart3, label: 'Command Analytics', copy: 'Holistic real-time dashboards delivering KPIs, trend forecasts, and executive-level performance summaries.', ring: COLOR.violet, glow: 'rgba(139,92,246,0.12)' },
    { icon: Users, label: 'Team Orchestration', copy: 'Role-stratified access hierarchies with real-time synchronisation across every organisational tier.', ring: COLOR.sky, glow: 'rgba(56,189,248,0.12)' },
    { icon: Zap, label: 'Instant Reporting', copy: 'Timestamped proof-of-presence with photo logs, automated notification chains, and priority escalation protocols.', ring: COLOR.rose, glow: 'rgba(251,113,133,0.12)' },
    { icon: Shield, label: 'Enterprise Security', copy: 'Military-grade AES-256 encryption, ISO-27001 compliance, and private-cloud deployment for sensitive operations.', ring: COLOR.emerald, glow: 'rgba(52,211,153,0.12)' },
    { icon: Layers, label: 'Modular Platform', copy: 'Composable microservice modules that integrate seamlessly into your existing enterprise software ecosystem.', ring: '#fb923c', glow: 'rgba(251,146,60,0.12)' },
];

const PROGRESS = [
    { label: 'Shelf Coverage', value: 94, color: COLOR.gold },
    { label: 'Team Presence', value: 78, color: COLOR.violet },
    { label: 'Report Accuracy', value: 99, color: COLOR.emerald },
    { label: 'Route Efficiency', value: 87, color: COLOR.sky },
];

export default function UniversalLandingPage() {
    const router = useRouter();
    const [publicStats, setPublicStats] = useState<PublicStats | null>(null);

    useEffect(() => {
        StatsService.getPublicStats().then(setPublicStats);
    }, []);

    const METRICS = [
        { value: publicStats?.teams || '120+', unit: '', label: 'Active Staff' },
        { value: '99.9', unit: '%', label: 'SLA Uptime' },
        { value: publicStats?.reports || '5.2K+', unit: '', label: 'Daily Reports' },
        { value: publicStats?.data_points || '18K+', unit: '', label: 'Data Points' },
    ];

    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        if (Platform.OS !== 'web') return;
        const fn = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    if (Platform.OS !== 'web') {
        return <Redirect href="/indexMobile" />;
    }

    const scrollTo = (id: string) => {
        if (typeof document === 'undefined') return;
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: id === 'logos' ? 'center' : 'start' });
        }
    };
    const navPinned = scrollY > 30;

    const S = {
        page: { fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif", backgroundColor: COLOR.bg, color: COLOR.white, overflowX: 'hidden' as const, minHeight: '100vh' } as any,
        navWrap: { position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 100, padding: navPinned ? '12px 0' : '24px 0', transition: 'padding 0.6s ease' },
        navInner: { maxWidth: 1400, margin: '0 auto', padding: '0 32px' },
        navBox: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 24px', borderRadius: 20, background: navPinned ? 'rgba(0,0,0,0.7)' : 'transparent', backdropFilter: navPinned ? 'blur(24px) saturate(180%)' : 'none', border: navPinned ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent', boxShadow: navPinned ? '0 8px 40px rgba(0,0,0,0.5)' : 'none', transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)' },
        logo: { display: 'flex', alignItems: 'center', gap: 12 },
        logoBadge: { width: 44, height: 44, borderRadius: 14, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(212,168,75,0.4)', background: COLOR.bg },
        logoText: { fontWeight: 900, fontSize: 22, letterSpacing: '-0.04em' },
        navLinks: { display: 'flex', gap: 2, alignItems: 'center' },
        navActions: { display: 'flex', alignItems: 'center', gap: 12 },
        navSignIn: { background: 'none', border: 'none', color: COLOR.textMuted, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: '8px 16px', fontFamily: 'inherit', transition: 'color 0.2s' },
        heroSection: { position: 'relative' as const, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
        heroBg: { position: 'absolute' as const, inset: 0 },
        heroGrid: { position: 'absolute' as const, inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize: '60px 60px' },
        heroFade: { position: 'absolute' as const, bottom: 0, left: 0, right: 0, height: 200, background: `linear-gradient(to top, \${COLOR.bg}, transparent)` },
        heroContent: { position: 'relative' as const, zIndex: 10, maxWidth: 1400, margin: '0 auto', padding: '120px 40px 80px', width: '100%' },
        heroCopy: { maxWidth: 900, margin: '0 auto', textAlign: 'center' as const, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 32 },
        badge: { display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 20px', borderRadius: 100, border: '1px solid rgba(212,168,75,0.3)', background: 'rgba(212,168,75,0.08)', fontSize: 11, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: '#fcd98e' },
        heroH1: { fontWeight: 900, fontSize: 'clamp(3.2rem, 7.5vw, 7rem)', lineHeight: 0.92, letterSpacing: '-0.04em' },
        heroItalic: { fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: 'italic', fontWeight: 700 },
        heroP: { color: COLOR.textMuted, fontSize: 20, lineHeight: 1.7, fontWeight: 300, maxWidth: 540 },
        heroCtas: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' as const },
        metricsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 64, maxWidth: 880, margin: '64px auto 0' },
        metricCard: { padding: '24px 20px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' as const, backdropFilter: 'blur(12px)', transition: 'transform 0.3s ease, box-shadow 0.3s ease' } as any,
        featSection: { padding: '160px 40px', maxWidth: 1400, margin: '0 auto' },
        featHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 80, gap: 40, flexWrap: 'wrap' as const },
        featH2: { fontWeight: 900, fontSize: 'clamp(2.8rem, 5vw, 5rem)', letterSpacing: '-0.04em', lineHeight: 0.95 },
        featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 },
        featCard: { padding: '44px 36px', borderRadius: 28, background: 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.07)', cursor: 'default', overflow: 'hidden', position: 'relative' as const },
        intelSection: { padding: '160px 40px', background: '#040405', position: 'relative' as const, overflow: 'hidden' },
        intelInner: { maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 100, flexWrap: 'wrap' as const },
        deviceWrap: { background: 'linear-gradient(135deg, rgba(212,168,75,0.4), rgba(255,255,255,0.05), rgba(139,92,246,0.2))', padding: 1, borderRadius: 40, boxShadow: '0 30px 80px rgba(0,0,0,0.5)' },
        deviceInner: { background: '#0d0d0f', borderRadius: 39, padding: 36, minWidth: 360, display: 'flex', flexDirection: 'column' as const, gap: 20 },
        ctaSection: { padding: '180px 40px', position: 'relative' as const, overflow: 'hidden', textAlign: 'center' as const },
        ctaH2: { fontWeight: 900, fontSize: 'clamp(3rem, 6vw, 6.5rem)', letterSpacing: '-0.04em', lineHeight: 0.92 },
        ctaInputRow: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' as const, maxWidth: 560, margin: '0 auto' },
        footer: { background: '#040405', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '80px 40px 40px' },
        footerGrid: { maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 60, marginBottom: 64 },
        footerColTitle: { fontSize: 9, fontWeight: 900, letterSpacing: '0.35em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.35)', marginBottom: 24 },
        footerLinks: { display: 'flex', flexDirection: 'column' as const, gap: 14 },
        footerBottom: { maxWidth: 1400, margin: '0 auto', paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        footerCopy: { fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.15)' },
    };

    return (
        <div style={S.page}>
            <style dangerouslySetInnerHTML={{ __html: CSS }} />

            {/* NAV */}
            <nav style={S.navWrap}>
                <div style={S.navInner}>
                    <div style={S.navBox}>
                        <div style={S.logo}>
                            <div style={S.logoBadge}>
                                <img src={(() => {
                                    const a = require('../assets/images/index.png');
                                    return typeof a === 'string' ? a : (a.uri || a.default || '');
                                })()} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Logo" />
                            </div>
                            <span style={S.logoText}>Field<span className="gold-text">Force</span></span>
                        </div>
                        <div style={S.navLinks}>
                            {['Logos', 'Capabilities', 'Intelligence', 'Pricing'].map(n => (
                                <button key={n} className="nav-link" onClick={() => scrollTo(n.toLowerCase())}>{n}</button>
                            ))}
                        </div>
                        <div style={S.navActions}>
                            <button style={S.navSignIn} onClick={() => router.push('/login')}>Sign In</button>
                            <button className="cta-btn cta-btn-primary" style={{ padding: '10px 28px', fontSize: 13, borderRadius: 14 }} onClick={() => router.push('/login')}>
                                Get Access <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section style={S.heroSection} id="hero">
                <div style={S.heroBg}>
                    <div style={{ position: 'absolute', top: '-5%', left: '-5%', width: '55%', height: '55%', borderRadius: '50%', background: 'rgba(180,120,20,0.12)', filter: 'blur(120px)' }} />
                    <div style={{ position: 'absolute', bottom: '-5%', right: '-5%', width: '45%', height: '45%', borderRadius: '50%', background: 'rgba(100,60,200,0.10)', filter: 'blur(100px)' }} />
                    <div style={S.heroGrid} />
                    <div style={S.heroFade} />
                </div>
                <div style={S.heroContent}>
                    <div style={S.heroCopy}>
                        <div className="reveal" style={{ animationDelay: '0.05s' }}>
                            <div style={S.badge}><Sparkles size={14} color={COLOR.gold} /> Enterprise Field Intelligence</div>
                        </div>
                        <h1 className="reveal" style={{ ...S.heroH1, animationDelay: '0.15s' }}>
                            Orchestrate<br />
                            <span className="gold-text" style={S.heroItalic}>Field Success</span><br />
                            With Precision.
                        </h1>
                        <p className="reveal" style={{ ...S.heroP, animationDelay: '0.25s' }}>
                            Real-time merchandising coordination, GPS-grade location intelligence, and instant event synthesis powering the world&apos;s most agile field forces.
                        </p>
                        <div className="reveal" style={{ ...S.heroCtas, animationDelay: '0.35s' }}>
                            <button className="cta-btn cta-btn-primary" onClick={() => router.push('/login')}>Launch Platform <ArrowRight size={18} /></button>
                        </div>
                    </div>
                    <div className="reveal" style={{ ...S.metricsRow, animationDelay: '0.45s' }}>
                        {METRICS.map((m, i) => (
                            <div key={i} style={S.metricCard}>
                                <div className="gold-text" style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em' }}>
                                    <AnimatedNumber value={m.value} />
                                </div>
                                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', color: COLOR.textMuted, marginTop: 6 }}>{m.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CUSTOM IMAGE MARQUEE */}
            <GoldDivider />
            <div id="logos">
                <CustomMarqueeLogos />
            </div>
            <GoldDivider />

            {/* FEATURES */}
            <section id="capabilities">
                <div style={S.featSection}>
                    <SectionEyebrow>Core Capabilities</SectionEyebrow>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24, marginBottom: 80, gap: 100 }}>
                        <h2 className="reveal" style={{ fontWeight: 900, fontSize: '5rem', letterSpacing: '-0.04em', lineHeight: 1, margin: 0 }}>
                            Built for<br />
                            <span className="gold-text" style={{ fontFamily: "'DM Serif Display', serif", fontStyle: 'italic', fontWeight: 700 }}>exceptional</span><br />
                            operations.
                        </h2>
                        
                        <p style={{ color: COLOR.textMuted, fontSize: 18, lineHeight: 1.7, fontWeight: 400, maxWidth: 380, margin: 0, paddingBottom: 20 }}>
                            Every module engineered around one principle: field intelligence should be as sophisticated as the teams deploying it.
                        </p>
                    </div>

                    <div style={S.featureGrid}>
                        {FEATURES.map((f, i) => (
                            <div key={i} className="feat-card" style={{ ...S.featCard, boxShadow: `0 0 40px -12px ${f.ring}00` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                                    <div className="icon-wrap" style={{ width: 56, height: 56, borderRadius: 18, background: f.glow, border: `1px solid ${f.ring}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 25px -8px ${f.ring}60` }}>
                                        <f.icon size={26} color={f.ring} strokeWidth={1.5} />
                                    </div>
                                    <h3 style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>{f.label}</h3>
                                </div>
                                <p style={{ color: COLOR.textMuted, lineHeight: 1.75, fontWeight: 300, fontSize: 15 }}>{f.copy}</p>
                            </div>
                        ))}
                    </div>
                </div >
            </section >

            {/* INTELLIGENCE */}
            < section id="intelligence" style={S.intelSection} >
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />
                <div style={S.intelInner}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 40, minWidth: 320 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <SectionEyebrow>Intelligence Layer</SectionEyebrow>
                            <h2 style={{ ...S.featH2, lineHeight: 0.95 }}>Operational<br /><span className="gold-text" style={S.heroItalic}>intelligence,</span><br />redefined.</h2>
                            <p style={{ color: COLOR.textMuted, fontSize: 17, lineHeight: 1.7, fontWeight: 300, maxWidth: 380 }}>Our core analyzes store patterns, team dynamics, and route efficiency to surface insights no human eye could catch.</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {['Sub-meter GPS with adaptive battery protocols.', 'AI-driven route optimization every 90 seconds.', 'AES-256 enterprise-grade data encryption.', 'Real-time sync across all organisational tiers.'].map((line, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                                    <CheckCircle2 color={COLOR.gold} size={18} style={{ marginTop: 2, flexShrink: 0 }} />
                                    <p style={{ color: COLOR.textSub, fontWeight: 500, fontSize: 15 }}>{line}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}>
                        <div className="float" style={{ position: 'relative' }}>
                            <div style={S.deviceWrap}>
                                <div style={S.deviceInner}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div><div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', color: COLOR.gold }}>Live Operation</div><div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>Fleet Status</div></div>
                                    </div>
                                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {PROGRESS.map((p, i) => (
                                            <div key={i}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>{p.label}</span>
                                                    <span style={{ fontSize: 11, fontWeight: 900, color: p.color }}>{p.value}%</span>
                                                </div>
                                                <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${p.value}%`, background: p.color, boxShadow: `0 0 10px ${p.color}40` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>Ops: {publicStats?.teams || '120+'}</span><span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: COLOR.gold }}>{publicStats?.stores || '48+'} Cities</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(212,168,75,0.18)', filter: 'blur(50px)' }} />
                            <div style={{ position: 'absolute', bottom: -30, left: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', filter: 'blur(50px)' }} />
                        </div>
                    </div>
                </div>
            </section >

            {/* CTA */}
            < section style={S.ctaSection} id="pricing" >
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212,168,75,0.08), transparent)' }} />
                <div style={{ position: 'relative', zIndex: 10, maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, width: '100%' }}>
                        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,168,75,0.4))' }} />
                        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.35em', textTransform: 'uppercase', color: COLOR.gold, whiteSpace: 'nowrap' }}>Begin Your Journey</span>
                        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(212,168,75,0.4), transparent)' }} />
                    </div>
                    <h2 style={S.ctaH2}>The field deserves<br /><span className="gold-text" style={S.heroItalic}>exceptional</span> tools.</h2>
                    <div style={S.ctaInputRow}>
                        <input type="email" placeholder="your@enterprise.com" className="ghost-input" />
                        <button className="cta-btn cta-btn-primary" style={{ flexShrink: 0 }}>Request Access</button>
                    </div>
                </div>
            </section >

            {/* FOOTER */}
            < footer style={S.footer} >
                <div style={S.footerGrid}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ ...S.logoBadge, width: 34, height: 34 }}>
                                <img src={(() => {
                                    const a = require('../assets/images/index.png');
                                    return typeof a === 'string' ? a : (a.uri || a.default || '');
                                })()} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Logo" />
                            </div>
                            <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: '-0.03em' }}>FieldForce</span>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, lineHeight: 1.75, fontWeight: 300, maxWidth: 260 }}>Architectural-grade infrastructure for elite field operations.</p>
                        <div style={{ display: 'flex', gap: 10 }}>{[Globe2, Shield, LineChart].map((Icon, i) => (<div key={i} className="social-btn"><Icon size={15} color="rgba(255,255,255,0.3)" /></div>))}</div>
                    </div>
                    {[{ title: 'Platform',  links: ['Dashboard', 'GPS Engine', 'Reports', 'QA Suite'] },
                      { title: 'Services',  links: ['Enterprise', 'Security', 'API Access', 'Consulting'] },
                      { title: 'Resources', links: ['Docs', 'Whitepapers', 'Status', 'Blog'] },
                      { title: 'Company',   links: ['About', 'Careers', 'Privacy', 'Legal'] }].map(col => (
                        <div key={col.title}>
                            <p style={S.footerColTitle}>{col.title}</p>
                            <div style={S.footerLinks}>{col.links.map(link => (<a key={link} href="#" className="footer-link">{link}</a>))}</div>
                        </div>
                    ))}
                </div>
                <div style={S.footerBottom}>
                    <p style={S.footerCopy}>&copy; 2024 FieldForce Global Systems. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: 32 }}>
                        <a href="#" style={{ ...S.footerCopy, textDecoration: 'none' }} className="footer-link">Status: Operational</a>
                        <a href="#" style={{ ...S.footerCopy, textDecoration: 'none' }} className="footer-link">v2.4.1</a>
                    </div>
                </div>
            </footer >
        </div >
    );
}
