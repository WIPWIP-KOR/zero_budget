import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '@/theme';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: string;
  color?: string;
}

export function Chip({ label, selected, onPress, icon, color }: ChipProps) {
  const tint = color ?? colors.primary;
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && { backgroundColor: tint, borderColor: tint }]}
    >
      {icon ? (
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={14}
          color={selected ? '#fff' : tint}
        />
      ) : null}
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  label: {
    color: colors.text,
    fontSize: 14,
  },
  labelSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});
