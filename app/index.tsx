import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_COLORS } from '../constants/appColors';
import { Fonts } from '../hooks/useFonts';
import MeshGradient from './components/MeshGradient';
import MarqueeLogos from './components/MarqueeLogos';

export default function HomeScreen() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
      Animated.timing(buttonAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <MeshGradient />
      <LinearGradient
        colors={['rgba(15, 23, 42, 0.7)', 'rgba(30, 58, 95, 0.6)', 'rgba(15, 23, 42, 0.8)']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.brandingSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/index.png')}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.appName}>MerchandisingTeam</Text>

          <View style={styles.taglineContainer}>
            <View style={styles.taglineLine} />
            <Text style={styles.tagline}>DIGITAL FIELD OPERATIONS</Text>
            <View style={styles.taglineLine} />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.contentSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.headline}>Streamline Your</Text>
          <Text style={styles.headlineAccent}>Field Operations</Text>

          <Text style={styles.description}>
            Empower your team with real-time insights, seamless task management,
            and intelligent reporting tools.
          </Text>

          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <Ionicons name="analytics-outline" size={22} color="#60a5fa" />
              <Text style={styles.featureText}>Analytics</Text>
            </View>

            <View style={styles.featureDot} />

            <View style={styles.featureItem}>
              <Ionicons name="location-outline" size={22} color="#60a5fa" />
              <Text style={styles.featureText}>Tracking</Text>
            </View>

            <View style={styles.featureDot} />

            <View style={styles.featureItem}>
              <Ionicons name="people-outline" size={22} color="#60a5fa" />
              <Text style={styles.featureText}>Team Sync</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.ctaSection,
            {
              opacity: buttonAnim,
              transform: [
                {
                  translateY: buttonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <MarqueeLogos />
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/login')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[APP_COLORS.accent, APP_COLORS.accentDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <View style={styles.buttonIcon}>
                <Ionicons name="arrow-forward" size={20} color="#ffffff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/about')}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Discover Our Story</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by TeamDev</Text>
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  brandingSection: {
    alignItems: 'center',
    paddingTop: Platform.select({ ios: 20, android: 40 }),
  },

  logoContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: { width: 100, height: 100 },

  appName: {
    fontSize: 28,
    fontFamily: Fonts.headingXBold,
    color: '#f8fafc',
    marginTop: 20,
  },

  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  taglineLine: {
    width: 24,
    height: 1,
    backgroundColor: APP_COLORS.divider,
    marginHorizontal: 6,
  },

  tagline: {
    fontSize: 11,
    marginBottom: 25,
    fontFamily: Fonts.bodyMedium,
    color: APP_COLORS.textSecondary,
    letterSpacing: 3,
  },

  contentSection: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headline: {
    fontSize: 32,
    fontFamily: Fonts.headingLight,
    color: '#e2e8f0',
  },

  headlineAccent: {
    fontSize: 34,
    fontFamily: Fonts.heading,
    color: APP_COLORS.accent,
    marginBottom: 20,
  },

  description: {
    fontSize: 15,
    fontFamily: Fonts.body,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },

  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  featureItem: { alignItems: 'center', marginHorizontal: 8 },
  featureText: { fontSize: 12, fontFamily: Fonts.bodyMedium, color: '#94a3b8', marginTop: 6 },
  featureDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
    marginHorizontal: 8,
  },

  ctaSection: { paddingHorizontal: 32, paddingBottom: 24 },

  primaryButton: { borderRadius: 16, overflow: 'hidden', marginBottom: 14 },

  buttonGradient: {
    flexDirection: 'row',
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: Fonts.headingSemiBold,
    marginRight: 12,
  },

  buttonIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  secondaryButton: { alignItems: 'center', paddingVertical: 14 },
  secondaryButtonText: { color: APP_COLORS.textSecondary, fontSize: 15, fontFamily: Fonts.bodyMedium },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: Platform.select({ ios: 16, android: 24 }),
  },

  footerText: { color: APP_COLORS.textMuted, fontSize: 12, fontFamily: Fonts.body, marginRight: 8 },
  versionText: { color: APP_COLORS.textMuted, fontSize: 11, fontFamily: Fonts.bodyLight },
});
