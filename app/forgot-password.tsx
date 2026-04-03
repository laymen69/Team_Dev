import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import FloatingLabelInput from './components/FloatingLabelInput';

/* ──────────────────────────────────────────
   PREMIUM FORGOT PASSWORD — "Aurum" Theme
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
`;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid enterprise email');
      return;
    }

    setIsLoading(true);
    // Simulate sending email
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Recovery Transmitted',
        'Check your secure channel for clearance reset instructions.',
        [{ text: 'Acknowledge', onPress: () => router.back() }]
      );
    }, 1500);
  };

  const S = {
    container: { display: 'flex', flexDirection: 'row' as const, height: '100vh', fontFamily: "'Inter', sans-serif", color: COLOR.white, backgroundColor: COLOR.bg },

    /* Left Hero Panel */
    left: { flex: 1.3, position: 'relative' as const, overflow: 'hidden', display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center', borderRight: `1px solid ${COLOR.border}` },
    bgTop: { position: 'absolute' as const, top: '-20%', left: '-20%', width: '80%', height: '80%', borderRadius: '50%', background: 'rgba(212,168,75,0.08)', filter: 'blur(120px)', zIndex: 0 },
    bgGrid: { position: 'absolute' as const, inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '60px 60px', zIndex: 0 },
    leftContent: { position: 'relative' as const, zIndex: 10, padding: 40, textAlign: 'center' as const, width: '100%', maxWidth: 600 },

    iconBox: { width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #d4a84b, #b08c3c)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(212,168,75,0.4)', margin: '0 auto 40px' },

    h1: { fontWeight: 900, fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 20 },
    italic: { fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: 'italic', fontWeight: 700 },
    p: { color: COLOR.textSub, fontSize: 18, lineHeight: 1.6, fontWeight: 300, marginBottom: 60 },

    /* Right Form Panel */
    right: { flex: 1, backgroundColor: COLOR.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, overflowY: 'auto' as const },
    formBox: { width: '100%', maxWidth: 440 },

    formH2: { fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 8 },
    formSub: { color: COLOR.textMuted, fontSize: 15, marginBottom: 40, lineHeight: 1.6 },

    inputGrp: { marginBottom: 32 },
  };

  // React Native compatibility wrapper (Optional, but good for native fallback)
  const CompWrapper = ({ children }: any) => {
    if (Platform.OS === 'web') return children;
    return (
      <View style={{ flex: 1, backgroundColor: COLOR.bg }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60, flexGrow: 1, justifyContent: 'center' }}>
          <View style={{ marginBottom: 40, alignItems: 'center' }}>
            <Ionicons name="key" size={48} color={COLOR.gold} />
            <Text style={{ fontSize: 24, color: '#fff', fontWeight: 'bold', marginTop: 16 }}>Recover Access</Text>
            <Text style={{ color: COLOR.textMuted, textAlign: 'center', marginTop: 8 }}>Enter your enterprise email to verify credentials.</Text>
          </View>

          <FloatingLabelInput label="Email Address" value={email} onChangeText={setEmail} icon="mail-outline" variant="light" />

          <TouchableOpacity onPress={handleReset} style={{ backgroundColor: COLOR.gold, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 32 }}>
            <Text style={{ fontWeight: 'bold', color: '#000' }}>Transmit Recovery Protocol</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24, alignItems: 'center' }}>
            <Text style={{ color: COLOR.gold }}>Return to Authentication</Text>
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

          <div className="reveal" style={S.iconBox}>
            <Ionicons name="key" size={36} color="#000" />
          </div>

          <h1 className="reveal" style={{ ...S.h1, animationDelay: '0.1s' }}>
            Secure<br />
            <span className="gold-text" style={S.italic}>Recovery.</span>
          </h1>
          <p className="reveal" style={{ ...S.p, animationDelay: '0.2s' }}>
            If you have lost access to the FieldForce matrix, initiate a secure transmission here. We will verify your clearances and send recovery protocols.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div style={S.right}>
        <div className="reveal" style={{ ...S.formBox, animationDelay: '0.3s' }}>
          <h2 style={S.formH2}>Reset Credentials</h2>
          <p style={S.formSub}>Enter your registered enterprise email address below to receive password recovery instructions.</p>

          <div style={S.inputGrp}>
            <input type="email" placeholder="Enterprise Email" className="ghost-input" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <button className="cta-btn-primary" onClick={handleReset} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#000" /> : 'Transmit Recovery Request'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <span style={{ color: COLOR.textMuted, fontSize: 14 }}>Remember your clearance code? </span>
            <span className="link-text" onClick={() => router.back()}>Back to Login</span>
          </div>
        </div>
      </div>

    </div>
  );
}
