import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { expiria } from '../theme';

interface LoadingSpinnerProps {
    message?: string;
    size?: 'small' | 'large';
}

export function LoadingSpinner({ message, size = 'large' }: LoadingSpinnerProps) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size={size} color={expiria.colors.primaryInk} />
            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    message: {
        marginTop: 12,
        fontSize: 16,
        color: expiria.colors.textMuted,
        textAlign: 'center',
    },
});
