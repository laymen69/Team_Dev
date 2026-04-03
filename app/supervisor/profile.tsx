import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
import MeshGradient from '../components/MeshGradient';
import { BottomNav } from '../../components/ui/BottomNav';
import { EditProfileModal } from '../../components/ui/EditProfileModal';
import { Header } from '../../components/ui/Header';
import { getFullImageUrl } from '../../constants/api';
import { getColors } from '../../constants/designSystem';
import { SUPERVISOR_NAV_ITEMS } from '../../constants/navigation';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../hooks/useFonts';
import { UserService, UserUpdateData } from '../../services/user.service';
import { User } from '../../types/auth';

const ProfileHeader = ({ user, colors, onEdit }: { user: any, colors: any, onEdit: () => void }) => {
  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'SV';
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Supervisor';
  const roleDisplay = user ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Supervisor';

  return (
    <View style={styles.premiumHeader}>
      <View style={styles.headerBackgroundContainer}>
        <MeshGradient />
        <LinearGradient
            colors={['transparent', colors.background]}
            style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={styles.headerContent}>
        <View style={styles.avatarWrapper}>
          <View style={[styles.avatarGlow, { backgroundColor: colors.primary + '40' }]} />
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
            <Feather name="camera" size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileTextInfo}>
          <Text style={[styles.premiumName, { color: colors.text }]}>{fullName}</Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.roleBadgeText, { color: colors.primary }]}>{roleDisplay}</Text>
          </View>
        </View>

        <View style={[styles.glassCard, { backgroundColor: colors.surface + '80', borderColor: colors.border }]}>
          <View style={styles.contactItem}>
            <View style={[styles.contactIcon, { backgroundColor: colors.primary + '20' }]}>
               <Feather name="mail" size={14} color={colors.primary} />
            </View>
            <View>
                <Text style={[styles.contactLabel, { color: colors.textMuted }]}>Email</Text>
                <Text style={[styles.contactItemText, { color: colors.text }]}>{user?.email || '—'}</Text>
            </View>
          </View>
          {user?.phone && (
            <View style={[styles.contactItem, { marginTop: 16 }]}>
              <View style={[styles.contactIcon, { backgroundColor: colors.primary + '20' }]}>
                <Feather name="phone" size={14} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.contactLabel, { color: colors.textMuted }]}>Phone</Text>
                <Text style={[styles.contactItemText, { color: colors.text }]}>{user.phone}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const MenuItem = ({ item, isLast, colors, router }: any) => (
  <TouchableOpacity
    onPress={() => router.push(item.path)}
    style={[styles.menuItemGlass, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
  >
    <View style={[styles.menuIconContainerGlass, { backgroundColor: colors.primary + '15' }]}>
      <Feather name={item.icon} size={18} color={colors.primary} />
    </View>
    <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
    {item.badge && (
      <View style={[styles.badge, { backgroundColor: colors.danger }]}>
        <Text style={styles.badgeText}>{item.badge}</Text>
      </View>
    )}
    <Feather name="chevron-right" size={18} color={colors.textMuted} />
  </TouchableOpacity>
);

export default function Profile() {
  const router = useRouter();
  const { user, signOut, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const colors = getColors(theme);
  const isDark = theme === 'dark';

  const [profileUser, setProfileUser] = useState<User | null>(user);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const menuItems = [
    { icon: 'bell', label: 'Notifications', badge: unreadCount, path: '/supervisor/notifications' },
    { icon: 'calendar', label: 'Visit Schedule', path: '/supervisor/planning' },
    { icon: 'file-text', label: 'Documents', path: '/supervisor/documents' },
    { icon: 'clock', label: 'Work Log', path: '/supervisor/visits' },
    { icon: 'help-circle', label: 'Help & Support', path: '/supervisor/help' },
  ];

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
      <Header title="Profile" subtitle="Supervisor Account" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeaderWrap}>
          <ProfileHeader user={profileUser || user} colors={colors} onEdit={() => setIsEditModalVisible(true)} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ACCOUNT SETTINGS</Text>
          <View style={[styles.menuCardGlass, { backgroundColor: colors.surface + '40', borderColor: colors.border }]}>
            {menuItems.map((item, index) => (
              <MenuItem
                key={item.label}
                item={item}
                isLast={index === menuItems.length - 1}
                colors={colors}
                router={router}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>PREFERENCES</Text>
          <View style={[styles.menuCardGlass, { backgroundColor: colors.surface + '40', borderColor: colors.border }]}>
            <View style={styles.prefRow}>
              <View style={[styles.menuIconContainerGlass, { backgroundColor: '#fbbf2420' }]}>
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
          </View>
        </View>

        <TouchableOpacity style={[styles.logoutBtnGlass, { borderColor: colors.danger + '40', backgroundColor: colors.danger + '10' }]} onPress={signOut}>
          <Feather name="log-out" size={20} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>FieldForce Supervisor v1.2.0</Text>
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
            role: profileUser?.role || user?.role || 'supervisor',
            phone: profileUser?.phone || user?.phone || '',
            profileZone: profileUser?.profileZone || user?.profileZone || '',
            profileImage: profileUser?.profileImage || user?.profileImage || null,
        }}
        isSubmitting={isSubmitting}
      />

      <BottomNav items={SUPERVISOR_NAV_ITEMS} activeRoute="/supervisor/profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  sectionHeaderWrap: { marginBottom: 32 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontFamily: Fonts.headingSemiBold, marginBottom: 16, letterSpacing: 1.5, opacity: 0.7 },
  
  // Header Design
  premiumHeader: { position: 'relative', overflow: 'hidden' },
  headerBackgroundContainer: { height: 260, position: 'absolute', top: 0, left: 0, right: 0 },
  headerContent: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  avatarWrapper: { position: 'relative', zIndex: 1 },
  avatarGlow: { position: 'absolute', width: 140, height: 140, borderRadius: 70, top: -15, left: -15, transform: [{ scale: 1.2 }], opacity: 0.5 },
  avatarOutline: { padding: 5, borderRadius: 65, borderWidth: 3.5 },
  premiumAvatarContainer: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  premiumAvatar: { width: '100%', height: '100%' },
  avatarText: { color: '#fff', fontSize: 36, fontFamily: Fonts.headingXBold },
  premiumEditBtn: { position: 'absolute', bottom: 2, right: 2, width: 36, height: 36, borderRadius: 18, borderWidth: 3, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
  profileTextInfo: { alignItems: 'center', marginTop: 16, gap: 6, zIndex: 1 },
  premiumName: { fontSize: 26, fontFamily: Fonts.headingXBold, letterSpacing: -0.5 },
  roleBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 14 },
  roleBadgeText: { fontSize: 13, fontFamily: Fonts.bodyBold, letterSpacing: 1, textTransform: 'uppercase' },
  
  // Glassmorphism Cards
  glassCard: { width: '100%', marginTop: 28, padding: 22, borderRadius: 24, borderWidth: 1 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  contactIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  contactLabel: { fontSize: 11, fontFamily: Fonts.bodyBold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  contactItemText: { fontSize: 16, fontFamily: Fonts.bodyMedium },
  // Menus
  menuCardGlass: { borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  menuItemGlass: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 16 },
  menuIconContainerGlass: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: Fonts.bodyMedium },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 11, fontFamily: Fonts.bodyBold },
  
  prefRow: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 16 },
  logoutBtnGlass: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 20, borderWidth: 1, marginHorizontal: 20, gap: 12, marginTop: 12 },
  logoutText: { fontSize: 18, fontFamily: Fonts.headingSemiBold, letterSpacing: 1 },
  
  footer: { alignItems: 'center', marginTop: 32, paddingBottom: 40 },
  footerText: { fontSize: 12, fontFamily: Fonts.body, opacity: 0.5 },
});
