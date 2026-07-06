import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';

import { db } from './client';
import migrations from './migrations/migrations';
import { seedIfEmpty } from './seed';

/** 마이그레이션 + 최초 시드가 끝난 뒤에만 자식 화면을 렌더링한다. */
export function DatabaseProvider({ children }: { children: ReactNode }) {
  const { success, error } = useMigrations(db, migrations);
  const [seeded, setSeeded] = useState(false);
  const [seedError, setSeedError] = useState<Error | null>(null);

  useEffect(() => {
    if (!success) return;
    seedIfEmpty(db)
      .then(() => setSeeded(true))
      .catch((e) => setSeedError(e instanceof Error ? e : new Error(String(e))));
  }, [success]);

  const failure = error ?? seedError;
  if (failure) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>데이터베이스 초기화에 실패했어요</Text>
        <Text style={styles.errorDetail}>{failure.message}</Text>
      </View>
    );
  }

  if (!success || !seeded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    gap: 8,
    padding: 24,
  },
  errorTitle: {
    color: colors.danger,
    fontWeight: '600',
  },
  errorDetail: {
    color: colors.textSub,
    fontSize: 12,
  },
});
