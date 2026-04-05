import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrafficLightStatus } from '../types';
import { formatRelativeExpiration } from '../utils/dateUtils';
import { expiria } from '../theme';

interface ExpirationBadgeProps {
    status: TrafficLightStatus;
    daysUntilExpiration: number;
}

const statusColors: Record<TrafficLightStatus, { background: string; text: string }> = {
    green: {
        background: expiria.colors.statusGreenBg,
        text: expiria.colors.statusGreenText,
    },
    yellow: {
        background: expiria.colors.statusYellowBg,
        text: expiria.colors.statusYellowText,
    },
    red: {
        background: expiria.colors.statusRedBg,
        text: expiria.colors.statusRedText,
    },
};

export function ExpirationBadge({ status, daysUntilExpiration }: ExpirationBadgeProps) {
    const colors = statusColors[status];
    const expirationText = formatRelativeExpiration(daysUntilExpiration);

    return (
        <View style={[styles.badge, { backgroundColor: colors.background }]}>
            <View style={[styles.dot, { backgroundColor: colors.text }]} />
            <Text style={[styles.text, { color: colors.text }]}>{expirationText}</Text>
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
