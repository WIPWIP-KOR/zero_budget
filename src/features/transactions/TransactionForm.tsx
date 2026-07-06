import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Chip } from '@/components/Chip';
import { DatePickerModal } from '@/components/DatePickerModal';
import type { Transaction } from '@/db/schema';
import { accountsQuery } from '@/features/accounts/queries';
import { categoriesQuery } from '@/features/categories/queries';
import { formatAmount } from '@/lib/format';
import { formatDateLabel, toDateKey } from '@/lib/dates';
import { colors, radius, spacing } from '@/theme';

import type { TransactionInput } from './queries';

interface TransactionFormProps {
  initial?: Transaction;
  onSubmit: (input: TransactionInput) => void;
  onDelete?: () => void;
}

type FormType = 'expense' | 'income';

export function TransactionForm({ initial, onSubmit, onDelete }: TransactionFormProps) {
  const [type, setType] = useState<FormType>(
    initial?.type === 'income' ? 'income' : 'expense',
  );
  const [amountDigits, setAmountDigits] = useState(initial ? String(initial.amount) : '');
  const [categoryId, setCategoryId] = useState<string | null>(initial?.categoryId ?? null);
  const [accountId, setAccountId] = useState<string | null>(initial?.accountId ?? null);
  const [memo, setMemo] = useState(initial?.memo ?? '');
  const [dateKey, setDateKey] = useState(initial?.occurredOn ?? toDateKey(new Date()));
  const [dateModal, setDateModal] = useState(false);

  const { data: allCategories } = useLiveQuery(categoriesQuery());
  const { data: allAccounts } = useLiveQuery(accountsQuery());

  const typeCategories = useMemo(
    () => (allCategories ?? []).filter((c) => c.type === type),
    [allCategories, type],
  );

  const amount = amountDigits ? parseInt(amountDigits, 10) : 0;
  const selectedCategoryValid = typeCategories.some((c) => c.id === categoryId);

  const switchType = (next: FormType) => {
    setType(next);
    setCategoryId(null); // 카테고리는 타입별로 다르므로 초기화
  };

  const handleSave = () => {
    if (amount <= 0) {
      Alert.alert('금액을 입력해주세요');
      return;
    }
    if (!selectedCategoryValid) {
      Alert.alert('카테고리를 선택해주세요');
      return;
    }
    onSubmit({
      type,
      amount,
      categoryId,
      accountId,
      memo: memo || null,
      occurredOn: dateKey,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.typeRow}>
        {(['expense', 'income'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => switchType(t)}
            style={[
              styles.typeButton,
              type === t && {
                backgroundColor: t === 'expense' ? colors.expense : colors.income,
              },
            ]}
          >
            <Text style={[styles.typeLabel, type === t && styles.typeLabelActive]}>
              {t === 'expense' ? '지출' : '수입'}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.amountRow}>
        <TextInput
          style={styles.amountInput}
          value={amountDigits ? formatAmount(amount) : ''}
          onChangeText={(text) => setAmountDigits(text.replace(/\D/g, ''))}
          placeholder="0"
          placeholderTextColor={colors.textFaint}
          keyboardType="number-pad"
          autoFocus={!initial}
        />
        <Text style={styles.won}>원</Text>
      </View>

      <Pressable style={styles.dateRow} onPress={() => setDateModal(true)}>
        <Text style={styles.sectionLabel}>날짜</Text>
        <Text style={styles.dateValue}>{formatDateLabel(dateKey)}</Text>
      </Pressable>
      <DatePickerModal
        visible={dateModal}
        value={dateKey}
        onChange={setDateKey}
        onClose={() => setDateModal(false)}
      />

      <Text style={styles.sectionLabel}>카테고리</Text>
      <View style={styles.chipWrap}>
        {typeCategories.map((c) => (
          <Chip
            key={c.id}
            label={c.name}
            icon={c.icon}
            color={c.color}
            selected={categoryId === c.id}
            onPress={() => setCategoryId(c.id)}
          />
        ))}
      </View>

      <Text style={styles.sectionLabel}>자산</Text>
      <View style={styles.chipWrap}>
        {(allAccounts ?? []).map((a) => (
          <Chip
            key={a.id}
            label={a.name}
            color={a.color}
            selected={accountId === a.id}
            onPress={() => setAccountId(accountId === a.id ? null : a.id)}
          />
        ))}
      </View>

      <Text style={styles.sectionLabel}>메모</Text>
      <TextInput
        style={styles.memoInput}
        value={memo}
        onChangeText={setMemo}
        placeholder="메모 (선택)"
        placeholderTextColor={colors.textFaint}
      />

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveLabel}>{initial ? '수정' : '저장'}</Text>
      </Pressable>

      {onDelete ? (
        <Pressable
          style={styles.deleteButton}
          onPress={() =>
            Alert.alert('거래 삭제', '이 거래를 삭제할까요?', [
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
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
  },
  typeLabel: {
    color: colors.textSub,
    fontWeight: '600',
  },
  typeLabelActive: {
    color: '#fff',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
    minWidth: 120,
    padding: 0,
  },
  won: {
    fontSize: 24,
    color: colors.textSub,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  dateValue: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionLabel: {
    color: colors.textSub,
    fontSize: 13,
    marginTop: spacing.sm,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  memoInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    color: colors.text,
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
