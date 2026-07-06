import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { loadCurrentLedger } from '@/features/ledgers/current';
import { colors } from '@/theme';

import { initDb, type DB } from './client';
import migrations from './migrations/migrations';
import { seedIfEmpty } from './seed';

/** DB 연결 → 마이그레이션 → 최초 시드가 끝난 뒤에만 자식 화면을 렌더링한다. */
export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB | null>(null);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    initDb()
      .then(setDb)
      .catch((e) => setInitError(e instanceof Error ? e : new Error(String(e))));
  }, []);

  if (initError) return <DbError error={initError} />;
  if (!db) return <Loading />;
  return <Migrator db={db}>{children}</Migrator>;
}

function Migrator({ db, children }: { db: DB; children: ReactNode }) {
  const { success, error } = useMigrations(db, migrations);
  const [seeded, setSeeded] = useState(false);
  const [seedError, setSeedError] = useState<Error | null>(null);

  useEffect(() => {
    if (!success) return;
    seedIfEmpty(db)
      .then(() => loadCurrentLedger(db))
      .then(() => setSeeded(true))
      .catch((e) => setSeedError(e instanceof Error ? e : new Error(String(e))));
  }, [success, db]);

  const failure = error ?? seedError;
  if (failure) return <DbError error={failure} />;
  if (!success || !seeded) return <Loading />;
  return <>{children}</>;
}

function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

function DbError({ error }: { error: Error }) {
  return (
    <View style={styles.center}>
      <Text style={styles.errorTitle}>데이터베이스 초기화에 실패했어요</Text>
      <Text style={styles.errorDetail}>{error.message}</Text>
    </View>
  );
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
