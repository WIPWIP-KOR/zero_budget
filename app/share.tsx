import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useSession } from '@/features/auth/AuthProvider';
import { useCurrentLedger } from '@/features/ledgers/CurrentLedgerContext';
import { createInviteCode, joinWithCode } from '@/features/ledgers/invites';
import { ledgersQuery } from '@/features/ledgers/queries';
import { resetSyncCursors, syncNow } from '@/sync/engine';
import { colors, radius, spacing } from '@/theme';

export default function ShareScreen() {
  const { session } = useSession();
  const { switchLedger } = useCurrentLedger();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [joinInput, setJoinInput] = useState('');
  const [busy, setBusy] = useState<'invite' | 'join' | null>(null);

  if (!session) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Ionicons name="people" size={28} color={colors.primary} />
          <Text style={styles.title}>부부 가계부</Text>
          <Text style={styles.sub}>
            로그인하면 배우자를 초대해서 하나의 가계부를 함께 쓸 수 있어요. 각자 입력해도 서로의
            기록이 합쳐져서 보여요.
          </Text>
          <Link href="/sign-in" asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryLabel}>로그인하고 시작하기</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    );
  }

  const handleInvite = async () => {
    setBusy('invite');
    try {
      // 내 장부가 서버에 있어야 초대 코드를 만들 수 있다
      await syncNow();
      const code = await createInviteCode();
      setInviteCode(code);
    } catch (e) {
      Alert.alert('초대 코드 생성 실패', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const handleJoin = async () => {
    if (joinInput.trim().length < 6) {
      Alert.alert('6자리 초대 코드를 입력해주세요');
      return;
    }
    setBusy('join');
    try {
      const ledgerId = await joinWithCode(joinInput);
      // 과거 데이터까지 전부 받도록 커서를 리셋하고 동기화 — 합류한 장부가 로컬에 내려온다
      await resetSyncCursors();
      await syncNow();
      // main(부부)만 전환한다. party는 목록에만 추가되고 현재 장부는 그대로 (§3.3b)
      const joined = (await ledgersQuery()).find((l) => l.id === ledgerId);
      if (joined?.kind === 'party') {
        Alert.alert('합류 완료', `"${joined.name}" 파티에 합류했어요. 장부 목록에서 확인하세요.`);
      } else {
        await switchLedger(ledgerId);
        Alert.alert('합류 완료', '이제 부부 가계부를 함께 써요! 🎉');
      }
    } catch (e) {
      Alert.alert('합류 실패', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>배우자 초대하기</Text>
        <Text style={styles.sub}>
          초대 코드를 만들어 배우자에게 보내주세요. 24시간 동안 유효해요.
        </Text>
        {inviteCode ? (
          <>
            <Text style={styles.code}>{inviteCode}</Text>
            <Pressable
              style={styles.primaryButton}
              onPress={() => void Share.share({ message: `영원가계부 초대 코드: ${inviteCode}` })}
            >
              <Text style={styles.primaryLabel}>코드 공유하기</Text>
            </Pressable>
          </>
        ) : (
          <Pressable style={styles.primaryButton} onPress={handleInvite} disabled={busy !== null}>
            {busy === 'invite' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryLabel}>초대 코드 만들기</Text>
            )}
          </Pressable>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>초대 코드로 합류하기</Text>
        <Text style={styles.sub}>
          배우자에게 받은 코드를 입력하면 그 가계부로 합류해요.
        </Text>
        <TextInput
          style={styles.codeInput}
          value={joinInput}
          onChangeText={(text) => setJoinInput(text.toUpperCase())}
          placeholder="ABC123"
          placeholderTextColor={colors.textFaint}
          autoCapitalize="characters"
          maxLength={6}
        />
        <Pressable style={styles.primaryButton} onPress={handleJoin} disabled={busy !== null}>
          {busy === 'join' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryLabel}>합류하기</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
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
  code: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: 6,
    paddingVertical: spacing.sm,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    color: colors.text,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 4,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: 12,
  },
  primaryLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
