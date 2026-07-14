import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { getDb } from '@/db/client';
import { ledgers } from '@/db/schema';
import { useCurrentLedger } from '@/features/ledgers/CurrentLedgerContext';
import { archiveLedger, countTransactions, mergeLedgerInto } from '@/features/ledgers/merge';
import { colors, radius, spacing } from '@/theme';

/**
 * 재로그인/새 기기, 부부 합류 시 "기존 장부에 기록이 있음"을 감지하면 뜨는 병합 마법사 (§5.3).
 * params: source(기존에 쓰던 장부), target(새로 합류/발견한 장부)
 */
export default function MergeWizardScreen() {
  const { source, target } = useLocalSearchParams<{ source: string; target: string }>();
  const { switchLedger } = useCurrentLedger();

  const [loading, setLoading] = useState(true);
  const [sourceName, setSourceName] = useState('');
  const [targetName, setTargetName] = useState('');
  const [txCount, setTxCount] = useState(0);
  const [busy, setBusy] = useState<'merge' | 'keep' | 'delete' | null>(null);

  useEffect(() => {
    (async () => {
      const rows = await getDb().select().from(ledgers);
      setSourceName(rows.find((l) => l.id === source)?.name ?? '기존 장부');
      setTargetName(rows.find((l) => l.id === target)?.name ?? '새 장부');
      setTxCount(await countTransactions(source));
      setLoading(false);
    })();
  }, [source, target]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const finish = async () => {
    await switchLedger(target);
    router.replace('/');
  };

  const handleMerge = async () => {
    setBusy('merge');
    try {
      await mergeLedgerInto(source, target);
      await finish();
    } catch (e) {
      Alert.alert('병합 실패', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const handleKeep = async () => {
    setBusy('keep');
    await finish();
    setBusy(null);
  };

  const handleDelete = () => {
    Alert.alert(
      `"${sourceName}" 삭제`,
      '30일 안에는 복구할 수 있어요. 그 뒤에는 완전히 삭제돼요.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            setBusy('delete');
            try {
              await archiveLedger(source);
              await finish();
            } finally {
              setBusy(null);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Ionicons name="git-merge" size={28} color={colors.primary} />
      <Text style={styles.title}>"{targetName}" 장부를 발견했어요</Text>
      <Text style={styles.sub}>
        지금까지 쓰던 "{sourceName}"에 거래 {txCount}건이 있어요. 어떻게 할까요?
      </Text>

      <Pressable style={styles.option} onPress={handleMerge} disabled={busy !== null}>
        <View style={styles.optionHeader}>
          <Text style={styles.optionTitle}>합치기</Text>
          {busy === 'merge' ? <ActivityIndicator color={colors.primary} /> : null}
        </View>
        <Text style={styles.optionDesc}>
          "{sourceName}"의 거래를 "{targetName}"로 옮겨요. 카테고리·자산은 이름이 같으면 그대로
          맞추고, 없으면 새로 만들어요.
        </Text>
      </Pressable>

      <Pressable style={styles.option} onPress={handleKeep} disabled={busy !== null}>
        <View style={styles.optionHeader}>
          <Text style={styles.optionTitle}>보관</Text>
          {busy === 'keep' ? <ActivityIndicator color={colors.primary} /> : null}
        </View>
        <Text style={styles.optionDesc}>
          "{sourceName}"는 그대로 두고 "{targetName}"로 전환해요. 설정의 장부 전환에서 언제든
          다시 볼 수 있어요.
        </Text>
      </Pressable>

      <Pressable style={styles.option} onPress={handleDelete} disabled={busy !== null}>
        <View style={styles.optionHeader}>
          <Text style={[styles.optionTitle, { color: colors.danger }]}>삭제</Text>
          {busy === 'delete' ? <ActivityIndicator color={colors.danger} /> : null}
        </View>
        <Text style={styles.optionDesc}>
          "{sourceName}"를 지워요. "{targetName}"로 전환해요.
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  container: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.sm,
  },
  sub: {
    color: colors.textSub,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 6,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  optionDesc: {
    color: colors.textSub,
    fontSize: 13,
    lineHeight: 18,
  },
});
