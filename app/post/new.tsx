import { useQueryClient } from '@tanstack/react-query';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Chip } from '@/components/Chip';
import { useSession } from '@/features/auth/AuthProvider';
import { createPost, POST_TYPE_META, type PostType } from '@/features/feed/posts';
import { formatAmount } from '@/lib/format';
import { colors, radius, spacing } from '@/theme';

export default function NewPostScreen() {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [type, setType] = useState<PostType>('saving_win');
  const [message, setMessage] = useState('');
  const [digits, setDigits] = useState('');
  const [busy, setBusy] = useState(false);

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>로그인하면 자랑할 수 있어요</Text>
        <Text style={styles.sub}>절약과 멋진 소비의 순간을 다른 사람들과 나눠보세요</Text>
        <Link href="/sign-in" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryLabel}>로그인</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  const amount = digits ? parseInt(digits, 10) : null;

  const handleShare = async () => {
    if (!message.trim()) {
      Alert.alert('이야기를 한 줄 적어주세요');
      return;
    }
    setBusy(true);
    try {
      await createPost({ type, message: message.trim(), amount });
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      router.back();
    } catch (e) {
      Alert.alert('공유 실패', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>어떤 순간인가요?</Text>
      <View style={styles.chipRow}>
        {(Object.keys(POST_TYPE_META) as PostType[]).map((t) => (
          <Chip
            key={t}
            label={POST_TYPE_META[t].label}
            icon={POST_TYPE_META[t].icon}
            color={POST_TYPE_META[t].color}
            selected={type === t}
            onPress={() => setType(t)}
          />
        ))}
      </View>

      <Text style={styles.label}>이야기</Text>
      <TextInput
        style={styles.messageInput}
        value={message}
        onChangeText={setMessage}
        placeholder="예: 커피값 아껴서 일주일에 2만원 모았어요"
        placeholderTextColor={colors.textFaint}
        multiline
        maxLength={140}
      />

      <Text style={styles.label}>금액 (선택)</Text>
      <TextInput
        style={styles.amountInput}
        value={digits ? formatAmount(parseInt(digits, 10)) : ''}
        onChangeText={(text) => setDigits(text.replace(/\D/g, ''))}
        placeholder="0"
        placeholderTextColor={colors.textFaint}
        keyboardType="number-pad"
      />

      <Pressable style={styles.primaryButton} onPress={handleShare} disabled={busy}>
        <Text style={styles.primaryLabel}>{busy ? '공유 중…' : '피드에 공유'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  center: {
    flex: 1,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  sub: {
    color: colors.textSub,
    fontSize: 13,
    textAlign: 'center',
  },
  label: {
    color: colors.textSub,
    fontSize: 13,
    marginTop: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  amountInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    color: colors.text,
    fontSize: 16,
    textAlign: 'right',
  },
  primaryButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: 14,
    minWidth: 160,
  },
  primaryLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
