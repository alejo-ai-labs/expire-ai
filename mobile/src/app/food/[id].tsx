import { useState, useCallback, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DatePicker } from '../../components/DatePicker';
import { ExpirationBadge } from '../../components/ExpirationBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { CameraViewComponent } from '../../components/CameraView';
import { useFoodItems } from '../../hooks/useFoodItems';
import { CameraError } from '../../hooks/useCamera';
import { formatDate, calculateDaysUntilExpiration, getTrafficLightStatus } from '../../utils/dateUtils';
import * as api from '../../services/api';
import { expiria } from '../../theme';

export default function FoodDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { items, isLoading, updateItem, deleteItem } = useFoodItems();

    const [showLabelScanner, setShowLabelScanner] = useState(false);
    const [isProcessingLabel, setIsProcessingLabel] = useState(false);
    const [expirationDate, setExpirationDate] = useState<Date>(new Date());
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Find the current item
    const item = items.find(i => i.id === id);

    // Initialize expiration date when item loads
    useEffect(() => {
        if (item) {
            setExpirationDate(new Date(item.expirationDate));
        }
    }, [item?.expirationDate]);

    // Handle expiration date change
    const handleDateChange = useCallback((date: Date) => {
        setExpirationDate(date);
        setHasChanges(true);
    }, []);

    // Save changes
    const handleSave = useCallback(async () => {
        if (!item || !hasChanges) return;

        setIsSaving(true);
        try {
            await updateItem(item.id, {
                expirationDate: expirationDate.toISOString(),
                isEstimated: false, // Mark as user-set when manually changed
            });
            setHasChanges(false);
            Alert.alert('Saved', 'Expiration date updated successfully.');
        } catch (err) {
            Alert.alert('Error', 'Failed to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }, [item, hasChanges, expirationDate, updateItem]);

    // Handle delete
    const handleDelete = useCallback(() => {
        if (!item) return;

        Alert.alert(
            'Delete Item',
            `Are you sure you want to delete "${item.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteItem(item.id);
                            router.back();
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete item. Please try again.');
                        }
                    },
                },
            ]
        );
    }, [item, deleteItem, router]);

    // Handle label scan
    const handleLabelCapture = useCallback(async (imageUri: string) => {
        setIsProcessingLabel(true);

        try {
            // Convert image URI to base64 for API
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    const base64Data = result.split(',')[1] || result;
                    resolve(base64Data);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            // Call the scan label API
            const scanResult = await api.scanLabel(base64);

            if (!scanResult.expirationDate) {
                Alert.alert(
                    'Date Not Found',
                    'Could not find an expiration date on the label. Please enter it manually.'
                );
                setShowLabelScanner(false);
                return;
            }

            const extractedDate = new Date(scanResult.expirationDate);
            setExpirationDate(extractedDate);
            setHasChanges(true);
            setShowLabelScanner(false);

            Alert.alert(
                'Date Extracted',
                `Expiration date set to ${formatDate(extractedDate)} (${Math.round(scanResult.confidence * 100)}% confidence). Don't forget to save your changes.`
            );
        } catch (err) {
            const message = err instanceof api.ApiClientError
                ? err.message
                : 'Failed to extract date from label. Please try again or enter manually.';
            Alert.alert('Error', message);
        } finally {
            setIsProcessingLabel(false);
        }
    }, []);

    // Handle camera error
    const handleCameraError = useCallback((error: CameraError) => {
        setShowLabelScanner(false);
        Alert.alert('Camera Error', error.message);
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['bottom']}>
                <LoadingSpinner message="Loading item details..." />
            </SafeAreaView>
        );
    }

    // Item not found
    if (!item) {
        return (
            <SafeAreaView style={styles.container} edges={['bottom']}>
                <View style={styles.notFoundContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={expiria.colors.textMuted} />
                    <Text style={styles.notFoundTitle}>Item Not Found</Text>
                    <Text style={styles.notFoundText}>
                        This food item may have been deleted.
                    </Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const daysUntilExpiration = calculateDaysUntilExpiration(expirationDate);
    const status = getTrafficLightStatus(daysUntilExpiration);

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {/* Item Name */}
                <View style={styles.header}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <ExpirationBadge status={status} daysUntilExpiration={daysUntilExpiration} />
                </View>

                {/* Info Cards */}
                <View style={styles.infoSection}>
                    <View style={styles.infoCard}>
                        <Ionicons name="cart-outline" size={24} color={expiria.colors.primaryInk} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Purchase Date</Text>
                            <Text style={styles.infoValue}>{formatDate(item.purchaseDate)}</Text>
                        </View>
                    </View>

                    <View style={styles.infoCard}>
                        <Ionicons name="calendar-outline" size={24} color={expiria.colors.primaryInk} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Added On</Text>
                            <Text style={styles.infoValue}>{formatDate(item.createdAt)}</Text>
                        </View>
                    </View>

                    {item.isEstimated && (
                        <View style={styles.estimatedBanner}>
                            <Ionicons name="information-circle-outline" size={20} color={expiria.colors.statusYellowText} />
                            <Text style={styles.estimatedText}>
                                Expiration date is an AI estimate. Scan the label or edit manually for accuracy.
                            </Text>
                        </View>
                    )}
                </View>

                {/* Expiration Date Editor */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Expiration Date</Text>
                    <DatePicker
                        value={expirationDate}
                        onChange={handleDateChange}
                        label="Select expiration date"
                    />

                    <TouchableOpacity
                        style={styles.scanLabelButton}
                        onPress={() => setShowLabelScanner(true)}
                    >
                        <Ionicons name="camera-outline" size={20} color={expiria.colors.primaryInk} />
                        <Text style={styles.scanLabelText}>Scan Product Label</Text>
                    </TouchableOpacity>
                </View>

                {/* Save Button */}
                {hasChanges && (
                    <TouchableOpacity
                        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <Text style={styles.saveButtonText}>Saving...</Text>
                        ) : (
                            <>
                                <Ionicons name="checkmark" size={20} color={expiria.colors.canvas} />
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* Delete Button */}
            <View style={styles.bottomActions}>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Ionicons name="trash-outline" size={20} color={expiria.colors.statusRedText} />
                    <Text style={styles.deleteButtonText}>Delete Item</Text>
                </TouchableOpacity>
            </View>

            {/* Label Scanner Modal */}
            <Modal
                visible={showLabelScanner}
                animationType="slide"
                presentationStyle="fullScreen"
            >
                {isProcessingLabel ? (
                    <SafeAreaView style={styles.processingContainer}>
                        <LoadingSpinner message="Extracting expiration date..." />
                    </SafeAreaView>
                ) : (
                    <CameraViewComponent
                        mode="label"
                        onCapture={handleLabelCapture}
                        onError={handleCameraError}
                        onCancel={() => setShowLabelScanner(false)}
                    />
                )}
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: expiria.colors.primarySurface,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: expiria.spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: expiria.spacing.lg,
    },
    itemName: {
        fontSize: expiria.typography.sizes.heading,
        fontWeight: expiria.typography.weights.bold,
        color: expiria.colors.primaryInk,
        flex: 1,
        marginRight: expiria.spacing.sm + 4,
    },
    infoSection: {
        marginBottom: expiria.spacing.lg,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: expiria.colors.secondarySurface,
        borderRadius: expiria.borderRadius.sm + 4,
        padding: expiria.spacing.md,
        marginBottom: expiria.spacing.sm + 4,
        ...expiria.shadows.soft,
    },
    infoContent: {
        marginLeft: expiria.spacing.sm + 4,
    },
    infoLabel: {
        fontSize: expiria.typography.sizes.small + 1,
        color: expiria.colors.textMuted,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: expiria.typography.sizes.body,
        fontWeight: expiria.typography.weights.semibold,
        color: expiria.colors.primaryInk,
    },
    estimatedBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: expiria.colors.statusYellowBg,
        borderRadius: expiria.borderRadius.sm,
        padding: expiria.spacing.sm + 4,
        gap: expiria.spacing.sm,
    },
    estimatedText: {
        flex: 1,
        fontSize: expiria.typography.sizes.caption,
        color: expiria.colors.statusYellowText,
        lineHeight: 18,
    },
    section: {
        marginBottom: expiria.spacing.lg,
    },
    sectionTitle: {
        fontSize: expiria.typography.sizes.subheading - 2,
        fontWeight: expiria.typography.weights.semibold,
        color: expiria.colors.primaryInk,
        marginBottom: expiria.spacing.sm + 4,
    },
    scanLabelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: expiria.colors.canvas,
        borderWidth: expiria.strokes.thin,
        borderColor: expiria.colors.primaryInk,
        borderRadius: expiria.borderRadius.sm,
        paddingVertical: expiria.spacing.sm + 4,
        gap: expiria.spacing.sm,
    },
    scanLabelText: {
        fontSize: expiria.typography.sizes.body,
        fontWeight: expiria.typography.weights.medium,
        color: expiria.colors.primaryInk,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: expiria.colors.primaryInk,
        borderRadius: expiria.borderRadius.sm,
        paddingVertical: expiria.spacing.sm + 6,
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
    bottomActions: {
        padding: expiria.spacing.md,
        borderTopWidth: expiria.strokes.thin,
        borderTopColor: expiria.colors.border,
        backgroundColor: expiria.colors.secondarySurface,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: expiria.colors.statusRedBg,
        borderWidth: expiria.strokes.thin,
        borderColor: expiria.colors.statusRedBg,
        borderRadius: expiria.borderRadius.sm,
        paddingVertical: expiria.spacing.sm + 4,
        gap: expiria.spacing.sm,
    },
    deleteButtonText: {
        fontSize: expiria.typography.sizes.body,
        fontWeight: expiria.typography.weights.medium,
        color: expiria.colors.statusRedText,
    },
    notFoundContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: expiria.spacing.xl,
    },
    notFoundTitle: {
        fontSize: expiria.typography.sizes.subheading,
        fontWeight: expiria.typography.weights.semibold,
        color: expiria.colors.primaryInk,
        marginTop: expiria.spacing.md,
    },
    notFoundText: {
        fontSize: 14,
        color: expiria.colors.textMuted,
        textAlign: 'center',
        marginTop: expiria.spacing.sm,
    },
    backButton: {
        marginTop: expiria.spacing.lg,
        paddingHorizontal: expiria.spacing.lg,
        paddingVertical: expiria.spacing.sm + 4,
        backgroundColor: expiria.colors.primaryInk,
        borderRadius: expiria.borderRadius.sm,
    },
    backButtonText: {
        fontSize: expiria.typography.sizes.body,
        fontWeight: expiria.typography.weights.semibold,
        color: expiria.colors.canvas,
    },
    processingContainer: {
        flex: 1,
        backgroundColor: '#000000',
    },
});
