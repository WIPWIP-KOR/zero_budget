import { Ionicons } from '@expo/vector-icons';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Link, router } from 'expo-router';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useCurrentLedger } from '@/features/ledgers/CurrentLedgerContext';
import { unsortedTransactionsQuery } from '@/features/transactions/queries';
import { formatDateLabel } from '@/lib/dates';
import { formatKRW } from '@/lib/format';
import { colors, radius, spacing } from '@/theme';

export default function InboxScreen() {
  const { currentLedgerId } = useCurrentLedger();
  const { data } = useLiveQuery(unsortedTransactionsQuery(), [currentLedgerId]);
  const rows = data ?? [];

  return (
    <View style={styles.container}>
      <FlatList
        data={rows}
        keyExtractor={(row) => row.id}
        contentContainerStyle={rows.length === 0 ? styles.emptyContent : styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => router.push(`/inbox/${item.id}`)}
          >
            {item.photoUrl ? (
              <Image source={{ uri: item.photoUrl }} style={styles.thumb} />
            ) : item.videoUrl ? (
              <View style={[styles.thumb, styles.videoThumb]}>
                <Ionicons name="videocam" size={18} color="#fff" />
              </View>
            ) : (
              <View style={[styles.thumb, styles.textThumb]}>
                <Ionicons name="chatbubble-ellipses" size={18} color={colors.primary} />
              </View>
            )}
            <View style={styles.rowBody}>
              <Text style={styles.comment} numberOfLines={1}>
                {item.rawComment || '코멘트 없음'}
              </Text>
              <Text style={styles.date}>{formatDateLabel(item.occurredOn)}</Text>
            </View>
            <Text style={item.amount > 0 ? styles.amount : styles.amountMissing}>
              {item.amount > 0 ? formatKRW(item.amount) : '금액 미정'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle" size={32} color={colors.income} />
            <Text style={styles.emptyText}>수집함이 비어 있어요{'\n'}오늘도 정리 완료 ✨</Text>
          </View>
        }
      />
      <Link href="/capture" asChild>
        <Pressable style={styles.fab} testID="inbox-capture">
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
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  emptyContent: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
  },
  videoThumb: {
    backgroundColor: colors.textFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textThumb: {
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  comment: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  date: {
    color: colors.textSub,
    fontSize: 12,
  },
  amount: {
    color: colors.expense,
    fontWeight: '700',
  },
  amountMissing: {
    color: colors.textFaint,
    fontSize: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 20,
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
