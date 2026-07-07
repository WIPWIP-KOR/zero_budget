import AsyncStorage from '@react-native-async-storage/async-storage';
import { asc, eq, isNull } from 'drizzle-orm';

import type { DB } from '@/db/client';
import { ledgers } from '@/db/schema';

const STORAGE_KEY = 'zero_budget.currentLedgerId';

let currentLedgerId: string | null = null;

/**
 * 앱 시작 시(시드 이후) DatabaseProvider가 호출한다.
 * 저장된 선택(부부 장부 합류 등)이 있으면 우선하고,
 * 없거나 유효하지 않으면 가장 오래된 장부를 쓴다.
 */
export async function loadCurrentLedger(db: DB): Promise<void> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (stored) {
    const found = await db
      .select({ id: ledgers.id })
      .from(ledgers)
      .where(eq(ledgers.id, stored))
      .limit(1);
    if (found.length > 0) {
      currentLedgerId = stored;
      return;
    }
  }

  const rows = await db
    .select({ id: ledgers.id })
    .from(ledgers)
    .where(isNull(ledgers.deletedAt))
    .orderBy(asc(ledgers.createdAt))
    .limit(1);
  if (rows.length === 0) {
    throw new Error('No ledger found. Seed must create a default ledger.');
  }
  currentLedgerId = rows[0].id;
}

/** 부부 장부 합류 등으로 현재 장부를 바꾼다 (재시작 후에도 유지). */
export async function setCurrentLedgerId(id: string): Promise<void> {
  currentLedgerId = id;
  await AsyncStorage.setItem(STORAGE_KEY, id);
}

export function getCurrentLedgerId(): string {
  if (!currentLedgerId) {
    throw new Error('Current ledger not loaded. Use inside DatabaseProvider.');
  }
  return currentLedgerId;
}
