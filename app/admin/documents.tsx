import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../components/ui/Badge';
import { BottomNav } from '../../components/ui/BottomNav';
import { Card, StatCard } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { ADMIN_NAV_ITEMS } from '../../constants/navigation';
import { useTheme } from '../../context/ThemeContext';
import { DocumentService } from '../../services/document.service';

const documentsData = [
    { id: '1', name: 'Annual Report 2025', category: 'Reports', size: '2.4 MB', date: '2026-01-15', type: 'pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: '2', name: 'Merchandiser Guidelines', category: 'Guidelines', size: '1.1 MB', date: '2026-01-10', type: 'pdf', url: 'https://www.antennahouse.com/hubfs/pdf-samples/Guidelines.pdf' },
    { id: '3', name: 'Contract Template', category: 'Contracts', size: '540 KB', date: '2025-12-20', type: 'doc', url: 'https://www.w3.org/TR/PNG/iso_8859-1.txt' },
    { id: '4', name: 'Store Visit Checklist', category: 'Guidelines', size: '320 KB', date: '2026-02-01', type: 'pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: '5', name: 'Q4 Performance Report', category: 'Reports', size: '3.2 MB', date: '2026-01-28', type: 'pdf', url: 'https://www.antennahouse.com/hubfs/pdf-samples/Report.pdf' },
    { id: '6', name: 'Employee Handbook', category: 'Guidelines', size: '4.5 MB', date: '2025-11-15', type: 'pdf', url: 'https://www.antennahouse.com/hubfs/pdf-samples/Handbook.pdf' },
];

const categories = ['All', 'Reports', 'Contracts', 'Guidelines'];

export default function DocumentsPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const colors = getColors(theme);

    const handleDownload = async (doc: typeof documentsData[0]) => {
        setDownloadingId(doc.id);
        const fileName = `${doc.name}.${doc.type}`;
        await DocumentService.downloadAndShare(doc.url, fileName);
        setDownloadingId(null);
    };

    const filteredDocs = documentsData.filter(doc =>
        selectedCategory === 'All' || doc.category === selectedCategory
    );

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf': return { icon: 'document-text', color: colors.danger };
            case 'doc': return { icon: 'document', color: colors.primary };
            default: return { icon: 'document-outline', color: colors.textSecondary };
        }
    };

    const getCategoryVariant = (category: string): any => {
        switch (category) {
            case 'Reports': return 'primary';
            case 'Contracts': return 'success';
            case 'Guidelines': return 'warning';
            default: return 'neutral';
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <Header
                title="Documents"
                showBack
                rightIcon="cloud-upload"
                onRightIconPress={() => { }}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.statsRow}>
                    <StatCard
                        label="TOTAL FILES"
                        value={documentsData.length}
                        icon="folder"
                        color={colors.primary}
                    />
                    <StatCard
                        label="STORAGE"
                        value="12.4 MB"
                        icon="cloud-done"
                        color={colors.success}
                    />
                </View>

                <View style={styles.filterBar}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoryFilter}
                    >
                        {categories.map(category => (
                            <TouchableOpacity
                                key={category}
                                style={[
                                    styles.filterBtn,
                                    { backgroundColor: selectedCategory === category ? colors.primary : colors.surfaceSecondary }
                                ]}
                                onPress={() => setSelectedCategory(category)}
                            >
                                <Text style={[
                                    styles.filterText,
                                    { color: selectedCategory === category ? '#fff' : colors.textSecondary }
                                ]}>
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <SectionHeader title="Available Documents" />

                <View style={styles.docsList}>
                    {filteredDocs.map(doc => {
                        const fileConfig = getFileIcon(doc.type);
                        return (
                            <Card key={doc.id} style={styles.docCard}>
                                <View style={[styles.docIcon, { backgroundColor: fileConfig.color + '15' }]}>
                                    <Ionicons name={fileConfig.icon as any} size={24} color={fileConfig.color} />
                                </View>
                                <View style={styles.docInfo}>
                                    <View style={styles.docTop}>
                                        <Text style={[styles.docName, { color: colors.text }]} numberOfLines={1}>{doc.name}</Text>
                                        <Badge label={doc.category} variant={getCategoryVariant(doc.category)} size="sm" />
                                    </View>
                                    <Text style={[styles.docMeta, { color: colors.textSecondary }]}>{doc.size} • {doc.date}</Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.downloadBtn, { backgroundColor: colors.surfaceSecondary }]}
                                    onPress={() => handleDownload(doc)}
                                    disabled={downloadingId === doc.id}
                                >
                                    {downloadingId === doc.id ? (
                                        <ActivityIndicator size="small" color={colors.primary} />
                                    ) : (
                                        <Ionicons name="download-outline" size={20} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            </Card>
                        );
                    })}
                </View>
            </ScrollView>

            <BottomNav items={ADMIN_NAV_ITEMS} activeRoute="/admin/documents" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    statsRow: {
        flexDirection: 'row',
        padding: DesignTokens.spacing.lg,
        gap: DesignTokens.spacing.md,
    },
    filterBar: {
        marginBottom: DesignTokens.spacing.md,
    },
    categoryFilter: {
        paddingHorizontal: DesignTokens.spacing.lg,
        gap: DesignTokens.spacing.sm,
    },
    filterBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    filterText: {
        ...DesignTokens.typography.caption,
        fontWeight: 'bold',
    },
    docsList: {
        padding: DesignTokens.spacing.lg,
        gap: DesignTokens.spacing.md,
    },
    docCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: DesignTokens.spacing.md,
        gap: DesignTokens.spacing.md,
    },
    docIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    docInfo: {
        flex: 1,
        gap: 2,
    },
    docTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
    },
    docName: {
        flex: 1,
        ...DesignTokens.typography.bodyBold,
    },
    docMeta: {
        ...DesignTokens.typography.tiny,
    },
    downloadBtn: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
