import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../../components/ui/BottomNav';
import { Card } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { ADMIN_NAV_ITEMS } from '../../constants/navigation';
import { useTheme } from '../../context/ThemeContext';

const faqItems = [
    { question: 'How do I submit a leave request?', answer: 'Go to your Profile and select Leave Requests. Click on the "Send Request" button after filling out the form.' },
    { question: 'How can I change my password?', answer: 'Go to Profile > Privacy & Security > Change Password.' },
    { question: 'Where can I find my objectives?', answer: 'Your objectives are listed under the "Planning" tab or "My Objectives" in your Profile.' },
];

export default function HelpPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = getColors(theme);

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <Header
                title="Help & Support"
                showBack
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <SectionHeader title="CONTACT US" />
                    <Card style={styles.card}>
                        <TouchableOpacity style={[styles.contactRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name="call" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={[styles.contactLabel, { color: colors.text }]}>Call Support</Text>
                                <Text style={[styles.contactValue, { color: colors.textSecondary }]}>+1 (800) 123-4567</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.contactRow}>
                            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name="mail" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={[styles.contactLabel, { color: colors.text }]}>Email Support</Text>
                                <Text style={[styles.contactValue, { color: colors.textSecondary }]}>support@merchanapp.com</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                    </Card>
                </View>

                <View style={styles.section}>
                    <SectionHeader title="FREQUENTLY ASKED QUESTIONS" />
                    <View style={styles.faqContainer}>
                        {faqItems.map((item, index) => (
                            <Card key={index} style={styles.faqCard}>
                                <Text style={[styles.question, { color: colors.text }]}>{item.question}</Text>
                                <Text style={[styles.answer, { color: colors.textSecondary }]}>{item.answer}</Text>
                            </Card>
                        ))}
                    </View>
                </View>
            </ScrollView>

            <BottomNav items={ADMIN_NAV_ITEMS} activeRoute="/admin/help" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    content: {
        paddingHorizontal: DesignTokens.spacing.lg,
        paddingBottom: 100,
        gap: DesignTokens.spacing.lg,
    },
    section: {
        gap: DesignTokens.spacing.md,
    },
    card: {
        padding: 0,
        overflow: 'hidden',
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: DesignTokens.spacing.md,
        gap: DesignTokens.spacing.md,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        ...DesignTokens.typography.bodyBold,
    },
    contactValue: {
        ...DesignTokens.typography.tiny,
    },
    faqContainer: {
        gap: DesignTokens.spacing.md,
    },
    faqCard: {
        padding: DesignTokens.spacing.md,
        gap: DesignTokens.spacing.sm,
    },
    question: {
        ...DesignTokens.typography.bodyBold,
    },
    answer: {
        ...DesignTokens.typography.caption,
        lineHeight: 20,
    },
});
