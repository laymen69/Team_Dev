
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../../components/ui/BottomNav';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { MERCHANDISER_NAV_ITEMS } from '../../constants/navigation';
import { useTheme } from '../../context/ThemeContext';
import { LeaveService } from '../../services/leave.service';



const leaveTypes = [
    { id: 'annual', label: 'Annual Leave', icon: 'sunny' },
    { id: 'sick', label: 'Sick Leave', icon: 'medical' },
    { id: 'personal', label: 'Personal Leave', icon: 'person' },
    { id: 'emergency', label: 'Emergency Leave', icon: 'warning' },
];

export default function LeavePage() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = getColors(theme);

    const [selectedType, setSelectedType] = useState('annual');
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onDayPress = (day: any) => {
        if (!startDate || (startDate && endDate)) {
            setStartDate(day.dateString);
            setEndDate(null);
        } else {
            if (day.dateString < startDate) {
                setEndDate(startDate);
                setStartDate(day.dateString);
            } else {
                setEndDate(day.dateString);
            }
        }
    };

    const getMarkedDates = () => {
        let marked: any = {};
        if (startDate) {
            marked[startDate] = {
                startingDay: true,
                color: colors.primary,
                textColor: '#fff',
            };
        }
        if (endDate) {
            marked[endDate] = {
                endingDay: true,
                color: colors.primary,
                textColor: '#fff',
            };

            let start = new Date(startDate!);
            let end = new Date(endDate);
            let curr = new Date(start);
            curr.setDate(curr.getDate() + 1);

            while (curr < end) {
                const dateStr = curr.toISOString().split('T')[0];
                marked[dateStr] = {
                    color: colors.primary + '30',
                    textColor: colors.text
                };
                curr.setDate(curr.getDate() + 1);
            }
        }
        return marked;
    };

    const handleSubmit = async () => {
        if (!startDate || !endDate || !reason) {
            Alert.alert('Error', 'Please select a date range and provide a reason');
            return;
        }
        setIsSubmitting(true);
        const res = await LeaveService.create({
            leave_type: selectedType,
            start_date: startDate,
            end_date: endDate,
            reason: reason,
        });
        setIsSubmitting(false);

        if (res) {
            Alert.alert(
                'Request Submitted',
                `Your leave request from ${startDate} to ${endDate} has been sent for approval.`,
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } else {
            Alert.alert('Error', 'Failed to submit leave request. Please try again.');
        }
    };

    const handleCancel = () => {
        Alert.alert(
            'Cancel Request',
            'Are you sure you want to cancel this request?',
            [
                { text: 'No', style: 'cancel' },
                { text: 'Yes', onPress: () => router.back() }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title="Leave Request" subtitle="Apply for time off" showBack />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <SectionHeader title="Leave Type" />
                <View style={styles.typeGrid}>
                    {leaveTypes.map(type => (
                        <Card
                            key={type.id}
                            onPress={() => setSelectedType(type.id)}
                            style={[
                                styles.typeCard,
                                selectedType === type.id && { borderColor: colors.primary, backgroundColor: colors.primary + '08' }
                            ]}
                        >
                            <View style={[
                                styles.typeIcon,
                                { backgroundColor: selectedType === type.id ? colors.primary + '15' : colors.surfaceSecondary }
                            ]}>
                                <Ionicons
                                    name={type.icon as any}
                                    size={20}
                                    color={selectedType === type.id ? colors.primary : colors.textMuted}
                                />
                            </View>
                            <Text style={[
                                styles.typeLabel,
                                { color: selectedType === type.id ? colors.primary : colors.text }
                            ]}>
                                {type.label}
                            </Text>
                        </Card>
                    ))}
                </View>

                <SectionHeader title="Select Duration" />
                <Card style={styles.calendarCard}>
                    <Calendar
                        markingType={'period'}
                        markedDates={getMarkedDates()}
                        onDayPress={onDayPress}
                        theme={{
                            calendarBackground: colors.surface,
                            textSectionTitleColor: colors.textSecondary,
                            dayTextColor: colors.text,
                            todayTextColor: colors.primary,
                            selectedDayBackgroundColor: colors.primary,
                            selectedDayTextColor: '#fff',
                            monthTextColor: colors.text,
                            indicatorColor: colors.primary,
                            textDisabledColor: colors.textSecondary + '50',
                            arrowColor: colors.primary,
                        }}
                    />
                </Card>

                <View style={[styles.rangeInfo, { backgroundColor: colors.surfaceSecondary }]}>
                    <View style={styles.dateDisplay}>
                        <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>FROM</Text>
                        <Text style={[styles.dateValue, { color: colors.text }]}>{startDate || '--/--/----'}</Text>
                    </View>
                    <Feather name="arrow-right" size={20} color={colors.primary} />
                    <View style={styles.dateDisplay}>
                        <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>TO</Text>
                        <Text style={[styles.dateValue, { color: colors.text }]}>{endDate || '--/--/----'}</Text>
                    </View>
                </View>

                <SectionHeader title="Additional Reason" />
                <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <TextInput
                        style={[styles.textArea, { color: colors.text }]}
                        placeholder="Describe your reason..."
                        placeholderTextColor={colors.textSecondary}
                        value={reason}
                        onChangeText={setReason}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                    <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                        {reason.length}/500
                    </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonRow}>
                    <Button
                        title="Cancel"
                        variant="ghost"
                        onPress={handleCancel}
                        style={{ flex: 1 }}
                        icon="close-outline"
                        disabled={isSubmitting}
                    />
                    <Button
                        title={isSubmitting ? "Submitting..." : "Submit"}
                        onPress={handleSubmit}
                        style={{ flex: 1.5 }}
                        icon="send-outline"
                        disabled={isSubmitting}
                    />
                </View>
            </ScrollView>

            <BottomNav items={MERCHANDISER_NAV_ITEMS} activeRoute="/merchandiser/profile" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingBottom: 100 },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: DesignTokens.spacing.sm, paddingHorizontal: DesignTokens.spacing.lg },
    typeCard: { width: '48%', flexDirection: 'column', alignItems: 'flex-start', padding: DesignTokens.spacing.md, gap: 12 },
    typeIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    typeLabel: { ...DesignTokens.typography.caption, fontWeight: '700' },
    calendarCard: { marginHorizontal: DesignTokens.spacing.lg, padding: 8 },
    rangeInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: DesignTokens.spacing.lg, padding: 16, borderRadius: 16 },
    dateDisplay: { flex: 1, alignItems: 'center' },
    dateLabel: { ...DesignTokens.typography.tiny, marginBottom: 4 },
    dateValue: { ...DesignTokens.typography.bodyBold, fontSize: 14 },
    inputWrapper: { marginHorizontal: DesignTokens.spacing.lg, padding: 12, borderRadius: 14, borderWidth: 1, minHeight: 100 },
    textArea: { fontSize: 14, lineHeight: 20 },
    charCount: { ...DesignTokens.typography.caption, textAlign: 'right', marginTop: 4 },
    footer: { padding: DesignTokens.spacing.lg, marginTop: DesignTokens.spacing.md },
    buttonRow: {
        flexDirection: 'row',
        paddingHorizontal: DesignTokens.spacing.lg,
        gap: 12,
        marginTop: 8,
    },
});
