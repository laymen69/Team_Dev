
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../../components/ui/BottomNav';
import { EmptyState } from '../../components/ui/EmptyState';
import { Header } from '../../components/ui/Header';
import { getColors } from '../../constants/designSystem';
import { MERCHANDISER_NAV_ITEMS } from '../../constants/navigation';
import { useTheme } from '../../context/ThemeContext';

export default function MerchandiserComplaints() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = getColors(theme);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title="Complaints" subtitle="Report issues or feedback" showBack />

            <View style={styles.content}>
                <EmptyState
                    icon="chatbubbles-outline"
                    title="No Complaints Yet"
                    description="Your feedback is important. If you encounter any issues at a trade point, you can report them here."
                    actionTitle="Submit Feedback"
                    onAction={() => { }}
                />
            </View>

            <BottomNav items={MERCHANDISER_NAV_ITEMS} activeRoute="/merchandiser/profile" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, justifyContent: 'center' },
});
