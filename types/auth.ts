export type UserRole = 'admin' | 'supervisor' | 'merchandiser';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    password: string;
    email: string;
    role: UserRole;
    phone?: string;
    status?: string;
    profileZone?: string;
    profileImage?: string | null;
}

export interface AuthState {
    user: User | null;
    isLoading: boolean;
    signIn: (email: string, password: string, role: string, remember?: boolean) => Promise<void>;
    signOut: () => Promise<void>;
    updateUser: (updatedUser: User) => void;
}
