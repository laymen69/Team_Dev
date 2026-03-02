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
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';
import { Fonts } from '../hooks/useFonts';
import { AuthService } from '../services/auth.service';
import FloatingLabelInput from './components/FloatingLabelInput';
import MeshGradient from './components/MeshGradient';

const { width, height } = Dimensions.get('window');

type UserType = 'admin' | 'supervisor' | 'merchandiser';

export default function SignupScreen() {
    const router = useRouter();
    const theme = Colors.dark;
    const isDark = true;

    // Default to merchandiser, no step 1
    const [selectedType, setSelectedType] = useState<UserType>('merchandiser');

    // Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleGoogleSignIn = () => {
        Alert.alert('Google Sign-in', 'This feature is currently under development.');
    };

    const handleRegister = async () => {
        if (!firstName || !lastName || !email || !password) {
            Alert.alert('Missing Info', 'Please fill in all fields');
            return;
        }
        if (!email.includes('@')) {
            Alert.alert('Invalid Email', 'Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        try {
            const userData = {
                email,
                first_name: firstName,
                last_name: lastName,
                password,
                role: selectedType,
                is_active: true
            };

            await AuthService.register(userData);

            Alert.alert(
                'Success',
                'Account created successfully! Please sign in.',
                [{ text: 'Login Now', onPress: () => router.replace('/login') }]
            );
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message || 'Could not create account.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <MeshGradient />
            <LinearGradient colors={['rgba(15, 23, 42, 0.8)', 'rgba(30, 58, 95, 0.8)', 'rgba(15, 23, 42, 0.8)']} style={StyleSheet.absoluteFill}>
                <StatusBar style="light" />
                <SafeAreaView style={{ flex: 1 }}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                        <ScrollView contentContainerStyle={styles.scrollContent}>
                            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                                <Ionicons name="arrow-back" size={24} color="#f8fafc" />
                            </TouchableOpacity>

                            <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                                <Text style={styles.title}>Create Account</Text>
                                <Text style={styles.subtitle}>
                                    Tell us about yourself
                                </Text>
                            </Animated.View>

                            <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
                                <View style={styles.row}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <FloatingLabelInput label="First Name" value={firstName} onChangeText={setFirstName} icon="person-outline" theme={Colors.dark} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <FloatingLabelInput label="Last Name" value={lastName} onChangeText={setLastName} icon="person-outline" theme={Colors.dark} />
                                    </View>
                                </View>
                                <FloatingLabelInput label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" icon="mail-outline" theme={Colors.dark} />
                                <FloatingLabelInput label="Password" value={password} onChangeText={setPassword} secureTextEntry icon="lock-closed-outline" theme={Colors.dark} />

                                <TouchableOpacity
                                    style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                                    onPress={handleRegister}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.buttonText}>
                                        {isLoading ? "Creating Account..." : "Create Account"}
                                    </Text>
                                    {!isLoading && <Ionicons name="chevron-forward" size={18} color="white" />}
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/login')}>
                                    <Text style={styles.loginText}>Already have an account? <Text style={styles.loginTextAccent}>Sign In</Text></Text>
                                </TouchableOpacity>

                                <View style={styles.dividerContainer}>
                                    <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                                    <Text style={[styles.dividerText, { color: theme.textSecondary }]}>or</Text>
                                    <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
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
                                    <Text style={[styles.googleButtonText, { color: '#3B3B3B' }]}>Sign in with Gmail</Text>
                                </TouchableOpacity>
                            </Animated.View>

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
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontFamily: Fonts.heading,
        color: '#f8fafc',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: Fonts.subheading,
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 24,
    },
    formContainer: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
    },
    primaryButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        marginTop: 10,
        ...Platform.select({
            ios: { shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12 },
            android: { elevation: 6 },
        }),
    },
    buttonDisabled: {
        backgroundColor: '#1e3a5f',
        opacity: 0.6,
    },
    buttonText: {
        color: 'white',
        fontSize: 22,
        fontFamily: Fonts.cta,
        marginRight: 8,
        letterSpacing: 1,
    },
    loginLink: {
        alignItems: 'center',
        marginTop: 24,
    },
    loginText: {
        color: '#fafafaff',
        fontSize: 15,
        fontFamily: Fonts.body,
    },
    loginTextAccent: {
        color: '#60a5fa',
        fontFamily: Fonts.heading,
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
        marginVertical: 20,
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
});
