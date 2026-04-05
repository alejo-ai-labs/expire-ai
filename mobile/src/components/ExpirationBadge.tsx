import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrafficLightStatus } from '../types';
import { formatRelativeExpiration } from '../utils/dateUtils';
import { expiria } from '../theme';
import { useThemeColors } from '../context/ThemeContext';

interface ExpirationBadgeProps {
    status: TrafficLightStatus;
    daysUntilExpiration: number;
}

export function ExpirationBadge({ status, daysUntilExpiration }: ExpirationBadgeProps) {
    const colors = useThemeColors();
    const expirationText = formatRelativeExpiration(daysUntilExpiration);

    const statusColors: Record<TrafficLightStatus, { background: string; text: string }> = {
        green: {
            background: colors.statusGreenBg,
            text: colors.statusGreenText,
        },
        yellow: {
            background: colors.statusYellowBg,
            text: colors.statusYellowText,
        },
        red: {
            background: colors.statusRedBg,
            text: colors.statusRedText,
        },
    };

    const statusColor = statusColors[status];

    return (
        <View style={[styles.badge, { backgroundColor: statusColor.background }]}>
            <View style={[styles.dot, { backgroundColor: statusColor.text }]} />
            <Text style={[styles.text, { color: statusColor.text }]}>{expirationText}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: expiria.spacing.sm + 2,
        paddingVertical: expiria.spacing.xs + 2,
        borderRadius: expiria.borderRadius.lg,
        alignSelf: 'flex-start',
    },
    dot: {
        width: expiria.spacing.sm,
        height: expiria.spacing.sm,
        borderRadius: expiria.spacing.xs,
        marginRight: expiria.spacing.xs + 2,
    },
    text: {
        fontSize: expiria.typography.sizes.caption,
        fontWeight: expiria.typography.weights.semibold,
    },
});
