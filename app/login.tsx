import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_COLORS } from '../constants/appColors';
import { Colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { Fonts } from '../hooks/useFonts';
import { GoogleAuthService } from '../services/google.service';
import AnimatedBackground from './components/AnimatedBackground';
import AuthUserTypeCard from './components/AuthUserTypeCard';
import FloatingLabelInput from './components/FloatingLabelInput';
import MeshGradient from './components/MeshGradient';

const { width, height } = Dimensions.get('window');

type UserType = 'admin' | 'supervisor' | 'merchandiser';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  // Always dark — no theme switching on auth pages
  const theme = Colors.dark;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<UserType | null>(null);

  // Animations
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

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!email || !password) {
      Alert.alert('Error', 'Email or password are incorrect !');
      return;
    }
    if (!selectedType) {
      Alert.alert('Selection Required', 'Please choose your role to continue');
      return;
    }

    try {
      setIsLoading(true);
      await signIn(email, password, selectedType, rememberMe);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid sign in !');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!selectedType) {
      Alert.alert('Selection Required', 'Please choose your role to continue before signing in with Google');
      return;
    }

    setIsLoading(true);
    try {
      const result: any = await GoogleAuthService.signIn();
      if (result.type === 'success') {
        // Here you would normally send the ID token or access token 
        // to your backend to get an app JWT:
        // const appToken = await AuthService.loginWithGoogle(result.user.email);

        // For now, let's use a demo account for the selected role
        let demoEmail = 'admin@admin.com';
        if (selectedType === 'supervisor') demoEmail = 'supervisor@sup.com';
        if (selectedType === 'merchandiser') demoEmail = 'merch@merch.com';

        await signIn(demoEmail, 'password123', selectedType, true);
        Alert.alert('Google Sync Success', `Connected as ${result.user.name}`);
      }
    } catch (error: any) {
      Alert.alert('Google Sign-in failed', error.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

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
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

              <TouchableOpacity
                style={[styles.backButton, { backgroundColor: APP_COLORS.backButtonBg }]}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color={APP_COLORS.textPrimary} />
              </TouchableOpacity>
 
              <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.logoBadge}>
                  <Image
                    source={require('../assets/images/login.png')}
                    style={{ width: 180, height: 180, borderRadius: 32 }}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.title, { color: APP_COLORS.textPrimary }]}>Welcome Back</Text>
                <Text style={[styles.subtitle, { color: APP_COLORS.textSecondary }]}>Choose your role and sign in to continue</Text>
              </Animated.View>

              <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
                <View style={styles.typeContainer}>
                  <Text style={[styles.sectionTitle, { color: APP_COLORS.textSecondary }]}>Select Role</Text>
                  <View style={styles.typeRow}>
                    <AuthUserTypeCard
                      type="admin"
                      title="Admin"
                      icon="shield-checkmark"
                      color="#ef4444"
                      selectedType={selectedType}
                      onSelect={setSelectedType}
                    />
                    <AuthUserTypeCard
                      type="supervisor"
                      title="Supervisor"
                      icon="person"
                      color="#f59e0b"
                      selectedType={selectedType}
                      onSelect={setSelectedType}
                    />
                    <AuthUserTypeCard
                      type="merchandiser"
                      title="Merchandiser"
                      icon="cart"
                      color="#10b981"
                      selectedType={selectedType}
                      onSelect={setSelectedType}
                    />
                  </View>
                </View>

                <FloatingLabelInput
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  icon="mail-outline"
                />
                <FloatingLabelInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  icon="lock-closed-outline"
                />

                <View style={styles.optionsRow}>
                  <View style={styles.rememberContainer}>
                    <Switch
                      value={rememberMe}
                      onValueChange={setRememberMe}
                      trackColor={{ false: APP_COLORS.inputBorder, true: APP_COLORS.accent }}
                      thumbColor={rememberMe ? APP_COLORS.accent : '#f4f3f4'}
                    />
                    <Text style={[styles.rememberText, { color: APP_COLORS.textSecondary }]}>Remember me</Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                    <Text style={[styles.forgotText, { color: APP_COLORS.accent }]}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Text>
                  {!isLoading && <Ionicons name="log-in-outline" size={20} color="#e8e8e890" />}
                </TouchableOpacity>

                <View style={styles.signUpLink} >
                  <Text style={[styles.signUpText, { color: APP_COLORS.textSecondary }]}>
                    No account ? No Problem  <Text style={[styles.signUpTextAccent, { color: APP_COLORS.accent }]} onPress={() => router.push('/signup' as any)}>SignUp Now</Text>
                  </Text>
                </View>

                <View style={[styles.dividerContainer, { marginTop: 24, marginBottom: 16 }]}>
                  <View style={[styles.dividerLine, { backgroundColor: APP_COLORS.divider }]} />
                  <Text style={[styles.dividerText, { color: APP_COLORS.textSecondary }]}>or</Text>
                  <View style={[styles.dividerLine, { backgroundColor: APP_COLORS.divider }]} />
                </View>

                <TouchableOpacity
                  style={[styles.googleButton, { backgroundColor: '#FAFAFA', borderColor: theme.border }]}
                  onPress={handleGoogleSignIn}
                >
                  <Image
                    source={require('../assets/images/google_logo.png')}
                    style={{ width: 18, height: 18, marginRight: 12 }}
                    resizeMode="contain"
                  />
                  <Text style={[styles.googleButtonText, { color: 'black' }]}>Sign in with Gmail</Text>
                </TouchableOpacity>
              </Animated.View>

              <View style={[styles.demoBox, { borderColor: APP_COLORS.cardBorder, backgroundColor: APP_COLORS.cardBg }]}>
                <Text style={[styles.demoTitle, { color: APP_COLORS.accent }]}>Demo Accounts</Text>
                <Text style={[styles.demoText, { color: APP_COLORS.textSecondary }]}>Password: <Text style={{ color: APP_COLORS.textPrimary, fontWeight: 'bold' }}>   password123</Text></Text>
                <View style={styles.demoGrid}>
                  <Text style={[styles.demoItem, { color: APP_COLORS.textSecondary }]}>admin@admin.com</Text>
                  <Text style={[styles.demoItem, { color: APP_COLORS.textSecondary }]}>supervisor@sup.com</Text>
                  <Text style={[styles.demoItem, { color: APP_COLORS.textSecondary }]}>merch@merch.com</Text>
                  <Text style={[styles.demoItem, { color: APP_COLORS.textSecondary }]}>adel@merch.com</Text>
                </View>
              </View>

            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.heading,
    marginBottom: 8,
    color: APP_COLORS.roletext,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.subheading,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  googleButtonText: {
    fontSize: 16,
    fontFamily: Fonts.headingSemiBold,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.5,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    fontFamily: Fonts.body,
  },
  typeContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: Fonts.headingSemiBold,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: Fonts.body,
  },
  forgotText: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 14,
  },
  primaryButton: {
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    backgroundColor: APP_COLORS.accent,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 22,
    fontFamily: Fonts.cta,
    marginRight: 8,
    color: '#fff',
    letterSpacing: 1,
  },
  signUpLink: {
    alignItems: 'center',
    marginTop: 24,
  },
  signUpText: {
    fontSize: 15,
    fontFamily: Fonts.body,
    textAlign: 'center',
  },
  signUpTextAccent: {
    fontFamily: Fonts.heading,
  },
  demoBox: {
    marginTop: 40,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  demoTitle: {
    fontSize: 14,
    fontFamily: Fonts.headingXBold,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  demoText: {
    fontSize: 14,
    fontFamily: Fonts.body,
    marginBottom: 8,
  },
  demoGrid: {
    marginTop: 4,
  },
  demoItem: {
    fontSize: 13,
    fontFamily: Fonts.body,
    marginBottom: 4,
  }
});
