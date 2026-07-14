import { Ionicons } from '@expo/vector-icons';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Link } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { accountBalancesQuery } from '@/features/accounts/queries';
import { useCurrentLedger } from '@/features/ledgers/CurrentLedgerContext';
import { formatKRW } from '@/lib/format';
import { colors, radius, spacing } from '@/theme';

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  cash: 'cash',
  card: 'card',
  bank: 'business',
};

export default function AccountsScreen() {
  const { currentLedgerId } = useCurrentLedger();
  const { data } = useLiveQuery(accountBalancesQuery(), [currentLedgerId]);
  const rows = data ?? [];
  const total = rows.reduce((sum, r) => sum + r.balance, 0);

  return (
    <View style={styles.container}>
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>총 자산</Text>
        <Text style={[styles.totalValue, { color: total >= 0 ? colors.text : colors.expense }]}>
          {formatKRW(total)}
        </Text>
      </View>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.account.id}
        renderItem={({ item }) => (
          <Link
            href={{ pathname: '/accounts/[id]', params: { id: item.account.id } }}
            asChild
          >
            <Pressable style={styles.row}>
              <View style={[styles.iconCircle, { backgroundColor: `${item.account.color}22` }]}>
                <Ionicons
                  name={TYPE_ICONS[item.account.type] ?? 'wallet'}
                  size={18}
                  color={item.account.color}
                />
              </View>
              <Text style={styles.name}>{item.account.name}</Text>
              <Text
                style={[
                  styles.balance,
                  { color: item.balance >= 0 ? colors.text : colors.expense },
                ]}
              >
                {formatKRW(item.balance)}
              </Text>
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={<Text style={styles.empty}>자산이 없어요</Text>}
      />
      <Link href="/accounts/new" asChild>
        <Pressable style={styles.addButton} testID="add-account">
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addLabel}>자산 추가</Text>
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
  totalCard: {
    backgroundColor: colors.card,
    margin: spacing.md,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  totalLabel: {
    color: colors.textSub,
    fontSize: 12,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  balance: {
    fontSize: 15,
    fontWeight: '600',
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
