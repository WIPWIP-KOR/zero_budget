import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

// enableChangeListener: useLiveQuery가 쓰기 발생 시 자동으로 다시 조회하게 함
export const expoDb = openDatabaseSync('zero_budget.db', { enableChangeListener: true });

export const db = drizzle(expoDb, { schema });

export type DB = typeof db;
