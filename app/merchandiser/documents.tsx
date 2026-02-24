
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../../components/ui/BottomNav';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { MERCHANDISER_NAV_ITEMS } from '../../constants/navigation';
import { useTheme } from '../../context/ThemeContext';
import { DocumentService } from '../../services/document.service';

const documents = [
    { id: '1', name: 'Product Catalog 2024', type: 'pdf', size: '4.2 MB', date: 'Feb 5, 2024', category: 'Catalog', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: '2', name: 'Store Visit Guidelines', type: 'pdf', size: '1.8 MB', date: 'Jan 15, 2024', category: 'Guidelines', url: 'https://www.antennahouse.com/hubfs/pdf-samples/Guidelines.pdf' },
    { id: '3', name: 'Planogram Template', type: 'xlsx', size: '856 KB', date: 'Feb 1, 2024', category: 'Templates', url: 'https://sample-videos.com/xls/Sample-Spreadsheet-10-rows.xls' },
    { id: '4', name: 'Safety Procedures', type: 'pdf', size: '2.1 MB', date: 'Dec 10, 2023', category: 'Guidelines', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: '5', name: 'Expense Report Form', type: 'docx', size: '245 KB', date: 'Jan 20, 2024', category: 'Forms', url: 'https://www.w3.org/TR/PNG/iso_8859-1.txt' },
];

export default function MerchandiserDocuments() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = getColors(theme);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('All');

    const handleDownload = async (doc: typeof documents[0]) => {
        setDownloadingId(doc.id);
        const fileName = `${doc.name}.${doc.type}`;
        await DocumentService.downloadAndShare(doc.url, fileName);
        setDownloadingId(null);
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf': return { name: 'document-text', color: colors.danger };
            case 'xlsx': return { name: 'grid', color: colors.success };
            case 'docx': return { name: 'document', color: colors.primary };
            default: return { name: 'document-outline', color: colors.secondary };
        }
    };

    const filteredDocs = activeTab === 'All'
        ? documents
        : documents.filter(d => d.category === activeTab);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header
                title="Documents"
                subtitle="Shared Files & Resources"
                rightIcon="search-outline"
                onRightIconPress={() => { }}
                showBack
            />

            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                    {['All', 'Catalog', 'Guidelines', 'Templates', 'Forms'].map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setActiveTab(cat)}
                            style={[
                                styles.tab,
                                activeTab === cat && { backgroundColor: colors.primary }
                            ]}
                        >
                            <Text style={[
                                styles.tabText,
                                { color: activeTab === cat ? '#fff' : colors.textSecondary }
                            ]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <SectionHeader title={`${activeTab} Resources`} />
                {filteredDocs.map((doc) => {
                    const icon = getFileIcon(doc.type);
                    return (
                        <Card key={doc.id} style={styles.docCard} elevation="sm">
                            <View style={[styles.docIcon, { backgroundColor: icon.color + '15' }]}>
                                <Ionicons name={icon.name as any} size={24} color={icon.color} />
                            </View>
                            <View style={styles.docInfo}>
                                <Text style={[styles.docName, { color: colors.text }]}>{doc.name}</Text>
                                <Text style={[styles.docMeta, { color: colors.textSecondary }]}>
                                    {doc.type.toUpperCase()} • {doc.size} • {doc.date}
                                </Text>
                            </View>
                            <Button
                                title=""
                                variant="ghost"
                                onPress={() => handleDownload(doc)}
                                disabled={downloadingId !== null}
                                style={styles.downloadBtn}
                                icon={downloadingId === doc.id ? undefined : "download-outline"}
                            >
                                {downloadingId === doc.id && (
                                    <ActivityIndicator size="small" color={colors.primary} />
                                )}
                            </Button>
                        </Card>
                    );
                })}
            </ScrollView>

            <BottomNav items={MERCHANDISER_NAV_ITEMS} activeRoute="/merchandiser/profile" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    tabsContainer: { paddingVertical: DesignTokens.spacing.md },
    tabsScroll: { paddingHorizontal: DesignTokens.spacing.lg, gap: DesignTokens.spacing.sm },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    tabText: { ...DesignTokens.typography.caption, fontWeight: '700' },
    scroll: { paddingHorizontal: DesignTokens.spacing.lg, paddingBottom: 100 },
    docCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: DesignTokens.spacing.md,
        padding: DesignTokens.spacing.md,
        marginBottom: DesignTokens.spacing.sm,
    },
    docIcon: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    docInfo: { flex: 1, gap: 2 },
    docName: { ...DesignTokens.typography.bodyBold, fontSize: 14 },
    docMeta: { ...DesignTokens.typography.caption, fontSize: 11 },
    downloadBtn: { width: 44, height: 44, padding: 0 },
});
