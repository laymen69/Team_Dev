import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../../components/ui/BottomNav';
import { getColors } from '../../constants/designSystem';
import { SUPERVISOR_NAV_ITEMS } from '../../constants/navigation';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../hooks/useFonts';
import { DocumentService } from '../../services/document.service';

// Mock data for documents
const documents = [
    {
        id: '1',
        title: 'Merchandising Guide 2026',
        type: 'PDF',
        category: 'Training',
        size: '2.4 MB',
        date: '2026-02-01',
        icon: 'document-text',
        color: '#ef4444',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
        id: '2',
        title: 'Product Catalog Q1',
        type: 'PDF',
        category: 'Catalog',
        size: '5.8 MB',
        date: '2026-01-15',
        icon: 'book',
        color: '#3b82f6',
        url: 'https://www.antennahouse.com/hubfs/pdf-samples/Guidelines.pdf'
    },
    {
        id: '3',
        title: 'Store Layout Templates',
        type: 'ZIP',
        category: 'Templates',
        size: '12.1 MB',
        date: '2026-01-10',
        icon: 'folder',
        color: '#f59e0b',
        url: 'https://sample-videos.com/zip/1mb.zip'
    },
    {
        id: '4',
        title: 'Safety Procedures',
        type: 'PDF',
        category: 'Compliance',
        size: '1.2 MB',
        date: '2026-01-05',
        icon: 'shield-checkmark',
        color: '#10b981',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
        id: '5',
        title: 'Brand Guidelines',
        type: 'PDF',
        category: 'Branding',
        size: '8.4 MB',
        date: '2025-12-20',
        icon: 'color-palette',
        color: '#8b5cf6',
        url: 'https://www.antennahouse.com/hubfs/pdf-samples/Guidelines.pdf'
    },
];

const categories = ['All', 'Training', 'Catalog', 'Templates', 'Compliance', 'Branding'];

export default function DocumentsPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = getColors(theme);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const handleDownload = async (doc: typeof documents[0]) => {
        setDownloadingId(doc.id);
        const fileName = `${doc.title}.${doc.type.toLowerCase()}`;
        await DocumentService.downloadAndShare(doc.url, fileName);
        setDownloadingId(null);
    };

    const renderDocument = (item: typeof documents[0]) => (
        <TouchableOpacity
            key={item.id}
            style={[styles.card, { backgroundColor: colors.surface }]}
        >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
            </View>
            <View style={styles.cardInfo}>
                <Text style={[styles.docTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                </Text>
                <View style={styles.metaRow}>
                    <View style={[styles.typeBadge, { backgroundColor: colors.background }]}>
                        <Text style={[styles.typeText, { color: colors.textSecondary }]}>{item.type}</Text>
                    </View>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.size}</Text>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>•</Text>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.date}</Text>
                </View>
            </View>
            <TouchableOpacity
                style={[styles.downloadBtn, { backgroundColor: colors.primary }]}
                onPress={() => handleDownload(item)}
                disabled={downloadingId !== null}
            >
                {downloadingId === item.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Ionicons name="download-outline" size={18} color="#fff" />
                )}
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.surface }]}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Documents</Text>
                        <TouchableOpacity>
                            <Ionicons name="search" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                        Access guides, catalogs, and training materials
                    </Text>
                </View>

                {/* Categories */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                >
                    {categories.map((cat, index) => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.categoryChip,
                                {
                                    backgroundColor: index === 0 ? colors.primary : colors.surface,
                                    borderColor: colors.border,
                                }
                            ]}
                        >
                            <Text style={[
                                styles.categoryText,
                                { color: index === 0 ? '#fff' : colors.text }
                            ]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                        <Ionicons name="document" size={20} color={colors.primary} />
                        <Text style={[styles.statValue, { color: colors.text }]}>{documents.length}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Files</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                        <Ionicons name="cloud-download" size={20} color="#10b981" />
                        <Text style={[styles.statValue, { color: colors.text }]}>29.9 MB</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Size</Text>
                    </View>
                </View>

                {/* Section Title */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Documents</Text>
                </View>

                {/* Documents List */}
                <View style={styles.listContainer}>
                    {documents.map(renderDocument)}
                </View>
            </ScrollView>

            <BottomNav items={SUPERVISOR_NAV_ITEMS} activeRoute="/supervisor/documents" />
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    scroll: { paddingBottom: 100 },

    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: { fontSize: 20, fontFamily: Fonts.heading },
    headerSubtitle: { fontSize: 13, marginTop: 8, fontFamily: Fonts.body },

    categoriesContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 10,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
    },
    categoryText: { fontSize: 13, fontFamily: Fonts.bodySemiBold },

    statsRow: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        gap: 6,
    },
    statValue: { fontSize: 18, fontFamily: Fonts.heading },
    statLabel: { fontSize: 11, fontFamily: Fonts.bodySemiBold },

    sectionHeader: {
        paddingHorizontal: 16,
        marginTop: 20,
        marginBottom: 12,
    },
    sectionTitle: { fontSize: 18, fontFamily: Fonts.heading },

    listContainer: {
        paddingHorizontal: 16,
        gap: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardInfo: { flex: 1 },
    docTitle: { fontSize: 15, fontFamily: Fonts.bodySemiBold },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 6,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    typeText: { fontSize: 10, fontFamily: Fonts.bodyBold },
    metaText: { fontSize: 11, fontFamily: Fonts.body },
    downloadBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },

});