import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    FlatList, Modal, ScrollView, StyleSheet,
    Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../components/ui/Badge';
import { BottomNav } from '../../components/ui/BottomNav';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { ListSkeleton } from '../../components/ui/LoadingSkeleton';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { ADMIN_NAV_ITEMS } from '../../constants/navigation';
import { useTheme } from '../../context/ThemeContext';
import { Complaint, ComplaintService } from '../../services/complaint.service';

const STATUS_TABS = ['open', 'in_review', 'resolved'] as const;
const TYPE_LABELS: Record<string, string> = {
    store_issue: '🏪 Store Issue',
    colleague: '👥 Colleague',
    equipment: '🔧 Equipment',
    route: '🗺️ Route',
    other: '💬 Other',
};

export default function AdminComplaints() {
    const { theme } = useTheme();
    const colors = getColors(theme);

    const [activeTab, setActiveTab] = useState<typeof STATUS_TABS[number]>('open');
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);

    // resolve modal
    const [resolving, setResolving] = useState<Complaint | null>(null);
    const [responseText, setResponseText] = useState('');
    const [processing, setProcessing] = useState(false);

    const load = async () => {
        setLoading(true);
        const data = await ComplaintService.getAll(activeTab);
        setComplaints(data);
        setLoading(false);
    };

    useEffect(() => { load(); }, [activeTab]);

    const openResolve = (c: Complaint) => {
        setResolving(c);
        setResponseText('');
    };

    const handleResolve = async (status: 'in_review' | 'resolved') => {
        if (!resolving) return;
        setProcessing(true);
        await ComplaintService.resolve(resolving.id, status, responseText || undefined);
        setProcessing(false);
        setResolving(null);
        load();
    };

    const statusVariant = (s: string): any => {
        if (s === 'resolved') return 'success';
        if (s === 'in_review') return 'warning';
        return 'neutral';
    };

    const renderItem = ({ item }: { item: Complaint }) => (
        <Card style={s.card}>
            <View style={s.cardHead}>
                <View style={[s.avatar, { backgroundColor: colors.primary + '18' }]}>
                    <Text style={[s.avatarText, { color: colors.primary }]}>{item.requester_name[0]}</Text>
                </View>
                <View style={s.cardInfo}>
                    <Text style={[s.name, { color: colors.text }]}>{item.requester_name}</Text>
                    <Text style={[s.sub, { color: colors.textSecondary }]}>
                        {TYPE_LABELS[item.type] || item.type}
                    </Text>
                </View>
                <Badge label={item.status.replace('_', ' ').toUpperCase()} variant={statusVariant(item.status)} size="sm" />
            </View>

            <View style={[s.descBox, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[s.desc, { color: colors.textSecondary }]} numberOfLines={3}>{item.description}</Text>
            </View>

            <Text style={[s.date, { color: colors.textMuted }]}>
                {new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>

            {item.status !== 'resolved' && (
                <View style={s.actions}>
                    {item.status === 'open' && (
                        <Button title="Mark In Review" variant="ghost" size="sm" icon="eye-outline"
                            onPress={() => ComplaintService.resolve(item.id, 'in_review').then(load)}
                            style={s.btn}
                        />
                    )}
                    <Button title="Resolve" size="sm" icon="checkmark-circle-outline"
                        onPress={() => openResolve(item)}
                        style={s.btn}
                    />
                </View>
            )}

            {item.admin_response && (
                <View style={[s.responseBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
                    <Ionicons name="chatbubble-ellipses" size={14} color={colors.primary} />
                    <Text style={[s.responseText, { color: colors.primary }]}>{item.admin_response}</Text>
                </View>
            )}
        </Card>
    );

    return (
        <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>
            <Header title="Complaints" subtitle="Manage submitted complaints" />

            {/* Status tabs */}
            <View style={[s.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                {STATUS_TABS.map(tab => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        style={[s.tab, activeTab === tab && { borderBottomColor: colors.primary }]}
                    >
                        <Text style={[s.tabText, { color: activeTab === tab ? colors.primary : colors.textSecondary }]}>
                            {tab.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <ListSkeleton count={5} />
            ) : (
                <FlatList
                    data={complaints}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={s.list}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={<SectionHeader title={`${complaints.length} Complaint${complaints.length !== 1 ? 's' : ''}`} actionLabel="Refresh" onAction={load} />}
                    ListEmptyComponent={
                        <View style={s.empty}>
                            <Ionicons name="chatbubbles-outline" size={64} color={colors.textMuted} />
                            <Text style={{ color: colors.textSecondary, marginTop: 12, ...DesignTokens.typography.body }}>
                                No complaints in this category
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Resolve Modal */}
            <Modal visible={!!resolving} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setResolving(null)}>
                <SafeAreaView style={[s.modal, { backgroundColor: colors.background }]}>
                    <View style={[s.modalHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[s.modalTitle, { color: colors.text }]}>Resolve Complaint</Text>
                        <TouchableOpacity onPress={() => setResolving(null)}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={s.modalBody}>
                        {resolving && (
                            <View style={[s.descBox, { backgroundColor: colors.surfaceSecondary }]}>
                                <Text style={[s.desc, { color: colors.textSecondary }]}>{resolving.description}</Text>
                            </View>
                        )}
                        <Text style={[s.label, { color: colors.textSecondary }]}>Your Response (optional)</Text>
                        <View style={[s.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <TextInput
                                style={[s.textArea, { color: colors.text }]}
                                placeholder="Write a response to the complainant…"
                                placeholderTextColor={colors.textMuted}
                                value={responseText}
                                onChangeText={setResponseText}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                            <Button
                                title={processing ? 'Saving…' : 'Mark Resolved'}
                                onPress={() => handleResolve('resolved')}
                                icon="checkmark-circle-outline"
                                style={{ flex: 1 }}
                            />
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            <BottomNav items={ADMIN_NAV_ITEMS} activeRoute="/admin/complaints" />
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
    tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabText: { ...DesignTokens.typography.caption, fontWeight: 'bold' },
    list: { padding: DesignTokens.spacing.lg, paddingBottom: 100, gap: DesignTokens.spacing.md },
    card: { padding: DesignTokens.spacing.md, gap: DesignTokens.spacing.sm },
    cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    avatarText: { ...DesignTokens.typography.h3, fontWeight: 'bold' },
    cardInfo: { flex: 1 },
    name: { ...DesignTokens.typography.bodyBold },
    sub: { ...DesignTokens.typography.caption, marginTop: 2 },
    descBox: { borderRadius: 10, padding: 12 },
    desc: { ...DesignTokens.typography.caption, lineHeight: 18 },
    date: { ...DesignTokens.typography.tiny },
    actions: { flexDirection: 'row', gap: 8 },
    btn: { flex: 1 },
    responseBox: { flexDirection: 'row', gap: 6, padding: 10, borderRadius: 10, borderWidth: 1, alignItems: 'flex-start' },
    responseText: { ...DesignTokens.typography.caption, flex: 1 },
    empty: { alignItems: 'center', paddingTop: 80 },
    modal: { flex: 1 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1 },
    modalTitle: { ...DesignTokens.typography.h2 },
    modalBody: { padding: DesignTokens.spacing.lg, gap: DesignTokens.spacing.md },
    label: { ...DesignTokens.typography.caption, fontWeight: '600' },
    inputWrap: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 12 },
    textArea: { fontSize: 14, paddingVertical: 10, minHeight: 100 },
});
