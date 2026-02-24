import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_COLORS } from '../constants/appColors';
import MeshGradient from './components/MeshGradient';

export default function NotFoundScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Not Found', headerShown: false }} />
      <View style={styles.container}>
        <StatusBar style="light" />
        <MeshGradient />
        <View style={styles.overlay} />

        <SafeAreaView style={styles.safeArea}>
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            {/* Big 404 */}
            <Text style={styles.code}>404</Text>

            {/* Icon */}
            <View style={styles.iconRing}>
              <Ionicons name="compass-outline" size={42} color={APP_COLORS.accent} />
            </View>

            <Text style={styles.title}>Page Not Found</Text>
            <Text style={styles.subtitle}>
              The page you're looking for doesn't exist or has been moved.
            </Text>

            {/* Go Home */}
            <TouchableOpacity onPress={() => router.replace('/')} activeOpacity={0.85}>
              <LinearGradient
                colors={[APP_COLORS.accent, APP_COLORS.accentDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btn}
              >
                <Ionicons name="home-outline" size={18} color="#fff" />
                <Text style={styles.btnText}>Go Home</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Link href="/login" style={styles.altLink}>
              <Text style={styles.altLinkText}>Back to Sign In</Text>
            </Link>
          </Animated.View>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: APP_COLORS.overlay },
  safeArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  code: {
    fontSize: 96,
    fontWeight: '800',
    color: APP_COLORS.accent,
    opacity: 0.15,
    letterSpacing: -4,
    marginBottom: -20,
  },

  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1.5,
    borderColor: APP_COLORS.cardBorder,
    backgroundColor: APP_COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: APP_COLORS.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 15,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 16,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  altLink: { marginTop: 20 },
  altLinkText: {
    color: APP_COLORS.textSecondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

