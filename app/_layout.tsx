import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { usePermissions } from '../hooks/usePermissions';

import { useAppFonts } from '../hooks/useFonts';

// Configure notification behavior — native only (web has no NativeEventEmitter)
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}


// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

import { NotificationProvider } from '../context/NotificationContext';

export default function RootLayout() {
  const { fontsLoaded: appFontsLoaded } = useAppFonts();
  const [iconsLoaded, iconError] = useFonts({
    ...Ionicons.font,
  });

  const allLoaded = appFontsLoaded && iconsLoaded;

  // Request system permissions on mount
  usePermissions();

  useEffect(() => {
    if (allLoaded || iconError) {
      SplashScreen.hideAsync();
    }
  }, [allLoaded, iconError]);

  if (!allLoaded && !iconError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <NotificationProvider>
              <RootLayoutContent />
            </NotificationProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootLayoutContent() {
  const { theme } = useTheme();

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 45,
          contentStyle: { backgroundColor: theme === 'dark' ? '#1e293b' : '#f8f9fa' }
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="indexMobile" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="about" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="supervisor" />
        <Stack.Screen name="merchandiser" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}
