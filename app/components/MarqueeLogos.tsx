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

const TUNISIA_IMAGES = [
    require('../../assets/images/tunisia/boisson-gazeuse.png'),
    require('../../assets/images/tunisia/brownies.jpg'),
    require('../../assets/images/tunisia/eau-minerale.png'),
    require('../../assets/images/tunisia/tomate.png'),
    require('../../assets/images/tunisia/yaourt.png'),
    require('../../assets/images/tunisia/lait-1-2-ecreme.png'),
    require('../../assets/images/tunisia/lben.jpg'),
    require('../../assets/images/tunisia/pate-a-tartiner.jpg'),
    require('../../assets/images/tunisia/fromage-fondu.png'),
    require('../../assets/images/tunisia/harissa.jpg'),
];

const LOGO_WIDTH = Platform.select({ web: 120, default: 100 });
const LOGO_MARGIN = 30;
const TOTAL_LOGO_WIDTH = LOGO_WIDTH + LOGO_MARGIN;
const TOTAL_WIDTH = TUNISIA_IMAGES.length * TOTAL_LOGO_WIDTH;

export default function MarqueeLogos() {
    const isWeb = Platform.OS === 'web';
    const scrollX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = () => {
            scrollX.setValue(0);
            Animated.timing(scrollX, {
                toValue: -TOTAL_WIDTH,
                duration: isWeb ? 15000 : 12000,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(() => animate());
        };

        animate();
    }, [scrollX, isWeb]);

    const renderLogos = () => (
        <View style={styles.logoRow}>
            {TUNISIA_IMAGES.map((image, index) => (
                <View key={index} style={styles.logoItem}>
                    <Image
                        source={image}
                        style={styles.logoImage}
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

            <View style={styles.marqueeContainer}>
                <Animated.View
                    style={[
                        styles.animatedRow,
                        { transform: [{ translateX: scrollX }] },
                    ]}
                >
                    {renderLogos()}
                    {renderLogos()}
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 25,
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        paddingHorizontal: 32,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerText: {
        fontSize: 10,
        fontFamily: Fonts.heading,
        color: '#ffffff',
        letterSpacing: 6,
        marginHorizontal: 16,
        opacity: 0.8,
        textAlign: 'center',
    },
    marqueeContainer: {
        overflow: 'hidden',
        width: '100%',
        height: 50,
        alignItems: 'center',
    },
    animatedRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoItem: {
        width: LOGO_WIDTH,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    logoImage: {
        width: LOGO_WIDTH - 20,
        height: 38,
        opacity: 0.9,
    },
});
