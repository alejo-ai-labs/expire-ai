import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../context/ThemeContext';
import { expiria } from '../theme';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItemProps {
  question: string;
  answer: string;
}

const toggleAnimation = LayoutAnimation.create(
  200,
  LayoutAnimation.Types.easeInEaseOut,
  LayoutAnimation.Properties.opacity
);

export function FAQItem({ question, answer }: FAQItemProps) {
  const [expanded, setExpanded] = useState(false);
  const colors = useThemeColors();

  const handleToggle = () => {
    LayoutAnimation.configureNext(toggleAnimation);
    setExpanded((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleToggle}
        style={styles.questionRow}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <Text style={[styles.questionText, { color: colors.primaryInk }]}>
          {question}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textMuted}
        />
      </TouchableOpacity>
      {expanded && (
        <Text style={[styles.answerText, { color: colors.textMuted }]}>
          {answer}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: expiria.spacing.sm,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionText: {
    fontSize: expiria.typography.sizes.body,
    fontWeight: expiria.typography.weights.medium,
    flex: 1,
    marginRight: expiria.spacing.sm,
  },
  answerText: {
    fontSize: expiria.typography.sizes.body,
    fontWeight: expiria.typography.weights.regular,
    marginTop: expiria.spacing.sm,
  },
});
