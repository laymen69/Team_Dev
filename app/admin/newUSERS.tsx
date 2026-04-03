import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminWebLayout } from '../../components/admin/WebLayout';
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
        status: 'active',
        phone: '',
        address: '',
        tags: ''
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
                phone: newUser.phone,
                address: newUser.address,
                tags: newUser.tags,
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
            status: 'active',
            phone: '',
            address: '',
            tags: ''
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
            status: user.status || 'active',
            phone: user.phone || '',
            address: user.address || '',
            tags: user.tags || ''
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

    const handleDeleteUser = async (userId: number, userName: string) => {
        const performDelete = async () => {
            try {
                setIsLoading(true);
                const success = await UserService.delete(userId);
                if (success) {
                    Alert.alert('Success', 'User deleted successfully');
                    fetchUsers();
                } else {
                    Alert.alert('Error', 'Failed to delete user');
                }
            } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to delete user');
            } finally {
                setIsLoading(false);
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
                await performDelete();
            }
        } else {
            Alert.alert(
                'Confirm Deletion',
                `Are you sure you want to delete ${userName}? This action cannot be undone.`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: performDelete }
                ]
            );
        }
    };

    const handleUserAction = (item: any) => {
        if (Platform.OS === 'web') {
            // Simple approach for web without a full popover library
            const choice = window.confirm(`Actions for ${item.first_name}:\nOK = Edit\nCancel = Delete (or close)`);
            if (choice) {
                openEditModal(item);
            } else {
                // Secondary check for delete to avoid accidental deletion on cancel
                handleDeleteUser(item.id, `${item.first_name} ${item.last_name}`);
            }
        } else {
            Alert.alert(
                'User Actions',
                `Select an action for ${item.first_name} ${item.last_name}`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Edit', onPress: () => openEditModal(item) },
                    { text: 'Delete', style: 'destructive', onPress: () => handleDeleteUser(item.id, `${item.first_name} ${item.last_name}`) }
                ]
            );
        }
    };

    const [sortField, setSortField] = useState<'name' | 'role'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const filteredUsers = users.filter((user: any) => {
        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        const email = (user.email || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        
        const matchesSearch = name.toLowerCase().includes(query) || email.includes(query);
        const matchesFilter = selectedFilter === 'all' || (user.status || 'active') === selectedFilter;
        return matchesSearch && matchesFilter;
    }).sort((a: any, b: any) => {
        let valA, valB;
        if (sortField === 'name') {
            valA = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
            valB = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
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

    if (Platform.OS === 'web') {
        return (
            <AdminWebLayout title="User Management">
                <View style={[styles.searchContainer, { backgroundColor: 'transparent', paddingHorizontal: 0 }]}>
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

                <View style={[styles.filterScrollWrapper, { marginBottom: 24 }]}>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
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
                    </View>
                </View>

                {isLoading ? (
                    <ListSkeleton count={8} />
                ) : (
                    <View style={{ gap: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Text style={{ fontSize: 18, fontFamily: Fonts.headingSemiBold, color: colors.text }}>Team Members</Text>
                            <TouchableOpacity
                                style={{ backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                                onPress={openCreateModal}
                            >
                                <Ionicons name="person-add-outline" size={18} color="#fff" />
                                <Text style={{ color: '#fff', fontFamily: Fonts.headingSemiBold }}>Add User</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                            <View style={{ minWidth: 1000 }}>
                                <UserTable
                                    users={filteredUsers}
                                    onEdit={openEditModal}
                                    onDelete={(u: any) => handleDeleteUser(u.id, `${u.firstName} ${u.lastName}`)}
                                    colors={colors}
                                    getRoleColor={getRoleColor}
                                    getStatusColor={getStatusColor}
                                    getInitials={getInitials}
                                    isDark={isDark}
                                />
                            </View>
                        </ScrollView>
                    </View>
                )}

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={closeModal}
                >
                    <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }]}>
                        <View style={[styles.modalContent, { backgroundColor: colors.surface, borderRadius: 24, width: '100%', maxWidth: 500, height: 'auto', padding: 32 }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>
                                    {isEditing ? 'Edit User Profile' : 'Add New Staff Member'}
                                </Text>
                                <TouchableOpacity onPress={closeModal}>
                                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={[styles.modalBody, { paddingHorizontal: 0 }]}>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
                                    <TextInput
                                        style={[styles.input, { color: Platform.OS === 'web' ? '#000' : colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
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
                                        style={[styles.input, { color: Platform.OS === 'web' ? '#000' : colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                        value={newUser.password}
                                        onChangeText={(t) => setNewUser({ ...newUser, password: t })}
                                        placeholder={isEditing ? "(Leave blank to keep current)" : "******"}
                                        secureTextEntry
                                        placeholderTextColor={colors.textMuted}
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
                                    <TextInput
                                        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                        value={newUser.phone}
                                        onChangeText={(t) => setNewUser({ ...newUser, phone: t })}
                                        placeholder="+1 (555) 000-0000"
                                        placeholderTextColor={colors.textMuted}
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.text }]}>Address</Text>
                                    <TextInput
                                        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                        value={newUser.address}
                                        onChangeText={(t) => setNewUser({ ...newUser, address: t })}
                                        placeholder="123 Street Name, City, State"
                                        placeholderTextColor={colors.textMuted}
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.text }]}>Tags (Comma separated)</Text>
                                    <TextInput
                                        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                        value={newUser.tags}
                                        onChangeText={(t) => setNewUser({ ...newUser, tags: t })}
                                        placeholder="Design, UI/UX"
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
                                                    { color: newUser.role === r ? '#fff' : colors.textSecondary }
                                                ]}>
                                                    {r.toUpperCase()}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </ScrollView>

                            <View style={[styles.modalFooter, { padding: 0, borderTopWidth: 0, marginTop: 24 }]}>
                                <TouchableOpacity
                                    style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                                    onPress={handleCreateUser}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" />
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
            </AdminWebLayout>
        );
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
                                onPress={() => handleUserAction(item)}
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
                                <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                    value={newUser.phone}
                                    onChangeText={(t) => setNewUser({ ...newUser, phone: t })}
                                    placeholder="+1 (555) 000-0000"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Address</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                    value={newUser.address}
                                    onChangeText={(t) => setNewUser({ ...newUser, address: t })}
                                    placeholder="123 Street Name, City"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Tags (Comma separated)</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                    value={newUser.tags}
                                    onChangeText={(t) => setNewUser({ ...newUser, tags: t })}
                                    placeholder="Design, Sales, Merch"
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

function UserTable({ users, onEdit, onDelete, colors, getRoleColor, getStatusColor, getInitials, isDark }: any) {
    const tableHeaderColor = isDark ? '#18181b' : '#f8fafc';
    const borderColor = isDark ? '#27272a' : '#e2e8f0';

    return (
        <View style={{ borderRadius: 12, borderWidth: 1, borderColor, overflow: 'hidden', backgroundColor: colors.surface }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', backgroundColor: tableHeaderColor, paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: borderColor }}>
                <View style={{ width: 40 }} /> {/* Checkbox placeholder */}
                <Text style={{ flex: 2, color: colors.textSecondary, fontSize: 13, fontFamily: Fonts.headingSemiBold }}>Name</Text>
                <Text style={{ flex: 1.5, color: colors.textSecondary, fontSize: 13, fontFamily: Fonts.headingSemiBold }}>Job Title</Text>
                <Text style={{ flex: 1, color: colors.textSecondary, fontSize: 13, fontFamily: Fonts.headingSemiBold }}>Status</Text>
                <Text style={{ flex: 2, color: colors.textSecondary, fontSize: 13, fontFamily: Fonts.headingSemiBold }}>Email</Text>
                <Text style={{ flex: 1.5, color: colors.textSecondary, fontSize: 13, fontFamily: Fonts.headingSemiBold }}>Phone</Text>
                <Text style={{ flex: 1.5, color: colors.textSecondary, fontSize: 13, fontFamily: Fonts.headingSemiBold }}>Tags</Text>
                <Text style={{ flex: 2, color: colors.textSecondary, fontSize: 13, fontFamily: Fonts.headingSemiBold }}>Address</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Body */}
            {users.length === 0 ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                    <Text style={{ color: colors.textMuted }}>No users found</Text>
                </View>
            ) : (
                users.map((user: any) => (
                    <UserTableRow
                        key={user.id}
                        user={user}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        colors={colors}
                        getRoleColor={getRoleColor}
                        getStatusColor={getStatusColor}
                        getInitials={getInitials}
                        borderColor={borderColor}
                    />
                ))
            )}
        </View>
    );
}

function UserTableRow({ user, onEdit, onDelete, colors, getRoleColor, getStatusColor, getInitials, borderColor }: any) {
    const [hovered, setHovered] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const tags = user.tags ? user.tags.split(',').map((t: string) => t.trim()) : [];

    return (
        <View
            // @ts-ignore
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderBottomWidth: 1,
                borderBottomColor: borderColor,
                backgroundColor: hovered ? (colors.isDark ? '#ffffff05' : '#f8fafc') : 'transparent'
            }}
        >
            <View style={{ width: 40 }}>
                <View style={{ width: 16, height: 16, borderRadius: 4, borderWidth: 1, borderColor: colors.border }} />
            </View>

            {/* Name */}
            <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: getRoleColor(user.role) + '20', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: getRoleColor(user.role), fontSize: 11, fontFamily: Fonts.headingSemiBold }}>{getInitials(user.firstName, user.lastName)}</Text>
                </View>
                <Text style={{ color: colors.text, fontSize: 14, fontFamily: Fonts.bodyMedium }}>{user.firstName} {user.lastName}</Text>
            </View>

            {/* Job Title */}
            <Text style={{ flex: 1.5, color: colors.textSecondary, fontSize: 13 }}>
                {user.role === 'admin' ? 'Administrator' : user.role === 'supervisor' ? 'Team Lead' : 'Merchandiser'}
            </Text>

            {/* Status */}
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: getStatusColor(user.status || 'active') }} />
                <Text style={{ color: colors.text, fontSize: 13, textTransform: 'capitalize' }}>{user.status || 'Active'}</Text>
            </View>

            {/* Email */}
            <Text style={{ flex: 2, color: colors.textSecondary, fontSize: 13 }} numberOfLines={1}>{user.email}</Text>

            {/* Phone */}
            <Text style={{ flex: 1.5, color: colors.textSecondary, fontSize: 13 }} numberOfLines={1}>{user.phone || '-'}</Text>

            {/* Tags */}
            <View style={{ flex: 1.5, flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                {tags.length > 0 ? tags.map((tag: string, i: number) => (
                    <View key={i} style={{ backgroundColor: colors.surfaceSecondary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{tag}</Text>
                    </View>
                )) : <Text style={{ color: colors.textMuted, fontSize: 11 }}>-</Text>}
            </View>

            {/* Address */}
            <Text style={{ flex: 2, color: colors.textSecondary, fontSize: 13 }} numberOfLines={1}>{user.address || 'Not set'}</Text>

            {/* Actions */}
            <View style={{ width: 40, position: 'relative' }}>
                <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
                    <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />
                </TouchableOpacity>

                {menuOpen && (
                    <View style={{
                        position: 'absolute',
                        right: 0,
                        top: 24,
                        width: 120,
                        backgroundColor: colors.surface,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: borderColor,
                        elevation: 5,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        zIndex: 100
                    }}>
                        <TouchableOpacity
                            onPress={() => { onEdit(user); setMenuOpen(false); }}
                            style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: borderColor, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                        >
                            <Ionicons name="pencil" size={14} color={colors.primary} />
                            <Text style={{ color: colors.text, fontSize: 13 }}>Update</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => { onDelete(user); setMenuOpen(false); }}
                            style={{ padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                        >
                            <Ionicons name="trash" size={14} color={colors.danger} />
                            <Text style={{ color: colors.danger, fontSize: 13 }}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
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
                <Ionicons name="ellipsis-vertical-outline" size={20} color={colors.textSecondary} />
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


