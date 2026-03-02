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
import { getFullImageUrl } from '../../constants/api';
import { getColors } from '../../constants/designSystem';
import { ADMIN_NAV_ITEMS } from '../../constants/navigation';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../hooks/useFonts';
import { UserService, UserUpdateData } from '../../services/user.service';
import { User } from '../../types/auth';

const ProfileHeader = ({ user, colors, onEdit }: { user: any, colors: any, onEdit: () => void }) => {
  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'AD';
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Administrator';
  const roleDisplay = user ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Admin';

  return (
    <View style={styles.premiumHeader}>
      <View style={[styles.headerBg, { backgroundColor: colors.primary }]}>
        <View style={[styles.circle, { top: -20, right: -20, backgroundColor: 'rgba(255,255,255,0.1)' }]} />
        <View style={[styles.circle, { bottom: -40, left: -20, backgroundColor: 'rgba(255,255,255,0.05)', width: 120, height: 120 }]} />
      </View>

      <View style={styles.headerContent}>
        <View style={styles.avatarWrapper}>
          <View style={[styles.avatarOutline, { borderColor: colors.background }]}>
            <View style={[styles.premiumAvatarContainer, { backgroundColor: user?.profileImage ? 'transparent' : colors.primary }]}>
              {user?.profileImage ? (
                <Image source={{ uri: getFullImageUrl(user.profileImage) || '' }} style={styles.premiumAvatar} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
          </View>
          <TouchableOpacity onPress={onEdit} style={[styles.premiumEditBtn, { backgroundColor: colors.primary, borderColor: colors.background }]}>
            <Feather name="camera" size={12} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileTextInfo}>
          <Text style={[styles.premiumName, { color: colors.text }]}>{fullName}</Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.primary + '15' }]}>
            <Text style={[styles.roleBadgeText, { color: colors.primary }]}>{roleDisplay}</Text>
          </View>
        </View>

        <View style={[styles.contactInfoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.contactItem}>
            <Feather name="mail" size={14} color={colors.primary} />
            <Text style={[styles.contactItemText, { color: colors.text }]}>{user?.email || '—'}</Text>
          </View>
          {user?.phone && (
            <View style={[styles.contactItem, { marginTop: 12 }]}>
              <Feather name="phone" size={14} color={colors.primary} />
              <Text style={[styles.contactItemText, { color: colors.text }]}>{user.phone}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const StatCard = ({ icon, label, value, color, colors }: any) => (
  <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
    <View style={styles.statHeader}>
      <Feather name={icon} size={16} color={color} />
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
    <Text style={[styles.statValue, { color: color }]}>{value}</Text>
  </View>
);

const MenuItem = ({ item, isLast, colors, router }: any) => (
  <TouchableOpacity
    onPress={() => router.push(item.path)}
    style={[styles.menuItem, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
  >
    <View style={[styles.menuIconContainer, { backgroundColor: colors.background }]}>
      <Feather name={item.icon} size={18} color={colors.text} />
    </View>
    <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
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
  const { unreadCount } = useNotifications();
  const colors = getColors(theme);
  const isDark = theme === 'dark';

  const menuItems = [
    { icon: 'bell', label: 'Notifications', badge: unreadCount, path: '/admin/notifications' },
    { icon: 'calendar', label: 'My Objectives', path: '/admin/planning' },
    { icon: 'file-text', label: 'Documents', path: '/admin/documents' },
    { icon: 'clock', label: 'Leave Requests', path: '/admin/leave' },
    { icon: 'shield', label: 'Privacy & Security', path: '/admin/privacy' },
    { icon: 'help-circle', label: 'Help & Support', path: '/admin/help' },
  ];

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
      <Header title="Profile" subtitle="Account Settings" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ProfileHeader user={profileUser || user} colors={colors} onEdit={() => setIsEditModalVisible(true)} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>OVERVIEW</Text>
          <View style={styles.statsRow}>
            <StatCard icon="users" label="Users" value="124" color={colors.primary} colors={colors} />
            <StatCard icon="shopping-cart" label="Stores" value="48" color={colors.success} colors={colors} />
            <StatCard icon="activity" label="Uptime" value="99.9%" color={colors.secondary} colors={colors} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>SETTINGS</Text>
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
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>FieldForce Admin v1.2.0</Text>
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
          role: profileUser?.role || user?.role || 'admin',
          phone: profileUser?.phone || user?.phone || '',
          profileZone: profileUser?.profileZone || user?.profileZone || '',
          profileImage: profileUser?.profileImage || user?.profileImage || null,
        }}
        isSubmitting={isSubmitting}
      />

      <BottomNav items={ADMIN_NAV_ITEMS} activeRoute="/admin/profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingVertical: 16, paddingBottom: 120 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontFamily: Fonts.headingSemiBold, marginBottom: 12, letterSpacing: 1 },
  profileCard: { padding: 16, borderRadius: 16 },
  profileHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarContainer: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  avatarText: { color: '#fff', fontSize: 24, fontFamily: Fonts.heading },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  profileName: { fontSize: 20, fontFamily: Fonts.heading },
  profileRole: { fontSize: 14, fontFamily: Fonts.subheading, marginTop: 2 },
  profileZone: { fontSize: 12, fontFamily: Fonts.secondary, marginTop: 4 },
  editBtn: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },

  // Premium Design
  premiumHeader: { marginBottom: 32 },
  headerBg: { height: 120, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' },
  circle: { position: 'absolute', width: 80, height: 80, borderRadius: 40 },
  headerContent: { alignItems: 'center', marginTop: -50, paddingHorizontal: 20 },
  avatarWrapper: { position: 'relative' },
  avatarOutline: { padding: 4, borderRadius: 54, borderWidth: 4 },
  premiumAvatarContainer: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  premiumAvatar: { width: '100%', height: '100%' },
  premiumEditBtn: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
  profileTextInfo: { alignItems: 'center', marginTop: 12, gap: 4 },
  premiumName: { fontSize: 24, fontFamily: Fonts.heading },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 4 },
  roleBadgeText: { fontSize: 12, fontFamily: Fonts.bodyBold, letterSpacing: 0.5 },
  contactInfoCard: { width: '100%', marginTop: 24, padding: 20, borderRadius: 20, borderWidth: 1, gap: 4 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contactItemText: { fontSize: 15, fontFamily: Fonts.bodyMedium },

  separator: { height: 1, marginVertical: 16 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactText: { fontSize: 14, fontFamily: Fonts.secondary },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1 },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  statLabel: { fontSize: 12, fontFamily: Fonts.secondary },
  statValue: { fontSize: 20, fontFamily: Fonts.heading },
  menuCard: { padding: 0, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  menuIconContainer: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontFamily: Fonts.bodyMedium },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { color: '#fff', fontSize: 10, fontFamily: Fonts.bodyBold },
  prefCard: { padding: 0, overflow: 'hidden' },
  prefRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginHorizontal: 16, gap: 12 },
  logoutText: { fontSize: 18, fontFamily: Fonts.cta, letterSpacing: 1 },
  footer: { alignItems: 'center', marginTop: 24 },
  footerText: { fontSize: 12, fontFamily: Fonts.body },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontFamily: Fonts.headingSemiBold },
  modalBody: { gap: 16 },
  label: { fontSize: 11, fontFamily: Fonts.bodyBold },
  readOnlyField: { padding: 14, borderRadius: 12 },
  input: { padding: 14, borderWidth: 1, borderRadius: 12, fontSize: 15 },
  saveBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontFamily: Fonts.headingSemiBold, fontSize: 16 },
  textMuted: { opacity: 0.6 },
});
