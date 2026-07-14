import { Ionicons } from '@expo/vector-icons';
import { Link, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { signOut, useSession } from '@/features/auth/AuthProvider';
import {
  cancelEveningReminder,
  isEveningReminderScheduled,
  requestNotificationPermission,
  scheduleEveningReminder,
} from '@/features/notifications/reminder';
import { useSync } from '@/sync/SyncProvider';
import { colors, radius, spacing } from '@/theme';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  href?: Href;
  note?: string;
}

const MENU: MenuItem[] = [
  { icon: 'wallet', label: '자산 관리', href: '/accounts' },
  { icon: 'pricetags', label: '카테고리 관리', href: '/category' },
  { icon: 'repeat', label: '반복 거래', href: '/recurring' },
  { icon: 'people', label: '부부 가계부', href: '/share' },
  { icon: 'people-circle', label: '파티', href: '/party' },
];

export default function SettingsScreen() {
  const { session } = useSession();
  const { syncing, lastSyncedAt, error, sync } = useSync();
  const [reminderOn, setReminderOn] = useState(false);

  useEffect(() => {
    void isEveningReminderScheduled().then(setReminderOn);
  }, []);

  const handleToggleReminder = async (next: boolean) => {
    if (next) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('알림 권한이 필요해요', '설정에서 알림 접근을 허용해주세요.');
        return;
      }
      await scheduleEveningReminder(21, 0);
    } else {
      await cancelEveningReminder();
    }
    setReminderOn(next);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {session ? (
          <>
            <Pressable
              style={styles.row}
              onPress={() =>
                Alert.alert('로그아웃', '로그아웃할까요? 데이터는 이 기기에 남아있어요.', [
                  { text: '취소', style: 'cancel' },
                  { text: '로그아웃', style: 'destructive', onPress: () => void signOut() },
                ])
              }
            >
              <Ionicons name="person-circle" size={20} color={colors.primary} />
              <Text style={styles.label}>{session.user.email ?? '로그인됨'}</Text>
              <Text style={styles.note}>로그아웃</Text>
            </Pressable>
            <Pressable style={styles.row} onPress={() => void sync()} disabled={syncing}>
              <Ionicons name="sync" size={20} color={colors.primary} />
              <Text style={styles.label}>{syncing ? '동기화 중…' : '지금 동기화'}</Text>
              <Text style={styles.note}>
                {error
                  ? '실패'
                  : lastSyncedAt
                    ? new Date(lastSyncedAt).toLocaleTimeString()
                    : ''}
              </Text>
            </Pressable>
          </>
        ) : (
          <Link href="/sign-in" asChild>
            <Pressable style={styles.row}>
              <Ionicons name="person-circle" size={20} color={colors.primary} />
              <Text style={styles.label}>로그인 · 동기화</Text>
              <Text style={styles.note}>로컬 모드</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
            </Pressable>
          </Link>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="notifications" size={20} color={colors.primary} />
          <Text style={styles.label}>저녁 리마인더 (오후 9시)</Text>
          <Switch value={reminderOn} onValueChange={(v) => void handleToggleReminder(v)} />
        </View>
      </View>

      <View style={styles.card}>
        {MENU.map((item) => {
          const row = (
            <View style={styles.row}>
              <Ionicons name={item.icon} size={20} color={colors.primary} />
              <Text style={styles.label}>{item.label}</Text>
              {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
              {item.href ? (
                <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
              ) : null}
            </View>
          );
          return item.href ? (
            <Link key={item.label} href={item.href} asChild>
              <Pressable>{row}</Pressable>
            </Link>
          ) : (
            <View key={item.label} style={styles.disabled}>
              {row}
            </View>
          );
        })}
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
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  label: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  note: {
    color: colors.textFaint,
    fontSize: 12,
  },
  disabled: {
    opacity: 0.55,
  },
});
