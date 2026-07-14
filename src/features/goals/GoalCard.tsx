import { Ionicons } from '@expo/vector-icons';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useCurrentLedger } from '@/features/ledgers/CurrentLedgerContext';
import { formatMonth } from '@/lib/dates';
import { formatKRW } from '@/lib/format';
import { colors, radius, spacing } from '@/theme';

import { computeGoalProgress } from './progress';
import { goalQuery } from './queries';

interface GoalCardProps {
  month: string; // YYYY-MM
  income: number;
  expense: number;
}

/** 홈 최상단 — 이번 달 목표 진행 카드. 목표가 없으면 설정 유도 CTA. */
export function GoalCard({ month, income, expense }: GoalCardProps) {
  const { currentLedgerId } = useCurrentLedger();
  const { data } = useLiveQuery(goalQuery(month), [month, currentLedgerId]);
  const goal = data?.[0];

  if (!goal) {
    return (
      <Link href="/goal/edit" asChild>
        <Pressable style={styles.card} testID="goal-card-empty">
          <View style={styles.emptyRow}>
            <Ionicons name="flag" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.emptyTitle}>{formatMonth(month)} 목표 세우기</Text>
              <Text style={styles.emptySub}>저축 목표를 정하면 진행 상황을 알려드려요</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </View>
        </Pressable>
      </Link>
    );
  }

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const p = computeGoalProgress(income, expense, goal.savingTarget, now.getDate(), daysInMonth);

  const statusColor =
    p.status === 'behind' ? colors.expense : p.status === 'ontrack' ? colors.primary : colors.income;

  return (
    <Link href="/goal/edit" asChild>
      <Pressable style={styles.card} testID="goal-card">
        <View style={styles.headerRow}>
          <Text style={styles.title}>{formatMonth(month)} 저축 목표</Text>
          <Text style={[styles.message, { color: statusColor }]}>{p.message}</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={[styles.saved, { color: statusColor }]}>{formatKRW(p.saved)}</Text>
          <Text style={styles.target}> / {formatKRW(p.target)}</Text>
        </View>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              { width: `${Math.round(p.progress * 100)}%`, backgroundColor: statusColor },
            ]}
          />
          {/* 오늘 기준 기대 진행 위치 */}
          <View style={[styles.paceMark, { left: `${Math.round(p.expectedProgress * 100)}%` }]} />
        </View>
        <Text style={styles.percent}>
          {Math.round(p.progress * 100)}% 달성 · 이맘때 기대치 {Math.round(p.expectedProgress * 100)}%
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 8,
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  emptySub: {
    color: colors.textSub,
    fontSize: 12,
    marginTop: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  message: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  saved: {
    fontSize: 22,
    fontWeight: '800',
  },
  target: {
    color: colors.textSub,
    fontSize: 14,
  },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
  paceMark: {
    position: 'absolute',
    top: -2,
    width: 2,
    height: 14,
    backgroundColor: colors.textFaint,
  },
  percent: {
    color: colors.textFaint,
    fontSize: 11,
  },
});
