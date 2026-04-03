import { Stack, useRouter } from 'expo-router';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Platform, Text, View } from 'react-native';

const COLOR = {
    bg: '#09090b',
    gold: '#d4a84b',
    goldLight: '#f5d98c',
    textMuted: 'rgba(255,255,255,0.40)',
    white: '#ffffff',
};

const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&display=swap');

    body {
        margin: 0;
        background-color: ${COLOR.bg};
        font-family: 'Inter', system-ui, sans-serif;
        color: ${COLOR.white};
        overflow: hidden;
    }

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

    .cta-btn-primary {
        display: inline-flex; align-items: center; gap: 10px;
        padding: 16px 36px; border-radius: 18px; font-weight: 900; font-size: 16px;
        cursor: pointer; border: none; transition: transform 0.25s ease, box-shadow 0.25s ease;
        background: linear-gradient(135deg, #d4a84b 0%, #f5d98c 50%, #d4a84b 100%);
        background-size: 200% auto; color: #000;
        box-shadow: 0 12px 40px rgba(212,168,75,0.4); animation: goldShift 4s linear infinite;
        font-family: inherit;
    }
    .cta-btn-primary:active { transform: scale(0.95); }
    .cta-btn-primary:hover { transform: scale(1.04); box-shadow: 0 20px 50px rgba(212,168,75,0.5); }
`;

export default function NotFoundScreen() {
    const router = useRouter();

    if (Platform.OS !== 'web') {
        return (
            <View style={{ flex: 1, backgroundColor: COLOR.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
                <Stack.Screen options={{ title: 'Not Found', headerShown: false }} />
                <Text style={{ color: COLOR.gold, fontSize: 64, fontWeight: '900' }}>404</Text>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 16 }}>Page Not Found</Text>
                <Text style={{ color: COLOR.textMuted, fontSize: 14, marginTop: 8, textAlign: 'center' }}>This route does not exist in the FieldForce network.</Text>
            </View>
        );
    }

    const S = {
        container: {
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            textAlign: 'center' as const,
            padding: 40,
            position: 'relative' as const,
        },
        bg: {
            position: 'absolute' as const,
            inset: 0,
            zIndex: -1,
        },
        grid: {
            position: 'absolute' as const, inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)',
            backgroundSize: '60px 60px',
        },
        ambientTop: {
            position: 'absolute' as const, top: '-10%', left: '20%',
            width: '60%', height: '60%', borderRadius: '50%',
            background: 'rgba(212,168,75,0.08)', filter: 'blur(100px)',
        },
        ambientBottom: {
            position: 'absolute' as const, bottom: '-10%', right: '20%',
            width: '60%', height: '60%', borderRadius: '50%',
            background: 'rgba(139,92,246,0.05)', filter: 'blur(100px)',
        },
        badge: {
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '8px 20px', borderRadius: 100,
            border: '1px solid rgba(212,168,75,0.3)', background: 'rgba(212,168,75,0.08)',
            fontSize: 11, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: '#fcd98e',
            marginBottom: 32,
        },
        h1: {
            fontWeight: 900,
            fontSize: 'clamp(4rem, 10vw, 12rem)',
            lineHeight: 0.9,
            letterSpacing: '-0.04em',
            margin: 0,
        },
        subH2: {
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            marginTop: 16,
        },
        p: {
            color: COLOR.textMuted,
            fontSize: 18,
            lineHeight: 1.7,
            fontWeight: 300,
            maxWidth: 480,
            margin: '24px auto 40px',
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: COLOR.bg }}>
            <Stack.Screen options={{ title: 'Not Found', headerShown: false }} />
            <style dangerouslySetInnerHTML={{ __html: CSS }} />

            <div style={S.container}>
                <div style={S.bg}>
                    <div style={S.ambientTop} />
                    <div style={S.ambientBottom} />
                    <div style={S.grid} />
                </div>

                <div className="reveal" style={{ animationDelay: '0.05s' }}>
                    <div style={S.badge}>
                        <Sparkles size={14} color={COLOR.gold} /> System Error 404
                    </div>
                </div>

                <h1 className="reveal" style={{ ...S.h1, animationDelay: '0.1s' }}>
                    Signal <span className="gold-text">Lost</span>
                </h1>

                <h2 className="reveal gold-text" style={{ ...S.subH2, animationDelay: '0.2s' }}>
                    Coordinates unrecognized.
                </h2>

                <p className="reveal" style={{ ...S.p, animationDelay: '0.3s' }}>
                    The operational sector you are attempting to access does not exist within the FieldForce matrix. Please return to the command center.
                </p>

                <div className="reveal" style={{ animationDelay: '0.4s' }}>
                    <button className="cta-btn-primary" onClick={() => router.replace('/')}>
                        Return to Command <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </View>
    );
}
