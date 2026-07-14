import { Ionicons } from '@expo/vector-icons';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Link } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { categoriesQuery } from '@/features/categories/queries';
import { useCurrentLedger } from '@/features/ledgers/CurrentLedgerContext';
import { colors, radius, spacing } from '@/theme';

export default function CategoryListScreen() {
  const { currentLedgerId } = useCurrentLedger();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const { data } = useLiveQuery(categoriesQuery(type), [type, currentLedgerId]);
  const rows = data ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.segmentRow}>
        {(['expense', 'income'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setType(t)}
            style={[styles.segment, type === t && styles.segmentActive]}
          >
            <Text style={[styles.segmentLabel, type === t && styles.segmentLabelActive]}>
              {t === 'expense' ? '지출' : '수입'}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={rows}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/category/[id]', params: { id: item.id } }} asChild>
            <Pressable style={styles.row}>
              <View style={[styles.iconCircle, { backgroundColor: `${item.color}22` }]}>
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={18}
                  color={item.color}
                />
              </View>
              <Text style={styles.name}>{item.name}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={<Text style={styles.empty}>카테고리가 없어요</Text>}
      />
      <Link href="/category/new" asChild>
        <Pressable style={styles.addButton} testID="add-category">
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addLabel}>카테고리 추가</Text>
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
  segmentRow: {
    flexDirection: 'row',
    margin: spacing.md,
    backgroundColor: colors.border,
    borderRadius: radius.sm,
    padding: 2,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: radius.sm - 2,
  },
  segmentActive: {
    backgroundColor: colors.card,
  },
  segmentLabel: {
    color: colors.textSub,
    fontSize: 13,
    fontWeight: '600',
  },
  segmentLabelActive: {
    color: colors.text,
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
