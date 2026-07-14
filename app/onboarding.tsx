import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useSession } from '@/features/auth/AuthProvider';
import { upsertGoal } from '@/features/goals/queries';
import {
  requestNotificationPermission,
  scheduleEveningReminder,
} from '@/features/notifications/reminder';
import { markOnboardingComplete } from '@/features/onboarding/storage';
import { toMonthKey } from '@/lib/dates';
import { formatAmount } from '@/lib/format';
import { colors, radius, spacing } from '@/theme';

const INTRO_PAGES = [
  {
    icon: 'create' as const,
    title: '3초면 기록 끝',
    body: '결제 직후 사진이나 코멘트 한 줄이면 충분해요. 정리는 나중에, 한 번에.',
  },
  {
    icon: 'flag' as const,
    title: '목표를 향해 가는 나침반',
    body: '절약 → 저축 → 자산 증식. 잘 가고 있는지 매일 알려드려요.',
  },
  {
    icon: 'heart' as const,
    title: '함께 쓰는 장부',
    body: '부부, 파티, 친구까지 — 혼자 써도 좋고 함께 쓰면 더 좋아요.',
  },
];

type Step = 'intro' | 'goal' | 'notification' | 'login';

export default function OnboardingScreen() {
  const { session } = useSession();
  const [step, setStep] = useState<Step>('intro');
  const [introIndex, setIntroIndex] = useState(0);
  const [goalDigits, setGoalDigits] = useState('');
  const [busy, setBusy] = useState(false);

  const finish = async () => {
    await markOnboardingComplete();
    router.replace('/');
  };

  const handleIntroNext = () => {
    if (introIndex < INTRO_PAGES.length - 1) {
      setIntroIndex(introIndex + 1);
    } else {
      setStep('goal');
    }
  };

  const handleGoalSave = async () => {
    const amount = goalDigits ? parseInt(goalDigits, 10) : 0;
    if (amount > 0) {
      await upsertGoal(toMonthKey(new Date()), amount);
    }
    setStep('notification');
  };

  const handleNotificationAllow = async () => {
    setBusy(true);
    try {
      const granted = await requestNotificationPermission();
      if (granted) await scheduleEveningReminder(21, 0);
    } catch {
      // 권한 거부/실패해도 온보딩은 막지 않는다
    } finally {
      setBusy(false);
      setStep('login');
    }
  };

  if (step === 'intro') {
    const page = INTRO_PAGES[introIndex];
    return (
      <View style={styles.container}>
        <View style={styles.introBody}>
          <Ionicons name={page.icon} size={48} color={colors.primary} />
          <Text style={styles.introTitle}>{page.title}</Text>
          <Text style={styles.introText}>{page.body}</Text>
        </View>
        <View style={styles.dots}>
          {INTRO_PAGES.map((_, i) => (
            <View key={i} style={[styles.dot, i === introIndex && styles.dotActive]} />
          ))}
        </View>
        <Pressable style={styles.primaryButton} onPress={handleIntroNext} testID="onboarding-next">
          <Text style={styles.primaryLabel}>
            {introIndex < INTRO_PAGES.length - 1 ? '다음' : '시작하기'}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (step === 'goal') {
    const amount = goalDigits ? parseInt(goalDigits, 10) : 0;
    return (
      <View style={styles.container}>
        <Text style={styles.stepTitle}>이번 달 저축 목표를 정할까요?</Text>
        <Text style={styles.stepSub}>나중에 언제든 바꿀 수 있어요</Text>
        <View style={styles.amountRow}>
          <TextInput
            style={styles.amountInput}
            value={goalDigits ? formatAmount(amount) : ''}
            onChangeText={(text) => setGoalDigits(text.replace(/\D/g, ''))}
            placeholder="0"
            placeholderTextColor={colors.textFaint}
            keyboardType="number-pad"
            autoFocus
          />
          <Text style={styles.won}>원</Text>
        </View>
        <Pressable style={styles.primaryButton} onPress={handleGoalSave}>
          <Text style={styles.primaryLabel}>{amount > 0 ? '목표 설정' : '건너뛰기'}</Text>
        </Pressable>
      </View>
    );
  }

  if (step === 'notification') {
    return (
      <View style={styles.container}>
        <Ionicons name="notifications" size={48} color={colors.primary} />
        <Text style={styles.stepTitle}>저녁마다 정리 알림을 받을까요?</Text>
        <Text style={styles.stepSub}>매일 저녁 9시, 수집함 정리를 상기시켜드려요</Text>
        <Pressable style={styles.primaryButton} onPress={handleNotificationAllow} disabled={busy}>
          <Text style={styles.primaryLabel}>{busy ? '설정 중…' : '알림 허용'}</Text>
        </Pressable>
        <Pressable style={styles.skipButton} onPress={() => setStep('login')} disabled={busy}>
          <Text style={styles.skipLabel}>건너뛰기</Text>
        </Pressable>
      </View>
    );
  }

  // step === 'login'
  return (
    <View style={styles.container}>
      <Ionicons name="person-circle" size={48} color={colors.primary} />
      <Text style={styles.stepTitle}>
        {session ? '로그인됐어요' : '로그인하면 기기 간 동기화돼요'}
      </Text>
      <Text style={styles.stepSub}>
        {session
          ? '이제 시작해볼까요?'
          : '로그인 없이도 이 기기에서 끝까지 쓸 수 있어요. 나중에 언제든 로그인할 수 있어요.'}
      </Text>
      {session ? (
        <Pressable style={styles.primaryButton} onPress={() => void finish()}>
          <Text style={styles.primaryLabel}>시작하기</Text>
        </Pressable>
      ) : (
        <>
          <Link href="/sign-in" asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryLabel}>로그인 · 회원가입</Text>
            </Pressable>
          </Link>
          <Pressable style={styles.skipButton} onPress={() => void finish()}>
            <Text style={styles.skipLabel}>나중에 (로컬 모드)</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  introBody: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  introText: {
    color: colors.textSub,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  stepSub: {
    color: colors.textSub,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
    minWidth: 120,
    padding: 0,
  },
  won: {
    fontSize: 20,
    color: colors.textSub,
  },
  primaryButton: {
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: 14,
  },
  primaryLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipLabel: {
    color: colors.textSub,
    fontSize: 13,
  },
});
