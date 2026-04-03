import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { AuthService } from '../services/auth.service';
import FloatingLabelInput from './components/FloatingLabelInput';

/* ──────────────────────────────────────────
   PREMIUM WEB SIGNUP — "Aurum" Theme
   Pure inline styles — no Tailwind needed
────────────────────────────────────────── */

const COLOR = {
    bg: '#09090b',
    surface: '#111113',
    border: 'rgba(255,255,255,0.07)',
    gold: '#d4a84b',
    goldLight: '#f5d98c',
    white: '#ffffff',
    textMuted: 'rgba(255,255,255,0.40)',
    textSub: 'rgba(255,255,255,0.65)',
};

const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { -webkit-font-smoothing: antialiased; background-color: ${COLOR.bg}; margin: 0; }

    .gold-text {
        background: linear-gradient(120deg, #d4a84b 0%, #f5d98c 40%, #d4a84b 70%, #b08c3c 100%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: goldShift 5s linear infinite;
    }
    @keyframes goldShift { to { background-position: 200% center; } }

    .cta-btn-primary {
        position: relative; overflow: hidden; display: inline-flex; justify-content: center; alignItems: center; gap: 10px;
        padding: 16px 36px; border-radius: 14px; font-weight: 800; font-size: 16px; width: 100%;
        cursor: pointer; border: none; transition: transform 0.2s ease, box-shadow 0.2s ease;
        background: linear-gradient(135deg, #d4a84b 0%, #f5d98c 50%, #d4a84b 100%);
        background-size: 200% auto; color: #000;
        box-shadow: 0 12px 30px rgba(212,168,75,0.3); animation: goldShift 4s linear infinite;
        font-family: 'Inter', sans-serif;
    }
    .cta-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(212,168,75,0.4); }
    .cta-btn-primary:active { transform: translateY(0); }

    .ghost-input {
        background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
        border-radius: 14px; padding: 18px 20px; color: #fff; font-size: 15px;
        font-weight: 500; font-family: 'Inter', sans-serif; outline: none; transition: border 0.2s, background 0.2s;
        width: 100%;
    }
    .ghost-input::placeholder { color: rgba(255,255,255,0.25); }
    .ghost-input:focus { border-color: rgba(212,168,75,0.4); background: rgba(255,255,255,0.05); }

    .link-text {
        color: ${COLOR.gold}; cursor: pointer; text-decoration: none; font-weight: 600; transition: color 0.2s; font-family: 'Inter', sans-serif; font-size: 14px;
    }
    .link-text:hover { color: ${COLOR.goldLight}; }

    .google-btn {
        display: flex; align-items: center; justify-content: center; gap: 12px;
        padding: 16px; border-radius: 14px; background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.08); cursor: pointer; transition: background 0.2s;
        font-family: 'Inter', sans-serif; font-weight: 600; color: #fff; font-size: 15px; width: 100%;
    }
    .google-btn:hover { background: rgba(255,255,255,0.08); }

    .anim-img {
        animation: floatY 8s ease-in-out infinite; filter: drop-shadow(0 20px 40px rgba(0,0,0,0.5));
    }
    @keyframes floatY { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-20px);} }
`;

export default function SignupScreen() {
    const router = useRouter();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = () => {
        Alert.alert('Google Sign-in', 'This enterprise feature requires backend activation.');
    };

    const handleRegister = async () => {
        if (!firstName || !lastName || !email || !password) {
            Alert.alert('Missing Info', 'Please fill in all clearance fields');
            return;
        }
        if (!email.includes('@')) {
            Alert.alert('Invalid Clearance Code', 'Please enter a valid enterprise email');
            return;
        }

        setIsLoading(true);
        try {
            const userData = { email, first_name: firstName, last_name: lastName, password, role: 'merchandiser', is_active: true };
            await AuthService.register(userData);
            Alert.alert('Clearance Granted', 'Account created successfully! Please authenticate.', [
                { text: 'Authenticate Now', onPress: () => router.replace('/login') }
            ]);
        } catch (error: any) {
            Alert.alert('Clearance Failed', error.message || 'Could not verify registry parameters.');
        } finally {
            setIsLoading(false);
        }
    };

    const S = {
        container: { display: 'flex', flexDirection: 'row' as const, height: '100vh', fontFamily: "'Inter', sans-serif", color: COLOR.white, backgroundColor: COLOR.bg },

        /* Left Hero Panel */
        left: { flex: 1.3, position: 'relative' as const, overflow: 'hidden', display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center', borderRight: `1px solid ${COLOR.border}` },
        bgTop: { position: 'absolute' as const, top: '-20%', left: '-20%', width: '80%', height: '80%', borderRadius: '50%', background: 'rgba(212,168,75,0.08)', filter: 'blur(120px)', zIndex: 0 },
        bgGrid: { position: 'absolute' as const, inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '60px 60px', zIndex: 0 },
        leftContent: { position: 'relative' as const, zIndex: 10, padding: 40, textAlign: 'center' as const, width: '100%', maxWidth: 600 },

        h1: { fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 20 },
        italic: { fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: 'italic', fontWeight: 700 },
        p: { color: COLOR.textSub, fontSize: 18, lineHeight: 1.6, fontWeight: 300, marginBottom: 60 },

        /* Right Form Panel */
        right: { flex: 1, backgroundColor: COLOR.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, overflowY: 'auto' as const },
        formBox: { width: '100%', maxWidth: 440 },

        formH2: { fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 8 },
        formSub: { color: COLOR.textMuted, fontSize: 15, marginBottom: 40 },

        inputGrp: { marginBottom: 20 },
        row: { display: 'flex', gap: 20, marginBottom: 20 },
        col: { flex: 1 },

        divider: { display: 'flex', alignItems: 'center', gap: 16, margin: '32px 0' },
        line: { flex: 1, height: 1, background: COLOR.border },
        divText: { fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: COLOR.textMuted },
    };

    // React Native compatibility wrapper
    const CompWrapper = ({ children }: any) => {
        if (Platform.OS === 'web') return children;
        return (
            <View style={{ flex: 1, backgroundColor: COLOR.bg }}>
                <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
                    {/* Fallback rendering for pure native, though UI is heavily web-centric now */}
                    <View style={{ marginBottom: 40, alignItems: 'center' }}>
                        <Ionicons name="shield-checkmark" size={48} color={COLOR.gold} />
                        <Text style={{ fontSize: 24, color: '#fff', fontWeight: 'bold', marginTop: 16 }}>Request Access</Text>
                    </View>
                    <FloatingLabelInput label="First Name" value={firstName} onChangeText={setFirstName} icon="person-outline" variant="light" />
                    <View style={{ height: 16 }} />
                    <FloatingLabelInput label="Last Name" value={lastName} onChangeText={setLastName} icon="person-outline" variant="light" />
                    <View style={{ height: 16 }} />
                    <FloatingLabelInput label="Email" value={email} onChangeText={setEmail} icon="mail-outline" variant="light" />
                    <View style={{ height: 16 }} />
                    <FloatingLabelInput label="Password" value={password} onChangeText={setPassword} secureTextEntry icon="lock-closed-outline" variant="light" />

                    <TouchableOpacity onPress={handleRegister} style={{ backgroundColor: COLOR.gold, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 32 }}>
                        <Text style={{ fontWeight: 'bold', color: '#000' }}>Submit Clearance Request</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/login')} style={{ marginTop: 24, alignItems: 'center' }}>
                        <Text style={{ color: COLOR.gold }}>Have an account? Login here</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }

    if (Platform.OS !== 'web') {
        return <CompWrapper />;
    }

    return (
        <div style={S.container}>
            <style dangerouslySetInnerHTML={{ __html: CSS }} />

            {/* Left Info Panel */}
            <div style={S.left}>
                <div style={S.bgTop} />
                <div style={S.bgGrid} />
                <div style={S.leftContent}>
                    <img src={require('../assets/images/hero_bg.png')} alt="FieldForce" className="anim-img" style={{ width: '100%', maxWidth: 400, marginBottom: 40, borderRadius: 24, border: `1px solid ${COLOR.border}` }} />

                    <h1 style={S.h1}>
                        Join the<br />
                        <span className="gold-text" style={S.italic}>network.</span>
                    </h1>
                    <p style={S.p}>
                        Integrate seamlessly into a real-time framework designed for high-performance merchandising and logistics.
                    </p>
                </div>
            </div>

            {/* Right Signup Form */}
            <div style={S.right}>
                <div style={S.formBox}>
                    <h2 style={S.formH2}>Request Clearance</h2>
                    <p style={S.formSub}>Register your credentials to access the FieldForce ecosystem.</p>

                    <div style={S.row}>
                        <div style={S.col}>
                            <input type="text" placeholder="First Name" className="ghost-input" value={firstName} onChange={e => setFirstName(e.target.value)} />
                        </div>
                        <div style={S.col}>
                            <input type="text" placeholder="Last Name" className="ghost-input" value={lastName} onChange={e => setLastName(e.target.value)} />
                        </div>
                    </div>

                    <div style={S.inputGrp}>
                        <input type="email" placeholder="Enterprise Email" className="ghost-input" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div style={S.inputGrp}>
                        <input type="password" placeholder="Secure Password" className="ghost-input" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>

                    <div style={{ padding: '24px 0 12px' }}>
                        <button className="cta-btn-primary" onClick={handleRegister} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="#000" /> : 'Acknowledge & Register'}
                        </button>
                    </div>

                    <div style={S.divider}>
                        <div style={S.line} />
                        <div style={S.divText}>OR</div>
                        <div style={S.line} />
                    </div>

                    <button className="google-btn" onClick={handleGoogleSignIn}>
                        <Image source={require('../assets/images/google_logo.png')} style={{ width: 18, height: 18 }} />
                        Enterprise Registry (Google)
                    </button>

                    <div style={{ textAlign: 'center', marginTop: 32 }}>
                        <span style={{ color: COLOR.textMuted, fontSize: 14 }}>Clearance already active? </span>
                        <span className="link-text" onClick={() => router.push('/login')}>Authenticate</span>
                    </div>
                </div>
            </div>

        </div>
    );
}
