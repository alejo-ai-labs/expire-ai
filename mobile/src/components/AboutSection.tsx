import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { useThemeColors } from '../context/ThemeContext';
import { expiria } from '../theme';

export function AboutSection() {
  const colors = useThemeColors();
  const version = Constants.expoConfig?.version ?? 'Version unknown';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.secondarySurface },
      ]}
    >
      <Text style={[styles.title, { color: colors.primaryInk }]}>About</Text>
      <Text style={[styles.appName, { color: colors.primaryInk }]}>
        EXPIRIA
      </Text>
      <Text style={[styles.version, { color: colors.textMuted }]}>
        {version}
      </Text>
      <Text style={[styles.description, { color: colors.textMuted }]}>
        Track your food expiration dates and reduce waste.
      </Text>
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
  appName: {
    fontSize: expiria.typography.sizes.heading,
    fontWeight: expiria.typography.weights.bold,
    textTransform: 'uppercase',
    marginBottom: expiria.spacing.xs,
  },
  version: {
    fontSize: expiria.typography.sizes.caption,
    fontWeight: expiria.typography.weights.medium,
    marginBottom: expiria.spacing.sm,
  },
  description: {
    fontSize: expiria.typography.sizes.body,
    fontWeight: expiria.typography.weights.regular,
  },
});
