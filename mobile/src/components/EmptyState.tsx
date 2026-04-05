import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { expiria } from '../theme';

interface EmptyStateProps {
    icon?: keyof typeof Ionicons.glyphMap;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon = 'basket-outline',
    title,
    message,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={64} color={expiria.colors.border} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            {actionLabel && onAction && (
                <TouchableOpacity style={styles.button} onPress={onAction}>
                    <Ionicons name="add-circle-outline" size={20} color={expiria.colors.canvas} />
                    <Text style={styles.buttonText}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: expiria.spacing.xl,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: expiria.borderRadius.full,
        backgroundColor: expiria.colors.canvas,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: expiria.spacing.lg,
    },
    title: {
        fontSize: expiria.typography.sizes.subheading,
        fontWeight: expiria.typography.weights.semibold,
        color: expiria.colors.primaryInk,
        marginBottom: expiria.spacing.sm,
        textAlign: 'center',
    },
    message: {
        fontSize: expiria.typography.sizes.body,
        color: expiria.colors.textMuted,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: expiria.spacing.lg,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: expiria.colors.primaryInk,
        paddingHorizontal: expiria.spacing.lg - 4,
        paddingVertical: expiria.spacing.md - 4,
        borderRadius: expiria.borderRadius.sm,
    },
    buttonText: {
        color: expiria.colors.canvas,
        fontSize: expiria.typography.sizes.body,
        fontWeight: expiria.typography.weights.semibold,
        marginLeft: expiria.spacing.sm,
    },
});
