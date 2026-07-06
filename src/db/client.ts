import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync, openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

import * as schema from './schema';

export type DB = ExpoSQLiteDatabase<typeof schema> & { $client: SQLiteDatabase };

const DB_NAME = 'zero_budget.db';

let instance: DB | null = null;

/**
 * 앱 시작 시 DatabaseProvider가 한 번 호출한다.
 * 웹에서는 sqlite 워커+wasm 부팅이 끝나기 전에 openDatabaseSync의
 * busy-wait이 타임아웃되므로, 비동기 오픈으로 워커(모듈 싱글턴)를
 * 먼저 부팅한 뒤 sync 연결을 연다.
 */
export async function initDb(): Promise<DB> {
  if (instance) return instance;

  if (Platform.OS === 'web') {
    const warmup = await openDatabaseAsync(DB_NAME);
    await warmup.closeAsync();
  }

  // enableChangeListener: useLiveQuery가 쓰기 발생 시 자동으로 다시 조회하게 함
  const expoDb = openDatabaseSync(DB_NAME, { enableChangeListener: true });
  instance = drizzle(expoDb, { schema });
  return instance;
}

/** initDb 완료 후에만 호출할 것 — DatabaseProvider 아래에서는 항상 안전하다. */
export function getDb(): DB {
  if (!instance) {
    throw new Error('DB not initialized. Use inside DatabaseProvider.');
  }
  return instance;
}
