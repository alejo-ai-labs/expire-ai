import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrafficLightStatus } from '../types';
import { formatDate } from '../utils/dateUtils';
import { ExpirationBadge } from './ExpirationBadge';
import { expiria } from '../theme';

interface FoodCardProps {
    id: string;
    name: string;
    purchaseDate: string;
    expirationDate: string;
    status: TrafficLightStatus;
    daysUntilExpiration: number;
    isEstimated: boolean;
    onPress: () => void;
    onDelete: () => void;
}

export function FoodCard({
    name,
    purchaseDate,
    expirationDate,
    status,
    daysUntilExpiration,
    isEstimated,
    onPress,
    onDelete,
}: FoodCardProps) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.name} numberOfLines={1}>
                        {name}
                    </Text>
                    <Pressable
                        style={styles.deleteButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        hitSlop={8}
                    >
                        <Ionicons name="trash-outline" size={20} color={expiria.colors.textMuted} />
                    </Pressable>
                </View>

                <View style={styles.dates}>
                    <View style={styles.dateRow}>
                        <Text style={styles.dateLabel}>Purchased:</Text>
                        <Text style={styles.dateValue}>{formatDate(purchaseDate)}</Text>
                    </View>
                    <View style={styles.dateRow}>
                        <Text style={styles.dateLabel}>Expires:</Text>
                        <Text style={styles.dateValue}>{formatDate(expirationDate)}</Text>
                        {isEstimated && (
                            <View style={styles.estimatedBadge}>
                                <Text style={styles.estimatedText}>Est.</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.footer}>
                    <ExpirationBadge status={status} daysUntilExpiration={daysUntilExpiration} />
                </View>
            </View>
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
    card: {
        backgroundColor: expiria.colors.secondarySurface,
        borderRadius: expiria.borderRadius.lg,
        marginHorizontal: expiria.spacing.md,
        marginVertical: expiria.spacing.xs + 2,
        ...expiria.shadows.card,
    },
    content: {
        padding: expiria.spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: expiria.spacing.sm + 4,
    },
    name: {
        fontSize: expiria.typography.sizes.subheading - 2,
        fontWeight: expiria.typography.weights.semibold,
        color: expiria.colors.primaryInk,
        flex: 1,
        marginRight: expiria.spacing.sm,
    },
    deleteButton: {
        padding: expiria.spacing.xs,
    },
    dates: {
        marginBottom: expiria.spacing.sm + 4,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: expiria.spacing.xs,
    },
    dateLabel: {
        fontSize: expiria.typography.sizes.caption + 1,
        color: expiria.colors.textMuted,
        width: 80,
    },
    dateValue: {
        fontSize: expiria.typography.sizes.caption + 1,
        color: expiria.colors.primaryInk,
        fontWeight: expiria.typography.weights.medium,
    },
    estimatedBadge: {
        backgroundColor: expiria.colors.border,
        paddingHorizontal: expiria.spacing.xs + 2,
        paddingVertical: 2,
        borderRadius: expiria.borderRadius.sm / 2,
        marginLeft: expiria.spacing.sm,
    },
    estimatedText: {
        fontSize: expiria.typography.sizes.small,
        color: expiria.colors.textMuted,
        fontWeight: expiria.typography.weights.medium,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
});
