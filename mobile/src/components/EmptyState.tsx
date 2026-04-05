import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { expiria } from '../theme';
import { useThemeColors } from '../context/ThemeContext';

interface EmptyStateProps {
    icon?: keyof typeof Ionicons.glyphMap;
    illustration?: ImageSourcePropType;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon = 'basket-outline',
    illustration,
    title,
    message,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    const colors = useThemeColors();

    return (
        <View style={styles.container}>
            {illustration ? (
                <Image
                    source={illustration}
                    style={styles.illustration}
                    resizeMode="contain"
                />
            ) : (
                <View style={[styles.iconContainer, { backgroundColor: colors.canvas }]}>
                    <Ionicons name={icon} size={64} color={colors.border} />
                </View>
            )}
            <Text style={[styles.title, { color: colors.primaryInk }]}>{title}</Text>
            <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
            {actionLabel && onAction && (
                <TouchableOpacity style={[styles.button, { backgroundColor: colors.primaryInk }]} onPress={onAction}>
                    <Ionicons name="add-circle-outline" size={20} color={colors.canvas} />
                    <Text style={[styles.buttonText, { color: colors.canvas }]}>{actionLabel}</Text>
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
    illustration: {
        width: 200,
        height: 200,
        alignSelf: 'center',
        marginBottom: expiria.spacing.lg,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: expiria.borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: expiria.spacing.lg,
    },
    title: {
        fontSize: expiria.typography.sizes.subheading,
        fontWeight: expiria.typography.weights.semibold,
        marginBottom: expiria.spacing.sm,
        textAlign: 'center',
    },
    message: {
        fontSize: expiria.typography.sizes.body,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: expiria.spacing.lg,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: expiria.spacing.lg - 4,
        paddingVertical: expiria.spacing.md - 4,
        borderRadius: expiria.borderRadius.sm,
    },
    buttonText: {
        fontSize: expiria.typography.sizes.body,
        fontWeight: expiria.typography.weights.semibold,
        marginLeft: expiria.spacing.sm,
    },
});
