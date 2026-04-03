import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';

export function useRoleProtection(allowedRoles: UserRole[]) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => { 
        if (isLoading) return;

        if (!user) {
            // If not logged in, redirect to login
            router.replace('/login');
            return;
        }

        if (!allowedRoles.includes(user.role)) {
            // If logged in but wrong role, redirect to their own dashboard
            if (user.role === 'admin') router.replace('/admin/dashboard');
            else if (user.role === 'supervisor') router.replace('/supervisor/dashboard');
            else if (user.role === 'merchandiser') router.replace('/merchandiser/dashboard');
            else router.replace('/'); // Fallback
        }
    }, [user, isLoading, segments, allowedRoles, router]);

    return { isAuthorized: user && allowedRoles.includes(user.role), isLoading };
}
