import { asc, isNull } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { ledgers, type LedgerKind } from '@/db/schema';
import { nowISO } from '@/lib/dates';
import { newId } from '@/lib/id';

/** 내가 속한(로컬에 동기화된) 모든 장부 — 장부 전환기, 정리 화면의 장부 선택에 쓰인다 */
export function ledgersQuery() {
  return getDb().select().from(ledgers).where(isNull(ledgers.deletedAt)).orderBy(asc(ledgers.createdAt));
}

/**
 * 새 장부를 만든다.
 * - personal: 초대 없이 즉시 생성, 내 장부 목록에 추가 (§3.3c). 멤버십은 로그인 후 sync에서
 *   ledger_members 행이 필요하지만, 오프라인/로컬 모드에서도 장부 자체는 즉시 쓸 수 있다.
 * - party: 이름만 먼저 만들고, 초대 코드는 invites.ts의 createInviteCode()로 별도 발급 (§3.3b)
 */
export async function createLedger(name: string, kind: LedgerKind): Promise<string> {
  const id = newId();
  const ts = nowISO();
  await getDb().insert(ledgers).values({
    id,
    name,
    kind,
    createdAt: ts,
    updatedAt: ts,
  });
  return id;
}
