import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { colors, radius, spacing } from '@/theme';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isSupabaseConfigured) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>서버 설정이 필요해요</Text>
        <Text style={styles.sub}>
          .env에 Supabase 키를 채우면 계정 로그인과 동기화를 사용할 수 있어요.{'\n'}
          지금은 이 기기에만 저장되는 로컬 모드로 사용 중입니다.
        </Text>
        <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryLabel}>로컬 모드로 계속</Text>
        </Pressable>
      </View>
    );
  }

  const handleEmailAuth = async () => {
    if (!email.trim() || !password) {
      Alert.alert('이메일과 비밀번호를 입력해주세요');
      return;
    }
    setBusy(true);
    try {
      const supabase = getSupabase();
      const { error } =
        mode === 'signin'
          ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
          : await supabase.auth.signUp({ email: email.trim(), password });
      if (error) throw error;
      router.back();
    } catch (e) {
      Alert.alert('로그인 실패', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const handleKakao = async () => {
    setBusy(true);
    try {
      const supabase = getSupabase();
      const redirectTo = Linking.createURL('sign-in');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) throw error;

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type === 'success') {
        const code = new URL(result.url).searchParams.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          router.back();
        }
      }
    } catch (e) {
      Alert.alert('카카오 로그인 실패', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>제로가계부</Text>
      <Text style={styles.sub}>로그인하면 부부 공유와 기기 간 동기화를 사용할 수 있어요</Text>

      <Pressable style={styles.kakaoButton} onPress={handleKakao} disabled={busy}>
        <Text style={styles.kakaoLabel}>카카오로 시작하기</Text>
      </Pressable>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>또는 이메일로</Text>
        <View style={styles.dividerLine} />
      </View>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="이메일"
        placeholderTextColor={colors.textFaint}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="비밀번호"
        placeholderTextColor={colors.textFaint}
        secureTextEntry
      />
      <Pressable style={styles.primaryButton} onPress={handleEmailAuth} disabled={busy}>
        <Text style={styles.primaryLabel}>{mode === 'signin' ? '로그인' : '회원가입'}</Text>
      </Pressable>
      <Pressable onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
        <Text style={styles.switchLabel}>
          {mode === 'signin' ? '처음이신가요? 회원가입' : '이미 계정이 있어요. 로그인'}
        </Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
        <Text style={styles.secondaryLabel}>나중에 할게요 (로컬 모드)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.lg,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  sub: {
    color: colors.textSub,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: 14,
  },
  kakaoLabel: {
    color: '#191919',
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textFaint,
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    color: colors.text,
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: spacing.xs,
  },
  primaryLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  switchLabel: {
    color: colors.primary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  secondaryLabel: {
    color: colors.textSub,
    fontSize: 13,
  },
});
