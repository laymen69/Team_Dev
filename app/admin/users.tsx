import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../components/ui/Badge';
import { BottomNav } from '../../components/ui/BottomNav';
import { Header } from '../../components/ui/Header';
import { ListSkeleton } from '../../components/ui/LoadingSkeleton';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DesignTokens, getColors } from '../../constants/designSystem';
import { ADMIN_NAV_ITEMS } from '../../constants/navigation';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../hooks/useFonts';
import { UserService, UserUpdateData } from '../../services/user.service';
import { User } from '../../types/auth';

export default function AdminUsersPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = getColors(theme);
    const isDark = theme === 'dark';

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // items for modal
    const [modalVisible, setModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [newUser, setNewUser] = useState({
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        role: 'merchandiser',
        status: 'active'
    });

    const fetchUsers = useCallback(async () => {
        try {
            const data = await UserService.getAll();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load users');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, []);

    const handleUpdateUser = async () => {
        if (!newUser.email || !newUser.first_name || !newUser.last_name) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        try {
            setIsSubmitting(true);
            const updateData: UserUpdateData = {
                email: newUser.email,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                role: newUser.role,
                status: newUser.status,
            };

            if (newUser.password) {
                updateData.password = newUser.password;
            }

            if (selectedUserId) {
                await UserService.update(selectedUserId, updateData);
                Alert.alert('Success', 'User updated successfully');
                closeModal();
                fetchUsers();
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateUser = async () => {
        if (isEditing) {
            await handleUpdateUser();
            return;
        }

        if (!newUser.email || !newUser.password || !newUser.first_name || !newUser.last_name) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        try {
            setIsSubmitting(true);
            await UserService.create(newUser);
            Alert.alert('Success', 'User created successfully');
            closeModal();
            fetchUsers();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setSelectedUserId(null);
        setNewUser({
            email: '',
            first_name: '',
            last_name: '',
            password: '',
            role: 'merchandiser',
            status: 'active'
        });
        setModalVisible(true);
    };

    const openEditModal = (user: any) => {
        setIsEditing(true);
        setSelectedUserId(user.id);
        setNewUser({
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            password: '', // Password empty for update unless changed
            role: user.role,
            status: user.status || 'active'
        });
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setIsEditing(false);
        setSelectedUserId(null);
    };

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchUsers();
    }, [fetchUsers]);

    const [sortField, setSortField] = useState<'name' | 'role'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const filteredUsers = users.filter((user: any) => {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = selectedFilter === 'all' || (user.status || 'active') === selectedFilter;
        return matchesSearch && matchesFilter;
    }).sort((a: any, b: any) => {
        let valA, valB;
        if (sortField === 'name') {
            valA = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
            valB = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
        } else {
            valA = (a.role || '').toLowerCase();
            valB = (b.role || '').toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const filters = [
        { id: 'all', label: 'All', count: users.length },
        { id: 'active', label: 'Active', count: users.filter((u: any) => (u.status || 'active') === 'active').length },
        { id: 'inactive', label: 'Inactive', count: users.filter((u: any) => u.status === 'inactive').length },
        { id: 'pending', label: 'Pending', count: users.filter((u: any) => u.status === 'pending').length },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return colors.success;
            case 'inactive': return colors.danger;
            case 'pending': return colors.warning;
            default: return colors.textSecondary;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'supervisor': return colors.secondary;
            case 'admin': return colors.danger;
            default: return colors.primary;
        }
    };

    const getRoleLabel = (role: string) => {
        return role === 'merchandiser' ? 'Merchandiser' :
            role === 'supervisor' ? 'Supervisor' : 'Admin';
    };

    const getInitials = (firstName: string, lastName: string) => {
        if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
        if (firstName) return firstName.substring(0, 2).toUpperCase();
        return '??';
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header
                title="User Management"
                subtitle={`${users.length} registered accounts`}
                rightIcon="person-add-outline"
                onRightIconPress={openCreateModal}
                showBack
            />

            <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
                <View style={[styles.searchBox, { backgroundColor: colors.surfaceSecondary }]}>
                    <Ionicons name="search" size={20} color={colors.textMuted} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search by name or email..."
                        placeholderTextColor={colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <View style={styles.filterScrollWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContainer}
                >
                    {filters.map(filter => (
                        <TouchableOpacity
                            key={filter.id}
                            style={[
                                styles.filterBtn,
                                { backgroundColor: selectedFilter === filter.id ? colors.primary : colors.surfaceSecondary }
                            ]}
                            onPress={() => setSelectedFilter(filter.id)}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: selectedFilter === filter.id ? '#fff' : colors.textSecondary }
                            ]}>
                                {filter.label}
                            </Text>
                            <View style={[
                                styles.filterBadge,
                                { backgroundColor: selectedFilter === filter.id ? 'rgba(255,255,255,0.3)' : colors.border }
                            ]}>
                                <Text style={[
                                    styles.filterBadgeText,
                                    { color: selectedFilter === filter.id ? '#fff' : colors.textSecondary }
                                ]}>
                                    {filter.count}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {isLoading ? (
                <View style={styles.content}>
                    <ListSkeleton count={6} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                >
                    <SectionHeader title="Team Members" />
                    {filteredUsers.length === 0 ? (
                        <View style={styles.empty}>
                            <Ionicons name="people-outline" size={64} color={colors.textMuted} />
                            <Text style={{ color: colors.textSecondary, marginTop: DesignTokens.spacing.md }}>No users found</Text>
                        </View>
                    ) : (
                        filteredUsers.map((item: any) => (
                            <UserListItem
                                key={item.id}
                                item={item}
                                onPress={() => openEditModal(item)}
                                getRoleColor={getRoleColor}
                                getInitials={getInitials}
                                getStatusColor={getStatusColor}
                                getRoleLabel={getRoleLabel}
                                colors={colors}
                            />
                        ))
                    )}
                </ScrollView>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface, borderTopLeftRadius: DesignTokens.borderRadius.xl, borderTopRightRadius: DesignTokens.borderRadius.xl }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {isEditing ? 'Edit User Profile' : 'Add New Staff Member'}
                            </Text>
                            <TouchableOpacity onPress={closeModal}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                    value={newUser.email}
                                    onChangeText={(t) => setNewUser({ ...newUser, email: t })}
                                    placeholder="john@example.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
                                    <TextInput
                                        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                        value={newUser.first_name}
                                        onChangeText={(t) => setNewUser({ ...newUser, first_name: t })}
                                        placeholder="John"
                                        placeholderTextColor={colors.textMuted}
                                    />
                                </View>
                                <View style={{ width: 12 }} />
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
                                    <TextInput
                                        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                        value={newUser.last_name}
                                        onChangeText={(t) => setNewUser({ ...newUser, last_name: t })}
                                        placeholder="Doe"
                                        placeholderTextColor={colors.textMuted}
                                    />
                                </View>
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Temporary Password</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                    value={newUser.password}
                                    onChangeText={(t) => setNewUser({ ...newUser, password: t })}
                                    placeholder={isEditing ? "(Leave blank to keep current)" : "******"}
                                    secureTextEntry
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Assignable Role</Text>
                                <View style={styles.roleSelector}>
                                    {['admin', 'supervisor', 'merchandiser'].map((r) => (
                                        <TouchableOpacity
                                            key={r}
                                            style={[
                                                styles.roleOption,
                                                newUser.role === r && { backgroundColor: colors.primary, borderColor: colors.primary },
                                                { borderColor: colors.border }
                                            ]}
                                            onPress={() => setNewUser({ ...newUser, role: r })}
                                        >
                                            <Text style={[
                                                styles.roleOptionText,
                                                { color: newUser.role === r ? '#acacac8e' : colors.textSecondary }
                                            ]}>
                                                {r.toUpperCase()}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                                onPress={handleCreateUser}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#ffffffff" />
                                ) : (
                                    <Text style={styles.submitBtnText}>
                                        {isEditing ? 'Save Changes' : 'Confirm Registration'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <BottomNav items={ADMIN_NAV_ITEMS} activeRoute="/admin/users" />
        </SafeAreaView>
    );
}

function UserListItem({ item, onPress, getRoleColor, getInitials, getStatusColor, colors, getRoleLabel }: any) {
    const scaleAnim = new Animated.Value(1);

    const onPressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
            speed: 20,
            bounciness: 10,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
            bounciness: 10,
        }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: DesignTokens.spacing.md }}>
            <Pressable
                onPress={onPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                style={({ pressed }) => [
                    styles.userCard,
                    {
                        backgroundColor: pressed ? colors.surfaceSecondary : colors.surface,
                        borderColor: pressed ? colors.primary : 'transparent',
                        borderWidth: 1,
                        shadowOpacity: pressed ? 0.05 : 0.1, // Reduce shadow on press for "depressed" feel
                    }
                ]}
            >
                <View style={[styles.avatar, { backgroundColor: getRoleColor(item.role) + '15' }]}>
                    <Text style={[styles.avatarText, { color: getRoleColor(item.role) }]}>
                        {getInitials(item.first_name, item.last_name)}
                    </Text>
                </View>
                <View style={styles.userInfo}>
                    <View style={styles.userTop}>
                        <Text style={[styles.userName, { color: colors.text }]}>
                            {item.first_name} {item.last_name}
                        </Text>
                        <Badge label={getRoleLabel(item.role)} variant={item.role === 'admin' ? 'danger' : item.role === 'supervisor' ? 'primary' : 'neutral'} size="sm" />
                    </View>
                    <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email}</Text>
                    <View style={styles.userMeta}>
                        <View style={styles.statusDot}>
                            <View style={[styles.dot, { backgroundColor: getStatusColor(item.status || 'active') }]} />
                            <Text style={[styles.statusText, { color: getStatusColor(item.status || 'active') }]}>
                                {(item.status || 'active').toUpperCase()}
                            </Text>
                        </View>
                    </View>
                </View>
                <Ionicons name="create-outline" size={20} color={colors.primary} />
            </Pressable>
        </Animated.View>
    );
}

const styles = {
    container: {
        flex: 1,
    },
    searchContainer: {
        paddingHorizontal: DesignTokens.spacing.lg,
        paddingBottom: DesignTokens.spacing.md,
        paddingTop: DesignTokens.spacing.sm,
    },
    searchBox: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        paddingHorizontal: DesignTokens.spacing.md,
        borderRadius: DesignTokens.borderRadius.lg,
        height: 48,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    searchInput: {
        flex: 1,
        marginLeft: DesignTokens.spacing.sm,
        fontSize: DesignTokens.typography.body.fontSize,
    },
    filterScrollWrapper: {
        marginBottom: DesignTokens.spacing.md,
    },
    filterContainer: {
        paddingHorizontal: DesignTokens.spacing.lg,
        gap: DesignTokens.spacing.sm,
    },
    filterBtn: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        paddingHorizontal: DesignTokens.spacing.md,
        paddingVertical: 8,
        borderRadius: DesignTokens.borderRadius.full,
        gap: DesignTokens.spacing.sm,
    },
    filterText: {
        fontSize: DesignTokens.typography.caption.fontSize,
        fontFamily: Fonts.secondaryBold,
    },
    filterBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: DesignTokens.borderRadius.full,
    },
    filterBadgeText: {
        fontSize: 10,
        fontFamily: Fonts.bodyBold,
    },
    content: {
        paddingHorizontal: DesignTokens.spacing.lg,
        paddingBottom: 100,
    },
    sectionTitle: {
        ...DesignTokens.typography.h3,
        marginBottom: DesignTokens.spacing.md,
    },
    empty: {
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        padding: DesignTokens.spacing.xxl,
    },
    userCard: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        padding: DesignTokens.spacing.lg,
        // marginBottom removed here as it's handled by wrapper
        gap: DesignTokens.spacing.md,
        borderRadius: DesignTokens.borderRadius.lg,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    avatarText: {
        fontSize: 18,
        fontFamily: Fonts.heading,
    },
    userInfo: {
        flex: 1,
        gap: 4,
    },
    userTop: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
        marginBottom: 2,
    },
    userName: {
        fontSize: 16,
        fontFamily: Fonts.headingSemiBold,
    },
    userEmail: {
        fontSize: 13,
        fontFamily: Fonts.secondary,
    },
    userMeta: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: DesignTokens.spacing.md,
        marginTop: 4,
    },
    statusDot: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: 'rgba(0,0,0,0.03)',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 11,
        fontFamily: Fonts.secondaryBold,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end' as const,
    },
    modalContent: {
        height: '85%' as const,
        paddingTop: DesignTokens.spacing.xl,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
        paddingHorizontal: DesignTokens.spacing.xl,
        marginBottom: DesignTokens.spacing.xl,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: Fonts.heading,
    },
    modalBody: {
        flex: 1,
        paddingHorizontal: DesignTokens.spacing.xl,
    },
    inputGroup: {
        marginBottom: DesignTokens.spacing.lg,
    },
    label: {
        fontSize: 14,
        fontFamily: Fonts.bodySemiBold,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: DesignTokens.borderRadius.md,
        paddingHorizontal: DesignTokens.spacing.md,
        paddingVertical: 12,
        fontSize: 16,
    },
    row: {
        flexDirection: 'row' as const,
    },
    roleSelector: {
        flexDirection: 'row' as const,
        gap: DesignTokens.spacing.sm,
    },
    roleOption: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: DesignTokens.borderRadius.md,
        borderWidth: 1,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    roleOptionText: {
        fontSize: 12,
        fontFamily: Fonts.cta,
        letterSpacing: 1,
    },
    modalFooter: {
        padding: DesignTokens.spacing.xl,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    submitBtn: {
        paddingVertical: 16,
        borderRadius: DesignTokens.borderRadius.lg,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 20,
        fontFamily: Fonts.cta,
        letterSpacing: 1,
    },
};


