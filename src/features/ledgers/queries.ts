import { asc, isNull } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { ledgers } from '@/db/schema';

/** 내가 속한(로컬에 동기화된) 모든 장부 — 장부 전환기, 정리 화면의 장부 선택에 쓰인다 */
export function ledgersQuery() {
  return getDb().select().from(ledgers).where(isNull(ledgers.deletedAt)).orderBy(asc(ledgers.createdAt));
}
