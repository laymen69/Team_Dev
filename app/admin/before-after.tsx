import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminWebLayout } from '../../components/admin/WebLayout';
import { getColors } from '../../constants/designSystem';
import { useTheme } from '../../context/ThemeContext';
import { ReportService } from '../../services/report.service';
import { NotificationService } from '../../services/notification.service';

export default function BeforeAfterReport() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { theme } = useTheme();
    const activeColors = getColors(theme);

    const [report, setReport] = useState<any>(null);
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (id) {
            loadReport(Number(id));
        } else {
            loadAllReports();
        }
    }, [id]);

    const loadAllReports = async () => {
        setLoading(true);
        try {
            const data = await ReportService.getAll();
            setReports(data || []);
        } catch (error) {
            console.error('Failed to load reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadReport = async (reportId: number) => {
        try {
            const data = await ReportService.getById(reportId);
            setReport(data);
        } catch (error) {
            console.error('Failed to load report:', error);
            alert('Failed to load report details.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
        if (!report || !id) return;
        setProcessing(true);
        try {
            const updated = await ReportService.updateStatus(Number(id), status);
            if (updated) {
                setReport(updated);
                
                // Send notification to the user
                await NotificationService.sendNotification({
                    user_id: report.user_id || 1,
                    title: `Report ${status === 'approved' ? 'Approved' : 'Rejected'}`,
                    message: `Your report "${report.name}" has been ${status}.`,
                    type: status === 'approved' ? 'success' : 'alert',
                });
                
                if (Platform.OS !== 'web') {
                    alert(`Report ${status} successfully.`);
                }
            }
        } catch (error) {
            console.error('Update status error:', error);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: activeColors.background }]}>
                <ActivityIndicator size="large" color={activeColors.primary} />
            </View>
        );
    }

    // Detail View
    if (id && report) {
        if (Platform.OS === 'web') {
            return (
                <AdminWebLayout title="Report Details">
                    <View style={{ backgroundColor: activeColors.surface, borderRadius: 24, padding: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                            <View>
                                <Text style={[styles.title, { color: activeColors.text, fontSize: 32 }]}>{report.name}</Text>
                                <Text style={[styles.date, { color: activeColors.textSecondary, fontSize: 16 }]}>
                                    Submitted by User #{report.user_id} on {new Date(report.created_at).toLocaleDateString()}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={{ backgroundColor: activeColors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 }}
                                onPress={() => router.back()}
                            >
                                <Text style={{ color: '#fff', fontWeight: '700' }}>Back to List</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ gap: 32 }}>
                            <View>
                                <Text style={[styles.sectionTitle, { color: activeColors.text, fontSize: 18, marginBottom: 12 }]}>Notes</Text>
                                <View style={{ backgroundColor: activeColors.background, padding: 20, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: activeColors.primary }}>
                                    <Text style={[styles.notes, { color: activeColors.textSecondary }]}>
                                        {report.notes || "No notes provided."}
                                    </Text>
                                </View>
                            </View>

                            <View>
                                <Text style={[styles.sectionTitle, { color: activeColors.text, fontSize: 18, marginBottom: 20 }]}>Evidence</Text>
                                <View style={{ flexDirection: 'row', gap: 24 }}>
                                    <View style={{ flex: 1, gap: 12 }}>
                                        <Text style={[styles.imageLabel, { color: activeColors.textSecondary, textAlign: 'center' }]}>BEFORE CONDITION</Text>
                                        {report.before_image ? (
                                            <Image source={{ uri: report.before_image }} style={[styles.image, { height: 400 }]} resizeMode="cover" />
                                        ) : (
                                            <View style={[styles.placeholder, { height: 400, borderColor: activeColors.border }]}>
                                                <Ionicons name="image-outline" size={48} color={activeColors.textMuted} />
                                                <Text style={{ color: activeColors.textSecondary, marginTop: 12 }}>No Image Available</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={{ flex: 1, gap: 12 }}>
                                        <Text style={[styles.imageLabel, { color: activeColors.textSecondary, textAlign: 'center' }]}>AFTER CONDITION</Text>
                                        {report.after_image ? (
                                            <Image source={{ uri: report.after_image }} style={[styles.image, { height: 400 }]} resizeMode="cover" />
                                        ) : (
                                            <View style={[styles.placeholder, { height: 400, borderColor: activeColors.border }]}>
                                                <Ionicons name="image-outline" size={48} color={activeColors.textMuted} />
                                                <Text style={{ color: activeColors.textSecondary, marginTop: 12 }}>No Image Available</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>

                            {/* ── Approval Actions ────────────────────────── */}
                            {report.status === 'pending' && (
                                <View style={{ flexDirection: 'row', gap: 16, marginTop: 40, borderTopWidth: 1, borderTopColor: activeColors.border, paddingTop: 32 }}>
                                    <TouchableOpacity
                                        style={{ flex: 1, backgroundColor: activeColors.danger + '10', borderColor: activeColors.danger, borderWidth: 1, paddingVertical: 16, borderRadius: 14, alignItems: 'center' }}
                                        onPress={() => handleUpdateStatus('rejected')}
                                        disabled={processing}
                                    >
                                        <Text style={{ color: activeColors.danger, fontWeight: '700', fontSize: 16 }}>Reject Report</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{ flex: 2, backgroundColor: activeColors.success, paddingVertical: 16, borderRadius: 14, alignItems: 'center', shadowColor: activeColors.success, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 }}
                                        onPress={() => handleUpdateStatus('approved')}
                                        disabled={processing}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Approve & Notify User</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {report.status !== 'pending' && (
                                <View style={{ marginTop: 40, padding: 20, borderRadius: 16, backgroundColor: report.status === 'approved' ? activeColors.success + '10' : activeColors.danger + '10', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <Ionicons name={report.status === 'approved' ? "checkmark-circle" : "close-circle"} size={24} color={report.status === 'approved' ? activeColors.success : activeColors.danger} />
                                    <Text style={{ color: report.status === 'approved' ? activeColors.success : activeColors.danger, fontWeight: '700', fontSize: 16 }}>
                                        Report already {report.status}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </AdminWebLayout>
            );
        }

        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: activeColors.background }]}>
                <View style={[styles.header, { backgroundColor: activeColors.surface }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={activeColors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: activeColors.text }]}>Report Details</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scroll}>
                    <View style={[styles.card, { backgroundColor: activeColors.surface }]}>
                        <Text style={[styles.title, { color: activeColors.text }]}>{report.name}</Text>
                        <Text style={[styles.date, { color: activeColors.textSecondary }]}>
                            Submitted by User #{report.user_id} on {new Date(report.created_at).toLocaleDateString()}
                        </Text>

                        <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Notes</Text>
                        <Text style={[styles.notes, { color: activeColors.textSecondary }]}>
                            {report.notes || "No notes provided."}
                        </Text>

                        <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Evidence</Text>

                        <View style={styles.imagesContainer}>
                            <View style={styles.imageWrapper}>
                                <Text style={[styles.imageLabel, { color: activeColors.textSecondary }]}>Before</Text>
                                {report.before_image ? (
                                    <Image source={{ uri: report.before_image }} style={styles.image} />
                                ) : (
                                    <View style={[styles.placeholder, { borderColor: activeColors.border }]}>
                                        <Text style={{ color: activeColors.textSecondary }}>No Image</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.imageWrapper}>
                                <Text style={[styles.imageLabel, { color: activeColors.textSecondary }]}>After</Text>
                                {report.after_image ? (
                                    <Image source={{ uri: report.after_image }} style={styles.image} />
                                ) : (
                                    <View style={[styles.placeholder, { borderColor: activeColors.border }]}>
                                        <Text style={{ color: activeColors.textSecondary }}>No Image</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Approval Actions Mobile */}
                        {report.status === 'pending' && (
                            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                                <TouchableOpacity
                                    style={{ flex: 1, backgroundColor: activeColors.danger + '10', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
                                    onPress={() => handleUpdateStatus('rejected')}
                                    disabled={processing}
                                >
                                    <Text style={{ color: activeColors.danger, fontWeight: '700' }}>Reject</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{ flex: 1, backgroundColor: activeColors.success, paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
                                    onPress={() => handleUpdateStatus('approved')}
                                    disabled={processing}
                                >
                                    <Text style={{ color: '#fff', fontWeight: '700' }}>Approve</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>

                <View style={[styles.bottomNav, { backgroundColor: activeColors.surface, borderTopColor: activeColors.border }]}>
                    <NavItem icon="grid" label="Overview" onPress={() => router.push('/admin/dashboard')} activeColors={activeColors} />
                    <NavItem icon="people" label="Users" onPress={() => router.push('/admin/users')} activeColors={activeColors} />
                    <NavItem icon="storefront" label="GSM" onPress={() => router.push('/admin/gsm')} activeColors={activeColors} />
                    <NavItem icon="calendar" label="Planning" onPress={() => router.push('/admin/planning')} activeColors={activeColors} />
                    <NavItem icon="person" label="Profile" onPress={() => router.push('/admin/profile')} activeColors={activeColors} />
                </View>
            </SafeAreaView>
        );
    }

    // "Report not found" only if an ID was actually requested
    if (id && !report) {
        return (
            <View style={[styles.center, { backgroundColor: activeColors.background }]}>
                <Text style={{ color: activeColors.text }}>Report not found.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: activeColors.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // List View (Default - when no ID is present)
    if (Platform.OS === 'web') {
        return (
            <AdminWebLayout title="Field Reports">
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: activeColors.text }}>All Reports History</Text>
                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: activeColors.surfaceSecondary || '#f3f4f6', borderRadius: 12 }}
                        onPress={loadAllReports}
                    >
                        <Ionicons name="refresh" size={18} color={activeColors.text} />
                        <Text style={{ fontWeight: '600', color: activeColors.text }}>Refresh</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                    {reports.length === 0 ? (
                        <View style={[styles.center, { width: '100%', padding: 100 }]}>
                            <Ionicons name="documents-outline" size={64} color={activeColors.textMuted} />
                            <Text style={{ color: activeColors.textSecondary, marginTop: 16 }}>No reports found.</Text>
                        </View>
                    ) : (
                        reports.map((item: any) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.reportItem, { backgroundColor: activeColors.surface, width: '32%', marginBottom: 0, padding: 20, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }]}
                                onPress={() => router.push(`/admin/before-after?id=${item.id}`)}
                            >
                                <View style={[styles.reportIcon, { backgroundColor: activeColors.primary + '15', width: 56, height: 56, borderRadius: 16 }]}>
                                    <Ionicons name="camera" size={28} color={activeColors.primary} />
                                </View>
                                <View style={styles.reportContent}>
                                    <Text style={[styles.reportTitle, { color: activeColors.text, fontSize: 16 }]} numberOfLines={1}>{item.name || 'Before/After Report'}</Text>
                                    <Text style={[styles.reportSubtitle, { color: activeColors.textSecondary, marginTop: 4 }]}>
                                        User #{item.user_id} • {new Date(item.created_at).toLocaleDateString()}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={activeColors.textSecondary} />
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </AdminWebLayout>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: activeColors.background }]}>
            <View style={[styles.header, { backgroundColor: activeColors.surface }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={activeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>Field Reports</Text>
                <TouchableOpacity onPress={loadAllReports} style={styles.backBtn}>
                    <Ionicons name="refresh" size={24} color={activeColors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {reports.length === 0 ? (
                    <View style={styles.center}>
                        <Text style={{ color: activeColors.textSecondary }}>No reports found.</Text>
                    </View>
                ) : (
                    reports.map((item: any) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.reportItem, { backgroundColor: activeColors.surface }]}
                            onPress={() => router.push(`/admin/before-after?id=${item.id}`)}
                        >
                            <View style={[styles.reportIcon, { backgroundColor: activeColors.primary + '15' }]}>
                                <Ionicons name="camera" size={24} color={activeColors.primary} />
                            </View>
                            <View style={styles.reportContent}>
                                <Text style={[styles.reportTitle, { color: activeColors.text }]}>{item.name || 'Before/After Report'}</Text>
                                <Text style={[styles.reportSubtitle, { color: activeColors.textSecondary }]}>
                                    User #{item.user_id} • {new Date(item.created_at).toLocaleDateString()}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={activeColors.textSecondary} />
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            <View style={[styles.bottomNav, { backgroundColor: activeColors.surface, borderTopColor: activeColors.border }]}>
                <NavItem icon="grid" label="Overview" onPress={() => router.push('/admin/dashboard')} activeColors={activeColors} />
                <NavItem icon="people" label="Users" onPress={() => router.push('/admin/users')} activeColors={activeColors} />
                <NavItem icon="storefront" label="GSM" onPress={() => router.push('/admin/gsm')} activeColors={activeColors} />
                <NavItem icon="calendar" label="Planning" onPress={() => router.push('/admin/planning')} activeColors={activeColors} />
                <NavItem icon="person" label="Profile" onPress={() => router.push('/admin/profile')} activeColors={activeColors} />
            </View>
        </SafeAreaView>
    );
}

function NavItem({ icon, label, active = false, onPress, activeColors }: any) {
    return (
        <TouchableOpacity style={styles.navItem} onPress={onPress}>
            <Ionicons
                name={icon}
                size={22}
                color={active ? activeColors.primary : activeColors.textSecondary}
            />
            <Text style={[styles.navText, { color: active ? activeColors.primary : activeColors.textSecondary }]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700' },

    scroll: {
        padding: 16,
        paddingBottom: 100,
    },
    card: {
        borderRadius: 16,
        padding: 16,
    },
    title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
    date: { fontSize: 13, marginBottom: 20 },

    sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 },
    notes: { fontSize: 15, lineHeight: 22 },

    imagesContainer: {
        gap: 20,
        marginTop: 10,
    },
    imageWrapper: { gap: 8 },
    imageLabel: { fontSize: 14, fontWeight: '600' },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        backgroundColor: '#e5e7eb',
    },
    placeholder: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },

    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    navItem: { alignItems: 'center', gap: 2 },
    navText: { fontSize: 10, fontWeight: '700' },
    reportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        gap: 12,
    },
    reportIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reportContent: {
        flex: 1,
    },
    reportTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    reportSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
});
