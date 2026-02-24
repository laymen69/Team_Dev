
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Animated,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Input } from '../../../components/ui/Input';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { DesignTokens, getColors } from '../../../constants/designSystem';
import { useTheme } from '../../../context/ThemeContext';
import { useToast } from '../../../context/ToastContext';
import { Fonts } from '../../../hooks/useFonts';
import { ReportService } from '../../../services/report.service';

export default function OutOfStockEvent() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = getColors(theme);
    const { showToast } = useToast();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        productName: '',
        category: '',
        expectedRestock: '',
        notes: '',
    });
    const [photo, setPhoto] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fadeAnim = useRef(new Animated.Value(1)).current;

    const transitionTo = (nextStep: number) => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setStep(nextStep);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        });
    };

    const pickImage = async (source: 'camera' | 'library') => {
        const { status } = source === 'camera'
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            showToast({ message: 'Permission required', type: 'error' });
            return;
        }

        const options: ImagePicker.ImagePickerOptions = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        };

        const result = source === 'camera'
            ? await ImagePicker.launchCameraAsync(options)
            : await ImagePicker.launchImageLibraryAsync(options);

        if (!result.canceled) {
            setPhoto(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!formData.productName.trim()) {
            showToast({ message: 'Product name is required', type: 'warning' });
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await ReportService.create({
                name: formData.productName,
                notes: `Category: ${formData.category}\nRestock: ${formData.expectedRestock}\nNotes: ${formData.notes}`,
                type: 'Out of Stock',
                status: 'pending',
                before_image: photo || undefined,
                visits_planned: 0,
                visits_completed: 0,
            });

            if (result) {
                showToast({ message: 'Out of stock reported!', type: 'success' });
                router.back();
            } else {
                showToast({ message: 'Submission failed', type: 'error' });
            }
        } catch (error) {
            showToast({ message: 'An error occurred', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Product Information</Text>

            <Input
                label="Product Name *"
                placeholder="Enter product name"
                value={formData.productName}
                onChangeText={(text) => setFormData({ ...formData, productName: text })}
            />

            <Input
                label="Category"
                placeholder="e.g., Beverages, Dairy"
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
            />

            <Button
                title="Next Step"
                onPress={() => transitionTo(2)}
                disabled={!formData.productName.trim()}
                fullWidth
                style={styles.nextBtn}
            />
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Restock & Photo</Text>

            <Input
                label="Expected Restock"
                placeholder="e.g., Tomorrow, Next Week"
                value={formData.expectedRestock}
                onChangeText={(text) => setFormData({ ...formData, expectedRestock: text })}
            />

            <Text style={[styles.label, { color: colors.text }]}>Evidence Photo (Optional)</Text>
            {photo ? (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: photo }} style={styles.previewImage} />
                    <Button
                        title="Remove"
                        variant="ghost"
                        onPress={() => setPhoto(null)}
                        style={styles.removeBtn}
                        icon="trash"
                    />
                </View>
            ) : (
                <View style={styles.photoActions}>
                    <Card onPress={() => pickImage('camera')} style={styles.photoCard}>
                        <Ionicons name="camera" size={32} color={colors.primary} />
                        <Text style={[styles.photoLabel, { color: colors.text }]}>Camera</Text>
                    </Card>
                    <Card onPress={() => pickImage('library')} style={styles.photoCard}>
                        <Ionicons name="images" size={32} color={colors.primary} />
                        <Text style={[styles.photoLabel, { color: colors.text }]}>Gallery</Text>
                    </Card>
                </View>
            )}

            <View style={styles.footerBtns}>
                <Button title="Back" variant="outline" onPress={() => transitionTo(1)} style={{ flex: 1 }} />
                <Button title="Next Step" onPress={() => transitionTo(3)} style={{ flex: 1 }} />
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Final Notes</Text>

            <Input
                label="Additional Notes"
                placeholder="Any other details..."
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
                style={{ minHeight: 120, textAlignVertical: 'top' }}
            />

            <View style={styles.footerBtns}>
                <Button title="Back" variant="outline" onPress={() => transitionTo(2)} style={{ flex: 1 }} />
                <Button
                    title="Submit"
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    style={{ flex: 1 }}
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title="Out of Stock" subtitle="Report unavailable products" showBack />

            <ProgressBar progress={step / 3} label={`Step ${step} of 3`} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    <Animated.View style={{ opacity: fadeAnim }}>
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: DesignTokens.spacing.lg, paddingBottom: 120 },
    stepContainer: { gap: DesignTokens.spacing.lg },
    stepTitle: { ...DesignTokens.typography.h3 },
    label: { ...DesignTokens.typography.bodyBold, marginBottom: -8 },
    photoActions: {
        flexDirection: 'row',
        gap: DesignTokens.spacing.lg,
        paddingVertical: 8,
    },
    photoCard: {
        flex: 1,
        height: 140,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        borderRadius: DesignTokens.borderRadius.xl,
    },
    photoLabel: {
        ...DesignTokens.typography.bodyBold,
        fontFamily: Fonts.bodyBold,
        fontSize: 14,
    },
    previewContainer: { width: '100%', aspectRatio: 4 / 3, borderRadius: DesignTokens.borderRadius.lg, overflow: 'hidden' },
    previewImage: { width: '100%', height: '100%' },
    removeBtn: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 8 },
    footerBtns: { flexDirection: 'row', gap: DesignTokens.spacing.md, marginTop: DesignTokens.spacing.xl },
    nextBtn: { marginTop: DesignTokens.spacing.xl },
});
