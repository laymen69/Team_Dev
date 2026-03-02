import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import {
  Animated,
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
import { DesignTokens } from '../constants/designSystem';
import { Fonts } from '../hooks/useFonts';
import MarqueeLogos from './components/MarqueeLogos';
import MeshGradient from './components/MeshGradient';

export default function HomeScreen() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (Platform.OS === 'web') {
      router.replace('/dashboard_web');
      return;
    }

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 7, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 20, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <MeshGradient />

      {/* Dark Overlay */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 23, 42, 0.75)' }]} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header Branding */}
          <Animated.View style={[styles.branding, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
              <Image
                source={require('../assets/images/index.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            <Text style={styles.appName}>MerchandisingTeam</Text>
            <View style={styles.taglineRow}>
              <View style={styles.line} />
              <Text style={styles.tagline}>INTELLIGENT FIELD OPS</Text>
              <View style={styles.line} />
            </View>
          </Animated.View>

          {/* Main Content */}
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.title}>Streamline Your</Text>
            <Text style={styles.accentTitle}>Field Success</Text>
            <Text style={styles.description}>
              The all-in-one platform for real-time visibility, automated reporting, and intelligent field team coordination.
            </Text>

            <View style={styles.features}>
              <Feature icon="analytics-outline" label="Analytics" />
              <View style={styles.dot} />
              <Feature icon="location-outline" label="Live GPS" />
              <View style={styles.dot} />
              <Feature icon="people-outline" label="Team Sync" />
            </View>
          </Animated.View>

          {/* Actions Section */}
          <View style={styles.actions}>
            <MarqueeLogos />

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.push('/login')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[APP_COLORS.accent, APP_COLORS.accentDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                <Text style={styles.btnText}>Get Started</Text>
                <View style={styles.iconCircle}>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.googleBtn}
              onPress={() => {/* Gmail Login logic */ }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="google" size={20} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => router.push('/about')}
            >
              <Text style={styles.skipText}>Learn More About Us</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Crafted by Team Dev  •  v1.0.5</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const Feature = ({ icon, label }: { icon: any, label: string }) => (
  <View style={styles.feat}>
    <Ionicons name={icon} size={20} color={APP_COLORS.accent} />
    <Text style={styles.featLabel}>{label}</Text>
  </View>
);


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  branding: {
    alignItems: 'center',
    paddingTop: 30,
    marginBottom: 40,
  },

  logo: { width: 100, height: 100 },
  appName: {
    fontSize: 26,
    fontFamily: Fonts.headingXBold,
    color: '#fff',
    marginTop: 18,
    letterSpacing: 0.5,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    opacity: 0.6,
  },
  line: { width: 16, height: 1, backgroundColor: '#fff', marginHorizontal: 8 },
  tagline: { fontSize: 11, fontFamily: Fonts.subheading, color: '#fff', letterSpacing: 2 },

  content: {
    paddingHorizontal: 28,
    marginBottom: 30,
  },
  title: { fontSize: 32, fontFamily: Fonts.headingLight, color: '#e2e8f0', textAlign: 'center' },
  accentTitle: {
    fontSize: 36,
    fontFamily: Fonts.heading,
    color: APP_COLORS.accent,
    textAlign: 'center',
    marginTop: -8,
  },
  description: {
    fontSize: 15,
    fontFamily: Fonts.body,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 16,
    marginBottom: 28,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  feat: { alignItems: 'center' },
  featLabel: { fontSize: 11, fontFamily: Fonts.bodyMedium, color: '#64748b', marginTop: 4 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#334155' },

  actions: { paddingHorizontal: 28 },
  primaryBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 10,
    ...DesignTokens.shadows.md,
  },
  btnGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: '#fff', fontSize: 18, fontFamily: Fonts.cta, letterSpacing: 1 },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 18,
    paddingVertical: 14,
    marginTop: 12,
  },
  googleBtnText: { color: '#fff', fontSize: 16, fontFamily: Fonts.bodyMedium },
  skipBtn: { paddingVertical: 16, alignItems: 'center' },
  skipText: { color: '#64748b', fontSize: 15, fontFamily: Fonts.cta, opacity: 0.8 },

  footer: {
    paddingBottom: 20,
    alignItems: 'center',
    opacity: 0.4,
  },
  footerText: { color: '#fff', fontSize: 10, fontFamily: Fonts.body },
});
