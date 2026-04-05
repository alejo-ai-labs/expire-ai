import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../context/ThemeContext';
import { expiria } from '../theme';

interface SettingsBoxProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function SettingsBox({ isDarkMode, onToggleTheme }: SettingsBoxProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.secondarySurface },
      ]}
    >
      <Text style={[styles.title, { color: colors.primaryInk }]}>
        Settings
      </Text>
      <View style={styles.row}>
        <View style={styles.labelRow}>
          <Ionicons
            name={isDarkMode ? 'moon' : 'sunny'}
            size={18}
            color={isDarkMode ? colors.accent : colors.accent}
          />
          <Text style={[styles.label, { color: colors.primaryInk }]}>
            Dark Mode
          </Text>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={onToggleTheme}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor={isDarkMode ? colors.primarySurface : colors.canvas}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: expiria.borderRadius.lg,
    padding: expiria.spacing.md,
  },
  title: {
    fontSize: expiria.typography.sizes.subheading,
    fontWeight: expiria.typography.weights.semibold,
    marginBottom: expiria.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: expiria.spacing.sm,
  },
  label: {
    fontSize: expiria.typography.sizes.body,
    fontWeight: expiria.typography.weights.regular,
  },
});
