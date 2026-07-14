import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useCurrentLedger } from '@/features/ledgers/CurrentLedgerContext';
import { ledgersQuery } from '@/features/ledgers/queries';
import { goalQuery, upsertGoal } from '@/features/goals/queries';
import { formatMonth, toMonthKey } from '@/lib/dates';
import { formatAmount } from '@/lib/format';
import { colors, radius, spacing } from '@/theme';

export default function GoalEditScreen() {
  const month = toMonthKey(new Date());
  const { currentLedgerId } = useCurrentLedger();
  const { data } = useLiveQuery(goalQuery(month), [month, currentLedgerId]);
  const existing = data?.[0];

  const { data: allLedgers } = useLiveQuery(ledgersQuery());
  const currentLedger = allLedgers?.find((l) => l.id === currentLedgerId);
  const isSpendingCap = existing?.kind === 'spending_cap' || currentLedger?.kind === 'party';

  const [digits, setDigits] = useState('');
  useEffect(() => {
    if (existing) setDigits(String(existing.savingTarget));
  }, [existing]);

  const amount = digits ? parseInt(digits, 10) : 0;

  const handleSave = async () => {
    if (amount <= 0) {
      Alert.alert('목표 금액을 입력해주세요');
      return;
    }
    await upsertGoal(month, amount, isSpendingCap ? 'spending_cap' : 'saving');
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isSpendingCap
          ? `${formatMonth(month)}에 얼마 안에서 끝낼까요?`
          : `${formatMonth(month)}에 얼마를 모을까요?`}
      </Text>
      <Text style={styles.sub}>
        {isSpendingCap
          ? '이 장부의 지출 합계가 상한을 넘지 않도록 알려드려요'
          : '수입에서 지출을 뺀 금액이 목표를 향해 쌓여요'}
      </Text>
      <View style={styles.amountRow}>
        <TextInput
          style={styles.amountInput}
          value={digits ? formatAmount(amount) : ''}
          onChangeText={(text) => setDigits(text.replace(/\D/g, ''))}
          placeholder="0"
          placeholderTextColor={colors.textFaint}
          keyboardType="number-pad"
          autoFocus
        />
        <Text style={styles.won}>원</Text>
      </View>
      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveLabel}>{existing ? '목표 수정' : '목표 저장'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  sub: {
    color: colors.textSub,
    fontSize: 13,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
    minWidth: 140,
    padding: 0,
  },
  won: {
    fontSize: 24,
    color: colors.textSub,
  },
  saveButton: {
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
});
