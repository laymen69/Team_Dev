import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import {
    Animated,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { getFullImageUrl } from '../../constants/api';
import { getColors } from '../../constants/designSystem';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../hooks/useFonts';

const SIDEBAR_WIDTH = 256;
const COLLAPSED_WIDTH = 70;

const ADMIN_LINKS = [
    { icon: 'grid-outline', label: 'Dashboard', route: '/admin/dashboard', group: 'Overview' },
    { icon: 'people-outline', label: 'Members', route: '/admin/users', group: 'Overview' },
    { icon: 'map-outline', label: 'Locations', route: '/admin/gsm', group: 'Overview' },
    { icon: 'calendar-outline', label: 'Schedule', route: '/admin/planning', group: 'Overview' },
    { icon: 'document-text-outline', label: 'Before/After', route: '/admin/before-after', group: 'Content' },
    { icon: 'cube-outline', label: 'Products', route: '/admin/articles', group: 'Content' },
    { icon: 'folder-outline', label: 'Contracts', route: '/admin/documents', group: 'Content' },
    { icon: 'warning-outline', label: 'Feedback', route: '/admin/complaints', group: 'Content' },
    { icon: 'airplane-outline', label: 'Leave Req.', route: '/admin/leave', group: 'Content' },
    { icon: 'notifications-outline', label: 'Alerts', route: '/admin/notifications', group: 'Settings' },
    { icon: 'options-outline', label: 'Profile', route: '/admin/profile', group: 'Settings' },
];

const GROUPS = ['Overview', 'Content', 'Settings'];

// A single animated nav item that responds to hover
const NavItem = React.memo(({ link, isActive, onPress, colors, isDark, isCollapsed }: any) => {
    const hoverAnim = useRef(new Animated.Value(0)).current;

    const handleHoverIn = () => {
        Animated.timing(hoverAnim, { toValue: 1, duration: 160, useNativeDriver: false }).start();
    };
    const handleHoverOut = () => {
        Animated.timing(hoverAnim, { toValue: 0, duration: 160, useNativeDriver: false }).start();
    };

    const hoverBg = isDark ? '#ffffff0d' : '#00000008';
    const activeBg = isDark ? '#ffffff14' : '#00000010';

    const bgColor = isActive
        ? activeBg
        : hoverAnim.interpolate({ inputRange: [0, 1], outputRange: ['transparent', hoverBg] });

    return (
        <View
            style={{ cursor: Platform.OS === 'web' ? 'pointer' : 'default' } as any}
            // @ts-ignore - react-native-web mouse events
            onMouseEnter={handleHoverIn}
            onMouseLeave={handleHoverOut}
        >
            <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
                <Animated.View style={[navSt.item, { backgroundColor: bgColor, justifyContent: isCollapsed ? 'center' : 'flex-start' }]}>
                    {isActive && <View style={[navSt.pill, { backgroundColor: colors.primary }]} />}
                    <Ionicons
                        name={link.icon as any}
                        size={17}
                        color={isActive ? colors.primary : colors.textMuted}
                        style={!isCollapsed && { marginRight: 10 }}
                    />
                    {!isCollapsed && (
                        <Text style={[navSt.label, { color: isActive ? colors.primary : colors.textMuted },
                        isActive && { fontFamily: Fonts.headingSemiBold }
                        ]} numberOfLines={1}>{link.label}</Text>
                    )}
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
});

const navSt = StyleSheet.create({
    item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 14, borderRadius: 8, marginBottom: 2, position: 'relative' },
    pill: { position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, borderRadius: 2 },
    label: { fontSize: 13, fontFamily: Fonts.body },
});

export function AdminWebLayout({ children, title }: { children: React.ReactNode; title: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const { theme } = useTheme();
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const sidebarWidth = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;

    const toggleCollapse = () => {
        const toValue = isCollapsed ? SIDEBAR_WIDTH : COLLAPSED_WIDTH;
        Animated.spring(sidebarWidth, {
            toValue,
            useNativeDriver: false,
            friction: 8,
            tension: 40
        }).start();
        setIsCollapsed(!isCollapsed);
    };

    if (Platform.OS !== 'web') return <>{children}</>;

    const isDark = theme === 'dark';
    const colors = getColors(theme);

    // Sidebar & layout colors that are premium but theme-aware
    const sidebarBg = isDark ? '#0f0f12' : '#ffffff';
    const pageBg = isDark ? '#09090b' : '#f4f4f5';
    const border = isDark ? '#27272a' : '#e4e4e7';
    const groupLabel = isDark ? '#52525b' : '#a1a1aa';
    const searchBg = isDark ? '#18181b' : '#f4f4f5';

    return (
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: pageBg }}>
            {/* ── SIDEBAR ── */}
            <Animated.View style={[sidebarSt.sidebar, { width: sidebarWidth, backgroundColor: sidebarBg, borderRightColor: border }]}>
                {/* Brand */}
                <View style={[sidebarSt.brand, isCollapsed && { paddingHorizontal: 0, justifyContent: 'center' }]}>
                    <View style={[sidebarSt.logoBox, { backgroundColor: colors.primary }]}>
                        <Ionicons name="apps-outline" size={16} color="#fff" />
                    </View>
                    {!isCollapsed && <Text style={[sidebarSt.brandName, { color: colors.text }]}>Main Dashboard</Text>}
                    <TouchableOpacity onPress={toggleCollapse} style={sidebarSt.themeBtn}>
                        <Ionicons name={isCollapsed ? "menu-outline" : "chevron-back-outline"} size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* Search input */}
                <View style={[sidebarSt.searchBar, { backgroundColor: searchBg, borderColor: border, justifyContent: isCollapsed ? 'center' : 'flex-start' }]}>
                    <Ionicons name="search" size={14} color={colors.textMuted} />
                    {!isCollapsed && (
                        <>
                            <TextInput
                                style={[sidebarSt.searchHint, { color: colors.text, outlineStyle: 'none' } as any]}
                                placeholder="Search..."
                                placeholderTextColor={colors.textMuted}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 ? (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={14} color={colors.textMuted} />
                                </TouchableOpacity>
                            ) : (
                                <View style={[sidebarSt.cmdKey, { borderColor: border }]}>
                                    <Text style={{ color: colors.textMuted, fontSize: 10, fontFamily: Fonts.secondaryBold }}>⌘</Text>
                                </View>
                            )}
                        </>
                    )}
                </View>

                {/* Nav Groups */}
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, paddingHorizontal: 12 }}>
                    {GROUPS.map(group => {
                        const groupLinks = ADMIN_LINKS.filter(l => 
                            l.group === group && 
                            (l.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             l.group.toLowerCase().includes(searchQuery.toLowerCase()))
                        );
                        if (groupLinks.length === 0) return null;

                        return (
                            <View key={group} style={{ marginBottom: 24 }}>
                                {!isCollapsed && <Text style={[sidebarSt.groupLabel, { color: groupLabel }]}>{group.toUpperCase()}</Text>}
                                {groupLinks.map(link => (
                                    <NavItem
                                        key={link.route}
                                        link={link}
                                        isActive={pathname === link.route}
                                        onPress={() => router.push(link.route as any)}
                                        colors={colors}
                                        isDark={isDark}
                                        isCollapsed={isCollapsed}
                                    />
                                ))}
                            </View>
                        );
                    })}
                </ScrollView>

                {/* Footer: user info + sign out */}
                <View style={[sidebarSt.footer, { borderTopColor: border, paddingHorizontal: isCollapsed ? 12 : 16 }]}>
                    <View style={[sidebarSt.userRow, isCollapsed && { justifyContent: 'center' }]}>
                        <View style={[sidebarSt.avatar, { backgroundColor: colors.primary + '30', borderColor: colors.primary + '60', overflow: 'hidden' }]}>
                            {user?.profileImage ? (
                                <Image source={{ uri: getFullImageUrl(user.profileImage) || '' }} style={sidebarSt.avatarImg} />
                            ) : (
                                <Text style={[sidebarSt.avatarText, { color: colors.primary }]}>{user?.firstName?.[0] ?? 'A'}</Text>
                            )}
                        </View>
                        {!isCollapsed && (
                            <>
                                <View style={{ flex: 1 }}>
                                    <Text style={[sidebarSt.userName, { color: colors.text }]} numberOfLines={1}>
                                        {user?.firstName} {user?.lastName}
                                    </Text>
                                    <Text style={[sidebarSt.userEmail, { color: colors.textMuted }]} numberOfLines={1}>{user?.email ?? 'admin'}</Text>
                                </View>
                                <TouchableOpacity onPress={signOut} style={sidebarSt.signOutBtn}>
                                    <Ionicons name="log-out-outline" size={16} color={colors.danger ?? '#ef4444'} />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Animated.View>

            {/* ── MAIN AREA ── */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 36 }} showsVerticalScrollIndicator={false}>
                <View style={{ maxWidth: 1400, width: '100%', alignSelf: 'center' }}>
                    {children}
                </View>
            </ScrollView>
        </View>
    );
}

const sidebarSt = StyleSheet.create({
    sidebar: { borderRightWidth: 1, paddingVertical: 24 },
    brand: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20, gap: 10 },
    logoBox: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    brandName: { flex: 1, fontSize: 15, fontFamily: Fonts.headingSemiBold },
    themeBtn: { padding: 6 },
    searchBar: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, marginHorizontal: 16, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, marginBottom: 28, gap: 8 },
    searchHint: { flex: 1, fontSize: 12, fontFamily: Fonts.body },
    cmdKey: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
    groupLabel: { fontSize: 10, fontFamily: Fonts.secondaryBold, letterSpacing: 0.8, marginBottom: 10, paddingHorizontal: 14 },
    footer: { paddingHorizontal: 16, paddingTop: 16, borderTopWidth: 1 },
    userRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    avatar: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    avatarImg: { width: '100%', height: '100%' },
    avatarText: { fontSize: 13, fontFamily: Fonts.headingSemiBold },
    userName: { fontSize: 13, fontFamily: Fonts.headingSemiBold },
    userEmail: { fontSize: 11, fontFamily: Fonts.body },
    signOutBtn: { padding: 4 },
});
