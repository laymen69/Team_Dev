/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#a5a457ff';

export const Colors = {
  light: {
    text: '#2F2F2F', // Dark Gray
    textSecondary: '#4F3A1B', // Deep Brown
    background: '#E5E5E5', // Snowy White
    backgroundSecondary: '#F1D298', // Sandy Yellow
    card: '#FAFAFA', // Off-white
    tint: tintColorLight,
    icon: '#4F3A1B',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    border: '#e5e7eb',
    success: '#16a34a',
    warning: '#f59e0b',
    error: '#dc2626',
    info: '#A2DFF7', // Azure Blue
    buttonBackground: '#F9E3B2', // Desert Yellow
    buttonText: '#2F2F2F',
  },
  dark: {
    text: '#E0E0E0', // Pale Off-white
    textSecondary: '#D0D0D0', // Light Gray
    background: '#2D2D2D', // Deep Matte Black
    backgroundSecondary: '#3B3B3B', // Charcoal Gray
    card: '#3B3B3B',
    tint: tintColorDark,
    icon: '#DAA520', // Muted Gold
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    border: '#334155',
    success: '#22c55e',
    warning: '#fbbf24',
    error: '#ef4444',
    info: '#4071A0', // Premium Azure
    buttonBackground: '#1D3B6D', // Dark Rich Blue
    buttonText: '#E0E0E0',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
