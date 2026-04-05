import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../context/ThemeContext';
import { expiria } from '../theme';
import { FAQItem } from './FAQItem';

const FAQ_ITEMS = [
  {
    question: 'How do I scan a food item?',
    answer:
      'Open the Scan tab and point your camera at the food item\'s barcode or label. Expiria will automatically detect and add it to your list.',
  },
  {
    question: 'How does expiration tracking work?',
    answer:
      'Expiria tracks the expiration dates of your food items and shows them with color-coded badges: green for fresh, yellow for expiring soon, and red for expired.',
  },
  {
    question: 'Will I get notifications?',
    answer:
      'Yes, Expiria sends push notifications to remind you before your food items expire, so you can use them in time.',
  },
];

export function HelpBox() {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.secondarySurface },
      ]}
    >
      <Text style={[styles.title, { color: colors.primaryInk }]}>Help</Text>
      {FAQ_ITEMS.map((item) => (
        <FAQItem
          key={item.question}
          question={item.question}
          answer={item.answer}
        />
      ))}
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
});
