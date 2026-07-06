import { Ionicons } from '@expo/vector-icons';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import { MonthSwitcher } from '@/components/MonthSwitcher';
import { groupByDate } from '@/features/transactions/group';
import { monthTransactionsQuery } from '@/features/transactions/queries';
import { TransactionListItem } from '@/features/transactions/TransactionListItem';
import { formatDateLabel, toMonthKey } from '@/lib/dates';
import { formatKRW } from '@/lib/format';
import { colors, spacing } from '@/theme';

export default function HistoryScreen() {
  const [month, setMonth] = useState(() => toMonthKey(new Date()));
  const { data } = useLiveQuery(monthTransactionsQuery(month), [month]);

  const sections = useMemo(() => groupByDate(data ?? []), [data]);

  return (
    <View style={styles.container}>
      <MonthSwitcher month={month} onChange={setMonth} />
      <SectionList
        sections={sections}
        keyExtractor={(row) => row.tx.id}
        renderItem={({ item }) => <TransactionListItem row={item} />}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionDate}>{formatDateLabel(section.dateKey)}</Text>
            <View style={styles.sectionTotals}>
              {section.income > 0 && (
                <Text style={[styles.sectionTotal, { color: colors.income }]}>
                  +{formatKRW(section.income)}
                </Text>
              )}
              {section.expense > 0 && (
                <Text style={[styles.sectionTotal, { color: colors.expense }]}>
                  -{formatKRW(section.expense)}
                </Text>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>이 달의 거래가 없어요</Text>
          </View>
        }
        stickySectionHeadersEnabled={false}
        contentContainerStyle={sections.length === 0 ? { flex: 1 } : undefined}
      />
      <Link href="/transaction/new" asChild>
        <Pressable style={styles.fab}>
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  sectionDate: {
    color: colors.textSub,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTotals: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sectionTotal: {
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textFaint,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
});
