import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { addMonths, formatMonth } from '@/lib/dates';
import { colors, spacing } from '@/theme';

interface MonthSwitcherProps {
  month: string; // YYYY-MM
  onChange: (month: string) => void;
}

export function MonthSwitcher({ month, onChange }: MonthSwitcherProps) {
  return (
    <View style={styles.row}>
      <Pressable hitSlop={8} onPress={() => onChange(addMonths(month, -1))}>
        <Ionicons name="chevron-back" size={20} color={colors.textSub} />
      </Pressable>
      <Text style={styles.label}>{formatMonth(month)}</Text>
      <Pressable hitSlop={8} onPress={() => onChange(addMonths(month, 1))}>
        <Ionicons name="chevron-forward" size={20} color={colors.textSub} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    minWidth: 110,
    textAlign: 'center',
  },
});
