import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, RefreshControl, View } from 'react-native';
import { FoodItemWithStatus } from '../types';
import { FoodCard } from './FoodCard';
import { EmptyState } from './EmptyState';
import { expiria } from '../theme';
import { useThemeColors } from '../context/ThemeContext';

interface FoodCardListProps {
    items: FoodItemWithStatus[];
    onItemPress: (id: string) => void;
    onItemDelete: (id: string) => void;
    onRefresh?: () => void;
    refreshing?: boolean;
    onAddItem?: () => void;
}

export function FoodCardList({
    items,
    onItemPress,
    onItemDelete,
    onRefresh,
    refreshing = false,
    onAddItem,
}: FoodCardListProps) {
    const colors = useThemeColors();

    // Sort items by expiration date (soonest first)
    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            const dateA = new Date(a.expirationDate).getTime();
            const dateB = new Date(b.expirationDate).getTime();
            return dateA - dateB;
        });
    }, [items]);

    const renderItem = useCallback(
        ({ item }: { item: FoodItemWithStatus }) => (
            <FoodCard
                id={item.id}
                name={item.name}
                purchaseDate={item.purchaseDate}
                expirationDate={item.expirationDate}
                status={item.status}
                daysUntilExpiration={item.daysUntilExpiration}
                isEstimated={item.isEstimated}
                onPress={() => onItemPress(item.id)}
                onDelete={() => onItemDelete(item.id)}
            />
        ),
        [onItemPress, onItemDelete]
    );

    const keyExtractor = useCallback((item: FoodItemWithStatus) => item.id, []);

    const renderEmptyState = useCallback(
        () => (
            <EmptyState
                icon="basket-outline"
                illustration={require('../../assets/empty-fridge.png')}
                title="No Food Items"
                message="Start tracking your food by scanning a receipt or adding items manually."
                actionLabel={onAddItem ? "Scan Receipt" : undefined}
                onAction={onAddItem}
            />
        ),
        [onAddItem]
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.primarySurface }]}>
            <FlatList
                data={sortedItems}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={[
                    styles.listContent,
                    sortedItems.length === 0 && styles.emptyListContent,
                ]}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    onRefresh ? (
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primaryInk}
                            colors={[colors.primaryInk]}
                        />
                    ) : undefined
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingVertical: expiria.spacing.sm,
    },
    emptyListContent: {
        flexGrow: 1,
    },
});
