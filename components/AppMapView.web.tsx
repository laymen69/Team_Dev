import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Web mock for map
export default function AppMapView(props: any) {
    return (
        <View style={[styles.container, props.style]}>
            <Text style={styles.text}>Map not available on web</Text>
        </View>
    );
}

export const Marker = (props: any) => null;
export const PROVIDER_DEFAULT = 'default';

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    text: {
        color: '#666',
    }
});
