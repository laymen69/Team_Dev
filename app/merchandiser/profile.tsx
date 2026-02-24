import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../../components/ui/BottomNav';
import { Card } from '../../components/ui/Card';
import { EditProfileModal } from '../../components/ui/EditProfileModal';
import { Header } from '../../components/ui/Header';
import { getColors } from '../../constants/designSystem';
import { MERCHANDISER_NAV_ITEMS } from '../../constants/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../hooks/useFonts';
import { UserService, UserUpdateData } from '../../services/user.service';
import { User } from '../../types/auth';

const menuItems = [
    { icon: 'bell', label: 'Notifications', badge: 3, path: '/merchandiser/notifications' },
    { icon: 'calendar', label: 'Visit Schedule', path: '/merchandiser/planning' },
    { icon: 'file-text', label: 'Guidelines', path: '/merchandiser/documents' },
    { icon: 'clock', label: 'Work Log', path: '/merchandiser/visits' },
    { icon: 'help-circle', label: 'Help & Support', path: '/merchandiser/help' },
];

const ProfileHeader = ({ user, colors, onEdit }: { user: any, colors: any, onEdit: () => void }) => {
    const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'ME';
    const fullName = user ? `${user.firstName} ${user.lastName}` : 'Merchandiser';
    const roleDisplay = user ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Merchandiser';

    return (
        <Card style={styles.profileCard}>
            <View style={styles.profileHeaderRow}>
                <View style={[styles.avatarContainer, { backgroundColor: user?.profileImage ? 'transparent' : colors.primary }]}>
                    {user?.profileImage ? (
                        <Image source={{ uri: user.profileImage }} style={styles.avatar} />
                    ) : (
                        <Text style={styles.avatarText}>{initials}</Text>
                    )}
                </View>
                <View style={styles.profileInfo}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.profileName, { color: colors.text }]}>{fullName}</Text>
                        <TouchableOpacity onPress={onEdit} style={[styles.editBtn, { backgroundColor: colors.surfaceSecondary }]}>
                            <Feather name="edit-2" size={14} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.profileRole, { color: colors.primary }]}>{roleDisplay}</Text>
                    <Text style={[styles.profileZone, { color: colors.textSecondary }]}>Casablanca - North Sector</Text>
                </View>
            </View>
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <View style={styles.contactRow}>
                <Feather name="mail" size={14} color={colors.textSecondary} />
                <Text style={[styles.contactText, { color: colors.textSecondary }]}>{user?.email || 'merch@fieldforce.com'}</Text>
            </View>
        </Card>
    );
};

const MenuItem = ({ item, isLast, colors, router }: any) => (
    <TouchableOpacity
        onPress={() => router.push(item.path)}
        style={[styles.menuItem, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
    >
        <View style={[styles.menuIconContainer, { backgroundColor: colors.background }]}>
            <Feather name={item.icon} size={18} color={colors.text} />
        </View>
        <Text style={[styles.menuLabel, { flex: 1, color: colors.text }]}>{item.label}</Text>
        {item.badge && (
            <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
        )}
        <Feather name="chevron-right" size={18} color={colors.textSecondary} />
    </TouchableOpacity>
);

export default function Profile() {
    const router = useRouter();
    const { user, signOut, updateUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const colors = getColors(theme);
    const isDark = theme === 'dark';

    const [profileUser, setProfileUser] = useState<User | null>(user);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchProfile = async () => {
        try {
            const data = await UserService.getMe();
            if (data) {
                setProfileUser(data);
            }
        } catch (err) {
            console.error('Fetch profile error:', err);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdateProfile = async (data: any) => {
        if (!profileUser?.id) return;

        setIsSubmitting(true);
        try {
            const updateData: UserUpdateData = {
                first_name: data.firstName,
                last_name: data.lastName,
                phone: data.phone,
                profile_zone: data.profileZone,
                profile_image: data.image,
            };

            const updated = await UserService.update(profileUser.id, updateData);
            if (updated) {
                Alert.alert('Success', 'Profile updated successfully');
                await fetchProfile();
                updateUser(updated);
                setIsEditModalVisible(false);
            } else {
                Alert.alert('Error', 'Failed to update profile');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            Alert.alert('Error', 'An error occurred while updating profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <Header title="My Profile" subtitle="Account & App Settings" />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <ProfileHeader user={profileUser || user} colors={colors} onEdit={() => setIsEditModalVisible(true)} />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>PERSONAL SETTINGS</Text>
                    <Card style={styles.menuCard}>
                        {menuItems.map((item, index) => (
                            <MenuItem
                                key={item.label}
                                item={item}
                                isLast={index === menuItems.length - 1}
                                colors={colors}
                                router={router}
                            />
                        ))}
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>PREFERENCES</Text>
                    <Card style={styles.prefCard}>
                        <View style={styles.prefRow}>
                            <View style={[styles.menuIconContainer, { backgroundColor: '#fbbf2420' }]}>
                                <Ionicons name={isDark ? "moon" : "sunny"} size={20} color="#fbbf24" />
                            </View>
                            <Text style={[styles.menuLabel, { flex: 1, color: colors.text }]}>Dark Appearance</Text>
                            <Switch
                                value={isDark}
                                onValueChange={toggleTheme}
                                trackColor={{ false: "#cbd5e1", true: colors.primary }}
                                thumbColor="#fff"
                            />
                        </View>
                    </Card>
                </View>

                <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.danger }]} onPress={signOut}>
                    <Feather name="log-out" size={20} color={colors.danger} />
                    <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>FieldForce v1.2.0</Text>
                </View>
            </ScrollView>

            <EditProfileModal
                isVisible={isEditModalVisible}
                onClose={() => setIsEditModalVisible(false)}
                onSave={handleUpdateProfile}
                userData={{
                    firstName: profileUser?.firstName || user?.firstName || '',
                    lastName: profileUser?.lastName || user?.lastName || '',
                    email: profileUser?.email || user?.email || '',
                    role: profileUser?.role || user?.role || 'merchandiser',
                    phone: profileUser?.phone || user?.phone || '',
                    profileZone: profileUser?.profileZone || user?.profileZone || '',
                    profileImage: profileUser?.profileImage || user?.profileImage || null,
                }}
                isSubmitting={isSubmitting}
            />

            <BottomNav items={MERCHANDISER_NAV_ITEMS} activeRoute="/merchandiser/profile" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    scrollContent: { paddingVertical: 16, paddingBottom: 120 },
    section: { paddingHorizontal: 16, marginBottom: 24 },
    sectionTitle: { fontSize: 12, fontFamily: Fonts.bodyBold, marginBottom: 12, letterSpacing: 0.5 },
    profileCard: { padding: 16, borderRadius: 16 },
    profileHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    avatarContainer: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    avatar: { width: '100%', height: '100%' },
    avatarText: { color: '#fff', fontSize: 24, fontFamily: Fonts.heading },
    profileInfo: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    profileName: { fontSize: 18, fontFamily: Fonts.headingSemiBold },
    profileRole: { fontSize: 14, fontFamily: Fonts.bodySemiBold, marginTop: 2 },
    profileZone: { fontSize: 12, fontFamily: Fonts.body, marginTop: 4 },
    editBtn: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    separator: { height: 1, marginVertical: 16 },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    contactText: { fontSize: 14, fontFamily: Fonts.body },
    menuCard: { padding: 0, overflow: 'hidden' },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    menuIconContainer: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    menuLabel: { flex: 1, fontSize: 14, fontFamily: Fonts.bodyMedium },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    badgeText: { color: '#fff', fontSize: 10, fontFamily: Fonts.bodyBold },
    prefCard: { padding: 0, overflow: 'hidden' },
    prefRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginHorizontal: 16, gap: 12 },
    logoutText: { fontSize: 16, fontFamily: Fonts.headingSemiBold },
    footer: { alignItems: 'center', marginTop: 24 },
    footerText: { fontSize: 12, fontFamily: Fonts.body },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontFamily: Fonts.heading },
    modalBody: { gap: 16 },
    label: { fontSize: 11, fontFamily: Fonts.bodyBold },
    readOnlyField: { padding: 14, borderRadius: 12 },
    input: { padding: 14, borderWidth: 1, borderRadius: 12, fontSize: 15 },
    saveBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    saveBtnText: { color: '#fff', fontFamily: Fonts.heading, fontSize: 16 },
    textMuted: { opacity: 0.6 },
});
