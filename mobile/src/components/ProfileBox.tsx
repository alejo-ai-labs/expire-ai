import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '../types';
import { useThemeColors } from '../context/ThemeContext';
import { expiria } from '../theme';
import { DatePicker } from './DatePicker';
import { CountryPicker } from './CountryPicker';
import { toISODateString } from '../utils/dateUtils';

interface ProfileBoxProps {
  profile: UserProfile | null;
  onUpdateField: (field: keyof UserProfile, value: string | number) => void;
}

// Text-based fields only — birthday, country, weight, height get special treatment
interface TextFieldConfig {
  key: keyof UserProfile;
  label: string;
  keyboard: 'default' | 'email-address';
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const TEXT_FIELDS: TextFieldConfig[] = [
  { key: 'name', label: 'Name', keyboard: 'default', placeholder: 'Enter name', icon: 'person-outline' },
  { key: 'lastName', label: 'Last Name', keyboard: 'default', placeholder: 'Enter last name', icon: 'person-outline' },
  { key: 'email', label: 'Email', keyboard: 'email-address', placeholder: 'Enter email', icon: 'mail-outline' },
];

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

const BIRTHDAY_MIN = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 120);
  return d;
})();

const BIRTHDAY_MAX = new Date();

const WEIGHT_MIN = 20;
const WEIGHT_MAX = 250;
const HEIGHT_MIN = 80;
const HEIGHT_MAX = 250;

export function ProfileBox({ profile, onUpdateField }: ProfileBoxProps) {
  const colors = useThemeColors();
  const [editingField, setEditingField] = useState<keyof UserProfile | null>(null);
  const [editValue, setEditValue] = useState('');
  // Ref tracks the latest typed value so onBlur always has the current text
  const editValueRef = useRef('');

  const getDisplayValue = (key: keyof UserProfile): string => {
    if (!profile) return '';
    const val = profile[key];
    if (val === 0 && (key === 'weight' || key === 'height')) return '';
    return String(val ?? '');
  };

  const startEditing = (field: TextFieldConfig) => {
    const display = getDisplayValue(field.key);
    setEditingField(field.key);
    setEditValue(display);
    editValueRef.current = display;
  };

  const handleChangeText = (text: string) => {
    setEditValue(text);
    editValueRef.current = text;
  };

  const commitEdit = useCallback(
    (field: TextFieldConfig) => {
      setEditingField(null);
      const trimmed = editValueRef.current.trim();
      onUpdateField(field.key, trimmed);
    },
    [onUpdateField],
  );

  // Birthday helpers
  const birthdayDate = profile?.birthday
    ? new Date(profile.birthday)
    : new Date(2000, 0, 1);

  const handleBirthdayChange = (date: Date) => {
    onUpdateField('birthday', toISODateString(date));
  };

  // Slider helpers
  const weightValue = profile?.weight ?? 0;
  const heightValue = profile?.height ?? 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.secondarySurface }]}>
      {/* Text fields */}
      {TEXT_FIELDS.map((field) => (
        <View key={field.key} style={styles.row}>
          <View style={styles.labelRow}>
            <Ionicons name={field.icon} size={14} color={colors.textMuted} />
            <Text style={[styles.label, { color: colors.textMuted }]}>
              {field.label}
            </Text>
          </View>
          {editingField === field.key ? (
            <TextInput
              style={[
                styles.input,
                { color: colors.primaryInk, borderBottomColor: colors.accent },
              ]}
              value={editValue}
              onChangeText={handleChangeText}
              onBlur={() => commitEdit(field)}
              onSubmitEditing={() => commitEdit(field)}
              keyboardType={field.keyboard}
              autoFocus
              placeholder={field.placeholder}
              placeholderTextColor={colors.textMuted}
              returnKeyType="done"
            />
          ) : (
            <TouchableOpacity
              style={styles.valueTouchable}
              onPress={() => startEditing(field)}
              activeOpacity={0.6}
            >
              <Text
                style={[
                  styles.value,
                  { color: colors.primaryInk },
                  !getDisplayValue(field.key) && { color: colors.textMuted },
                ]}
                numberOfLines={1}
              >
                {getDisplayValue(field.key) || field.placeholder}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {/* Gender — option selector */}
      <View style={styles.row}>
        <View style={styles.labelRow}>
          <Ionicons name="male-female-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.label, { color: colors.textMuted }]}>Gender</Text>
        </View>
        <GenderPicker
          value={profile?.gender ?? ''}
          onChange={(g) => onUpdateField('gender', g)}
        />
      </View>

      {/* Birthday — calendar picker */}
      <View style={styles.row}>
        <View style={styles.labelRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.label, { color: colors.textMuted }]}>Birthday</Text>
        </View>
        <DatePicker
          value={birthdayDate}
          onChange={handleBirthdayChange}
          minDate={BIRTHDAY_MIN}
          maxDate={BIRTHDAY_MAX}
        />
      </View>

      {/* Country — searchable picker */}
      <View style={styles.row}>
        <View style={styles.labelRow}>
          <Ionicons name="globe-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.label, { color: colors.textMuted }]}>Country</Text>
        </View>
        <CountryPicker
          value={profile?.country ?? ''}
          onChange={(c) => onUpdateField('country', c)}
        />
      </View>

      {/* Weight — slider */}
      <View style={styles.row}>
        <View style={styles.labelRow}>
          <Ionicons name="fitness-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.label, { color: colors.textMuted }]}>
            Weight (kg)
          </Text>
        </View>
        <SliderRow
          value={weightValue}
          min={WEIGHT_MIN}
          max={WEIGHT_MAX}
          step={1}
          unit="kg"
          onSlidingComplete={(v) => onUpdateField('weight', v)}
        />
      </View>

      {/* Height — slider */}
      <View style={styles.row}>
        <View style={styles.labelRow}>
          <Ionicons name="resize-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.label, { color: colors.textMuted }]}>
            Height (cm)
          </Text>
        </View>
        <SliderRow
          value={heightValue}
          min={HEIGHT_MIN}
          max={HEIGHT_MAX}
          step={1}
          unit="cm"
          onSlidingComplete={(v) => onUpdateField('height', v)}
        />
      </View>
    </View>
  );
}

// ─── Inline GenderPicker component ────────────────────────────────────────────

interface GenderPickerProps {
  value: string;
  onChange: (gender: string) => void;
}

function GenderPicker({ value, onChange }: GenderPickerProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.genderRow}>
      {GENDER_OPTIONS.map((option) => {
        const selected = value === option;
        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.genderChip,
              { borderColor: colors.border },
              selected && { backgroundColor: colors.accent, borderColor: colors.accent },
            ]}
            onPress={() => onChange(option)}
            activeOpacity={0.6}
          >
            <Text
              style={[
                styles.genderChipText,
                { color: colors.primaryInk },
                selected && { color: colors.canvas },
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Inline SliderRow component ───────────────────────────────────────────────

interface SliderRowProps {
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onSlidingComplete: (value: number) => void;
}

function SliderRow({ value, min, max, step, unit, onSlidingComplete }: SliderRowProps) {
  const colors = useThemeColors();
  const [localValue, setLocalValue] = useState(value || min);

  // Sync when external value changes (e.g. profile loaded)
  React.useEffect(() => {
    if (value >= min) setLocalValue(value);
  }, [value, min]);

  return (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <Text style={[styles.sliderValue, { color: colors.primaryInk }]}>
          {localValue} {unit}
        </Text>
      </View>
      <View style={styles.sliderTrackWrap}>
        <Text style={[styles.sliderBound, { color: colors.textMuted }]}>{min}</Text>
        <View style={styles.sliderFlex}>
          <CustomSlider
            value={localValue}
            min={min}
            max={max}
            step={step}
            onValueChange={setLocalValue}
            onSlidingComplete={(v) => onSlidingComplete(v)}
            trackColor={colors.border}
            activeTrackColor={colors.accent}
            thumbColor={colors.accent}
          />
        </View>
        <Text style={[styles.sliderBound, { color: colors.textMuted }]}>{max}</Text>
      </View>
    </View>
  );
}

// ─── Pure RN Slider (no external dep) ─────────────────────────────────────────

interface CustomSliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onValueChange: (v: number) => void;
  onSlidingComplete: (v: number) => void;
  trackColor: string;
  activeTrackColor: string;
  thumbColor: string;
}

function CustomSlider({
  value,
  min,
  max,
  step,
  onValueChange,
  onSlidingComplete,
  trackColor,
  activeTrackColor,
  thumbColor,
}: CustomSliderProps) {
  const trackRef = useRef<View>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  const fraction = trackWidth > 0 ? (value - min) / (max - min) : 0;
  const thumbLeft = fraction * trackWidth;

  const snapToStep = (raw: number) => {
    const clamped = Math.min(max, Math.max(min, raw));
    return Math.round(clamped / step) * step;
  };

  const handleTouch = (pageX: number) => {
    trackRef.current?.measure((_x, _y, width, _h, px) => {
      const ratio = (pageX - px) / width;
      const raw = min + ratio * (max - min);
      onValueChange(snapToStep(raw));
    });
  };

  return (
    <View
      ref={trackRef}
      style={[styles.customTrack, { backgroundColor: trackColor }]}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={(e) => handleTouch(e.nativeEvent.pageX)}
      onResponderMove={(e) => handleTouch(e.nativeEvent.pageX)}
      onResponderRelease={() => onSlidingComplete(value)}
    >
      <View
        style={[
          styles.customTrackActive,
          { width: thumbLeft, backgroundColor: activeTrackColor },
        ]}
      />
      <View
        style={[
          styles.customThumb,
          {
            left: thumbLeft - 12,
            backgroundColor: thumbColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: expiria.borderRadius.lg,
    padding: expiria.spacing.md,
  },
  row: {
    paddingVertical: expiria.spacing.sm + 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: expiria.spacing.xs,
    marginBottom: expiria.spacing.xs,
  },
  label: {
    fontSize: expiria.typography.sizes.caption,
    fontWeight: expiria.typography.weights.medium,
  },
  value: {
    fontSize: expiria.typography.sizes.body,
    fontWeight: expiria.typography.weights.regular,
  },
  valueTouchable: {
    minHeight: 24,
    justifyContent: 'center',
  },
  input: {
    fontSize: expiria.typography.sizes.body,
    fontWeight: expiria.typography.weights.regular,
    borderBottomWidth: 1,
    paddingVertical: 2,
    minHeight: 24,
  },
  // Gender chip styles
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: expiria.spacing.sm,
  },
  genderChip: {
    paddingHorizontal: expiria.spacing.sm + 4,
    paddingVertical: expiria.spacing.xs + 2,
    borderRadius: expiria.borderRadius.full,
    borderWidth: expiria.strokes.thin,
  },
  genderChipText: {
    fontSize: expiria.typography.sizes.caption,
    fontWeight: expiria.typography.weights.medium,
  },
  // Slider styles
  sliderContainer: {
    marginTop: expiria.spacing.xs,
  },
  sliderHeader: {
    alignItems: 'flex-end',
    marginBottom: expiria.spacing.xs,
  },
  sliderValue: {
    fontSize: expiria.typography.sizes.body,
    fontWeight: expiria.typography.weights.semibold,
  },
  sliderTrackWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: expiria.spacing.sm,
  },
  sliderBound: {
    fontSize: expiria.typography.sizes.small,
    fontWeight: expiria.typography.weights.medium,
    minWidth: 28,
    textAlign: 'center',
  },
  sliderFlex: {
    flex: 1,
  },
  // Custom slider track
  customTrack: {
    height: 6,
    borderRadius: 3,
    justifyContent: 'center',
    position: 'relative',
  },
  customTrackActive: {
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  customThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: 'absolute',
    top: -9,
    ...expiria.shadows.soft,
  },
});
