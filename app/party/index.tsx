import { Ionicons } from '@expo/vector-icons';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useSession } from '@/features/auth/AuthProvider';
import { createInviteCode } from '@/features/ledgers/invites';
import { createLedger, ledgersQuery } from '@/features/ledgers/queries';
import { syncNow } from '@/sync/engine';
import { colors, radius, spacing } from '@/theme';

/** 파티 목록/생성 — 여행비·회비처럼 주 장부와 별개인 공유 장부 (§3.3b) */
export default function PartyScreen() {
  const { session } = useSession();
  const { data } = useLiveQuery(ledgersQuery());
  const parties = (data ?? []).filter((l) => l.kind === 'party');

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [newCode, setNewCode] = useState<string | null>(null);

  if (!session) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Ionicons name="people-circle" size={28} color={colors.primary} />
          <Text style={styles.title}>파티</Text>
          <Text style={styles.sub}>
            로그인하면 여행비·회비 같은 파티 장부를 만들어 함께 기록할 수 있어요.
          </Text>
        </View>
      </View>
    );
  }

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      const ledgerId = await createLedger(trimmed, 'party');
      await syncNow(); // 초대 코드 발급 전에 장부가 서버에 있어야 한다
      const code = await createInviteCode(ledgerId);
      setNewCode(code);
      setName('');
    } catch (e) {
      Alert.alert('파티 생성 실패', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={parties}
        keyExtractor={(l) => l.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.card}>
            {newCode ? (
              <>
                <Text style={styles.title}>파티가 만들어졌어요</Text>
                <Text style={styles.code}>{newCode}</Text>
                <Pressable
                  style={styles.primaryButton}
                  onPress={() =>
                    void Share.share({ message: `영원가계부 파티 초대 코드: ${newCode}` })
                  }
                >
                  <Text style={styles.primaryLabel}>코드 공유하기</Text>
                </Pressable>
                <Pressable onPress={() => setNewCode(null)}>
                  <Text style={styles.link}>닫기</Text>
                </Pressable>
              </>
            ) : creating ? (
              <>
                <Text style={styles.title}>새 파티 만들기</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="예: 제주 여행, 스터디 회비"
                  placeholderTextColor={colors.textFaint}
                  autoFocus
                />
                <Pressable style={styles.primaryButton} onPress={handleCreate} disabled={busy}>
                  {busy ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryLabel}>만들고 초대 코드 받기</Text>
                  )}
                </Pressable>
              </>
            ) : (
              <Pressable style={styles.primaryButton} onPress={() => setCreating(true)}>
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.primaryLabel}>새 파티 만들기</Text>
              </Pressable>
            )}
            <Text style={styles.hint}>
              초대 코드로 합류하려면 설정 &gt; 부부 가계부 화면의 &quot;코드로 합류하기&quot;를
              써주세요. 파티는 주 장부를 바꾸지 않고 목록에만 추가돼요.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.partyRow}>
            <Ionicons name="people" size={18} color={colors.primary} />
            <Text style={styles.partyName}>{item.name}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>아직 만든 파티가 없어요</Text>
        }
      />
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
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  sub: {
    color: colors.textSub,
    fontSize: 13,
    lineHeight: 19,
  },
  hint: {
    color: colors.textFaint,
    fontSize: 12,
    lineHeight: 17,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    color: colors.text,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  primaryLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  link: {
    color: colors.primary,
    textAlign: 'center',
    fontSize: 13,
  },
  code: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: 6,
    paddingVertical: spacing.xs,
  },
  partyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  partyName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  empty: {
    color: colors.textFaint,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
