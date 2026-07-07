import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { formatRelative } from '@/lib/dates';
import { formatKRW } from '@/lib/format';
import { colors, radius, spacing } from '@/theme';

import type { Moment } from './moments';
import { POST_TYPE_META, type Post } from './posts';

/** 내 기록에서 만들어진 동기부여 카드 */
export function MomentCard({ moment }: { moment: Moment }) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}18` }]}>
        <Ionicons
          name={moment.icon as keyof typeof Ionicons.glyphMap}
          size={18}
          color={colors.primary}
        />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{moment.title}</Text>
        <Text style={styles.sub}>{moment.sub}</Text>
      </View>
    </View>
  );
}

/** 다른 사용자의 공유 포스트 */
export function PostCard({ post }: { post: Post }) {
  const meta = POST_TYPE_META[post.type];
  return (
    <View style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: `${meta.color}18` }]}>
        <Ionicons name={meta.icon as keyof typeof Ionicons.glyphMap} size={18} color={meta.color} />
      </View>
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.author}>{post.authorName}</Text>
          <Text style={[styles.badge, { color: meta.color }]}>{meta.label}</Text>
          <Text style={styles.time}>{formatRelative(post.createdAt)}</Text>
        </View>
        <Text style={styles.title}>{post.message}</Text>
        {post.amount != null ? (
          <Text style={[styles.amount, { color: meta.color }]}>{formatKRW(post.amount)}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  author: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
  },
  time: {
    flex: 1,
    textAlign: 'right',
    color: colors.textFaint,
    fontSize: 11,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  sub: {
    color: colors.textSub,
    fontSize: 12,
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
  },
});
