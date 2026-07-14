import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useLocalSearchParams, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { accountsByLedgerQuery } from '@/features/accounts/queries';
import { categoriesByLedgerQuery } from '@/features/categories/queries';
import { ledgersQuery } from '@/features/ledgers/queries';
import { sortTransaction, transactionQuery } from '@/features/transactions/queries';
import { formatAmount } from '@/lib/format';
import { colors, radius, spacing } from '@/theme';

export default function SortTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useLiveQuery(transactionQuery(id));
  const tx = data?.[0];

  const { data: allLedgers } = useLiveQuery(ledgersQuery());
  const ledgers = allLedgers ?? [];

  const [ledgerId, setLedgerId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [amountDigits, setAmountDigits] = useState<string | null>(null);

  const effectiveLedgerId = ledgerId ?? tx?.ledgerId ?? '';
  const amount = amountDigits !== null ? parseInt(amountDigits || '0', 10) : tx?.amount ?? 0;

  const { data: ledgerCategories } = useLiveQuery(
    categoriesByLedgerQuery(effectiveLedgerId, 'expense'),
    [effectiveLedgerId],
  );
  const { data: ledgerAccounts } = useLiveQuery(accountsByLedgerQuery(effectiveLedgerId), [
    effectiveLedgerId,
  ]);

  const mediaUri = tx?.photoUrl ?? null;

  const handleSave = async () => {
    if (!tx || !effectiveLedgerId) return;
    if (amount <= 0) {
      Alert.alert('금액을 입력해주세요');
      return;
    }
    if (!categoryId) {
      Alert.alert('카테고리를 선택해주세요');
      return;
    }
    await sortTransaction(tx.id, {
      ledgerId: effectiveLedgerId,
      categoryId,
      accountId,
      amount,
    });
    router.back();
  };

  if (!tx) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {mediaUri ? <Image source={{ uri: mediaUri }} style={styles.media} /> : null}
      {tx.rawComment ? <Text style={styles.comment}>{tx.rawComment}</Text> : null}

      <Text style={styles.sectionLabel}>금액</Text>
      <View style={styles.amountRow}>
        <TextInput
          style={styles.amountInput}
          value={amount ? formatAmount(amount) : ''}
          onChangeText={(text) => setAmountDigits(text.replace(/\D/g, ''))}
          placeholder="0"
          placeholderTextColor={colors.textFaint}
          keyboardType="number-pad"
        />
        <Text style={styles.won}>원</Text>
      </View>

      <Text style={styles.sectionLabel}>장부</Text>
      <View style={styles.chipWrap}>
        {ledgers.map((l) => (
          <Chip
            key={l.id}
            label={l.name}
            selected={effectiveLedgerId === l.id}
            onPress={() => {
              setLedgerId(l.id);
              setCategoryId(null);
              setAccountId(null);
            }}
          />
        ))}
      </View>

      <Text style={styles.sectionLabel}>카테고리</Text>
      <View style={styles.chipWrap}>
        {(ledgerCategories ?? []).map((c) => (
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
        {(ledgerAccounts ?? []).map((a) => (
          <Chip
            key={a.id}
            label={a.name}
            color={a.color}
            selected={accountId === a.id}
            onPress={() => setAccountId(accountId === a.id ? null : a.id)}
          />
        ))}
      </View>

      <Pressable style={styles.saveButton} onPress={handleSave} testID="sort-save">
        <Text style={styles.saveLabel}>정리 완료</Text>
      </Pressable>
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
  media: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
  },
  comment: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  sectionLabel: {
    color: colors.textSub,
    fontSize: 13,
    marginTop: spacing.sm,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  amountInput: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    padding: 0,
    minWidth: 80,
  },
  won: {
    fontSize: 18,
    color: colors.textSub,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
});
