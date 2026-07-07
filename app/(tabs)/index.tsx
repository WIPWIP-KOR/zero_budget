import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Link } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/features/auth/AuthProvider';
import { MomentCard, PostCard } from '@/features/feed/FeedCards';
import { buildLocalMoments } from '@/features/feed/moments';
import { fetchPublicPosts } from '@/features/feed/posts';
import { GoalCard } from '@/features/goals/GoalCard';
import { sumMonth } from '@/features/transactions/group';
import { monthTransactionsQuery } from '@/features/transactions/queries';
import { toDateKey, toMonthKey } from '@/lib/dates';
import { formatKRW } from '@/lib/format';
import { isSupabaseConfigured } from '@/lib/supabase';
import { colors, radius, spacing } from '@/theme';

export default function HomeScreen() {
  const month = toMonthKey(new Date());
  const { session } = useSession();
  const { data } = useLiveQuery(monthTransactionsQuery(month), [month]);

  const rows = data ?? [];
  const totals = useMemo(() => sumMonth(rows.map((r) => r.tx)), [rows]);
  const moments = useMemo(
    () =>
      buildLocalMoments(
        rows.map((r) => ({
          occurredOn: r.tx.occurredOn,
          type: r.tx.type,
          amount: r.tx.amount,
        })),
        toDateKey(new Date()),
      ),
    [rows],
  );

  const { data: posts } = useQuery({
    queryKey: ['posts'],
    queryFn: () => fetchPublicPosts(),
    enabled: isSupabaseConfigured && Boolean(session),
    staleTime: 60_000,
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 제일 작은 목표가 제일 위 */}
      <GoalCard month={month} income={totals.income} expense={totals.expense} />

      <View style={styles.summaryStrip}>
        <Text style={styles.summaryText}>
          이번 달 <Text style={{ color: colors.income }}>+{formatKRW(totals.income)}</Text>
          {'  ·  '}
          <Text style={{ color: colors.expense }}>-{formatKRW(totals.expense)}</Text>
        </Text>
      </View>

      <View style={styles.actionRow}>
        <Link href="/transaction/new" asChild>
          <Pressable style={styles.actionButton} testID="quick-add">
            <Ionicons name="add-circle" size={18} color="#fff" />
            <Text style={styles.actionLabel}>거래 입력</Text>
          </Pressable>
        </Link>
        <Link href="/post/new" asChild>
          <Pressable style={styles.actionSecondary} testID="brag">
            <Ionicons name="megaphone" size={18} color={colors.primary} />
            <Text style={[styles.actionLabel, { color: colors.primary }]}>자랑하기</Text>
          </Pressable>
        </Link>
      </View>

      {moments.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>내 이야기</Text>
          {moments.map((m) => (
            <MomentCard key={m.id} moment={m} />
          ))}
        </>
      ) : null}

      <Text style={styles.sectionTitle}>피드</Text>
      {session ? (
        posts && posts.length > 0 ? (
          posts.map((p) => <PostCard key={p.id} post={p} />)
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              아직 공유된 이야기가 없어요. 첫 자랑의 주인공이 되어보세요!
            </Text>
          </View>
        )
      ) : (
        <View style={styles.emptyCard}>
          <Ionicons name="people" size={22} color={colors.primary} />
          <Text style={styles.emptyText}>
            로그인하면 다른 사람들의 절약 이야기와{'\n'}멋진 소비를 구경할 수 있어요
          </Text>
          <Link href="/sign-in" asChild>
            <Pressable style={styles.loginButton}>
              <Text style={styles.loginLabel}>로그인</Text>
            </Pressable>
          </Link>
        </View>
      )}
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
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  summaryStrip: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  summaryText: {
    color: colors.textSub,
    fontSize: 13,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
  },
  actionSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.md,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    color: colors.textSub,
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.textSub,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
  },
  loginLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
