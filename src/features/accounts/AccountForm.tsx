import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Chip } from '@/components/Chip';
import type { Account, AccountType } from '@/db/schema';
import { colors, radius, spacing } from '@/theme';

import type { AccountInput } from './queries';

// dataviz 검증 통과 팔레트에서 선정
const ACCOUNT_COLORS = [
  '#3182F6',
  '#047857',
  '#7C3AED',
  '#D97706',
  '#DB2777',
  '#0891B2',
  '#B45309',
  '#64748B',
];

const TYPE_LABELS: Record<AccountType, string> = {
  cash: '현금',
  card: '카드',
  bank: '은행',
};

interface AccountFormProps {
  initial?: Account;
  onSubmit: (input: AccountInput) => void;
  onDelete?: () => void;
}

export function AccountForm({ initial, onSubmit, onDelete }: AccountFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<AccountType>(initial?.type ?? 'card');
  const [color, setColor] = useState(initial?.color ?? ACCOUNT_COLORS[0]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('자산 이름을 입력해주세요');
      return;
    }
    onSubmit({ name: name.trim(), type, color });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>이름</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="예: 생활비 카드"
        placeholderTextColor={colors.textFaint}
        autoFocus={!initial}
      />

      <Text style={styles.label}>종류</Text>
      <View style={styles.chipRow}>
        {(Object.keys(TYPE_LABELS) as AccountType[]).map((t) => (
          <Chip key={t} label={TYPE_LABELS[t]} selected={type === t} onPress={() => setType(t)} />
        ))}
      </View>

      <Text style={styles.label}>색상</Text>
      <View style={styles.chipRow}>
        {ACCOUNT_COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setColor(c)}
            style={[
              styles.colorDot,
              { backgroundColor: c },
              color === c && styles.colorDotSelected,
            ]}
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
            Alert.alert('자산 삭제', '이 자산을 삭제할까요? 기존 거래 기록은 유지돼요.', [
              { text: '취소', style: 'cancel' },
              { text: '삭제', style: 'destructive', onPress: onDelete },
            ])
          }
        >
          <Text style={styles.deleteLabel}>삭제</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.md,
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
