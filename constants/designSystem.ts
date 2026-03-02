
export const DesignTokens = {
    colors: {
        light: {
            primary: '#4F3A1B', // Deep Brown
            primaryLight: '#F9E3B2', // Desert Yellow
            primaryDark: '#2F2F2F', // Dark Gray
            secondary: '#A2DFF7', // Azure Blue
            success: '#10B981',
            warning: '#F59E0B',
            danger: '#EF4444',
            info: '#A2DFF7',
            background: '#e8e6e6fd', // Snowy White
            surface: '#FAFAFA', // Off-white
            surfaceSecondary: '#Fdf6e3', // Lighter sandy yellow for contrast
            text: '#2F2F2F',
            textSecondary: '#4F3A1B',
            textMuted: '#8D7F71', // Muted brown/gray
            border: '#D4C5B0', // Sandy border
            icon: '#4F3A1B',
            glass: 'rgba(250, 250, 250, 0.7)',
            glassBorder: 'rgba(255, 255, 255, 0.3)',
        },
        dark: {
            primary: '#DAA520', // Muted Gold
            primaryLight: '#3B3B3B',
            primaryDark: '#1D3B6D', // Dark Blue
            secondary: '#4071A0', // Premium Azure
            success: '#34D399',
            warning: '#FBBF24',
            danger: '#F87171',
            info: '#4071A0',
            background: '#2D2D2D', // Deep Matte Black
            surface: '#333333', // Slightly lighter black
            surfaceSecondary: '#3B3B3B', // Charcoal Gray
            text: '#E0E0E0',
            textSecondary: '#D0D0D0',
            textMuted: '#9CA3AF',
            border: '#4B5563',
            icon: '#DAA520',
            glass: 'rgba(45, 45, 45, 0.7)',
            glassBorder: 'rgba(255, 255, 255, 0.1)',
        },
    },
    glass: {
        blur: 20,
        intensity: 0.7,
        borderWidth: 1.5,
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        xxl: 32,
        huge: 48,
    },
    borderRadius: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 20,
        xl: 28,
        full: 9999,
    },
    shadows: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 8,
        },
    },
    typography: {
        h1: {
            fontFamily: 'Montserrat_700Bold',
            fontSize: 32,
            lineHeight: 40,
            letterSpacing: -0.5,
        },
        h2: {
            fontFamily: 'Montserrat_700Bold',
            fontSize: 24,
            lineHeight: 32,
            letterSpacing: -0.3,
        },
        h3: {
            fontFamily: 'Montserrat_600SemiBold',
            fontSize: 20,
            lineHeight: 28,
        },
        subheading: {
            fontFamily: 'PlayfairDisplay_600SemiBold',
            fontSize: 18,
            lineHeight: 26,
        },
        body: {
            fontFamily: 'Roboto_400Regular',
            fontSize: 16,
            lineHeight: 24,
        },
        bodyBold: {
            fontFamily: 'Roboto_700Bold',
            fontSize: 16,
            lineHeight: 24,
        },
        secondary: {
            fontFamily: 'Lato_400Regular',
            fontSize: 15,
            lineHeight: 22,
        },
        caption: {
            fontFamily: 'Lato_400Regular',
            fontSize: 14,
            lineHeight: 20,
            color: '#64748B',
        },
        tiny: {
            fontFamily: 'Lato_700Bold',
            fontSize: 12,
            lineHeight: 16,
            textTransform: 'uppercase' as const,
            letterSpacing: 1,
        },
        button: {
            fontFamily: 'BebasNeue_400Regular',
            fontSize: 18,
            letterSpacing: 1,
            textTransform: 'uppercase' as const,
        },
    },
};

export type ThemeType = 'light' | 'dark';

export const getColors = (theme: ThemeType = 'light') => DesignTokens.colors[theme];
