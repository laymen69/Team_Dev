import { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Image,
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Fonts } from '../../hooks/useFonts';

const { width } = Dimensions.get('window');

// Tunisian product assets from assets/images/tunisia/
const ROW1_IMAGES = [
    require('../../assets/images/tunisia/boisson-gazeuse.png'),
    require('../../assets/images/tunisia/brownies.jpg'),
    require('../../assets/images/tunisia/eau-minerale.png'),
    require('../../assets/images/tunisia/tomate.png'),
    require('../../assets/images/tunisia/yaourt.png'),
];

const ROW2_IMAGES = [
    require('../../assets/images/tunisia/lait-1-2-ecreme.png'),
    require('../../assets/images/tunisia/lben.jpg'),
    require('../../assets/images/tunisia/pate-a-tartiner.jpg'),
    require('../../assets/images/tunisia/fromage-fondu.png'),
    require('../../assets/images/tunisia/harissa.jpg'),
];

// Combined list for Mobile single-row layout
const ALL_IMAGES = [...ROW1_IMAGES, ...ROW2_IMAGES];

export default function MarqueeLogos() {
    const isWeb = Platform.OS === 'web';
    const scrollLeft = useRef(new Animated.Value(0)).current;
    const scrollRight = useRef(new Animated.Value(-width)).current;

    useEffect(() => {
        // Animation for the first row (Left sliding)
        const animateLeft = () => {
            scrollLeft.setValue(0);
            Animated.timing(scrollLeft, {
                toValue: -width,
                duration: isWeb ? 40000 : 30000,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(() => animateLeft());
        };

        // Animation for the second row (Right sliding) - Only for Web
        const animateRight = () => {
            if (!isWeb) return;
            scrollRight.setValue(-width);
            Animated.timing(scrollRight, {
                toValue: 0,
                duration: 40000,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(() => animateRight());
        };

        animateLeft();
        if (isWeb) animateRight();
    }, [scrollLeft, scrollRight, isWeb]);

    const renderLogoSet = (images: any[]) => (
        <View style={styles.logoRow}>
            {images.map((image, index) => (
                <View key={index} style={styles.logoItem}>
                    <Image
                        source={image}
                        style={isWeb ? styles.logoImageWeb : styles.logoImageMobile}
                        resizeMode="contain"
                    />
                </View>
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.line} />
                <Text style={styles.headerText}>EXCELLENCE TUNISIENNE</Text>
                <View style={styles.line} />
            </View>

            {/* Row 1: Sliding Left (Active on all platforms) */}
            <View style={styles.marqueeRowContainer}>
                <Animated.View
                    style={[
                        styles.animatedRow,
                        { transform: [{ translateX: scrollLeft }] },
                    ]}
                >
                    {renderLogoSet(isWeb ? ROW1_IMAGES : ALL_IMAGES)}
                    {renderLogoSet(isWeb ? ROW1_IMAGES : ALL_IMAGES)}
                </Animated.View>
            </View>

            {/* Row 2: Sliding Right (Web Only) */}
            {isWeb && (
                <View style={[styles.marqueeRowContainer, { marginTop: 20 }]}>
                    <Animated.View
                        style={[
                            styles.animatedRow,
                            { transform: [{ translateX: scrollRight }] },
                        ]}
                    >
                        {renderLogoSet(ROW2_IMAGES)}
                        {renderLogoSet(ROW2_IMAGES)}
                    </Animated.View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: Platform.select({ web: 35, default: 25 }),
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Platform.select({ web: 25, default: 20 }),
        paddingHorizontal: Platform.select({ web: 40, default: 32 }),
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
    headerText: {
        fontSize: Platform.select({ web: 10, default: 9 }),
        fontFamily: Fonts.heading,
        color: '#ffffff',
        letterSpacing: 2.5,
        marginHorizontal: 16,
        opacity: 0.9,
        textAlign: 'center',
    },
    marqueeRowContainer: {
        flexDirection: 'row',
        overflow: 'hidden',
        width: '100%',
        height: Platform.select({ web: 60, default: 45 }),
        alignItems: 'center',
    },
    animatedRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoRow: {
        flexDirection: 'row',
        width: width,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    logoItem: {
        paddingHorizontal: Platform.select({ web: 25, default: 15 }),
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoImageWeb: {
        width: 80,
        height: 50,
        opacity: 0.95,
    },
    logoImageMobile: {
        width: 60,
        height: 40,
        opacity: 0.9,
    },
});
