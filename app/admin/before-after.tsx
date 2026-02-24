import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { ReportService } from '../../services/report.service';

export default function BeforeAfterReport() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { theme } = useTheme();
    const activeColors = Colors[theme];

    const [report, setReport] = useState<any>(null);
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
            const data = await ReportService.getReportById(reportId);
            setReport(data);
        } catch (error) {
            console.error('Failed to load report:', error);
            alert('Failed to load report details.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: activeColors.background }]}>
                <ActivityIndicator size="large" color={activeColors.tint} />
            </View>
        );
    }

    // Detail View
    if (id && report) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: activeColors.background }]}>
                <View style={[styles.header, { backgroundColor: activeColors.card }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={activeColors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: activeColors.text }]}>Report Details</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scroll}>
                    <View style={[styles.card, { backgroundColor: activeColors.card }]}>
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
                    </View>
                </ScrollView>

                <View style={[styles.bottomNav, { backgroundColor: activeColors.card, borderTopColor: activeColors.border }]}>
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
                    <Text style={{ color: activeColors.tint }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // List View (Default - when no ID is present)
    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: activeColors.background }]}>
            <View style={[styles.header, { backgroundColor: activeColors.card }]}>
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
                            style={[styles.reportItem, { backgroundColor: activeColors.card }]}
                            onPress={() => router.push(`/admin/before-after?id=${item.id}`)}
                        >
                            <View style={[styles.reportIcon, { backgroundColor: activeColors.tint + '15' }]}>
                                <Ionicons name="camera" size={24} color={activeColors.tint} />
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

            <View style={[styles.bottomNav, { backgroundColor: activeColors.card, borderTopColor: activeColors.border }]}>
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
                color={active ? activeColors.tint : activeColors.textSecondary}
            />
            <Text style={[styles.navText, { color: active ? activeColors.tint : activeColors.textSecondary }]}>
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
