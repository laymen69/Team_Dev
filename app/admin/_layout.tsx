import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useRoleProtection } from '../../hooks/useRoleProtection';

export default function AdminLayout() {
    const { isAuthorized, isLoading } = useRoleProtection(['admin']);

    if (isLoading || !isAuthorized) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#7a2117ff" />
            </View>
        );
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'fade',
                animationDuration: 50,
            }}
        >
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="before-after" />
            <Stack.Screen name="users" />
            <Stack.Screen name="events" />
            <Stack.Screen name="planning" />
            <Stack.Screen name="leave" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="gsm" />
            <Stack.Screen name="documents" />
            <Stack.Screen name="privacy" />
            <Stack.Screen name="help" />
        </Stack>
    );
}
