import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import apiClient from '../services/apiClient';
import { AuthService } from '../services/auth.service';
import { appEventEmitter, AppEvents } from '../services/eventEmitter';
import { AuthState, User } from '../types/auth';

const STORAGE_KEY = 'user_session';

const AuthContext = createContext<AuthState>({
    user: null,
    isLoading: true,
    signIn: async (email: string, pass: string, role: string, remember?: boolean) => { },
    signOut: async () => { },
    updateUser: (updatedUser: User) => { },
});

const saveItem = async (key: string, value: string) => {
    if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
    } else {
        await SecureStore.setItemAsync(key, value);
    }
};

const getItem = async (key: string) => {
    if (Platform.OS === 'web') {
        return localStorage.getItem(key);
    } else {
        return await SecureStore.getItemAsync(key);
    }
};

const deleteItem = async (key: string) => {
    if (Platform.OS === 'web') {
        localStorage.removeItem(key);
    } else {
        await SecureStore.deleteItemAsync(key);
    }
};

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        // Check for persisted user and validate token
        const loadUser = async () => {
            try {
                const jsonUser = await getItem(STORAGE_KEY);
                const token = await (Platform.OS === 'web'
                    ? localStorage.getItem('userToken')
                    : AsyncStorage.getItem('userToken'));

                if (jsonUser && token) {
                    // Check if token is expired
                    if (AuthService.isTokenExpired(token)) {
                        console.log('[Auth] Token expired, logging out');
                        await deleteItem(STORAGE_KEY);
                        await AsyncStorage.removeItem('userToken');
                        setUser(null);
                    } else {
                        const expiration = AuthService.getTokenExpiration(token);
                        console.log('[Auth] Token valid until:', expiration);
                        const storedUser = JSON.parse(jsonUser);
                        // Set stored user immediately so UI doesn't block
                        setUser(storedUser);
                        // Then refresh from DB to get latest profileImage, phone, etc.
                        try {
                            const meResponse = await apiClient.get('/api/users/me');
                            const me = meResponse.data;
                            if (me) {
                                const freshUser = {
                                    ...storedUser,
                                    firstName: me.first_name || storedUser.firstName,
                                    lastName: me.last_name || storedUser.lastName,
                                    email: me.email || storedUser.email,
                                    phone: me.phone || storedUser.phone,
                                    status: me.status || storedUser.status,
                                    profileZone: me.profile_zone || storedUser.profileZone,
                                    profileImage: me.profile_image ?? storedUser.profileImage,
                                };
                                setUser(freshUser);
                                await saveItem(STORAGE_KEY, JSON.stringify(freshUser));
                            }
                        } catch (e) {
                            console.log('[Auth] Could not refresh /me, using stored data');
                        }
                    }
                } else if (jsonUser && !token) {
                    // User session exists but no token - clear session
                    console.log('[Auth] No token found, clearing session');
                    await deleteItem(STORAGE_KEY);
                    setUser(null);
                }
            } catch (e) {
                console.error('Failed to load user', e);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = (segments.length as number) === 0 ||
            (segments[0] as string) === 'login' ||
            (segments[0] as string) === 'forgot-password' ||
            (segments[0] as string) === 'signup' ||
            (segments[0] as string) === 'about' ||
            (segments[0] as string) === 'index';
        const inDashboardGroup = (segments[0] as string) === 'dashboard_web';
        if (inDashboardGroup) return;

        if (!user && !inAuthGroup) {
            console.log('[Auth] Guest detected in private route, redirecting to /login');
            router.replace('/login');
        } else if (user) {
            if (inAuthGroup) {
                console.log(`[Auth] Authenticated user (${user.role}) in auth group, redirecting to dashboard`);
                if (user.role === 'admin') router.replace('/admin/dashboard');
                else if (user.role === 'supervisor') router.replace('/supervisor/dashboard');
                else if (user.role === 'merchandiser') router.replace('/merchandiser/dashboard');
            } else {
                const currentRoot = segments[0];
                const allowedRoots: Record<string, string> = {
                    admin: 'admin',
                    supervisor: 'supervisor',
                    merchandiser: 'merchandiser'
                };

                if (currentRoot !== allowedRoots[user.role]) {
                    console.log(`[RBAC] Blocking access to /${currentRoot} for ${user.role}. Redirecting to /${allowedRoots[user.role]}/dashboard`);
                    router.replace(`/${allowedRoots[user.role]}/dashboard` as any);
                }
            }
        }
    }, [user, segments, isLoading]);

    useEffect(() => {
        const handleUnauthorized = () => {
            console.log('[Auth] Unauthorized event received, logging out');
            signOut();
        };

        appEventEmitter.on(AppEvents.UNAUTHORIZED, handleUnauthorized);
        return () => {
            appEventEmitter.off(AppEvents.UNAUTHORIZED, handleUnauthorized);
        };
    }, []);

    const signIn = async (email: string, pass: string, role: string, remember: boolean = true) => {
        console.log(`[Auth] Attempting signIn for: ${email}, expected role: ${role}`);
        const loggedUser = await AuthService.login(email, pass);

        if (loggedUser) {
            console.log(`[Auth] Login success for ${email}, user role: ${loggedUser.role}`);
            if (loggedUser.role !== role) {
                console.warn(`[Auth] Role mismatch! UI selected ${role} but backend returned ${loggedUser.role}`);
                throw new Error(`Invalid role selected. This account is not an ${role}.`);
            }
            setUser(loggedUser);
            if (remember) {
                console.log('[Auth] Saving session to storage');
                await saveItem(STORAGE_KEY, JSON.stringify(loggedUser));
            }
        } else {
            console.error('[Auth] Login failed: AuthService returned null');
            // If AuthService failed (likely network or server error), throw that instead of generic credentials error
            throw new Error('Login failed. Check internet connection or server status.');
        }
    };

    const signOut = async () => {
        await deleteItem(STORAGE_KEY);
        if (Platform.OS !== 'web') {
            await SecureStore.deleteItemAsync('userToken').catch(() => {
                AsyncStorage.removeItem('userToken');
            });
        } else {
            localStorage.removeItem('userToken');
        }

        setUser(null);
        router.replace('/login');
    };

    const updateUser = async (updatedUser: User) => {
        setUser(updatedUser);
        await saveItem(STORAGE_KEY, JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signOut, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}
