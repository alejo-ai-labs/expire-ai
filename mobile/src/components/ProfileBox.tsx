import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { UserProfile } from '../types';
import { useThemeColors } from '../context/ThemeContext';
import { expiria } from '../theme';

interface ProfileBoxProps {
  profile: UserProfile | null;
  onUpdateField: (field: keyof UserProfile, value: string | number) => void;
}

interface FieldConfig {
  key: keyof UserProfile;
  label: string;
  keyboard: 'default' | 'email-address' | 'numeric';
  placeholder: string;
}

const FIELDS: FieldConfig[] = [
  { key: 'name', label: 'Name', keyboard: 'default', placeholder: 'Enter name' },
  { key: 'lastName', label: 'Last Name', keyboard: 'default', placeholder: 'Enter last name' },
  { key: 'email', label: 'Email', keyboard: 'email-address', placeholder: 'Enter email' },
  { key: 'birthday', label: 'Birthday', keyboard: 'default', placeholder: 'YYYY-MM-DD' },
  { key: 'weight', label: 'Weight (kg)', keyboard: 'numeric', placeholder: '0' },
  { key: 'height', label: 'Height (cm)', keyboard: 'numeric', placeholder: '0' },
  { key: 'gender', label: 'Gender', keyboard: 'default', placeholder: 'Enter gender' },
  { key: 'country', label: 'Country', keyboard: 'default', placeholder: 'Enter country' },
];

export function ProfileBox({ profile, onUpdateField }: ProfileBoxProps) {
  const colors = useThemeColors();
  const [editingField, setEditingField] = useState<keyof UserProfile | null>(null);
  const [editValue, setEditValue] = useState('');

  const getDisplayValue = (field: FieldConfig): string => {
    if (!profile) return '';
    const val = profile[field.key];
    if (val === 0 && (field.key === 'weight' || field.key === 'height')) return '';
    return String(val ?? '');
  };

  const startEditing = (field: FieldConfig) => {
    setEditingField(field.key);
    setEditValue(getDisplayValue(field));
  };

  const commitEdit = (field: FieldConfig) => {
    setEditingField(null);
    const trimmed = editValue.trim();
    if (field.keyboard === 'numeric') {
      const num = parseFloat(trimmed);
      onUpdateField(field.key, isNaN(num) ? 0 : num);
    } else {
      onUpdateField(field.key, trimmed);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.secondarySurface },
      ]}
    >
      {FIELDS.map((field) => (
        <View key={field.key} style={styles.row}>
          <Text
            style={[
              styles.label,
              { color: colors.textMuted },
            ]}
          >
            {field.label}
          </Text>
          {editingField === field.key ? (
            <TextInput
              style={[
                styles.input,
                { color: colors.primaryInk, borderBottomColor: colors.accent },
              ]}
              value={editValue}
              onChangeText={setEditValue}
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
                  !getDisplayValue(field) && { color: colors.textMuted },
                ]}
                numberOfLines={1}
              >
                {getDisplayValue(field) || field.placeholder}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
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
  label: {
    fontSize: expiria.typography.sizes.caption,
    fontWeight: expiria.typography.weights.medium,
    marginBottom: expiria.spacing.xs,
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
});
