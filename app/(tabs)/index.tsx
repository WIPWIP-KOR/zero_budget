import { Ionicons } from '@expo/vector-icons';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Link } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GoalCard } from '@/features/goals/GoalCard';
import { sumMonth } from '@/features/transactions/group';
import { monthTransactionsQuery } from '@/features/transactions/queries';
import { TransactionListItem } from '@/features/transactions/TransactionListItem';
import { formatMonth, toMonthKey } from '@/lib/dates';
import { formatKRW } from '@/lib/format';
import { colors, radius, spacing } from '@/theme';

const RECENT_COUNT = 5;

export default function HomeScreen() {
  const month = toMonthKey(new Date());
  const { data } = useLiveQuery(monthTransactionsQuery(month), [month]);

  const rows = data ?? [];
  const totals = useMemo(() => sumMonth(rows.map((r) => r.tx)), [rows]);
  const recent = rows.slice(0, RECENT_COUNT);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <GoalCard month={month} income={totals.income} expense={totals.expense} />

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>{formatMonth(month)}</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>수입</Text>
            <Text style={[styles.summaryValue, { color: colors.income }]}>
              {formatKRW(totals.income)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>지출</Text>
            <Text style={[styles.summaryValue, { color: colors.expense }]}>
              {formatKRW(totals.expense)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>남은 돈</Text>
            <Text
              style={[
                styles.summaryValue,
                { color: totals.net >= 0 ? colors.text : colors.expense },
              ]}
            >
              {formatKRW(totals.net)}
            </Text>
          </View>
        </View>
      </View>

      <Link href="/transaction/new" asChild>
        <Pressable style={styles.addButton} testID="quick-add">
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.addLabel}>거래 입력</Text>
        </Pressable>
      </Link>

      <View style={styles.recentCard}>
        <Text style={styles.recentTitle}>최근 내역</Text>
        {recent.length > 0 ? (
          recent.map((row) => <TransactionListItem key={row.tx.id} row={row} />)
        ) : (
          <Text style={styles.empty}>아직 이번 달 거래가 없어요</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: {
    color: colors.textSub,
    fontSize: 12,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
  },
  addLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  recentCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    overflow: 'hidden',
  },
  recentTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  empty: {
    color: colors.textFaint,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
