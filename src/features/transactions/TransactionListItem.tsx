import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatSigned } from '@/lib/format';
import { colors, radius, spacing } from '@/theme';

import type { TransactionWithRefs } from './group';

export function TransactionListItem({ row }: { row: TransactionWithRefs }) {
  const { tx, category, account } = row;
  const tint = category?.color ?? colors.transfer;
  const amountColor =
    tx.type === 'income' ? colors.income : tx.type === 'expense' ? colors.expense : colors.text;

  return (
    <Link href={{ pathname: '/transaction/[id]', params: { id: tx.id } }} asChild>
      <Pressable style={styles.row}>
        <View style={[styles.iconCircle, { backgroundColor: `${tint}22` }]}>
          <Ionicons
            name={(category?.icon ?? 'swap-horizontal') as keyof typeof Ionicons.glyphMap}
            size={18}
            color={tint}
          />
        </View>
        <View style={styles.middle}>
          <Text style={styles.title} numberOfLines={1}>
            {tx.memo || category?.name || '거래'}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {[category?.name, account?.name].filter(Boolean).join(' · ')}
          </Text>
        </View>
        <Text style={[styles.amount, { color: amountColor }]}>
          {formatSigned(tx.amount, tx.type)}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  sub: {
    color: colors.textFaint,
    fontSize: 12,
    marginTop: 1,
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
  },
});
