import { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import { CameraViewComponent } from '../../components/CameraView';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useFoodItems } from '../../hooks/useFoodItems';
import { ExtractedFoodItem } from '../../types';
import { CameraError } from '../../hooks/useCamera';
import { addDays, toISODateString } from '../../utils/dateUtils';
import * as api from '../../services/api';
import { expiria } from '../../theme';

type ScanState = 'camera' | 'processing' | 'confirm' | 'error';

interface EditableItem extends ExtractedFoodItem {
    id: string;
    selected: boolean;
}

export default function ScanScreen() {
    const router = useRouter();
    const { addItems } = useFoodItems();

    const [scanState, setScanState] = useState<ScanState>('camera');
    const [extractedItems, setExtractedItems] = useState<EditableItem[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Handle image capture
    const handleCapture = useCallback(async (imageUri: string) => {
        console.log('[SCAN] Image captured:', imageUri);
        setScanState('processing');

        try {
            // Convert image URI to base64 for API using expo-file-system
            console.log('[SCAN] Converting image to base64...');
            const base64 = await FileSystem.readAsStringAsync(imageUri, {
                encoding: 'base64',
            });
            console.log('[SCAN] Base64 length:', base64.length);

            // Call the scan API
            console.log('[SCAN] Calling scan API...');
            const scanResult = await api.scanReceipt(base64);
            console.log('[SCAN] Scan result:', scanResult);

            if (scanResult.items.length === 0) {
                setErrorMessage('No food items found in the receipt. Please try again with a clearer image.');
                setScanState('error');
                return;
            }

            // Convert to editable items
            const editableItems: EditableItem[] = scanResult.items.map((item, index) => ({
                ...item,
                id: `item-${Date.now()}-${index}`,
                selected: true,
            }));

            setExtractedItems(editableItems);
            setScanState('confirm');
        } catch (err) {
            console.error('Scan error:', err);
            const message = err instanceof api.ApiClientError
                ? err.message
                : err instanceof Error
                    ? err.message
                    : 'Failed to process the receipt. Please try again.';
            setErrorMessage(message);
            setScanState('error');
        }
    }, []);

    // Handle camera error
    const handleCameraError = useCallback((error: CameraError) => {
        setErrorMessage(error.message);
        setScanState('error');
    }, []);

    // Toggle item selection
    const toggleItemSelection = useCallback((id: string) => {
        setExtractedItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, selected: !item.selected } : item
            )
        );
    }, []);

    // Update item name
    const updateItemName = useCallback((id: string, name: string) => {
        setExtractedItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, name } : item
            )
        );
    }, []);

    // Remove item
    const removeItem = useCallback((id: string) => {
        setExtractedItems(prev => prev.filter(item => item.id !== id));
    }, []);

    // Save confirmed items
    const handleSaveItems = useCallback(async () => {
        const selectedItems = extractedItems.filter(item => item.selected);

        if (selectedItems.length === 0) {
            Alert.alert('No Items Selected', 'Please select at least one item to save.');
            return;
        }

        try {
            const today = new Date();
            const itemsToSave = selectedItems.map(item => ({
                name: item.name,
                purchaseDate: toISODateString(today),
                expirationDate: toISODateString(addDays(today, item.estimatedExpirationDays)),
                isEstimated: true,
            }));

            await addItems(itemsToSave);

            Alert.alert(
                'Items Saved',
                `${selectedItems.length} item(s) added to your food tracker.`,
                [{ text: 'OK', onPress: () => router.push('/(tabs)/') }]
            );

            // Reset state
            setExtractedItems([]);
            setScanState('camera');
        } catch (err) {
            Alert.alert('Error', 'Failed to save items. Please try again.');
        }
    }, [extractedItems, addItems, router]);

    // Retry scanning
    const handleRetry = useCallback(() => {
        setErrorMessage('');
        setExtractedItems([]);
        setScanState('camera');
    }, []);

    // Render camera view
    if (scanState === 'camera') {
        return (
            <CameraViewComponent
                mode="receipt"
                onCapture={handleCapture}
                onError={handleCameraError}
            />
        );
    }

    // Render processing state
    if (scanState === 'processing') {
        return (
            <SafeAreaView style={styles.container} edges={['bottom']}>
                <LoadingSpinner message="Processing receipt..." />
                <Text style={styles.processingSubtext}>
                    Our AI is extracting food items from your receipt
                </Text>
            </SafeAreaView>
        );
    }

    // Render error state
    if (scanState === 'error') {
        return (
            <SafeAreaView style={styles.container} edges={['bottom']}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={expiria.colors.statusRedText} />
                    <Text style={styles.errorTitle}>Scan Failed</Text>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                        <Ionicons name="refresh" size={20} color={expiria.colors.canvas} />
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Render confirmation view
    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.confirmContainer}>
                <Text style={styles.confirmTitle}>Confirm Items</Text>
                <Text style={styles.confirmSubtitle}>
                    Review and edit the extracted items before saving
                </Text>

                {extractedItems.map(item => (
                    <View key={item.id} style={styles.itemCard}>
                        <TouchableOpacity
                            style={styles.checkbox}
                            onPress={() => toggleItemSelection(item.id)}
                        >
                            <Ionicons
                                name={item.selected ? 'checkbox' : 'square-outline'}
                                size={24}
                                color={item.selected ? expiria.colors.primaryInk : expiria.colors.textMuted}
                            />
                        </TouchableOpacity>

                        <View style={styles.itemContent}>
                            <TextInput
                                style={styles.itemNameInput}
                                value={item.name}
                                onChangeText={(text) => updateItemName(item.id, text)}
                                placeholder="Item name"
                            />
                            <Text style={styles.itemExpiry}>
                                Expires in ~{item.estimatedExpirationDays} days
                            </Text>
                            <View style={styles.confidenceBadge}>
                                <Text style={styles.confidenceText}>
                                    {Math.round(item.confidence * 100)}% confidence
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => removeItem(item.id)}
                        >
                            <Ionicons name="close-circle" size={24} color={expiria.colors.statusRedText} />
                        </TouchableOpacity>
                    </View>
                ))}

                {extractedItems.length === 0 && (
                    <View style={styles.emptyItems}>
                        <Text style={styles.emptyItemsText}>No items to confirm</Text>
                        <TouchableOpacity style={styles.scanAgainButton} onPress={handleRetry}>
                            <Text style={styles.scanAgainText}>Scan Again</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <View style={styles.bottomActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleRetry}>
                    <Text style={styles.cancelButtonText}>Scan Again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        extractedItems.filter(i => i.selected).length === 0 && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSaveItems}
                    disabled={extractedItems.filter(i => i.selected).length === 0}
                >
                    <Ionicons name="checkmark" size={20} color={expiria.colors.canvas} />
                    <Text style={styles.saveButtonText}>
                        Save ({extractedItems.filter(i => i.selected).length})
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: expiria.colors.primarySurface,
    },
    processingSubtext: {
        textAlign: 'center',
        color: expiria.colors.textMuted,
        fontSize: expiria.typography.sizes.caption + 1,
        marginTop: -60,
        paddingHorizontal: expiria.spacing.lg - 4,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: expiria.spacing.xl,
    },
    errorTitle: {
        fontSize: expiria.typography.sizes.subheading,
        fontWeight: expiria.typography.weights.semibold,
        color: expiria.colors.primaryInk,
        marginTop: expiria.spacing.md,
    },
    errorText: {
        fontSize: expiria.typography.sizes.caption + 1,
        color: expiria.colors.textMuted,
        textAlign: 'center',
        marginTop: expiria.spacing.sm,
        lineHeight: 20,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: expiria.colors.primaryInk,
        paddingHorizontal: expiria.spacing.lg,
        paddingVertical: expiria.spacing.sm + 4,
        borderRadius: expiria.borderRadius.sm,
        marginTop: expiria.spacing.lg,
        gap: expiria.spacing.sm,
    },
    retryButtonText: {
        color: expiria.colors.canvas,
        fontSize: expiria.typography.sizes.body,
        fontWeight: expiria.typography.weights.semibold,
    },
    confirmContainer: {
        flex: 1,
        padding: expiria.spacing.md,
    },
    confirmTitle: {
        fontSize: expiria.typography.sizes.heading - 4,
        fontWeight: expiria.typography.weights.bold,
        color: expiria.colors.primaryInk,
        marginBottom: expiria.spacing.xs,
    },
    confirmSubtitle: {
        fontSize: expiria.typography.sizes.caption + 1,
        color: expiria.colors.textMuted,
        marginBottom: expiria.spacing.lg - 4,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: expiria.colors.secondarySurface,
        borderRadius: expiria.borderRadius.sm + 4,
        padding: expiria.spacing.sm + 4,
        marginBottom: expiria.spacing.sm + 4,
        ...expiria.shadows.soft,
    },
    checkbox: {
        marginRight: expiria.spacing.sm + 4,
    },
    itemContent: {
        flex: 1,
    },
    itemNameInput: {
        fontSize: expiria.typography.sizes.body,
        fontWeight: expiria.typography.weights.semibold,
        color: expiria.colors.primaryInk,
        padding: 0,
        marginBottom: expiria.spacing.xs,
    },
    itemExpiry: {
        fontSize: expiria.typography.sizes.caption,
        color: expiria.colors.textMuted,
        marginBottom: expiria.spacing.xs,
    },
    confidenceBadge: {
        backgroundColor: expiria.colors.border,
        paddingHorizontal: expiria.spacing.sm,
        paddingVertical: 2,
        borderRadius: expiria.borderRadius.sm / 2,
        alignSelf: 'flex-start',
    },
    confidenceText: {
        fontSize: expiria.typography.sizes.small,
        color: expiria.colors.textMuted,
    },
    removeButton: {
        padding: expiria.spacing.xs,
    },
    emptyItems: {
        alignItems: 'center',
        padding: expiria.spacing.xl,
    },
    emptyItemsText: {
        fontSize: expiria.typography.sizes.body,
        color: expiria.colors.textMuted,
        marginBottom: expiria.spacing.md,
    },
    scanAgainButton: {
        paddingHorizontal: expiria.spacing.lg - 4,
        paddingVertical: expiria.spacing.sm + 2,
        backgroundColor: expiria.colors.border,
        borderRadius: expiria.borderRadius.sm,
    },
    scanAgainText: {
        fontSize: expiria.typography.sizes.caption + 1,
        fontWeight: expiria.typography.weights.medium,
        color: expiria.colors.primaryInk,
    },
    bottomActions: {
        flexDirection: 'row',
        padding: expiria.spacing.md,
        gap: expiria.spacing.sm + 4,
        borderTopWidth: expiria.strokes.thin,
        borderTopColor: expiria.colors.border,
        backgroundColor: expiria.colors.secondarySurface,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: expiria.spacing.sm + 6,
        borderRadius: expiria.borderRadius.sm,
        backgroundColor: expiria.colors.border,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: expiria.typography.sizes.body,
        fontWeight: expiria.typography.weights.semibold,
        color: expiria.colors.primaryInk,
    },
    saveButton: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: expiria.spacing.sm + 6,
        borderRadius: expiria.borderRadius.sm,
        backgroundColor: expiria.colors.primaryInk,
        alignItems: 'center',
        justifyContent: 'center',
        gap: expiria.spacing.sm,
    },
    saveButtonDisabled: {
        backgroundColor: expiria.colors.textMuted,
    },
    saveButtonText: {
        fontSize: expiria.typography.sizes.body,
        fontWeight: expiria.typography.weights.semibold,
        color: expiria.colors.canvas,
    },
});
