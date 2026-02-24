import { StyleSheet } from 'react-native';

export const CommonStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    scroll: {
        paddingBottom: 100,
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    flex1: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export const HeaderStyles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerSimple: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 12,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export const ButtonStyles = StyleSheet.create({
    fab: {
        position: 'absolute',
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    primaryBtn: {
        backgroundColor: '#135bec',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBtnText: {
        color: '#fff',
        fontWeight: '700',
    },
});

export const MapStyles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    map: {
        flex: 1,
    },
    menu: {
        position: 'absolute',
        bottom: 16,
        right: 72,
        borderRadius: 12,
        borderWidth: 1,
        padding: 8,
        gap: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    menuOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    optionText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export const MapOffsets = {
    fabBottomPrimary: 86,
    fabBottomSecondary: 142,
};

export const NavStyles = StyleSheet.create({
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        borderTopWidth: 1,
    },
    navItem: {
        alignItems: 'center',
        gap: 2,
    },
    navText: {
        fontSize: 10,
        fontWeight: '700',
    },
});

export const CardStyles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
    },
    statCard: {
        flex: 1,
        padding: 14,
        borderRadius: 16,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        marginVertical: 6,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '700',
    },
});

export const ModalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    content: {
        borderRadius: 20,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    submitBtn: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export const ErrorStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        margin: 16,
        borderRadius: 16,
        gap: 12,
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.8,
    },
    retryBtn: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 8,
    },
    retryBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
