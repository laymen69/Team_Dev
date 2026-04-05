import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { AdminWebLayout } from '../../components/admin/WebLayout';
import { getColors } from '../../constants/designSystem';
import { useTheme } from '../../context/ThemeContext';
import { Complaint, ComplaintService } from '../../services/complaint.service';

const TYPE_LABELS: Record<string, string> = {
    store_issue: 'Stock Issue',
    colleague: 'Colleague',
    equipment: 'Equipment',
    route: 'Route',
    other: 'Other',
};

const STATUS_COLOR: Record<string, string> = {
    open: '#f59e0b',
    in_review: '#3b82f6',
    resolved: '#10b981',
    rejected: '#ef4444',
};

const ROLE_COLOR: Record<string, { bg: string; text: string }> = {
    merchandiser: { bg: '#1d4ed820', text: '#60a5fa' },
    supervisor: { bg: '#7c3aed20', text: '#a78bfa' },
    admin: { bg: '#dc262620', text: '#f87171' },
};

export default function AdminComplaints() {
    const { theme } = useTheme();
    const colors = getColors(theme);

    const [activeTab, setActiveTab] = useState<'all' | 'open' | 'in_review' | 'resolved'>('all');
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [detail, setDetail] = useState<Complaint | null>(null);
    const [responseText, setResponseText] = useState('');
    const [processing, setProcessing] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        const data = await ComplaintService.getAll(activeTab === 'all' ? '' : activeTab);
        setComplaints(data);
        setLoading(false);
    }, [activeTab]);

    useEffect(() => { load(); }, [load]);

    const stats = useMemo(() => ({
        total: complaints.length,
        open: complaints.filter(c => c.status === 'open').length,
        in_review: complaints.filter(c => c.status === 'in_review').length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
    }), [complaints]);

    const filtered = useMemo(() =>
        complaints.filter(c =>
            (activeTab === 'all' || c.status === activeTab) &&
            (c.description.toLowerCase().includes(search.toLowerCase()) ||
             c.requester_name.toLowerCase().includes(search.toLowerCase()))
        ), [complaints, search, activeTab]);

    const handleResolve = async (status: 'resolved' | 'rejected') => {
        if (!detail) return;
        setProcessing(true);
        await ComplaintService.resolve(detail.id, status, responseText || undefined);
        setProcessing(false);
        setDetail(null);
        setResponseText('');
        load();
    };

    const handleInReview = async (item: Complaint) => {
        await ComplaintService.resolve(item.id, 'in_review');
        load();
    };

    if (Platform.OS !== 'web') return null;

    return (
        <AdminWebLayout title="Réclamations">
            {/* ── PAGE HEADER ─────────────────────────────── */}
            <View style={s.pageHeader}>
                <View>
                    <Text style={[s.pageTitle, { color: colors.text }]}>Gestion des Réclamations</Text>
                    <Text style={[s.pageSubtitle, { color: colors.textSecondary }]}>
                        Manage and resolve system-wide user feedback and field issues.
                    </Text>
                </View>

            </View>

            {/* ── STAT CARDS ──────────────────────────────── */}
            <View style={s.statsRow}>
                {[
                    { label: 'Total Complaints', value: stats.total, icon: 'chatbubbles-outline', color: colors.textSecondary, sub: '+12% from last month', subColor: '#10b981' },
                    { label: 'Pending', value: stats.open, icon: 'time-outline', color: '#f59e0b', sub: 'Requires immediate attention', subColor: '#f59e0b' },
                    { label: 'In Progress', value: stats.in_review, icon: 'hourglass-outline', color: '#3b82f6', sub: 'Assigned to support team', subColor: '#3b82f6' },
                    { label: 'Resolved', value: stats.resolved, icon: 'checkmark-circle-outline', color: '#10b981', sub: 'Completed successfully', subColor: '#10b981' },
                ].map(card => (
                    <View key={card.label} style={[s.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={s.statTop}>
                            <Text style={[s.statLabel, { color: colors.textSecondary }]}>{card.label}</Text>
                            <Ionicons name={card.icon as any} size={28} color={card.color} style={{ opacity: 0.6 }} />
                        </View>
                        <Text style={[s.statValue, { color: card.color === colors.textSecondary ? colors.text : card.color }]}>
                            {card.value}
                        </Text>
                        <Text style={[s.statSub, { color: card.subColor }]}>{card.sub}</Text>
                    </View>
                ))}
            </View>

            {/* ── SEARCH & FILTERS ───────────────────────── */}
            <View style={[s.filterBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[s.searchBox, { borderColor: colors.border, flex: 1 }]}>
                    <Ionicons name="search" size={16} color={colors.textMuted} />
                    <TextInput
                        placeholder="Search by ID, User or Keyword..."
                        placeholderTextColor={colors.textMuted}
                        value={search}
                        onChangeText={setSearch}
                        style={[s.searchInput, { color: colors.text }]}
                    />
                </View>

                <View style={s.filterGroup}>
                    {(['all', 'open', 'in_review', 'resolved'] as const).map(tab => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            style={[s.filterPill, {
                                backgroundColor: activeTab === tab ? colors.primary + '20' : 'transparent',
                                borderColor: activeTab === tab ? colors.primary : colors.border,
                            }]}
                        >
                            <Text style={{ color: activeTab === tab ? colors.primary : colors.textSecondary, fontSize: 13, fontWeight: '600' }}>
                                {tab === 'all' ? 'All' : tab === 'in_review' ? 'In Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* ── TABLE ────────────────────────────────────── */}
            <View style={[s.table, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {/* Table Header */}
                <View style={[s.tableHead, { borderBottomColor: colors.border, backgroundColor: colors.surfaceSecondary }]}>
                    {['ID', 'USER', 'ROLE', 'TYPE', 'DATE', 'STATUS', 'ACTIONS'].map(col => (
                        <Text key={col} style={[s.headCell, { color: colors.textMuted, flex: col === 'USER' ? 2 : col === 'ACTIONS' ? 1.5 : 1 }]}>
                            {col}
                        </Text>
                    ))}
                </View>

                {/* Rows */}
                {loading ? (
                    <View style={s.loadingRow}>
                        <ActivityIndicator color={colors.primary} />
                    </View>
                ) : filtered.length === 0 ? (
                    <View style={s.emptyRow}>
                        <Ionicons name="chatbubbles-outline" size={48} color={colors.border} />
                        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>No complaints found</Text>
                    </View>
                ) : (
                    filtered.map((item, idx) => {
                        const role = item.requester_role || 'merchandiser';
                        const rc = ROLE_COLOR[role] || ROLE_COLOR.merchandiser;
                        const sc = STATUS_COLOR[item.status] || '#94a3b8';

                        return (
                            <View key={item.id} style={[s.tableRow, {
                                borderBottomColor: colors.border,
                                backgroundColor: idx % 2 === 0 ? 'transparent' : colors.surfaceSecondary + '40',
                            }]}>
                                {/* ID */}
                                <Text style={[s.cell, { color: colors.textSecondary, flex: 1, fontSize: 14 }]}>
                                    #{`REC-${item.id}`}
                                </Text>

                                {/* User */}
                                <View style={[s.cell, { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                                    <View style={[s.rowAvatar, { backgroundColor: colors.primary + '20' }]}>
                                        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>
                                            {item.requester_name[0]}
                                        </Text>
                                    </View>
                                    <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }} numberOfLines={1}>
                                        {item.requester_name}
                                    </Text>
                                </View>

                                {/* Role */}
                                <View style={[s.cell, { flex: 1 }]}>
                                    <View style={[s.roleBadge, { backgroundColor: rc.bg }]}>
                                        <Text style={{ color: rc.text, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                            {role}
                                        </Text>
                                    </View>
                                </View>

                                {/* Type */}
                                <Text style={[s.cell, { color: colors.text, flex: 1, fontSize: 14 }]}>
                                    {TYPE_LABELS[item.type] || item.type}
                                </Text>

                                {/* Date */}
                                <Text style={[s.cell, { color: colors.textSecondary, flex: 1, fontSize: 14 }]}>
                                    {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </Text>

                                {/* Status */}
                                <View style={[s.cell, { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                                    <View style={[s.statusDot, { backgroundColor: sc }]} />
                                    <Text style={{ color: sc, fontWeight: '600', fontSize: 13 }}>
                                        {item.status === 'in_review' ? 'In Progress' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                    </Text>
                                </View>

                                {/* Actions */}
                                <View style={[s.cell, { flex: 1.5, flexDirection: 'row', gap: 8 }]}>
                                    <TouchableOpacity
                                        onPress={() => { setDetail(item); setResponseText(''); }}
                                        style={[s.actionBtn, { borderColor: colors.primary }]}
                                    >
                                        <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>View Detail</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}
            </View>

            {/* Result count */}
            {!loading && (
                <Text style={[s.resultCount, { color: colors.textMuted }]}>
                    Showing 1 to {filtered.length} of {filtered.length} results
                </Text>
            )}

            {/* ── DETAIL MODAL ────────────────────────── */}
            <Modal visible={!!detail} transparent animationType="fade">
                <View style={s.modalOverlay}>
                    <View style={[s.modalBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Modal Header */}
                            <View style={s.modalHead}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <Text style={[s.modalId, { color: colors.text }]}>REC-{detail?.id}</Text>
                                    <View style={[s.roleBadge, { backgroundColor: STATUS_COLOR[detail?.status || 'open'] + '20' }]}>
                                        <Text style={{ color: STATUS_COLOR[detail?.status || 'open'], fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }}>
                                            {detail?.status?.replace('_', ' ')}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => setDetail(null)}>
                                    <Ionicons name="close" size={22} color={colors.textMuted} />
                                </TouchableOpacity>
                            </View>
                            <Text style={[{ color: colors.textSecondary, fontSize: 13, marginBottom: 20 }]}>
                                Réclamation #{detail?.id} submitted on {detail ? new Date(detail.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                            </Text>

                            {/* User & Store cards */}
                            <View style={s.infoRow}>
                                <View style={[s.infoCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                                    <View style={[s.rowAvatar, { backgroundColor: colors.primary + '20', width: 44, height: 44, borderRadius: 10 }]}>
                                        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 18 }}>{detail?.requester_name?.[0]}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[s.infoCardTitle, { color: colors.primary }]}>{detail?.requester_name}</Text>
                                        <Text style={[s.infoCardSub, { color: colors.textSecondary }]}>{detail?.requester_role || 'Merchandiser'}</Text>
                                    </View>
                                </View>
                                <View style={[s.infoCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                                    <View style={[s.rowAvatar, { backgroundColor: colors.secondary + '20', width: 44, height: 44, borderRadius: 10 }]}>
                                        <Ionicons name="storefront" size={22} color={colors.secondary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[s.infoCardTitle, { color: colors.text }]}>Issue Type</Text>
                                        <Text style={[s.infoCardSub, { color: colors.textSecondary }]}>{TYPE_LABELS[detail?.type || ''] || detail?.type}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Description */}
                            <View style={[s.descBlock, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                                <Text style={[s.descText, { color: colors.text }]}>&quot;{detail?.description}&quot;</Text>
                            </View>

                            {/* Admin response if any */}
                            {detail?.admin_response && (
                                <View style={[s.adminResp, { borderLeftColor: colors.primary, backgroundColor: colors.primary + '08' }]}>
                                    <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>ADMIN RESPONSE</Text>
                                    <Text style={{ color: colors.text }}>{detail.admin_response}</Text>
                                </View>
                            )}

                            {/* Resolve input */}
                            {detail?.status !== 'resolved' && (
                                <>
                                    <Text style={[s.updateLabel, { color: colors.textSecondary }]}>Update Status</Text>
                                    <TextInput
                                        placeholder="Write response (optional)..."
                                        placeholderTextColor={colors.textMuted}
                                        value={responseText}
                                        onChangeText={setResponseText}
                                        multiline
                                        style={[s.textArea, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary, color: colors.text }]}
                                    />
                                </>
                            )}
                        </ScrollView>

                        {/* Modal Footer */}
                        <View style={[s.modalFooter, { borderTopColor: colors.border }]}>
                            <TouchableOpacity onPress={() => setDetail(null)} style={[s.cancelBtn, { borderColor: colors.border }]}>
                                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
                            </TouchableOpacity>
                            {detail?.status !== 'resolved' && (
                                <>
                                    {detail?.status === 'open' && (
                                        <TouchableOpacity
                                            onPress={() => { handleInReview(detail!); setDetail(null); }}
                                            style={[s.reviewBtn, { borderColor: '#3b82f6' }]}
                                        >
                                            <Text style={{ color: '#3b82f6', fontWeight: '700' }}>Mark In Review</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        onPress={() => handleResolve('resolved')}
                                        style={[s.saveBtn, { backgroundColor: colors.primary }]}
                                        disabled={processing}
                                    >
                                        {processing ? <ActivityIndicator color="#fff" size="small" /> :
                                            <Text style={{ color: '#fff', fontWeight: '700' }}>Save Changes</Text>}
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </AdminWebLayout>
    );
}

const s = StyleSheet.create({
    pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
    pageTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
    pageSubtitle: { fontSize: 14, marginTop: 4 },
    newBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
    newBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    statsRow: { flexDirection: 'row', gap: 16, marginBottom: 24, flexWrap: 'wrap' },
    statCard: { flex: 1, minWidth: 180, padding: 20, borderRadius: 16, borderWidth: 1, gap: 4 },
    statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    statLabel: { fontSize: 13, fontWeight: '600' },
    statValue: { fontSize: 36, fontWeight: '900', letterSpacing: -1 },
    statSub: { fontSize: 12, fontWeight: '500' },

    filterBar: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16, flexWrap: 'wrap' },
    searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
    searchInput: { flex: 1, fontSize: 14, outlineStyle: 'none' } as any,
    filterGroup: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    filterPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },

    table: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 12 },
    tableHead: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
    headCell: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
    tableRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 18, borderBottomWidth: 1, alignItems: 'center' },
    cell: { },
    rowAvatar: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    actionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
    loadingRow: { padding: 60, alignItems: 'center' },
    emptyRow: { padding: 60, alignItems: 'center' },
    resultCount: { fontSize: 13, marginBottom: 24 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalBox: { width: 580, maxHeight: '85%', borderRadius: 20, borderWidth: 1, padding: 28, gap: 0 },
    modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    modalId: { fontSize: 22, fontWeight: '800' },
    infoRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    infoCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
    infoCardTitle: { fontWeight: '700', fontSize: 15 },
    infoCardSub: { fontSize: 12, marginTop: 2 },
    descBlock: { padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
    descText: { fontSize: 15, lineHeight: 24, fontStyle: 'italic' },
    adminResp: { borderLeftWidth: 3, paddingLeft: 14, paddingVertical: 10, paddingRight: 10, borderRadius: 8, marginBottom: 16 },
    updateLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
    textArea: { borderWidth: 1, borderRadius: 12, padding: 14, minHeight: 100, fontSize: 14, marginBottom: 8 },
    modalFooter: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end', paddingTop: 16, borderTopWidth: 1, marginTop: 16 },
    cancelBtn: { paddingHorizontal: 20, paddingVertical: 11, borderRadius: 12, borderWidth: 1 },
    reviewBtn: { paddingHorizontal: 20, paddingVertical: 11, borderRadius: 12, borderWidth: 1 },
    saveBtn: { paddingHorizontal: 24, paddingVertical: 11, borderRadius: 12 },
});