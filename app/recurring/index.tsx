import { Ionicons } from '@expo/vector-icons';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Link } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useCurrentLedger } from '@/features/ledgers/CurrentLedgerContext';
import { recurringRulesQuery } from '@/features/recurring/queries';
import { formatDateLabel } from '@/lib/dates';
import { formatKRW } from '@/lib/format';
import { colors, radius, spacing } from '@/theme';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export default function RecurringListScreen() {
  const { currentLedgerId } = useCurrentLedger();
  const { data } = useLiveQuery(recurringRulesQuery(), [currentLedgerId]);
  const rows = data ?? [];

  return (
    <View style={styles.container}>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/recurring/[id]', params: { id: item.id } }} asChild>
            <Pressable style={styles.row}>
              <View style={styles.rowMain}>
                <Text style={styles.amount}>
                  {item.type === 'income' ? '+' : '-'}
                  {formatKRW(item.amount)}
                </Text>
                <Text style={styles.schedule}>
                  {item.frequency === 'monthly'
                    ? `매월 ${item.dayOfMonth === 31 ? '말일' : `${item.dayOfMonth}일`}`
                    : `매주 ${WEEKDAY_LABELS[item.weekday ?? 0]}요일`}
                  {' · '}
                  {formatDateLabel(item.startOn)}부터
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>등록된 반복 거래가 없어요</Text>
        }
      />
      <Link href="/recurring/new" asChild>
        <Pressable style={styles.addButton} testID="add-recurring">
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addLabel}>반복 거래 추가</Text>
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
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rowMain: {
    flex: 1,
    gap: 2,
  },
  amount: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  schedule: {
    color: colors.textSub,
    fontSize: 12,
  },
  empty: {
    color: colors.textFaint,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    margin: spacing.md,
    paddingVertical: 12,
  },
  addLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
