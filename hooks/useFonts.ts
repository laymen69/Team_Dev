import {
    PlayfairDisplay_400Regular,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_800ExtraBold,
    PlayfairDisplay_900Black,
    useFonts as useHeadingFonts,
} from '@expo-google-fonts/playfair-display';
import {
    PlusJakartaSans_300Light,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    useFonts as useBodyFonts,
} from '@expo-google-fonts/plus-jakarta-sans';

export function useAppFonts() {
    const [bodyLoaded] = useBodyFonts({
        PlusJakartaSans_300Light,
        PlusJakartaSans_400Regular,
        PlusJakartaSans_500Medium,
        PlusJakartaSans_600SemiBold,
        PlusJakartaSans_700Bold,
    });

    const [headingLoaded] = useHeadingFonts({
        PlayfairDisplay_400Regular,
        PlayfairDisplay_500Medium,
        PlayfairDisplay_600SemiBold,
        PlayfairDisplay_700Bold,
        PlayfairDisplay_800ExtraBold,
        PlayfairDisplay_900Black,
    });

    return { fontsLoaded: bodyLoaded && headingLoaded };
}

/** Font family constants — use these throughout the app */
export const Fonts = {
    // Playfair Display — headings, brand name, CTAs (Classic Luxury)
    heading: 'PlayfairDisplay_700Bold',
    headingLight: 'PlayfairDisplay_400Regular', // Playfair doesn't have 300 in this package usually, mapping to 400
    headingMedium: 'PlayfairDisplay_500Medium',
    headingSemiBold: 'PlayfairDisplay_600SemiBold',
    headingXBold: 'PlayfairDisplay_800ExtraBold',
    headingBlack: 'PlayfairDisplay_900Black',

    // Plus Jakarta Sans — body, labels, captions, UI (Modern & Refined)
    body: 'PlusJakartaSans_400Regular',
    bodyLight: 'PlusJakartaSans_300Light',
    bodyMedium: 'PlusJakartaSans_500Medium',
    bodySemiBold: 'PlusJakartaSans_600SemiBold',
    bodyBold: 'PlusJakartaSans_700Bold',
} as const;
