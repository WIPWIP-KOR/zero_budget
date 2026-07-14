import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Category, CategoryType } from '@/db/schema';
import { colors, radius, spacing } from '@/theme';

import type { CategoryInput } from './queries';

// dataviz 검증 통과 팔레트에서 선정 — AccountForm과 동일한 소스
const CATEGORY_COLORS = [
  '#E5484D',
  '#B45309',
  '#3B82F6',
  '#7C3AED',
  '#0891B2',
  '#EC4899',
  '#059669',
  '#D97706',
  '#6366F1',
  '#A21CAF',
  '#64748B',
];

const CATEGORY_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'restaurant',
  'cafe',
  'bus',
  'home',
  'wifi',
  'cart',
  'medkit',
  'film',
  'school',
  'gift',
  'card',
  'briefcase',
  'heart',
  'trending-up',
  'ellipsis-horizontal',
];

const TYPE_LABELS: Record<CategoryType, string> = {
  expense: '지출',
  income: '수입',
};

interface CategoryFormProps {
  initial?: Category;
  onSubmit: (input: CategoryInput) => void;
  onDelete?: () => void;
}

export function CategoryForm({ initial, onSubmit, onDelete }: CategoryFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<CategoryType>(initial?.type ?? 'expense');
  const [icon, setIcon] = useState(initial?.icon ?? CATEGORY_ICONS[0]);
  const [color, setColor] = useState(initial?.color ?? CATEGORY_COLORS[0]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('카테고리 이름을 입력해주세요');
      return;
    }
    onSubmit({ name: name.trim(), type, icon, color });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>이름</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="예: 반려동물"
        placeholderTextColor={colors.textFaint}
        autoFocus={!initial}
      />

      <Text style={styles.label}>종류</Text>
      <View style={styles.chipRow}>
        {(Object.keys(TYPE_LABELS) as CategoryType[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => setType(t)}
            style={[styles.typeButton, type === t && styles.typeButtonActive]}
          >
            <Text style={[styles.typeLabel, type === t && styles.typeLabelActive]}>
              {TYPE_LABELS[t]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>아이콘</Text>
      <View style={styles.chipRow}>
        {CATEGORY_ICONS.map((i) => (
          <Pressable
            key={i}
            onPress={() => setIcon(i)}
            style={[
              styles.iconCircle,
              { backgroundColor: `${color}22` },
              icon === i && { borderColor: color, borderWidth: 2 },
            ]}
          >
            <Ionicons name={i} size={18} color={color} />
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>색상</Text>
      <View style={styles.chipRow}>
        {CATEGORY_COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setColor(c)}
            style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotSelected]}
          />
        ))}
      </View>

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveLabel}>{initial ? '수정' : '추가'}</Text>
      </Pressable>

      {onDelete ? (
        <Pressable
          style={styles.deleteButton}
          onPress={() =>
            Alert.alert('카테고리 삭제', '이 카테고리를 삭제할까요? 기존 거래 기록은 유지돼요.', [
              { text: '취소', style: 'cancel' },
              { text: '삭제', style: 'destructive', onPress: onDelete },
            ])
          }
        >
          <Text style={styles.deleteLabel}>삭제</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  label: {
    color: colors.textSub,
    fontSize: 13,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    color: colors.text,
    fontSize: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'center',
  },
  typeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.lg,
    backgroundColor: colors.bg,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
  },
  typeLabel: {
    color: colors.textSub,
    fontWeight: '600',
  },
  typeLabelActive: {
    color: '#fff',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: colors.text,
  },
  saveButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: 14,
  },
  saveLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  deleteLabel: {
    color: colors.danger,
    fontWeight: '600',
  },
});
