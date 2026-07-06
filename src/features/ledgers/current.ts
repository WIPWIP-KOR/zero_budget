import { asc, isNull } from 'drizzle-orm';

import type { DB } from '@/db/client';
import { ledgers } from '@/db/schema';

let currentLedgerId: string | null = null;

/**
 * 앱 시작 시(시드 이후) DatabaseProvider가 호출한다.
 * MVP는 기기당 장부 1개 — 첫 장부를 현재 장부로 삼는다.
 * 부부 공유가 붙으면 로그인한 사용자의 멤버십 기준으로 바뀐다.
 */
export async function loadCurrentLedger(db: DB): Promise<void> {
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

export function getCurrentLedgerId(): string {
  if (!currentLedgerId) {
    throw new Error('Current ledger not loaded. Use inside DatabaseProvider.');
  }
  return currentLedgerId;
}
