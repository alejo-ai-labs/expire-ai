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
import { useThemeColors } from '../../context/ThemeContext';

export default function FoodDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { items, isLoading, updateItem, deleteItem } = useFoodItems();
    const colors = useThemeColors();

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
            <SafeAreaView style={[styles.container, { backgroundColor: colors.primarySurface }]} edges={['bottom']}>
                <LoadingSpinner message="Loading item details..." />
            </SafeAreaView>
        );
    }

    // Item not found
    if (!item) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.primarySurface }]} edges={['bottom']}>
                <View style={styles.notFoundContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={colors.textMuted} />
                    <Text style={[styles.notFoundTitle, { color: colors.primaryInk }]}>Item Not Found</Text>
                    <Text style={[styles.notFoundText, { color: colors.textMuted }]}>
                        This food item may have been deleted.
                    </Text>
                    <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.primaryInk }]} onPress={() => router.back()}>
                        <Text style={[styles.backButtonText, { color: colors.canvas }]}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const daysUntilExpiration = calculateDaysUntilExpiration(expirationDate);
    const status = getTrafficLightStatus(daysUntilExpiration);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.primarySurface }]} edges={['bottom']}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {/* Item Name */}
                <View style={styles.header}>
                    <Text style={[styles.itemName, { color: colors.primaryInk }]}>{item.name}</Text>
                    <ExpirationBadge status={status} daysUntilExpiration={daysUntilExpiration} />
                </View>

                {/* Info Cards */}
                <View style={styles.infoSection}>
                    <View style={[styles.infoCard, { backgroundColor: colors.secondarySurface }]}>
                        <Ionicons name="cart-outline" size={24} color={colors.primaryInk} />
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Purchase Date</Text>
                            <Text style={[styles.infoValue, { color: colors.primaryInk }]}>{formatDate(item.purchaseDate)}</Text>
                        </View>
                    </View>

                    <View style={[styles.infoCard, { backgroundColor: colors.secondarySurface }]}>
                        <Ionicons name="calendar-outline" size={24} color={colors.primaryInk} />
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Added On</Text>
                            <Text style={[styles.infoValue, { color: colors.primaryInk }]}>{formatDate(item.createdAt)}</Text>
                        </View>
                    </View>

                    {item.isEstimated && (
                        <View style={[styles.estimatedBanner, { backgroundColor: colors.statusYellowBg }]}>
                            <Ionicons name="information-circle-outline" size={20} color={colors.statusYellowText} />
                            <Text style={[styles.estimatedText, { color: colors.statusYellowText }]}>
                                Expiration date is an AI estimate. Scan the label or edit manually for accuracy.
                            </Text>
                        </View>
                    )}
                </View>

                {/* Expiration Date Editor */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.primaryInk }]}>Expiration Date</Text>
                    <DatePicker
                        value={expirationDate}
                        onChange={handleDateChange}
                        label="Select expiration date"
                    />

                    <TouchableOpacity
                        style={[styles.scanLabelButton, { backgroundColor: colors.canvas, borderColor: colors.primaryInk }]}
                        onPress={() => setShowLabelScanner(true)}
                    >
                        <Ionicons name="camera-outline" size={20} color={colors.primaryInk} />
                        <Text style={[styles.scanLabelText, { color: colors.primaryInk }]}>Scan Product Label</Text>
                    </TouchableOpacity>
                </View>

                {/* Save Button */}
                {hasChanges && (
                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: colors.primaryInk }, isSaving && { backgroundColor: colors.textMuted }]}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <Text style={[styles.saveButtonText, { color: colors.canvas }]}>Saving...</Text>
                        ) : (
                            <>
                                <Ionicons name="checkmark" size={20} color={colors.canvas} />
                                <Text style={[styles.saveButtonText, { color: colors.canvas }]}>Save Changes</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* Delete Button */}
            <View style={[styles.bottomActions, { borderTopColor: colors.border, backgroundColor: colors.secondarySurface }]}>
                <TouchableOpacity style={[styles.deleteButton, { backgroundColor: colors.statusRedBg, borderColor: colors.statusRedBg }]} onPress={handleDelete}>
                    <Ionicons name="trash-outline" size={20} color={colors.statusRedText} />
                    <Text style={[styles.deleteButtonText, { color: colors.statusRedText }]}>Delete Item</Text>
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
        flex: 1,
        marginRight: expiria.spacing.sm + 4,
    },
    infoSection: {
        marginBottom: expiria.spacing.lg,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
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
        marginBottom: 2,
    },
    infoValue: {
        fontSize: expiria.typography.sizes.body,
        fontWeight: expiria.typography.weights.semibold,
    },
    estimatedBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderRadius: expiria.borderRadius.sm,
        padding: expiria.spacing.sm + 4,
        gap: expiria.spacing.sm,
    },
    estimatedText: {
        flex: 1,
        fontSize: expiria.typography.sizes.caption,
        lineHeight: 18,
    },
    section: {
        marginBottom: expiria.spacing.lg,
    },
    sectionTitle: {
        fontSize: expiria.typography.sizes.subheading - 2,
        fontWeight: expiria.typography.weights.semibold,
        marginBottom: expiria.spacing.sm + 4,
    },
    scanLabelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: expiria.strokes.thin,
        borderRadius: expiria.borderRadius.sm,
        paddingVertical: expiria.spacing.sm + 4,
        gap: expiria.spacing.sm,
    },
    scanLabelText: {
        fontSize: expiria.typography.sizes.body,
        fontWeight: expiria.typography.weights.medium,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: expiria.borderRadius.sm,
        paddingVertical: expiria.spacing.sm + 6,
        gap: expiria.spacing.sm,
    },
    saveButtonText: {
        fontSize: expiria.typography.sizes.body,
        fontWeight: expiria.typography.weights.semibold,
    },
    bottomActions: {
        padding: expiria.spacing.md,
        borderTopWidth: expiria.strokes.thin,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: expiria.strokes.thin,
        borderRadius: expiria.borderRadius.sm,
        paddingVertical: expiria.spacing.sm + 4,
        gap: expiria.spacing.sm,
    },
    deleteButtonText: {
        fontSize: expiria.typography.sizes.body,
        fontWeight: expiria.typography.weights.medium,
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
        marginTop: expiria.spacing.md,
    },
    notFoundText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: expiria.spacing.sm,
    },
    backButton: {
        marginTop: expiria.spacing.lg,
        paddingHorizontal: expiria.spacing.lg,
        paddingVertical: expiria.spacing.sm + 4,
        borderRadius: expiria.borderRadius.sm,
    },
    backButtonText: {
        fontSize: expiria.typography.sizes.body,
        fontWeight: expiria.typography.weights.semibold,
    },
    processingContainer: {
        flex: 1,
        backgroundColor: '#000000',
    },
});
