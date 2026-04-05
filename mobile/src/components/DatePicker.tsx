import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    Pressable,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { toISODateString } from '../utils/dateUtils';
import { expiria } from '../theme';

interface DatePickerProps {
    value: Date;
    onChange: (date: Date) => void;
    minDate?: Date;
    maxDate?: Date;
    label?: string;
}

type InputMode = 'calendar' | 'manual';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Default reasonable date range: 1 year in the past to 2 years in the future
const getDefaultMinDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date;
};

const getDefaultMaxDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 2);
    return date;
};

export function DatePicker({
    value,
    onChange,
    minDate = getDefaultMinDate(),
    maxDate = getDefaultMaxDate(),
    label,
}: DatePickerProps) {

    const [modalVisible, setModalVisible] = useState(false);
    const [inputMode, setInputMode] = useState<InputMode>('calendar');
    const [viewDate, setViewDate] = useState(new Date(value));
    const [manualInput, setManualInput] = useState('');
    const [inputError, setInputError] = useState<string | null>(null);

    const formatDisplayDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const openModal = () => {
        setViewDate(new Date(value));
        setManualInput(toISODateString(value));
        setInputError(null);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setInputError(null);
    };

    const validateDate = useCallback((date: Date): string | null => {
        if (isNaN(date.getTime())) {
            return 'Invalid date format';
        }
        if (date < minDate) {
            return `Date must be after ${formatDisplayDate(minDate)}`;
        }
        if (date > maxDate) {
            return `Date must be before ${formatDisplayDate(maxDate)}`;
        }
        return null;
    }, [minDate, maxDate]);

    const handleDateSelect = (day: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const error = validateDate(newDate);
        if (!error) {
            onChange(newDate);
            closeModal();
        }
    };

    const handleManualSubmit = () => {
        const parsed = new Date(manualInput);
        const error = validateDate(parsed);
        if (error) {
            setInputError(error);
            return;
        }
        onChange(parsed);
        closeModal();
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setViewDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(newDate.getMonth() - 1);
            } else {
                newDate.setMonth(newDate.getMonth() + 1);
            }
            return newDate;
        });
    };

    const getDaysInMonth = (year: number, month: number): number => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number): number => {
        return new Date(year, month, 1).getDay();
    };

    const isDateDisabled = (day: number): boolean => {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        return date < minDate || date > maxDate;
    };

    const isSelectedDate = (day: number): boolean => {
        return (
            value.getDate() === day &&
            value.getMonth() === viewDate.getMonth() &&
            value.getFullYear() === viewDate.getFullYear()
        );
    };

    const isToday = (day: number): boolean => {
        const today = new Date();
        return (
            today.getDate() === day &&
            today.getMonth() === viewDate.getMonth() &&
            today.getFullYear() === viewDate.getFullYear()
        );
    };

    const renderCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days: (number | null)[] = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return (
            <View style={styles.calendar}>
                <View style={styles.calendarHeader}>
                    <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
                        <Ionicons name="chevron-back" size={24} color={expiria.colors.primaryInk} />
                    </TouchableOpacity>
                    <Text style={styles.monthYearText}>
                        {MONTHS[month]} {year}
                    </Text>
                    <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
                        <Ionicons name="chevron-forward" size={24} color={expiria.colors.primaryInk} />
                    </TouchableOpacity>
                </View>

                <View style={styles.weekDaysRow}>
                    {DAYS_OF_WEEK.map(day => (
                        <Text key={day} style={styles.weekDayText}>{day}</Text>
                    ))}
                </View>

                <View style={styles.daysGrid}>
                    {days.map((day, index) => (
                        <View key={index} style={styles.dayCell}>
                            {day !== null ? (
                                <TouchableOpacity
                                    style={[
                                        styles.dayButton,
                                        isSelectedDate(day) && styles.selectedDay,
                                        isToday(day) && !isSelectedDate(day) && styles.todayDay,
                                        isDateDisabled(day) && styles.disabledDay,
                                    ]}
                                    onPress={() => handleDateSelect(day)}
                                    disabled={isDateDisabled(day)}
                                >
                                    <Text
                                        style={[
                                            styles.dayText,
                                            isSelectedDate(day) && styles.selectedDayText,
                                            isDateDisabled(day) && styles.disabledDayText,
                                        ]}
                                    >
                                        {day}
                                    </Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderManualInput = () => (
        <View style={styles.manualInputContainer}>
            <Text style={styles.manualInputLabel}>Enter date (YYYY-MM-DD):</Text>
            <TextInput
                style={[styles.manualInput, inputError && styles.manualInputError]}
                value={manualInput}
                onChangeText={(text) => {
                    setManualInput(text);
                    setInputError(null);
                }}
                placeholder="2025-12-31"
                placeholderTextColor={expiria.colors.textMuted}
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
            />
            {inputError && <Text style={styles.errorText}>{inputError}</Text>}
            <TouchableOpacity style={styles.submitButton} onPress={handleManualSubmit}>
                <Text style={styles.submitButtonText}>Set Date</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TouchableOpacity style={styles.inputButton} onPress={openModal}>
                <Ionicons name="calendar-outline" size={20} color={expiria.colors.textMuted} />
                <Text style={styles.inputText}>{formatDisplayDate(value)}</Text>
                <Ionicons name="chevron-down" size={20} color={expiria.colors.textMuted} />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={closeModal}
            >
                <Pressable style={styles.modalOverlay} onPress={closeModal}>
                    <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Date</Text>
                            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={expiria.colors.primaryInk} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modeToggle}>
                            <TouchableOpacity
                                style={[styles.modeButton, inputMode === 'calendar' && styles.modeButtonActive]}
                                onPress={() => setInputMode('calendar')}
                            >
                                <Ionicons
                                    name="calendar"
                                    size={18}
                                    color={inputMode === 'calendar' ? expiria.colors.canvas : expiria.colors.textMuted}
                                />
                                <Text style={[styles.modeButtonText, inputMode === 'calendar' && styles.modeButtonTextActive]}>
                                    Calendar
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modeButton, inputMode === 'manual' && styles.modeButtonActive]}
                                onPress={() => setInputMode('manual')}
                            >
                                <Ionicons
                                    name="create"
                                    size={18}
                                    color={inputMode === 'manual' ? expiria.colors.canvas : expiria.colors.textMuted}
                                />
                                <Text style={[styles.modeButtonText, inputMode === 'manual' && styles.modeButtonTextActive]}>
                                    Manual
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {inputMode === 'calendar' ? renderCalendar() : renderManualInput()}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        marginBottom: expiria.spacing.md,
    },
    label: {
        fontSize: expiria.typography.sizes.caption + 1,
        fontWeight: expiria.typography.weights.medium,
        color: expiria.colors.primaryInk,
        marginBottom: expiria.spacing.sm,
    },
    inputButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: expiria.colors.secondarySurface,
        borderWidth: expiria.strokes.thin,
        borderColor: expiria.colors.border,
        borderRadius: expiria.borderRadius.sm,
        paddingHorizontal: expiria.spacing.sm + 4,
        paddingVertical: expiria.spacing.sm + 4,
        gap: expiria.spacing.sm,
    },
    inputText: {
        flex: 1,
        fontSize: expiria.typography.sizes.body,
        color: expiria.colors.primaryInk,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: expiria.spacing.lg - 4,
    },
    modalContent: {
        backgroundColor: expiria.colors.secondarySurface,
        borderRadius: expiria.borderRadius.md,
        width: '100%',
        maxWidth: 360,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: expiria.spacing.md,
        paddingVertical: expiria.spacing.sm + 4,
        borderBottomWidth: expiria.strokes.thin,
        borderBottomColor: expiria.colors.border,
    },
    modalTitle: {
        fontSize: expiria.typography.sizes.subheading - 2,
        fontWeight: expiria.typography.weights.semibold,
        color: expiria.colors.primaryInk,
    },
    closeButton: {
        padding: expiria.spacing.xs,
    },
    modeToggle: {
        flexDirection: 'row',
        padding: expiria.spacing.sm + 4,
        gap: expiria.spacing.sm,
    },
    modeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: expiria.spacing.sm + 2,
        paddingHorizontal: expiria.spacing.sm + 4,
        borderRadius: expiria.borderRadius.sm,
        backgroundColor: expiria.colors.canvas,
        gap: expiria.spacing.xs + 2,
    },
    modeButtonActive: {
        backgroundColor: expiria.colors.primaryInk,
    },
    modeButtonText: {
        fontSize: expiria.typography.sizes.caption + 1,
        fontWeight: expiria.typography.weights.medium,
        color: expiria.colors.textMuted,
    },
    modeButtonTextActive: {
        color: expiria.colors.canvas,
    },
    modalBody: {
        padding: expiria.spacing.md,
    },
    calendar: {
        width: '100%',
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: expiria.spacing.md,
    },
    navButton: {
        padding: expiria.spacing.sm,
    },
    monthYearText: {
        fontSize: expiria.typography.sizes.body,
        fontWeight: expiria.typography.weights.semibold,
        color: expiria.colors.primaryInk,
    },
    weekDaysRow: {
        flexDirection: 'row',
        marginBottom: expiria.spacing.sm,
    },
    weekDayText: {
        flex: 1,
        textAlign: 'center',
        fontSize: expiria.typography.sizes.small + 1,
        fontWeight: expiria.typography.weights.medium,
        color: expiria.colors.textMuted,
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        padding: 2,
    },
    dayButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: expiria.borderRadius.sm,
    },
    selectedDay: {
        backgroundColor: expiria.colors.primaryInk,
    },
    todayDay: {
        backgroundColor: expiria.colors.border,
    },
    disabledDay: {
        opacity: 0.3,
    },
    dayText: {
        fontSize: expiria.typography.sizes.caption + 1,
        color: expiria.colors.primaryInk,
    },
    selectedDayText: {
        color: expiria.colors.canvas,
        fontWeight: expiria.typography.weights.semibold,
    },
    disabledDayText: {
        color: expiria.colors.textMuted,
    },
    manualInputContainer: {
        padding: expiria.spacing.sm,
    },
    manualInputLabel: {
        fontSize: expiria.typography.sizes.caption + 1,
        fontWeight: expiria.typography.weights.medium,
        color: expiria.colors.primaryInk,
        marginBottom: expiria.spacing.sm,
    },
    manualInput: {
        backgroundColor: expiria.colors.canvas,
        borderWidth: expiria.strokes.thin,
        borderColor: expiria.colors.border,
        borderRadius: expiria.borderRadius.sm,
        paddingHorizontal: expiria.spacing.sm + 4,
        paddingVertical: expiria.spacing.sm + 4,
        fontSize: expiria.typography.sizes.body,
        color: expiria.colors.primaryInk,
    },
    manualInputError: {
        borderColor: expiria.colors.statusRedText,
    },
    errorText: {
        fontSize: expiria.typography.sizes.small + 1,
        color: expiria.colors.statusRedText,
        marginTop: expiria.spacing.xs,
    },
    submitButton: {
        backgroundColor: expiria.colors.primaryInk,
        borderRadius: expiria.borderRadius.sm,
        paddingVertical: expiria.spacing.sm + 4,
        alignItems: 'center',
        marginTop: expiria.spacing.md,
    },
    submitButtonText: {
        fontSize: expiria.typography.sizes.body,
        fontWeight: expiria.typography.weights.semibold,
        color: expiria.colors.canvas,
    },
});
